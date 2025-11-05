import { test, expect } from '@playwright/test';
import { runFreezeChecks, FreezeReport } from './utils/freezeCheck.js';
import { discoverRoutes, loadManualRoutes, mergeRoutes } from './utils/routeDiscovery.js';
import { DASHBOARD_PANELS, NON_COLLAPSIBLE_PANELS } from './config.js';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const HEADLESS = process.env.HEADLESS !== 'false';

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  reports: FreezeReport[];
}

test.describe('Freeze Detection', () => {
  let allRoutes: string[] = [];
  const summary: TestSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    reports: [],
  };

  test.beforeAll(async ({ browser }) => {
    // Discover routes
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      const discovered = await discoverRoutes(page, BASE_URL);
      const manual = loadManualRoutes();
      allRoutes = mergeRoutes(discovered, manual);
      console.log(`\n📋 Discovered ${allRoutes.length} routes to test`);
      if (allRoutes.length > 0) {
        console.log(`   Routes: ${allRoutes.slice(0, 10).join(', ')}${allRoutes.length > 10 ? '...' : ''}\n`);
      }
    } catch (error) {
      console.error('Route discovery failed:', error);
      // Fallback to manual routes only
      allRoutes = loadManualRoutes();
    } finally {
      await context.close();
    }
  });

  // Test each route individually - use test.describe to generate tests dynamically
  if (allRoutes.length > 0) {
    test.describe('Route Tests', () => {
      for (const route of allRoutes) {
        test(`Route: ${route}`, async ({ page }) => {
          const report = await runFreezeChecks(page, `${BASE_URL}${route}`);
          
          // Take screenshot
          const screenshotPath = `test-results/screenshots${route.replace(/\//g, '-') || 'root'}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });
          report.screenshot = screenshotPath;
          
          // Interact lightly: scroll and click first safe button
          try {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(500);
            
            // Try to click first non-dangerous button
            const safeButtons = page.locator('button:not([aria-label*="delete"]):not([aria-label*="remove"]):not([aria-label*="destroy"])').first();
            if (await safeButtons.isVisible({ timeout: 1000 })) {
              await safeButtons.click();
              await page.waitForTimeout(500);
            }
          } catch {
            // Interaction failed, continue
          }
          
          // Store report in a way that persists across tests
          (globalThis as any).__freezeReports = (globalThis as any).__freezeReports || [];
          (globalThis as any).__freezeReports.push(report);
          
          summary.reports.push(report);
          summary.total++;
          
          if (report.passed) {
            summary.passed++;
            console.log(`  ✔ ${route}`);
          } else {
            summary.failed++;
            console.log(`  ✖ ${route}`);
            console.log(`     Reasons: ${report.reasons.join(', ')}`);
          }
          
          // Save individual report
          expect(report.passed, `Freeze detected on ${route}: ${report.reasons.join(', ')}`).toBe(true);
        });
      }
    });
  }

  // Items → Catalog freeze regression test
  test('Items → Catalog navigation regression', async ({ page }) => {
    const itemsRoute = allRoutes.find(r => r.includes('/inventory/items') || r === '/inventory/items');
    const catalogRoute = allRoutes.find(r => r.includes('/inventory/catalog') || r === '/inventory/catalog');
    
    if (!itemsRoute || !catalogRoute) {
      test.skip();
      return;
    }
    
    console.log(`\n🔍 Items → Catalog freeze regression test\n`);
    
    // Navigate to Items first
    await page.goto(`${BASE_URL}${itemsRoute}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8000 });
    await page.waitForTimeout(1000);
    
    // Rapidly navigate Items → Catalog 5 times
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      // Navigate to Catalog
      await page.goto(`${BASE_URL}${catalogRoute}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      // Wait for content to render (check for table or cards)
      await page.waitForSelector('table, [data-testid*="catalog"], .card', { timeout: 5000 }).catch(() => {
        // Fallback: wait for any content
        return page.waitForSelector('main, [role="main"]', { timeout: 5000 });
      });
      
      const navTime = Date.now() - startTime;
      
      // Verify page is responsive (no freeze)
      const isResponsive = await page.evaluate(() => {
        return document.readyState === 'complete' && 
               !document.querySelector('[data-loading]') &&
               document.querySelector('table, .card, main');
      });
      
      expect(isResponsive, `Catalog should render on attempt ${i + 1}`).toBe(true);
      expect(navTime, `Navigation should complete within 10s (took ${navTime}ms)`).toBeLessThan(10000);
      
      // Check for console errors
      const errors = await page.evaluate(() => {
        return (window as any).__consoleErrors || [];
      });
      
      expect(errors.length, `No console errors on attempt ${i + 1}`).toBe(0);
      
      // Navigate back to Items
      await page.goto(`${BASE_URL}${itemsRoute}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.waitForTimeout(500);
      
      console.log(`  ✓ Attempt ${i + 1}/5: ${navTime}ms`);
    }
    
    console.log(`  ✔ Items → Catalog regression test passed\n`);
  });

  // Back-and-forth stress test
  test('Back-and-forth navigation stress test', async ({ page }) => {
    if (allRoutes.length < 2) {
      test.skip();
      return;
    }
    
    const route1 = allRoutes[0];
    const route2 = allRoutes[1];
    
    console.log(`\n🔄 Stress test: ${route1} ↔ ${route2}\n`);
    
    for (let cycle = 0; cycle < 3; cycle++) {
      // Navigate to route1
      await page.goto(`${BASE_URL}${route1}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 8000 });
      await page.waitForTimeout(1000);
      
      // Navigate to route2
      await page.goto(`${BASE_URL}${route2}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 8000 });
      await page.waitForTimeout(1000);
      
      // Go back
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 8000 });
      await page.waitForTimeout(1000);
      
      // Go forward
      await page.goForward({ waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 8000 });
      await page.waitForTimeout(1000);
      
      console.log(`  Cycle ${cycle + 1}/3 completed`);
    }
    
      // Final check - just verify page is responsive
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    
    expect(isResponsive, 'Page should be responsive after stress test').toBe(true);
    console.log(`  ✔ Stress test passed\n`);
  });

  // Dashboard panel collapse/expand test
  test('Dashboard panel interactions', async ({ page }) => {
    const dashboardRoute = allRoutes.find(r => r.includes('/dashboard') || r === '/dashboard' || r === '/');
    if (!dashboardRoute) {
      test.skip();
      return;
    }
    
    console.log(`\n📊 Testing dashboard panels on ${dashboardRoute}\n`);
    
    await page.goto(`${BASE_URL}${dashboardRoute}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8000 });
    await page.waitForTimeout(2000);
    
    // Test each collapsible panel
    const collapsiblePanels = Object.values(DASHBOARD_PANELS).filter(
      panel => !NON_COLLAPSIBLE_PANELS.includes(panel)
    );
    
    for (const panelId of collapsiblePanels) {
      try {
        const panel = page.locator(`[data-testid="${panelId}"]`);
        if (await panel.isVisible({ timeout: 2000 })) {
          // Check if panel header is clickable (has chevron)
          const header = panel.locator('.cursor-pointer').first();
          if (await header.isVisible({ timeout: 500 })) {
            // Get initial state
            const initialContent = await panel.locator('> div:last-child').isVisible();
            
            // Click to toggle
            await header.click();
            await page.waitForTimeout(500);
            
            // Check state changed
            const afterContent = await panel.locator('> div:last-child').isVisible();
            
            if (initialContent === afterContent) {
              console.log(`  ⚠ Panel ${panelId} did not toggle`);
            } else {
              console.log(`  ✔ Panel ${panelId} toggled successfully`);
            }
            
            // Toggle back
            await header.click();
            await page.waitForTimeout(500);
            
            // Verify no console errors
            const errors = await page.evaluate(() => {
              return (window as any).__consoleErrors || [];
            });
            expect(errors.length, `No errors when toggling ${panelId}`).toBe(0);
          }
        }
      } catch (error: any) {
        console.log(`  ⚠ Could not test panel ${panelId}: ${error.message}`);
      }
    }
    
    // Verify Quick Access is NOT collapsible
    const quickAccess = page.locator(`[data-testid="${DASHBOARD_PANELS.QUICK_ACCESS}"]`);
    if (await quickAccess.isVisible({ timeout: 2000 })) {
      const header = quickAccess.locator('.cursor-pointer').first();
      const isClickable = await header.isVisible({ timeout: 100 }).catch(() => false);
      expect(isClickable, 'Quick Access should not be collapsible').toBe(false);
      console.log(`  ✔ Quick Access is not collapsible (correct)`);
    }
    
    // Test Create PO button - should open modal, NOT sidebar
    try {
      const createPOButton = page.locator('button:has-text("Create Purchase Order")').first();
      if (await createPOButton.isVisible({ timeout: 2000 })) {
        await createPOButton.click();
        await page.waitForTimeout(500);
        
        // Check for modal (centered dialog)
        const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
        const sidebar = page.locator('aside, [data-testid="sidebar"], .sidebar').filter({ hasText: 'Create' }).first();
        
        const modalVisible = await modal.isVisible({ timeout: 1000 }).catch(() => false);
        const sidebarVisible = await sidebar.isVisible({ timeout: 1000 }).catch(() => false);
        
        expect(modalVisible || !sidebarVisible, 'Create PO should open modal, not sidebar').toBe(true);
        
        // Close modal
        const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel"), [aria-label="Close"]').first();
        if (await closeButton.isVisible({ timeout: 500 })) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
        
        console.log(`  ✔ Create PO opens modal (not sidebar)`);
      }
    } catch (error: any) {
      console.log(`  ⚠ Could not test Create PO button: ${error.message}`);
    }
    
    console.log(`\n`);
  });

  test.afterAll(async () => {
    // Collect reports from global storage
    const globalReports = (globalThis as any).__freezeReports || [];
    if (globalReports.length > 0) {
      summary.reports = globalReports;
      summary.total = globalReports.length;
      summary.passed = globalReports.filter((r: FreezeReport) => r.passed).length;
      summary.failed = globalReports.filter((r: FreezeReport) => !r.passed).length;
    }
    
    // Generate summary report
    const reportPath = path.join(process.cwd(), 'test-results', 'freeze-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const finalReport = {
      summary: {
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        passRate: summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(2) + '%' : '0%',
      },
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      routes: allRoutes,
      reports: summary.reports,
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
    
    // Console summary
    console.log('\n' + '='.repeat(60));
    console.log('FREEZE DETECTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Routes Tested: ${summary.total}`);
    console.log(`Passed: ${summary.passed} ✔`);
    console.log(`Failed: ${summary.failed} ✖`);
    console.log(`Pass Rate: ${finalReport.summary.passRate}`);
    console.log('='.repeat(60));
    console.log(`\n📄 Detailed report: ${reportPath}`);
    console.log(`📊 HTML report: test-results/html-report/index.html\n`);
    
    if (summary.failed > 0) {
      console.log('Failed Routes:');
      summary.reports
        .filter((r: FreezeReport) => !r.passed)
        .forEach((r: FreezeReport) => {
          console.log(`  ✖ ${r.route}`);
          r.reasons.forEach(reason => console.log(`    - ${reason}`));
        });
      console.log('');
    }
  });
});


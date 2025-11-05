import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Discover routes from navigation links in the SPA
 */
export async function discoverRoutes(page: Page, baseUrl: string): Promise<string[]> {
  const routes = new Set<string>();
  
  // Start from base URL
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000); // Wait for SPA to load
  
  // Common navigation selectors
  const navSelectors = [
    'nav a[href]',
    '[role="navigation"] a[href]',
    'aside a[href]',
    'header a[href]',
    '.sidebar a[href]',
    '[data-testid="nav"] a[href]',
    'a[href^="/"]', // Internal links
    'a[href^="#/"]', // Hash router links
  ];
  
  // Collect all links from navigation areas
  for (const selector of navSelectors) {
    try {
      const links = await page.locator(selector).all();
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href) {
          // Normalize hash router links
          let route = href;
          if (route.startsWith('#/')) {
            route = route.substring(1);
          } else if (route.startsWith('#')) {
            route = route.substring(1);
          }
          
          // Skip external links, file downloads, and anchors
          if (
            route.startsWith('http') ||
            route.startsWith('mailto:') ||
            route.startsWith('tel:') ||
            route.includes('://') ||
            route.endsWith('.pdf') ||
            route.endsWith('.zip') ||
            route.endsWith('.csv') ||
            route.startsWith('#') ||
            route === '/' ||
            route === ''
          ) {
            continue;
          }
          
          // Ensure route starts with /
          if (!route.startsWith('/')) {
            route = '/' + route;
          }
          
          routes.add(route);
        }
      }
    } catch {
      // Selector not found, continue
    }
  }
  
  // Also check for dashboard cards/links
  try {
    const dashboardLinks = await page.locator('[data-testid*="dashboard"], .card a[href], .kpi-card a[href]').all();
    for (const link of dashboardLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        routes.add(href);
      }
    }
  } catch {
    // Dashboard not available
  }
  
  // Check for tab navigation
  try {
    const tabLinks = await page.locator('[role="tab"] a[href], .tabs a[href], [data-testid*="tab"] a[href]').all();
    for (const link of tabLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        routes.add(href);
      }
    }
  } catch {
    // Tabs not available
  }
  
  return Array.from(routes).sort();
}

/**
 * Load manual routes from routes.json if it exists
 */
export function loadManualRoutes(): string[] {
  const routesPath = path.join(process.cwd(), 'tests', 'routes.json');
  try {
    if (fs.existsSync(routesPath)) {
      const content = fs.readFileSync(routesPath, 'utf-8');
      const routes = JSON.parse(content);
      return Array.isArray(routes) ? routes : [];
    }
  } catch (error) {
    console.warn('Could not load manual routes:', error);
  }
  return [];
}

/**
 * Merge discovered and manual routes, deduplicate
 */
export function mergeRoutes(discovered: string[], manual: string[]): string[] {
  const allRoutes = new Set([...discovered, ...manual]);
  return Array.from(allRoutes).sort();
}


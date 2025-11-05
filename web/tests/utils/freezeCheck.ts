import { Page } from '@playwright/test';
import { FreezeConfig, defaultConfig } from '../config.js';

export interface FreezeReport {
  route: string;
  passed: boolean;
  reasons: string[];
  timings: {
    navigation: number;
    firstContentfulPaint?: number;
    domContentLoaded?: number;
  };
  consoleErrors: Array<{ message: string; type: string; stack?: string }>;
  failedRequests: Array<{ url: string; status: number; method: string }>;
  slowRequests: Array<{ url: string; duration: number; method: string }>;
  spinnerDetected: boolean;
  spinnerDuration?: number;
  longTaskStats: {
    count: number;
    totalTime: number;
    maxTime: number;
    windowViolations: number;
  };
  domLivenessLost: boolean;
  domInactivityDuration?: number;
  screenshot?: string;
  trace?: string;
}

/**
 * Wait for route to be idle (network idle + DOM stable)
 */
export async function waitForRouteIdle(
  page: Page,
  { timeoutMs = 8000 }: { timeoutMs?: number } = {}
): Promise<number> {
  const startTime = Date.now();
  
  try {
    // Wait for network idle
    await page.waitForLoadState('networkidle', { timeout: timeoutMs });
    
    // For SPAs, also wait for main content container to be present
    // Try common selectors
    const contentSelectors = [
      'main',
      '[role="main"]',
      '#root > div',
      '.app-content',
      '[data-testid="page-content"]',
    ];
    
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000, state: 'attached' });
        break;
      } catch {
        // Continue to next selector
      }
    }
    
    // Wait a bit more for any React hydration
    await page.waitForTimeout(500);
    
    return Date.now() - startTime;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= timeoutMs) {
      throw new Error(`Route did not become idle within ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Note: Console error and request watching is now handled inline in runFreezeChecks
// to properly accumulate data over the observation period

/**
 * Watch for long tasks using PerformanceObserver
 */
export async function watchLongTasks(
  page: Page,
  config: FreezeConfig = defaultConfig
): Promise<{
  count: number;
  totalTime: number;
  maxTime: number;
  windowViolations: number;
}> {
  const longTasks: Array<{ startTime: number; duration: number }> = [];
  let windowViolations = 0;
  
  await page.addInitScript(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'longtask' || entry.duration > 50) {
            (window as any).__longTasks = (window as any).__longTasks || [];
            (window as any).__longTasks.push({
              startTime: entry.startTime,
              duration: entry.duration,
            });
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // Fallback: observe measure entries
        observer.observe({ entryTypes: ['measure'] });
      }
    }
  });
  
  // After observation period, collect results
  await page.waitForTimeout(config.observationWindow);
  
  const tasks = await page.evaluate(() => {
    return (window as any).__longTasks || [];
  });
  
  longTasks.push(...tasks);
  
  // Check for window violations (cumulative > 2s in 5s windows)
  const windowSize = 5000;
  const sortedTasks = longTasks.sort((a, b) => a.startTime - b.startTime);
  
  for (let i = 0; i < sortedTasks.length; i++) {
    const windowStart = sortedTasks[i].startTime;
    const windowEnd = windowStart + windowSize;
    let cumulative = 0;
    
    for (let j = i; j < sortedTasks.length; j++) {
      if (sortedTasks[j].startTime > windowEnd) break;
      cumulative += sortedTasks[j].duration;
    }
    
    if (cumulative > config.maxLongTaskTime) {
      windowViolations++;
    }
  }
  
  return {
    count: longTasks.length,
    totalTime: longTasks.reduce((sum, t) => sum + t.duration, 0),
    maxTime: Math.max(...longTasks.map(t => t.duration), 0),
    windowViolations,
  };
}

/**
 * Watch DOM liveness (mutations + animation frames)
 */
export async function watchDomLiveness(
  page: Page,
  config: FreezeConfig = defaultConfig
): Promise<{ lost: boolean; inactivityDuration?: number }> {
  let lastMutation = Date.now();
  let lastRaf = Date.now();
  let inactivityStart: number | null = null;
  
  await page.addInitScript(() => {
    // Watch for DOM mutations
    const observer = new MutationObserver(() => {
      (window as any).__lastMutation = Date.now();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    
    // Watch for animation frames
    let rafCount = 0;
    const checkRaf = () => {
      (window as any).__lastRaf = Date.now();
      (window as any).__rafCount = ++rafCount;
      requestAnimationFrame(checkRaf);
    };
    requestAnimationFrame(checkRaf);
  });
  
  // Poll for liveness during observation window
  const checkInterval = 500;
  const checks = Math.ceil(config.observationWindow / checkInterval);
  let maxInactivity = 0;
  
  for (let i = 0; i < checks; i++) {
    await page.waitForTimeout(checkInterval);
    
    const { lastMutation, lastRaf } = await page.evaluate(() => {
      return {
        lastMutation: (window as any).__lastMutation || Date.now(),
        lastRaf: (window as any).__lastRaf || Date.now(),
      };
    });
    
    const now = Date.now();
    const timeSinceMutation = now - lastMutation;
    const timeSinceRaf = now - lastRaf;
    const maxInactive = Math.max(timeSinceMutation, timeSinceRaf);
    
    if (maxInactive > config.domInactivityTimeout) {
      if (inactivityStart === null) {
        inactivityStart = now - maxInactive;
      }
      maxInactivity = Math.max(maxInactivity, maxInactive);
    } else {
      inactivityStart = null;
    }
  }
  
  return {
    lost: maxInactivity > config.domInactivityTimeout,
    inactivityDuration: maxInactivity > config.domInactivityTimeout ? maxInactivity : undefined,
  };
}

/**
 * Detect persistent loading spinners
 */
export async function detectPersistentSpinner(
  page: Page,
  config: FreezeConfig = defaultConfig
): Promise<{ detected: boolean; duration?: number }> {
  const startTime = Date.now();
  let spinnerFound = false;
  
  // Check for spinners after a short delay
  await page.waitForTimeout(1000);
  
  for (const selector of config.spinnerSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 100 })) {
        spinnerFound = true;
        break;
      }
    } catch {
      // Spinner not found with this selector
    }
  }
  
  if (!spinnerFound) {
    return { detected: false };
  }
  
  // Wait and check if spinner persists
  await page.waitForTimeout(config.spinnerTimeout);
  
  let stillVisible = false;
  for (const selector of config.spinnerSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 100 })) {
        stillVisible = true;
        break;
      }
    } catch {
      // Spinner gone
    }
  }
  
  return {
    detected: stillVisible,
    duration: stillVisible ? Date.now() - startTime : undefined,
  };
}

/**
 * Run all freeze checks and generate report
 */
export async function runFreezeChecks(
  page: Page,
  route: string,
  config: FreezeConfig = defaultConfig
): Promise<FreezeReport> {
  const report: FreezeReport = {
    route,
    passed: true,
    reasons: [],
    timings: {
      navigation: 0,
    },
    consoleErrors: [],
    failedRequests: [],
    slowRequests: [],
    spinnerDetected: false,
    longTaskStats: {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      windowViolations: 0,
    },
    domLivenessLost: false,
  };
  
  // Start watching console errors and requests BEFORE navigation
  const consoleErrors: Array<{ message: string; type: string; stack?: string }> = [];
  const failedRequests: Array<{ url: string; status: number; method: string }> = [];
  const slowRequests: Array<{ url: string; duration: number; method: string }> = [];
  const requestTimings = new Map<string, number>();
  
  // Set up listeners
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        message: msg.text(),
        type: 'console',
        stack: msg.location()?.url,
      });
    }
  });
  
  page.on('pageerror', (error) => {
    consoleErrors.push({
      message: error.message,
      type: 'pageerror',
      stack: error.stack,
    });
  });
  
  page.on('request', (request) => {
    const url = request.url();
    requestTimings.set(url, Date.now());
  });
  
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    const method = response.request().method();
    const startTime = requestTimings.get(url);
    
    if (status >= 500 || status === 0) {
      failedRequests.push({ url, status, method });
    }
    
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration > config.requestTimeout) {
        slowRequests.push({ url, duration, method });
      }
      requestTimings.delete(url);
    }
  });
  
  // Navigate to route
  const navStart = Date.now();
  try {
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: config.navigationTimeout });
    report.timings.navigation = Date.now() - navStart;
  } catch (error: any) {
    report.timings.navigation = Date.now() - navStart;
    report.passed = false;
    report.reasons.push(`Navigation timeout: ${error.message}`);
    return report;
  }
  
  // Wait for route to be idle
  try {
    await waitForRouteIdle(page, { timeoutMs: config.navigationTimeout });
  } catch (error: any) {
    report.passed = false;
    report.reasons.push(`Route did not become idle: ${error.message}`);
  }
  
  // Run observation checks in parallel
  const [spinnerResult, longTaskStats, domLiveness] = await Promise.all([
    detectPersistentSpinner(page, config),
    watchLongTasks(page, config),
    watchDomLiveness(page, config),
  ]);
  
  // Collect console errors and requests
  report.consoleErrors = consoleErrors;
  report.failedRequests = failedRequests;
  report.slowRequests = slowRequests;
  
  // Check spinner
  report.spinnerDetected = spinnerResult.detected;
  if (spinnerResult.detected) {
    report.spinnerDuration = spinnerResult.duration;
    report.passed = false;
    report.reasons.push(`Spinner persisted for ${spinnerResult.duration}ms`);
  }
  
  // Check long tasks
  report.longTaskStats = longTaskStats;
  if (longTaskStats.windowViolations > 0) {
    report.passed = false;
    report.reasons.push(`${longTaskStats.windowViolations} long task window violations`);
  }
  
  // Check DOM liveness
  report.domLivenessLost = domLiveness.lost;
  if (domLiveness.lost) {
    report.passed = false;
    report.reasons.push(`DOM liveness lost for ${domLiveness.inactivityDuration}ms`);
  }
  
  // Check console errors
  if (report.consoleErrors.length > 0) {
    report.passed = false;
    report.reasons.push(`${report.consoleErrors.length} console errors detected`);
  }
  
  // Check failed requests
  if (report.failedRequests.length > 0) {
    report.passed = false;
    report.reasons.push(`${report.failedRequests.length} failed requests`);
  }
  
  return report;
}


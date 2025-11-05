# Freeze Detection Tests

Automated end-to-end tests that crawl the SPA, navigate between all routes, and detect freezes, stalls, or errors.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Running Tests

### Basic Usage
```bash
# Run against default localhost URL
npm run test:freeze

# Run against custom URL
BASE_URL=https://your-site.github.io npm run test:freeze

# Run with UI (interactive mode)
npm run test:freeze:ui

# Run in headed mode (see browser)
npm run test:freeze:headed

# View HTML report
npm run test:freeze:report
```

### Environment Variables

- `BASE_URL`: Base URL to test (default: `http://localhost:5173`)
- `HEADLESS`: Run in headless mode (default: `true` for CI)
- `ROUTES_JSON`: Path to manual routes file (default: `tests/routes.json`)

## What Gets Tested

### Freeze Detection Criteria

1. **Navigation Timeout**: Route change takes > 8s
2. **Spinner Persistence**: Loading spinner visible > 10s
3. **DOM Inactivity**: No DOM mutations or animation frames for > 5s
4. **Console Errors**: Uncaught errors or unhandled promise rejections
5. **Failed Requests**: Network requests with 5xx status or stuck > 10s
6. **Long Tasks**: Cumulative long tasks > 2s within any 5s window

### Test Coverage

- **Route Discovery**: Automatically discovers routes from navigation links
- **Individual Route Tests**: Tests each route for freezes
- **Back-and-Forth Stress Test**: Navigates between routes multiple times
- **Dashboard Panel Tests**: Tests collapsible panels (expand/collapse)
- **Create PO Modal Test**: Verifies modal opens (not sidebar)

## Reports

### JSON Report
Location: `test-results/freeze-report.json`

Contains:
- Summary statistics (total, passed, failed, pass rate)
- Per-route reports with timing, errors, and freeze details
- Screenshot paths for each route

### HTML Report
Location: `test-results/html-report/index.html`

Playwright's interactive HTML report with:
- Test execution timeline
- Screenshots and traces
- Console logs and network activity

## Manual Routes

Edit `tests/routes.json` to add routes that aren't discovered automatically:

```json
[
  "/custom-route",
  "/another-route"
]
```

## Configuration

Edit `tests/config.ts` to adjust thresholds:
- `navigationTimeout`: Max time for navigation (default: 8000ms)
- `spinnerTimeout`: Max time for spinner (default: 10000ms)
- `domInactivityTimeout`: Max DOM inactivity (default: 5000ms)
- `observationWindow`: Time to observe after navigation (default: 15000ms)


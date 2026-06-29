/**
 * errorDiagnostics.js
 * Parses raw Selenium/Java exception messages and maps them to clean,
 * human-readable error diagnostics for display in the Execution Details UI.
 */

const RULES = [
  // --- Element Not Found ---
  {
    match: /no such element|unable to locate element|NoSuchElementException/i,
    icon: '🔍',
    title: 'Element Not Found',
    cause: (step) => {
      const el = step?.objectDetail || step?.testData;
      return el ? `The element "${el}" could not be located on the page.` : 'The element could not be located on the page.';
    },
    tips: [
      'Double-check your locator (XPath, CSS, ID) — it may be incorrect or outdated.',
      'The element might not have loaded yet — consider adding a Wait step before this action.',
      'The page may have navigated away or a modal may be blocking it.',
      'Inspect the page in a browser and verify the selector still works.',
    ],
  },
  // --- Element Not Clickable / Intercepted ---
  {
    match: /element click intercepted|ElementClickInterceptedException|element is not clickable/i,
    icon: '🚫',
    title: 'Click Intercepted',
    cause: (step) => {
      const el = step?.objectDetail || step?.testData;
      return el ? `Another element (like a modal or cookie banner) is covering the target "${el}".` : 'Another element (like a modal, overlay, or cookie banner) is covering the target element.';
    },
    tips: [
      'A popup, cookie consent banner, or loading overlay may be blocking the click.',
      'Add a step to close any popups before clicking this element.',
      'Try scrolling the element into view before clicking.',
    ],
  },
  // --- Timeout / Wait ---
  {
    match: /TimeoutException|timed out|timeout waiting/i,
    icon: '⏱️',
    title: 'Timeout Waiting for Element',
    cause: (step) => {
      const el = step?.objectDetail || step?.testData;
      return el ? `The page timed out while waiting for "${el}".` : 'The page or element took too long to respond.';
    },
    tips: [
      'The target element did not appear within the expected time.',
      'The page may be slow to load — check if the site is accessible.',
      'A previous step may have failed, leaving the page in an unexpected state.',
      'Try adding an explicit Wait step before this action.',
    ],
  },
  // --- Stale Element ---
  {
    match: /StaleElementReferenceException|stale element/i,
    icon: '🔄',
    title: 'Stale Element Reference',
    cause: (step) => {
      const el = step?.objectDetail || step?.testData;
      return el ? `The element "${el}" was found, but the page changed before the action could be performed.` : 'The element was found but the page changed before the action could be performed on it.';
    },
    tips: [
      'The page may have refreshed or a dynamic re-render happened between finding and clicking the element.',
      'This often happens with Single Page Applications (React, Vue, Angular).',
      'Add a short Wait step or re-locate the element before interacting with it.',
    ],
  },
  // --- Navigation / URL ---
  {
    match: /net::ERR|WebDriverException.*navigate|invalid URL|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_REFUSED/i,
    icon: '🌐',
    title: 'Navigation Failed',
    cause: 'The browser could not reach the target URL.',
    tips: [
      'Check that the URL is correct and includes http:// or https://.',
      'The website may be down or unreachable from this machine.',
      'A firewall or proxy may be blocking the connection.',
      'Verify that the agent machine has internet access.',
    ],
  },
  // --- Wrong Window / Frame ---
  {
    match: /no such window|no such frame|NoSuchWindowException|NoSuchFrameException/i,
    icon: '🪟',
    title: 'Window or Frame Not Found',
    cause: 'The browser window or iframe the test was targeting has closed or changed.',
    tips: [
      'A popup window may have closed unexpectedly.',
      'If your test switches to an iframe, make sure the iframe has loaded before interacting.',
      'The step may need to switch back to the main window/frame first.',
    ],
  },
  // --- Invalid Session ---
  {
    match: /invalid session id|session not created|SessionNotCreatedException/i,
    icon: '💀',
    title: 'Browser Session Lost',
    cause: 'The browser session was closed or crashed before this step could run.',
    tips: [
      'A previous critical error may have killed the browser.',
      'The browser driver (ChromeDriver/GeckoDriver) may have crashed.',
      'Check if the agent machine has enough memory and disk space.',
    ],
  },
  // --- Wrong Element Type (Select) ---
  {
    match: /Element should have been "select" but was|UnexpectedTagNameException/i,
    icon: '🔽',
    title: 'Wrong Element Type',
    cause: 'A "Select" action was used on an element that is not a <select> dropdown.',
    tips: [
      'The target element is not an HTML <select> element.',
      'If the dropdown is custom-built (e.g. a div-based dropdown), use Click instead of Select.',
      'Verify the locator is pointing to the correct dropdown element.',
    ],
  },
  // --- Assertion / Value Mismatch ---
  {
    match: /assertion failed|expected.*but (found|was|got)|does not equal/i,
    icon: '❌',
    title: 'Assertion Failed',
    cause: 'The value on the page did not match the expected value.',
    tips: [
      'The page content has changed — verify what value you are asserting against.',
      'There may be whitespace or casing differences.',
      'The element may contain dynamic content (e.g. dates, IDs) that changes.',
    ],
  },
  // --- Script / JS Error ---
  {
    match: /JavascriptException|javascript error/i,
    icon: '⚙️',
    title: 'JavaScript Error',
    cause: 'A JavaScript error occurred while executing a script on the page.',
    tips: [
      'The page may have thrown a JavaScript exception.',
      'A script step may have an invalid JavaScript expression.',
      'Check the browser console for more details on the error.',
    ],
  },
  // --- Generic WebDriverException ---
  {
    match: /WebDriverException|org\.openqa\.selenium/i,
    icon: '🤖',
    title: 'Browser Driver Error',
    cause: 'An unexpected error occurred in the browser automation driver.',
    tips: [
      'The ChromeDriver or GeckoDriver may not be compatible with the installed browser version.',
      'Try restarting the agent.',
      'Ensure the browser is installed correctly on this machine.',
    ],
  },
];

/**
 * Analyzes a raw error message string and returns a structured diagnostic object.
 * @param {string} rawError - The raw error string from the step's errorJson field.
 * @param {Object} step - The step object with actionName, locatorName, objectDetail, testData.
 * @returns {{ icon, title, cause, tips, raw, locatorHint } | null}
 */
export function diagnose(rawError, step = {}) {
  if (!rawError || rawError.trim() === '') return null;

  // Try to match a known error pattern
  for (const rule of RULES) {
    if (rule.match.test(rawError)) {
      const locatorHint = buildLocatorHint(step);
      const dynamicCause = typeof rule.cause === 'function' ? rule.cause(step) : rule.cause;
      return {
        icon: rule.icon,
        title: rule.title,
        cause: dynamicCause,
        tips: rule.tips,
        locatorHint,
        raw: rawError,
      };
    }
  }

  // Fallback: generic unknown error
  return {
    icon: '⚠️',
    title: 'Step Failed',
    cause: 'An unexpected error occurred during this step.',
    tips: [
      'Review the raw error message below for more details.',
      'A previous step failure may have left the page in an unexpected state.',
    ],
    locatorHint: buildLocatorHint(step),
    raw: rawError,
  };
}

function buildLocatorHint(step) {
  if (!step) return null;
  const parts = [];
  if (step.locatorName) parts.push(`Type: ${step.locatorName}`);
  if (step.objectDetail) parts.push(`Value: "${step.objectDetail}"`);
  if (step.testData && step.testData !== step.objectDetail) parts.push(`Data: "${step.testData}"`);
  return parts.length > 0 ? parts.join('  ·  ') : null;
}

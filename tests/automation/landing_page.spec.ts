import { test_Alice_2W } from './setup/sessionTest';
import { compareScreenshot, waitForElement } from './utilities/utils';

export type ElementState = 'new-account' | 'restored-account';

test_Alice_2W(
  `Landing page states`,
  async ({ aliceWindow1, aliceWindow2 }, testInfo) => {
    const os = process.platform;
    console.log('OS:', os);
    const [landingPage, restoredPage] = await Promise.all([
      waitForElement(aliceWindow1, 'class', 'session-conversation'),
      waitForElement(aliceWindow2, 'class', 'session-conversation'),
    ]);
    const results = await Promise.allSettled([
      compareScreenshot(landingPage, `${testInfo.title}`, 'new-account', os),
      compareScreenshot(
        restoredPage,
        `${testInfo.title}`,
        'restored-account',
        os,
      ),
    ]);
    if (results.some((r) => r.status === 'rejected')) {
      throw new Error('One or both screenshot comparisons failed');
    }
  },
);

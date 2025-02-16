/* eslint-disable no-useless-escape */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import { ElementHandle, Page } from '@playwright/test';
import { sleepFor } from '../../promise_utils';
import {
  DMTimeOption,
  DataTestId,
  LoaderType,
  Strategy,
  StrategyExtractionObj,
  WithMaxWait,
  WithPage,
  WithRightButton,
} from '../types/testing';
// eslint-disable-next-line import/no-cycle
import fs from 'fs';
import path from 'path';
import { sendMessage } from './message';
import { ElementState } from '../landing_page.spec';
import { screenshotFolder } from '../constants/variables';

// WAIT FOR FUNCTIONS

export async function waitForTestIdWithText(
  window: Page,
  dataTestId: DataTestId,
  text?: string,
  maxWait?: number,
) {
  let builtSelector = `css=[data-testid=${dataTestId}]`;
  if (text) {
    // " =>  \\\"
    /* prettier-ignore */

    const escapedText = text.replace(/"/g, '\\\"');

    builtSelector += `:has-text("${escapedText}")`;
    console.info('builtSelector:', builtSelector);
    // console.info('Text is tiny bubble: ', escapedText);
  }
  // console.info('looking for selector', builtSelector);
  const found = await window.waitForSelector(builtSelector, {
    timeout: maxWait,
  });
  // console.info('found selector', builtSelector);

  return found;
}

export async function waitForElement(
  window: Page,
  strategy: Strategy,
  selector: string,
  maxWaitMs?: number,
  text?: string,
) {
  const builtSelector = !text
    ? `css=[${strategy}=${selector}]`
    : `css=[${strategy}=${selector}]:has-text("${text.replace(/"/g, '\\"')}")`;

  return window.waitForSelector(builtSelector, { timeout: maxWaitMs });
}

export async function waitForTextMessage(
  window: Page,
  text: string,
  maxWait?: number,
) {
  let builtSelector = `css=[data-testid=message-content]:has-text("${text}")`;
  if (text) {
    // " =>  \\\"
    /* prettier-ignore */

    const escapedText = text.replace(/"/g, '\\\"');

    builtSelector += `:has-text("${escapedText}")`;
    console.info('builtSelector:', builtSelector);
  }
  const el = await window.waitForSelector(builtSelector, { timeout: maxWait });
  console.info(`Text message found. Text: , ${text}`);
  return el;
}

export async function waitForControlMessageWithText(
  window: Page,
  text: string,
) {
  return waitForTestIdWithText(window, 'message-content', text);
}

export async function waitForMatchingText(
  window: Page,
  text: string,
  maxWait?: number,
) {
  const builtSelector = `css=:has-text("${text}")`;
  const maxTimeout = maxWait ?? 55000;
  console.info(`waitForMatchingText: ${text}`);

  return window.waitForSelector(builtSelector, { timeout: maxTimeout });
}

export async function waitForMatchingPlaceholder(
  window: Page,
  dataTestId: string,
  placeholder: string,
  maxWait: number = 30000,
) {
  let found = false;
  const start = Date.now();
  console.info(
    `waitForMatchingPlaceholder: ${placeholder} with datatestId: ${dataTestId}`,
  );

  do {
    try {
      const elem = await waitForElement(window, 'data-testid', dataTestId);
      const elemPlaceholder = await elem.getAttribute('placeholder');
      if (elemPlaceholder === placeholder) {
        console.info(
          `waitForMatchingPlaceholder found matching element with placeholder: "${placeholder}"`,
        );

        found = true;
      }
    } catch (e) {
      await sleepFor(1000, true);
      console.info(
        `waitForMatchingPlaceholder failed with ${e.message}, retrying in 1s`,
      );
    }
  } while (!found && Date.now() - start <= maxWait);

  if (!found) {
    throw new Error(
      `Failed to find datatestid:"${dataTestId}" with placeholder: "${placeholder}"`,
    );
  }
}
export async function waitForLoadingAnimationToFinish(
  window: Page,
  loader: LoaderType,
  maxWait?: number,
) {
  let loadingAnimation: ElementHandle<SVGElement | HTMLElement> | undefined;

  await waitForElement(window, 'data-testid', `${loader}`, maxWait);

  do {
    try {
      loadingAnimation = await waitForElement(
        window,
        'data-testid',
        `${loader}`,
        100,
      );
      await sleepFor(500);
      console.info(`${loader} was found, waiting for it to be gone`);
    } catch (e) {
      loadingAnimation = undefined;
    }
  } while (loadingAnimation);
  console.info('Loading animation has finished');
}

export async function doWhileWithMax(
  maxWaitMs: number,
  waitBetweenMs: number,
  label: string,
  actionTodo: () => Promise<boolean>,
) {
  const start = Date.now();
  let iteration = 0;
  let wasSuccess = false;
  do {
    try {
      wasSuccess = await actionTodo();
    } catch (e) {
      console.error(
        `doWhileWithMax with label:"${label}" iteration:${iteration} failed with: ${e.message}`,
        e,
      );
    }
    iteration++;
    await sleepFor(waitBetweenMs);
  } while (!wasSuccess && Date.now() - start < maxWaitMs);

  if (!wasSuccess) {
    throw new Error(
      `doWhileWithMax with label:"${label}" still failing after ${maxWaitMs}ms`,
    );
  }
}

export async function checkPathLight(window: Page, maxWait?: number) {
  const maxWaitTime = maxWait || 500000;
  const waitPerLoop = 100;
  const start = Date.now();
  let pathColor: string | null = null;

  await doWhileWithMax(maxWaitTime, waitPerLoop, 'checkPathLight', async () => {
    const pathLight = await waitForElement(
      window,
      'data-testid',
      'path-light-container',
      maxWait,
    );
    pathColor = await pathLight.getAttribute('color');

    if (Date.now() - start >= maxWaitTime / 10) {
      console.log('Path building...');
    }

    return pathColor === 'var(--button-path-default-color)';
  });

  console.log('Path built correctly, Yay!', pathColor);
}

// ACTIONS

export async function clickOnElement({
  window,
  maxWait,
  rightButton,
  ...obj
}: WithPage & StrategyExtractionObj & WithMaxWait & WithRightButton) {
  const builtSelector = `css=[${obj.strategy}=${obj.selector}]`;
  console.info(`clickOnElement: looking for selector ${builtSelector}`);
  const sharedOpts = { timeout: maxWait };
  await window.click(
    builtSelector,
    rightButton ? { ...sharedOpts, button: 'right' } : sharedOpts,
  );
}

export async function lookForPartialTestId(
  window: Page,
  selector: string,
  click?: boolean,
  rightButton?: boolean,
  maxWait?: number,
) {
  const builtSelector = `css=[data-testid^="${selector}"]`;
  const sharedOpts = { timeout: maxWait };

  if (click) {
    await window.click(
      builtSelector,
      rightButton ? { ...sharedOpts, button: 'right' } : sharedOpts,
    );
  }
  return builtSelector;
}

//

export async function clickOnMatchingText(
  window: Page,
  text: string,
  rightButton = false,
  timeoutMs?: number,
) {
  console.info(`clickOnMatchingText: "${text}"`);
  return window.click(
    `"${text}"`,
    rightButton
      ? { button: 'right', timeout: timeoutMs }
      : { timeout: timeoutMs },
  );
}

export async function clickOnTestIdWithText(
  window: Page,
  dataTestId: DataTestId,
  text?: string,
  rightButton?: boolean,
  maxWait?: number,
) {
  const sharedOpts = { timeout: maxWait, strict: true };
  console.info(
    `clickOnTestIdWithText with testId:${dataTestId} and text:${
      text || 'none'
    }, rightButton:${!!rightButton}`,
  );

  const builtSelector = !text
    ? `css=[data-testid=${dataTestId}]`
    : `css=[data-testid=${dataTestId}]:has-text("${text}")`;

  await window.click(
    builtSelector,
    rightButton ? { ...sharedOpts, button: 'right' } : sharedOpts,
  );
  console.info(
    `clickOnTestIdWithText:clicked! testId:${dataTestId} and text:${
      text || 'none'
    }`,
  );
}

export async function clickOnTextMessage(
  window: Page,
  text: string,
  rightButton?: boolean,
  maxWait?: number,
) {
  const builtSelector = `css=[data-testid=message-content]:has-text("${text}")`;
  const sharedOpts = { timeout: maxWait };

  await window.click(
    builtSelector,
    rightButton ? { ...sharedOpts, button: 'right' } : sharedOpts,
  );
}

export function getMessageTextContentNow() {
  return `Test message timestamp: ${Date.now()}`;
}

export async function typeIntoInput(
  window: Page,
  dataTestId: DataTestId,
  text: string,
) {
  console.info(`typeIntoInput testId: ${dataTestId} : "${text}"`);
  const builtSelector = `css=[data-testid=${dataTestId}]`;
  // the new input made with onboarding element needs a click to reveal the input in the DOM
  await clickOnTestIdWithText(window, dataTestId);
  // reset the content to be empty before typing into the input
  await window.fill(builtSelector, '');
  return window.type(builtSelector, text);
}

export async function doesTextIncludeString(
  window: Page,
  dataTestId: DataTestId,
  text: string,
) {
  const element = await waitForTestIdWithText(window, dataTestId);
  const el = await element.innerText();

  const builtSelector = el.includes(text);
  if (builtSelector) {
    console.info('Text found:', text);
  } else {
    throw new Error(`Text not found: "${text}"`);
  }
}

export async function grabTextFromElement(
  window: Page,
  strategy: Strategy,
  selector: string,
) {
  const builtSelector = `css=[${strategy}=${selector}]`;
  const element = await window.waitForSelector(builtSelector);
  return element.innerText();
}

export async function hasElementBeenDeleted(
  window: Page,
  strategy: Strategy,
  selector: string,
  maxWait: number = 30000,
  text?: string,
) {
  const start = Date.now();

  let el: ElementHandle<SVGElement | HTMLElement> | undefined;
  do {
    try {
      el = await waitForElement(window, strategy, selector, maxWait, text);
      await sleepFor(100);
      console.info(`Element has been found, waiting for deletion`);
    } catch (e) {
      el = undefined;
      console.info(`Element has been deleted, woohoo!`);
    }
  } while (Date.now() - start <= maxWait && el);
  try {
    el = await waitForElement(window, strategy, selector, 1000, text);
  } catch (e) {
    // if we did throw here it's actually because the element is gone, so it's ok
  }

  if (el) {
    throw new Error(
      `hasElementBeenDeleted: element with selector ${selector} was expected to be gone but is still there`,
    );
  }
  console.info(`Element has been deleted yay`);
}

export async function hasTextMessageBeenDeleted(
  window: Page,
  text: string,
  maxWait: number = 5000,
) {
  await doWhileWithMax(
    15000,
    500,
    'waiting for text message to be deleted',
    async () => {
      try {
        await waitForElement(
          window,
          'data-testid',
          'message-content',
          maxWait,
          text,
        );
        return false;
      } catch (e) {
        console.info(`Text message not found, yay!`);
        return true;
      }
    },
  );
}

export async function hasElementPoppedUpThatShouldnt(
  window: Page,
  strategy: Strategy,
  selector: string,
  text?: string,
) {
  const builtSelector = !text
    ? `css=[${strategy}=${selector}]`
    : `css=[${strategy}=${selector}]:has-text("${text.replace(/"/g, '\\"')}")`;

  const fakeError = `Found ${selector}, oops..`;
  const elVisible = await window.isVisible(builtSelector);
  if (elVisible === true) {
    throw new Error(fakeError);
  }
  return builtSelector;
}

export async function doesElementExist(
  window: Page,
  strategy: Strategy,
  selector: string,
  text?: string,
) {
  const builtSelector = !text
    ? `css=[${strategy}=${selector}]`
    : `css=[${strategy}=${selector}]:has-text("${text.replace(/"/g, '\\"')}")`;

  const fakeError = `Element ${selector} does not exist`;
  const elVisible = await window.isVisible(builtSelector);
  if (!elVisible) {
    console.log(fakeError);
    return undefined;
  }
  console.log(`Element ${selector} exists`);
  return builtSelector;
}

export async function measureSendingTime(window: Page, messageNumber: number) {
  const message = `Test-message`;
  const timeStart = Date.now();

  await sendMessage(window, message);

  const timeEnd = Date.now();
  const timeMs = timeEnd - timeStart;

  console.log(`Message ${messageNumber}: ${timeMs}`);
  return timeMs;
}

export async function checkModalStrings(
  window: Page,
  expectedHeading: string,
  expectedDescription: string,
) {
  const heading = await waitForElement(window, 'data-testid', 'modal-heading');
  const description = await waitForElement(
    window,
    'data-testid',
    'modal-description',
  );

  const headingText = await heading.innerText();
  const descriptionText = await description.innerText();

  if (headingText !== expectedHeading) {
    throw new Error(
      `Expected heading: ${expectedHeading}, got: ${headingText}`,
    );
  }

  if (descriptionText !== expectedDescription) {
    throw new Error(
      `Expected description: ${expectedDescription}, got: ${descriptionText}`,
    );
  }
}

export async function formatTimeOption(option: DMTimeOption) {
  const timePart = option.replace('time-option-', '');
  const formattedTime = timePart.replace(/-/g, ' ');
  return formattedTime;
}

async function deleteDifferenceFile(
  fileFolder: string,
  fileName: string,
  os: string,
) {
  const filePath = path.join(
    screenshotFolder,
    fileFolder,
    `${fileName}-${os}-difference.png`,
  );

  if (fs.existsSync(filePath)) {
    // Delete the file if it exists
    fs.unlinkSync(filePath);
    console.log(`Deleted difference file at: ${filePath}`);
  } else {
    console.log(`No difference file found at: ${filePath}, proceeding...`);
  }
}

export async function compareScreenshot(
  element: ElementHandle<SVGElement | HTMLElement>,
  testTitle: string,
  elementState: ElementState,
  os: string,
) {
  const formattedTitle = testTitle.toLowerCase().replace(/\s+/g, '-');
  await deleteDifferenceFile(formattedTitle, elementState, os);

  const elementScreenshot = await element.screenshot();
  const folderPath = path.join(screenshotFolder, `${formattedTitle}`);

  // If folder doesn't exist, create folder
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  // If screenshot does not exist, save it to the folder
  if (!fs.existsSync(path.join(folderPath, `${elementState}-${os}.png`))) {
    fs.writeFileSync(
      path.join(folderPath, `${elementState}-${os}.png`),
      elementScreenshot,
    );
  }
  // If screenshot does exist, compare it to previous screenshot in the folder
  const previousScreenshot = fs.readFileSync(
    path.join(folderPath, `${elementState}-${os}.png`),
  );
  // If screenshots are different, then create a difference screenshot
  if (!elementScreenshot.equals(previousScreenshot)) {
    //  If elements do not match, then take the elementScreenshot and save it to same folder but with a new name of 'difference.png'
    fs.writeFileSync(
      path.join(folderPath, `${elementState}-${os}-difference.png`),
      elementScreenshot,
    );
    throw new Error(
      `Screenshots do not match, see ${screenshotFolder} > ${testTitle} folder > ${elementState}-${os}-difference.png`,
    );
  }
}

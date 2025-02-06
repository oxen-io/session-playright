import { Page } from '@playwright/test';
import { englishStrippedStr } from '../../locale/localizedString';
import { sleepFor } from '../../promise_utils';
import { ConversationType, DisappearOptions } from '../types/testing';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  doWhileWithMax,
  waitForElement,
  waitForTestIdWithText,
} from './utils';

export const setDisappearingMessages = async (
  windowA: Page,
  [conversationType, timerType, timerDuration]: DisappearOptions,
  windowB?: Page,
) => {
  const enforcedType: ConversationType = conversationType;
  await doWhileWithMax(5000, 1000, 'setDisappearingMessages', async () => {
    try {
      await clickOnTestIdWithText(
        windowA,
        'conversation-options-avatar',
        undefined,
        undefined,
        1000,
      );
      await clickOnElement({
        window: windowA,
        strategy: 'data-testid',
        selector: 'disappearing-messages',
        maxWait: 100,
      });
      return true;
    } catch (e) {
      console.log(
        'setDisappearingMessages doWhileWithMax action threw:',
        e.message,
      );

      return false;
    }
  });

  if (enforcedType === '1:1') {
    await clickOnElement({
      window: windowA,
      strategy: 'data-testid',
      selector: timerType,
    });
    // Check that 1 Day default is automatically selected (default time is only relevant to 1:1's)
    let defaultTime;
    if (timerType === 'disappear-after-read-option') {
      defaultTime = await waitForElement(
        windowA,
        'data-testid',
        'input-time-option-12-hours',
      );
    } else {
      defaultTime = await waitForElement(
        windowA,
        'data-testid',
        'input-time-option-1-days',
      );
    }
    const checked = await defaultTime.isChecked();
    if (checked) {
      console.info('Timer default time is correct');
    } else {
      throw new Error('Default timer not set correctly');
    }
  }

  // Change timer to testing duration (10 seconds)
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: timerDuration,
  });
  await clickOnElement({
    window: windowA,
    strategy: 'data-testid',
    selector: 'disappear-set-button',
  });
  await waitForTestIdWithText(windowA, 'disappear-messages-type-and-time');
  if (windowB) {
    await clickOnMatchingText(
      windowB,
      englishStrippedStr('disappearingMessagesFollowSetting').toString(),
    );
    await sleepFor(1000);
    await clickOnElement({
      window: windowB,
      strategy: 'data-testid',
      selector: 'session-confirm-ok-button',
    });
    await waitForTestIdWithText(windowB, 'disappear-messages-type-and-time');
  }
};

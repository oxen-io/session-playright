import { Page } from '@playwright/test';
import { englishStrippedStr } from '../../locale/localizedString';
import { sleepFor } from '../../promise_utils';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  typeIntoInput,
  waitForLoadingAnimationToFinish,
  waitForTestIdWithText,
} from './utils';
import { MediaType } from '../types/testing';

export const sendMedia = async (
  window: Page,
  path: string,
  testMessage: string,
) => {
  // Send media
  await window.setInputFiles("input[type='file']", `${path}`);
  await typeIntoInput(window, 'message-input-text-area', testMessage);
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  //   Implementing in groups rebuild
  // await waitForSentTick(window, testMessage);
};

export const sendVoiceMessage = async (window: Page) => {
  await clickOnTestIdWithText(window, 'microphone-button');
  await clickOnTestIdWithText(window, 'session-toast');
  await clickOnTestIdWithText(window, 'enable-microphone');
  await clickOnTestIdWithText(window, 'message-section');
  await clickOnTestIdWithText(window, 'microphone-button');
  await sleepFor(5000);
  await clickOnTestIdWithText(window, 'end-voice-message');
  await sleepFor(4000);
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  const selc = `css=[data-testid=msg-status][data-testtype=sent]`;
  await window.waitForSelector(selc, {
    timeout: 30000,
  });
};

export const sendLinkPreview = async (window: Page, testLink: string) => {
  await typeIntoInput(window, 'message-input-text-area', testLink);
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  await clickOnTestIdWithText(window, 'message-content', testLink, true);
  // Need to copy link to clipboard, as the enable link preview modal
  // doesn't pop up if manually typing link (needs to be pasted)
  // Need to have a nth(0) here to account for Copy Account ID, Appium was getting confused
  // Tried to use englishStripped here but Playwright doesn't like it
  // const copyText = englishStrippedStr('copy').toString();
  // eslint-disable-next-line
  const firstCopyBtn = window
    .locator(`[data-testid=context-menu-item]:has-text("Copy")`)
    .nth(0);
  await firstCopyBtn.click();
  await waitForTestIdWithText(
    window,
    'session-toast',
    englishStrippedStr('copied').toString(),
  );
  await clickOnTestIdWithText(window, 'message-input-text-area');
  const isMac = process.platform === 'darwin';
  await window.keyboard.press(`${isMac ? 'Meta' : 'Control'}+V`);
  //   Implementing in groups rebuild
  // await checkModalStrings(
  //   window,
  //   englishStrippedStr('linkPreviewsEnable').toString(),
  //   englishStrippedStr('linkPreviewsFirstDescription').toString(),
  // );
  await clickOnTestIdWithText(
    window,
    'session-confirm-ok-button',
    englishStrippedStr('enable').toString(),
  );
  await waitForLoadingAnimationToFinish(window, 'loading-spinner');
  // Also needs to be implemented in groups
  // await waitForTestIdWithText(window, 'link-preview-image');
  // await waitForTestIdWithText(
  //   window,
  //   'link-preview-title',
  //   'Session | Send Messages, Not Metadata. | Private Messenger',
  // );
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  //   Implementing in groups rebuild
  // await waitForSentTick(window, testLink);
};

export const trustUser = async (window: Page, mediaType: MediaType) => {
  await clickOnMatchingText(
    window,
    englishStrippedStr('attachmentsClickToDownload')
      .withArgs({
        file_type: englishStrippedStr(mediaType).toString().toLowerCase(),
      })
      .toString(),
  );
  //   Implementing in groups rebuild
  // await checkModalStrings(
  //   window,
  //   englishStrippedStr('attachmentsAutoDownloadModalTitle').toString(),
  //   englishStrippedStr('attachmentsAutoDownloadModalDescription')
  //     .withArgs({
  //       conversation_name: userName,
  //     })
  //     .toString(),
  // );
  await clickOnTestIdWithText(
    window,
    'session-confirm-ok-button',
    englishStrippedStr('download').toString(),
  );
};

import { Page } from '@playwright/test';
import { englishStrippedStr } from '../../locale/localizedString';
import { sleepFor } from '../../promise_utils';
import { User } from '../types/testing';
import { clickOnMatchingText, clickOnTestIdWithText } from './utils';

export const makeVoiceCall = async (
  callerWindow: Page,
  receiverWindow: Page,
  caller: User,
  receiver: User,
) => {
  await clickOnTestIdWithText(callerWindow, 'call-button');
  await clickOnTestIdWithText(callerWindow, 'session-toast');
  await clickOnTestIdWithText(callerWindow, 'enable-calls');
  //   Implementing in groups rebuild
  //   await checkModalStrings(
  //     callerWindow,
  //     englishStrippedStr('callsVoiceAndVideoBeta').toString(),
  //     englishStrippedStr('callsVoiceAndVideoModalDescription').toString(),
  //   );
  await clickOnTestIdWithText(callerWindow, 'session-confirm-ok-button');
  await clickOnTestIdWithText(callerWindow, 'message-section');
  await clickOnTestIdWithText(
    callerWindow,
    'module-conversation__user__profile-name',
    receiver.userName,
  );
  await clickOnTestIdWithText(callerWindow, 'call-button');
  // Enable calls in window B
  await clickOnTestIdWithText(receiverWindow, 'session-toast');
  await clickOnTestIdWithText(receiverWindow, 'enable-calls');
  //   Implementing in groups rebuild
  //   await checkModalStrings(
  //     receiverWindow,
  //     englishStrippedStr('callsVoiceAndVideoBeta').toString(),
  //     englishStrippedStr('callsVoiceAndVideoModalDescription').toString(),
  //   );
  await clickOnTestIdWithText(receiverWindow, 'session-confirm-ok-button');
  await clickOnMatchingText(
    receiverWindow,
    englishStrippedStr('accept').toString(),
  );
  await clickOnTestIdWithText(receiverWindow, 'message-section');
  await clickOnTestIdWithText(
    receiverWindow,
    'module-conversation__user__profile-name',
    caller.userName,
  );
  await sleepFor(5000);
  await clickOnTestIdWithText(callerWindow, 'end-call');
};

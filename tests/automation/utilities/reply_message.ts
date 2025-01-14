import { Page } from '@playwright/test';
import { englishStrippedStr } from '../../locale/localizedString';
import { sleepFor } from '../../promise_utils';
import { Strategy } from '../types/testing';
import { sendMessage } from './message';
import {
  clickOnMatchingText,
  clickOnTextMessage,
  waitForElement,
  waitForTextMessage,
} from './utils';

/**
 * Reply to a message and optionally wait for the reply to be received.
 * @param senderWindow send the message from this window
 * @param textMessage look for this message in senderWindow to reply to it
 * @param replyText reply with this message
 * @param receiverWindow if set, will wait until replyText is received from senderWindow
 *
 * Note: Most of the case, we want a receiverWindow argument to be given, to make the tests as reliable as possible
 */
export const replyTo = async ({
  replyText,
  textMessage,
  receiverWindow,
  senderWindow,
}: {
  senderWindow: Page;
  textMessage: string;
  replyText: string;
  receiverWindow: Page | null;
}) => {
  await waitForTextMessage(senderWindow, textMessage);
  // the right click context menu, for some reasons, often doesn't show up on the first try. Let's loop a few times

  for (let index = 0; index < 5; index++) {
    try {
      await clickOnTextMessage(senderWindow, textMessage, true, 1000);
      await clickOnMatchingText(
        senderWindow,
        englishStrippedStr('reply').toString(),
        false,
        1000,
      );
      break;
    } catch (e) {
      console.info(
        `failed to right click & reply to message attempt: ${index}.`,
      );
      await sleepFor(500, true);
    }
  }
  await sendMessage(senderWindow, replyText);
  if (receiverWindow) {
    await waitForTextMessage(receiverWindow, replyText);
  }
};

export const replyToMedia = async ({
  replyText,
  strategy,
  selector,
  receiverWindow,
  senderWindow,
}: {
  replyText: string;
  strategy: Strategy;
  selector: string;
  receiverWindow: Page;
  senderWindow: Page;
}) => {
  const selc = await waitForElement(senderWindow, strategy, selector);
  // the right click context menu, for some reasons, often doesn't show up on the first try. Let's loop a few times

  for (let index = 0; index < 5; index++) {
    try {
      await selc.click({ button: 'right' });
      await sleepFor(200);
      await clickOnMatchingText(
        senderWindow,
        englishStrippedStr('reply').toString(),
        false,
        1000,
      );
      break;
    } catch (e) {
      console.info(
        `failed to right click & reply to message attempt: ${index}.`,
      );
      await sleepFor(500, true);
    }
  }
  await sendMessage(senderWindow, replyText);
  if (receiverWindow) {
    await waitForTextMessage(receiverWindow, replyText);
  }
};

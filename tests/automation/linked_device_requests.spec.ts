import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import { test_Alice_2W_Bob_1W } from './setup/sessionTest';
import { sendMessage } from './utilities/message';
import { sendNewMessage } from './utilities/send_message';
import {
  clickOnTestIdWithText,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

test_Alice_2W_Bob_1W(
  'Accept request syncs',
  async ({ alice, bob, aliceWindow1, aliceWindow2, bobWindow1 }) => {
    const testMessage = `${bob.userName} sending message request to ${alice.userName}`;
    const testReply = `${alice.userName} accepting message request from ${bob.userName}`;
    await sendNewMessage(bobWindow1, alice.accountid, testMessage);
    // Accept request in aliceWindow1
    await clickOnTestIdWithText(aliceWindow1, 'message-request-banner');
    await clickOnTestIdWithText(aliceWindow2, 'message-request-banner');
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await clickOnTestIdWithText(aliceWindow1, 'accept-message-request');
    await waitForTestIdWithText(
      aliceWindow1,
      'message-request-response-message',
      englishStrippedStr('messageRequestYouHaveAccepted')
        .withArgs({
          name: bob.userName,
        })
        .toString(),
    );
    await waitForMatchingText(
      aliceWindow1,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
    await waitForMatchingText(
      aliceWindow2,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
    await sendMessage(aliceWindow1, testReply);
    await waitForTextMessage(bobWindow1, testReply);
    await clickOnTestIdWithText(aliceWindow2, 'new-conversation-button');
    await waitForTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
  },
);

test_Alice_2W_Bob_1W(
  'Decline request syncs',
  async ({ alice, aliceWindow1, aliceWindow2, bob, bobWindow1 }) => {
    const testMessage = `${bob.userName} sending message request to ${alice.userName}`;
    await sendNewMessage(bobWindow1, alice.accountid, testMessage);
    // Decline request in aliceWindow1
    await clickOnTestIdWithText(aliceWindow1, 'message-request-banner');
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await clickOnTestIdWithText(aliceWindow2, 'message-request-banner');
    await waitForTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await sleepFor(1000);
    await clickOnTestIdWithText(
      aliceWindow1,
      'decline-message-request',
      englishStrippedStr('decline').toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('delete').toString(),
    );

    // Note: this test is broken currently but this is a known issue.
    // It happens because we have a race condition between the update from libsession and the update from the swarm, both with the same seqno.
    // See SES-1563
    console.info(
      'This test is subject to a race condition and so is most of the times, broken. See SES-2518',
    );

    await waitForMatchingText(
      aliceWindow1,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
    await waitForMatchingText(
      aliceWindow2,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
  },
);

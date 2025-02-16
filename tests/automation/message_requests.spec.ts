import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import {
  test_Alice_1W_Bob_1W,
  test_Alice_2W_Bob_1W,
} from './setup/sessionTest';
import { sendMessage } from './utilities/message';
import { sendNewMessage } from './utilities/send_message';
import {
  clickOnMatchingText,
  clickOnTestIdWithText,
  waitForMatchingText,
  waitForTestIdWithText,
} from './utilities/utils';

// Open two windows and log into 2 separate accounts
test_Alice_1W_Bob_1W(
  'Message requests accept',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName} Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    // Check that using the accept button has intended use
    await clickOnTestIdWithText(bobWindow1, 'accept-message-request');
    // Check config message of message request acceptance
    await waitForTestIdWithText(
      bobWindow1,
      'message-request-response-message',
      englishStrippedStr('messageRequestYouHaveAccepted')
        .withArgs({
          name: alice.userName,
        })
        .toString(),
    );
    await waitForMatchingText(
      bobWindow1,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Message requests text reply',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    const testReply = `Sender: ${bob.userName}, Receiver: ${alice.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    await sendMessage(bobWindow1, testReply);
    // Check config message of message request acceptance

    await waitForTestIdWithText(
      bobWindow1,
      'message-request-response-message',
      englishStrippedStr('messageRequestYouHaveAccepted')
        .withArgs({
          name: alice.userName,
        })
        .toString(),
    );
    await waitForMatchingText(
      bobWindow1,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Message requests decline',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select message request from User A
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      alice.userName,
    );

    await clickOnTestIdWithText(
      bobWindow1,
      'decline-message-request',
      englishStrippedStr('decline').toString(),
    );
    // Confirm decline
    await clickOnTestIdWithText(
      bobWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('delete').toString(),
    );
    // Check config message of message request acceptance
    await waitForMatchingText(
      bobWindow1,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Message requests clear all',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `Sender: ${alice.userName}, Receiver: ${bob.userName}`;
    // send a message to User B from User A
    await sendNewMessage(aliceWindow1, bob.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(bobWindow1, 'message-request-banner');
    // Select 'Clear All' button
    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('clearAll').toString(),
    );
    // Confirm decline
    await clickOnTestIdWithText(
      bobWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('clear').toString(),
    );
    // Navigate back to message request folder to check
    await clickOnTestIdWithText(bobWindow1, 'settings-section');

    await clickOnTestIdWithText(
      bobWindow1,
      'message-requests-settings-menu-item',
      englishStrippedStr('sessionMessageRequests').toString(),
    );
    // Check config message of message request acceptance
    await waitForMatchingText(
      bobWindow1,
      englishStrippedStr('messageRequestsNonePending').toString(),
    );
  },
);

test_Alice_2W_Bob_1W(
  'Block message request',
  async ({ alice, bob, aliceWindow1, aliceWindow2, bobWindow1 }) => {
    const testMessage = `Sender: ${bob.userName}, Receiver: ${alice.userName}`;
    // send a message to Bob to Alice
    await sendNewMessage(bobWindow1, alice.accountid, `${testMessage}`);
    // Check the message request banner appears and click on it
    await clickOnTestIdWithText(aliceWindow1, 'message-request-banner');
    // Select message request from Bob
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    // Block Bob
    await clickOnTestIdWithText(
      aliceWindow1,
      'decline-and-block-message-request',
    );
    // Check modal strings
    // Confirm block
    await clickOnTestIdWithText(aliceWindow1, 'session-confirm-ok-button');
    // Need to wait for the blocked status to sync
    await sleepFor(2000);
    // Check blocked status in blocked contacts list
    await clickOnTestIdWithText(aliceWindow1, 'settings-section');
    await clickOnTestIdWithText(
      aliceWindow1,
      'conversations-settings-menu-item',
    );
    await clickOnTestIdWithText(aliceWindow1, 'reveal-blocked-user-settings');
    // await waitForTestIdWithText(aliceWindow1, 'contact', bob.userName);
    await waitForMatchingText(aliceWindow1, bob.userName);
    // Check that the blocked contacts is on alicewindow2
    // Implemented in groups rebuild
    // Check blocked status in blocked contacts list
    await sleepFor(5000);
    await clickOnTestIdWithText(aliceWindow2, 'settings-section');
    await clickOnTestIdWithText(
      aliceWindow2,
      'conversations-settings-menu-item',
    );
    await clickOnTestIdWithText(aliceWindow2, 'reveal-blocked-user-settings');
    // Implemented in groups rebuild
    // await waitForTestIdWithText(aliceWindow2, 'contact', bob.userName);
    await waitForMatchingText(aliceWindow2, bob.userName);
  },
);

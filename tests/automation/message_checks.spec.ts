import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import { testCommunityName } from './constants/community';
import { longText } from './constants/variables';
import { newUser } from './setup/new_user';
import {
  sessionTestTwoWindows,
  test_Alice_1W_Bob_1W,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { joinCommunity } from './utilities/join_community';
import { sendMessage } from './utilities/message';
import { replyTo } from './utilities/reply_message';
import { sendLinkPreview } from './utilities/send_media';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  clickOnTextMessage,
  hasTextMessageBeenDeleted,
  measureSendingTime,
  typeIntoInput,
  waitForElement,
  waitForLoadingAnimationToFinish,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

test_Alice_1W_Bob_1W(
  'Send image 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `${alice.userName} sending image to ${bob.userName}`;
    const testReply = `${bob.userName} replying to image from ${alice.userName}`;
    await createContact(aliceWindow1, bobWindow1, alice, bob);

    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'fixtures/test-image.png',
    );
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    // Click on untrusted attachment in window B
    await sleepFor(1000);
    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('attachmentsClickToDownload')
        .withArgs({
          file_type: englishStrippedStr('media').toString().toLowerCase(),
        })
        .toString(),
    );
    await clickOnTestIdWithText(bobWindow1, 'session-confirm-ok-button');
    await waitForLoadingAnimationToFinish(bobWindow1, 'loading-animation');
    // Waiting for image to change from loading state to loaded (takes a second)
    await sleepFor(1000);

    await replyTo({
      senderWindow: bobWindow1,
      textMessage: testMessage,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

test_Alice_1W_Bob_1W(
  'Send video 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `${alice.userName} sending video to ${bob.userName}`;
    const testReply = `${bob.userName} replying to video from ${alice.userName}`;
    await createContact(aliceWindow1, bobWindow1, alice, bob);

    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'fixtures/test-video.mp4',
    );
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);
    // give some time before we send the message, as the video preview takes some time to be added
    await sleepFor(1000);

    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('attachmentsClickToDownload')
        .withArgs({
          file_type: englishStrippedStr('media').toString().toLowerCase(),
        })
        .toString(),
    );
    await clickOnTestIdWithText(bobWindow1, 'session-confirm-ok-button');
    await waitForLoadingAnimationToFinish(bobWindow1, 'loading-animation');
    // Waiting for video to change from loading state to loaded (takes a second)
    await sleepFor(1000);
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: testMessage,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

test_Alice_1W_Bob_1W(
  'Send document 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = `${alice.userName} sending document to ${bob.userName}`;
    const testReply = `${bob.userName} replying to document from ${alice.userName}`;
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'fixtures/test-file.pdf',
    );
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);
    await sleepFor(100);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(1000);
    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('attachmentsClickToDownload')
        .withArgs({
          file_type: englishStrippedStr('file').toString().toLowerCase(),
        })
        .toString(),
    );
    await clickOnTestIdWithText(bobWindow1, 'session-confirm-ok-button');
    await waitForLoadingAnimationToFinish(bobWindow1, 'loading-animation');
    // Waiting for video to change from loading state to loaded (takes a second)
    await sleepFor(500);
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: testMessage,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

test_Alice_1W_Bob_1W(
  'Send voice message 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    // const testReply = `${bob.userName} to ${alice.userName}`;
    await createContact(aliceWindow1, bobWindow1, alice, bob);

    await clickOnTestIdWithText(aliceWindow1, 'microphone-button');
    await clickOnTestIdWithText(aliceWindow1, 'session-toast');
    await clickOnTestIdWithText(aliceWindow1, 'enable-microphone');
    await clickOnTestIdWithText(aliceWindow1, 'message-section');
    await clickOnTestIdWithText(aliceWindow1, 'microphone-button');
    await sleepFor(5000);
    await clickOnTestIdWithText(aliceWindow1, 'end-voice-message');
    await sleepFor(4000);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(1000);

    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('attachmentsClickToDownload')
        .withArgs({
          file_type: englishStrippedStr('audio').toString().toLowerCase(),
        })
        .toString(),
    );
    await clickOnTestIdWithText(bobWindow1, 'session-confirm-ok-button');
    await waitForLoadingAnimationToFinish(bobWindow1, 'loading-animation');
    await waitForElement(bobWindow1, 'class', 'rhap_progress-section');
  },
);

test_Alice_1W_Bob_1W(
  'Send GIF 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    // const testReply = `${bob.userName} to ${alice.userName}`;
    await createContact(aliceWindow1, bobWindow1, alice, bob);

    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'fixtures/test-gif.gif',
    );
    await sleepFor(100);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(1000);
    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('attachmentsClickToDownload')
        .withArgs({
          file_type: englishStrippedStr('media').toString().toLowerCase(),
        })
        .toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Send long text 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testReply = `${bob.userName} replying to long text message from ${alice.userName}`;
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await typeIntoInput(aliceWindow1, 'message-input-text-area', longText);
    await sleepFor(100);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    // await waitForSentTick(aliceWindow1, longText);
    await sleepFor(1000);
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: longText,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

test_Alice_1W_Bob_1W(
  'Send link 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testLink = 'https://getsession.org/';
    const testReply = `${bob.userName} replying to link from ${alice.userName}`;

    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await sendLinkPreview(aliceWindow1, testLink);
    await waitForElement(
      bobWindow1,
      'class',
      'module-message__link-preview__title',
      undefined,
      'Session | Send Messages, Not Metadata. | Private Messenger',
    );
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: testLink,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

test_Alice_1W_Bob_1W(
  'Send community invite',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await joinCommunity(aliceWindow1);
    await clickOnTestIdWithText(aliceWindow1, 'conversation-options-avatar');
    await clickOnTestIdWithText(aliceWindow1, 'add-user-button');
    await waitForTestIdWithText(
      aliceWindow1,
      'modal-heading',
      englishStrippedStr('membersInvite').toString(),
    );
    await clickOnTestIdWithText(aliceWindow1, 'contact', bob.userName);
    await clickOnTestIdWithText(aliceWindow1, 'session-confirm-ok-button');
    await clickOnTestIdWithText(aliceWindow1, 'modal-close-button');
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await Promise.all([
      waitForElement(
        aliceWindow1,
        'class',
        'group-name',
        undefined,
        testCommunityName,
      ),
      waitForElement(
        bobWindow1,
        'class',
        'group-name',
        undefined,
        testCommunityName,
      ),
    ]);
  },
);

test_Alice_1W_Bob_1W(
  'Unsend message 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const unsendMessage = 'Testing unsend functionality';
    await createContact(aliceWindow1, bobWindow1, alice, bob);

    await sendMessage(aliceWindow1, unsendMessage);
    await waitForTextMessage(bobWindow1, unsendMessage);
    await clickOnTextMessage(aliceWindow1, unsendMessage, true);
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('delete').toString(),
    );
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('clearMessagesForEveryone').toString(),
    );
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'session-confirm-ok-button',
    });
    await waitForTestIdWithText(
      aliceWindow1,
      'session-toast',
      englishStrippedStr('deleteMessageDeleted')
        .withArgs({ count: 1 })
        .toString(),
    );
    await sleepFor(1000);
    await waitForMatchingText(
      bobWindow1,
      englishStrippedStr('deleteMessageDeleted')
        .withArgs({ count: 1 })
        .toString(),
    );
  },
);

test_Alice_1W_Bob_1W(
  'Delete message 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const deletedMessage = 'Testing deletion functionality';
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await sendMessage(aliceWindow1, deletedMessage);
    await waitForTextMessage(bobWindow1, deletedMessage);
    await clickOnTextMessage(aliceWindow1, deletedMessage, true);
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('delete').toString(),
    );
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'session-confirm-ok-button',
    });
    await waitForTestIdWithText(
      aliceWindow1,
      'session-toast',
      englishStrippedStr('deleteMessageDeleted')
        .withArgs({ count: 1 })
        .toString(),
    );
    await hasTextMessageBeenDeleted(aliceWindow1, deletedMessage, 1000);
    // Still should exist in window B
    await waitForMatchingText(bobWindow1, deletedMessage);
  },
);

sessionTestTwoWindows(
  'Check performance',
  async ([aliceWindow1, bobWindow1]) => {
    const [alice, bob] = await Promise.all([
      newUser(aliceWindow1, 'Alice'),
      newUser(bobWindow1, 'Bob'),
    ]);
    // Create contact
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    const timesArray: Array<number> = [];

    let i;
    for (i = 1; i <= 10; i++) {
      // eslint-disable-next-line no-await-in-loop
      const timeMs = await measureSendingTime(aliceWindow1, i);
      timesArray.push(timeMs);
    }
    console.log(timesArray);
  },
);

// *************** NEED TO WAIT FOR LINK PREVIEW FIX *************************************************

test_Alice_1W_Bob_1W(
  'Send link 1:1',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testMessage = 'https://example.net';
    const testReply = `${bob.userName} replying to link from ${alice.userName}`;

    await createContact(aliceWindow1, bobWindow1, alice, bob);

    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);
    await sleepFor(5000);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(1000);
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: testMessage,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

test_Alice_1W_Bob_1W(
  'Send community invite',
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await joinCommunity(aliceWindow1);
    await clickOnTestIdWithText(aliceWindow1, 'conversation-options-avatar');
    await clickOnTestIdWithText(aliceWindow1, 'add-user-button');
    // Implementing in groups rebuild
    // await waitForTestIdWithText(
    //   aliceWindow1,
    //   'modal-heading',
    //   englishStrippedStr('membersInvite').toString(),
    // );
    // await clickOnTestIdWithText(aliceWindow1, 'contact', bob.userName);
    await clickOnMatchingText(aliceWindow1, bob.userName);
    // await clickOnTestIdWithText(aliceWindow1, 'session-confirm-ok-button');
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('okay').toString(),
    );
    // Implementing in groups rebuild
    // await clickOnTestIdWithText(aliceWindow1, 'modal-close-button');
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await Promise.all([
      waitForElement(
        aliceWindow1,
        'class',
        'group-name',
        undefined,
        testCommunityName,
      ),
      waitForElement(
        bobWindow1,
        'class',
        'group-name',
        undefined,
        testCommunityName,
      ),
    ]);
  },
);

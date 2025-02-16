import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import { test_group_Alice_1W_Bob_1W_Charlie_1W } from './setup/sessionTest';
import { sendMessage } from './utilities/message';
import { replyTo } from './utilities/reply_message';
import {
  checkModalStrings,
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  clickOnTextMessage,
  hasTextMessageBeenDeleted,
  lookForPartialTestId,
  typeIntoInput,
  waitForElement,
  waitForLoadingAnimationToFinish,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Send image to group',
  async ({
    alice,
    bob,
    aliceWindow1,
    bobWindow1,
    charlieWindow1,
    groupCreated,
  }) => {
    const testMessage = `${alice.userName} sending image to ${groupCreated.userName}`;
    const testReply = `${bob.userName} replying to image from ${alice.userName} in ${groupCreated.userName}`;
    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'sample_files/test-image.png',
    );
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);
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

    // reply was sent from bobWindow1 and awaited from aliceWindow1 already
    await waitForTextMessage(charlieWindow1, testReply);
  },
);

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Send video to group',
  async ({ alice, bob, aliceWindow1, bobWindow1, groupCreated }) => {
    const testMessage = `${alice.userName} sending video to ${groupCreated.userName}`;
    const testReply = `${bob.userName} replying to video from ${alice.userName} in ${groupCreated.userName}`;
    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'sample_files/test-video.mp4',
    );
    await sleepFor(1000);
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);
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

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Send document to group',
  async ({ alice, bob, aliceWindow1, bobWindow1, groupCreated }) => {
    const testMessage = `${alice.userName} sending document to ${groupCreated.userName}`;
    const testReply = `${bob.userName} replying to document from ${alice.userName} in ${groupCreated.userName}`;
    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'sample_files/test-file.pdf',
    );
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);
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

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Send voice message to group',
  async ({
    alice,
    bob,
    aliceWindow1,
    bobWindow1,
    charlieWindow1,
    groupCreated,
  }) => {
    const testReply = `${bob.userName} replying to voice message from ${alice.userName} in ${groupCreated.userName}`;
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'microphone-button',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'session-toast',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'enable-microphone',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'microphone-button',
    });
    await sleepFor(5000);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'end-voice-message',
    });
    await sleepFor(2000);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(1000);
    await lookForPartialTestId(bobWindow1, 'audio-', true, true);
    await lookForPartialTestId(charlieWindow1, 'audio-');
    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('reply').toString(),
    );
    await sendMessage(bobWindow1, testReply);
    await waitForTextMessage(aliceWindow1, testReply);
  },
);

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Send GIF to group',
  async ({ alice, bob, aliceWindow1, bobWindow1, groupCreated }) => {
    const testMessage = `${alice.userName} sending GIF to ${groupCreated.userName}`;

    const testReply = `${bob.userName} replying to GIF from ${alice.userName} in ${groupCreated.userName}`;
    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'sample_files/test-gif.gif',
    );
    await sleepFor(100);
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testMessage);

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

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Send long text to group',
  async ({
    alice,
    bob,
    aliceWindow1,
    bobWindow1,
    charlieWindow1,
    groupCreated,
  }) => {
    const longText =
      // eslint-disable-next-line max-len
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis lacinia mi. Praesent fermentum vehicula rhoncus. Aliquam ac purus lobortis, convallis nisi quis, pulvinar elit. Nam commodo eros in molestie lobortis. Donec at mattis est. In tempor ex nec velit mattis, vitae feugiat augue maximus. Nullam risus libero, bibendum et enim et, viverra viverra est. Suspendisse potenti. Sed ut nibh in sem rhoncus suscipit. Etiam tristique leo sit amet ullamcorper dictum. Suspendisse sollicitudin, lectus et suscipit eleifend, libero dui ultricies neque, non elementum nulla orci bibendum lorem. Suspendisse potenti. Aenean a tellus imperdiet, iaculis metus quis, pretium diam. Nunc varius vitae enim vestibulum interdum. In hac habitasse platea dictumst. Donec auctor sem quis eleifend fermentum. Vestibulum neque nulla, maximus non arcu gravida, condimentum euismod turpis. Cras ac mattis orci. Quisque ac enim pharetra felis sodales eleifend. Aliquam erat volutpat. Donec sit amet mollis nibh, eget feugiat ipsum. Integer vestibulum purus ac suscipit egestas. Duis vitae aliquet ligula.';
    const testReply = `${bob.userName} replying to long text message from ${alice.userName} in ${groupCreated.userName}`;
    await typeIntoInput(aliceWindow1, 'message-input-text-area', longText);
    await sleepFor(100);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(1000);
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: longText,
      replyText: testReply,
      receiverWindow: charlieWindow1,
    });
    await waitForTextMessage(charlieWindow1, longText);
  },
);

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Send link to group',
  async ({
    alice,
    bob,
    aliceWindow1,
    bobWindow1,
    charlieWindow1,
    groupCreated,
  }) => {
    const testMessage = `${alice.userName} sending link to ${groupCreated.userName}`;
    const testReply = `${bob.userName} replying to link from ${alice.userName} in ${groupCreated.userName}`;
    const testLink = 'https://getsession.org/';
    await typeIntoInput(aliceWindow1, 'message-input-text-area', testLink);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await clickOnTestIdWithText(
      aliceWindow1,
      'message-content',
      testMessage,
      true,
    );
    // Need to copy link to clipboard, as the enable link preview modal
    // doesn't pop up if manually typing link (needs to be pasted)
    // Need to have a nth(0) here to account for Copy Account ID, Appium was getting confused
    const firstCopyBtn = await aliceWindow1
      .locator(
        `[data-testid=context-menu-item]:has-text(${englishStrippedStr(
          'copy',
        ).toString()})`,
      )
      .nth(0);
    await firstCopyBtn.click();
    await waitForTestIdWithText(
      aliceWindow1,
      'session-toast',
      englishStrippedStr('copied').toString(),
    );
    await clickOnTestIdWithText(aliceWindow1, 'message-input-text-area');
    const isMac = process.platform === 'darwin';
    await aliceWindow1.keyboard.press(`${isMac ? 'Meta' : 'Control'}+V`);
    await checkModalStrings(
      aliceWindow1,
      englishStrippedStr('linkPreviewsEnable').toString(),
      englishStrippedStr('linkPreviewsFirstDescription')
        .withArgs({ app_name: 'Session' })
        .toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('enable').toString(),
    );
    // Needs to be changed to link-preview-loading
    await waitForLoadingAnimationToFinish(aliceWindow1, 'loading-spinner');
    // Also needs to be implemented
    // await waitForTestIdWithText(aliceWindow1, 'link-preview-image')
    // await waitForTestIdWithText(
    //   aliceWindow1,
    //   'link-preview-title',
    //   'Session | Send Messages, Not Metadata. | Private Messenger',
    // );
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await Promise.all([
      waitForElement(
        bobWindow1,
        'class',
        'module-message__link-preview__title',
        undefined,
        'Session | Send Messages, Not Metadata. | Private Messenger',
      ),
      waitForElement(
        charlieWindow1,
        'class',
        'module-message__link-preview__title',
        undefined,
        'Session | Send Messages, Not Metadata. | Private Messenger',
      ),
    ]);
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: testMessage,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Unsend message to group',
  async ({ aliceWindow1, bobWindow1, charlieWindow1, groupCreated }) => {
    const unsendMessage = `Testing unsend functionality in ${groupCreated.userName}`;
    await sendMessage(aliceWindow1, unsendMessage);
    await Promise.all([
      waitForTextMessage(bobWindow1, unsendMessage),
      waitForTextMessage(charlieWindow1, unsendMessage),
    ]);
    await clickOnTextMessage(aliceWindow1, unsendMessage, true);
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('delete').toString(),
    );
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('clearMessagesForEveryone').toString(),
    );
    // To be implemented in Standardise Message Deletion feature
    // await checkModalStrings(
    //   aliceWindow1,
    //   englishStrippedStr('deleteMessage').withArgs({ count: 1 }).toString(),
    //   englishStrippedStr('deleteMessageConfirm').toString(),
    // );
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
    await waitForMatchingText(
      charlieWindow1,
      englishStrippedStr('deleteMessageDeleted')
        .withArgs({ count: 1 })
        .toString(),
    );
  },
);

test_group_Alice_1W_Bob_1W_Charlie_1W(
  'Delete message to group',
  async ({ aliceWindow1, bobWindow1, charlieWindow1, groupCreated }) => {
    const deletedMessage = `Testing delete message functionality in ${groupCreated.userName}`;
    await sendMessage(aliceWindow1, deletedMessage);
    await waitForTextMessage(bobWindow1, deletedMessage);
    await waitForTextMessage(charlieWindow1, deletedMessage);
    await clickOnTextMessage(aliceWindow1, deletedMessage, true);
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('delete').toString(),
    );
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('clearMessagesForMe').toString(),
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
    await hasTextMessageBeenDeleted(aliceWindow1, deletedMessage, 5000);
    // Should still be there for user B and C
    await waitForMatchingText(bobWindow1, deletedMessage);
    await waitForMatchingText(charlieWindow1, deletedMessage);
  },
);

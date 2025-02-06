import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import {
  test_Alice_2W,
  test_Alice_2W_Bob_1W,
  test_group_Alice_2W_Bob_1W_Charlie_1W,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { sendMessage } from './utilities/message';
import { sendNewMessage } from './utilities/send_message';
import { setDisappearingMessages } from './utilities/set_disappearing_messages';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  doesTextIncludeString,
  hasElementBeenDeleted,
  hasTextMessageBeenDeleted,
  typeIntoInput,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

test_Alice_2W_Bob_1W(
  'Disappear after read 1:1',
  async ({ alice, bob, aliceWindow1, aliceWindow2, bobWindow1 }) => {
    const testMessage =
      'Testing disappearing messages timer is working correctly';

    const controlMessage = englishStrippedStr('disappearingMessagesSetYou')
      .withArgs({
        time: '10 seconds',
        disappearing_messages_type: englishStrippedStr(
          'disappearingMessagesTypeRead',
        ).toString(),
      })
      .toString();
    // Create Contact
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Click on conversation in linked device
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );

    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', 'disappear-after-read-option', 'time-option-10-seconds'],
      bobWindow1,
    );

    // Check control message is visible
    await doesTextIncludeString(
      aliceWindow1,
      'disappear-control-message',
      controlMessage,
    );
    await sleepFor(10000);
    // Control message should also disappear after 10 seconds
    await hasTextMessageBeenDeleted(aliceWindow1, controlMessage);
    // Send message
    await sendMessage(aliceWindow1, testMessage);
    // Check window B for message to confirm arrival
    // await clickOnTextMessage(bobWindow1, testMessage);
    await waitForTextMessage(bobWindow1, testMessage);
    // Wait 10 seconds to see if message is removed
    await sleepFor(10000);
    await hasTextMessageBeenDeleted(aliceWindow1, testMessage);
    // Check window B (need to refocus window)
    console.log(`Bring window B to front`);
    const message = 'Forcing window to front';
    await typeIntoInput(bobWindow1, 'message-input-text-area', message);
    // click up arrow (send)
    await clickOnElement({
      window: bobWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    await sleepFor(10000);
    await hasTextMessageBeenDeleted(bobWindow1, testMessage);
  },
);

test_Alice_2W_Bob_1W(
  'Disappear after send 1:1',
  async ({ alice, bob, aliceWindow1, aliceWindow2, bobWindow1 }) => {
    const testMessage =
      'Testing disappearing messages timer is working correctly';
    const controlMessage = englishStrippedStr('disappearingMessagesSetYou')
      .withArgs({
        time: '10 seconds',
        disappearing_messages_type: englishStrippedStr(
          'disappearingMessagesTypeSent',
        ).toString(),
      })
      .toString();
    // Create Contact
    await createContact(aliceWindow1, bobWindow1, alice, bob);

    // Click on conversation in linked device
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', 'disappear-after-send-option', 'time-option-10-seconds'],
      bobWindow1,
    );
    // Check control message is correct and appearing
    await waitForTestIdWithText(
      aliceWindow1,
      'disappear-control-message',
      controlMessage,
    );
    await sendMessage(aliceWindow1, testMessage);
    // Check message has appeared in receivers window and linked device
    await Promise.all([
      waitForTextMessage(bobWindow1, testMessage),
      waitForTextMessage(aliceWindow2, testMessage),
    ]);
    // Wait 10 seconds for message to disappearing (should disappear on all devices at once)
    await sleepFor(10000);
    await Promise.all([
      hasTextMessageBeenDeleted(aliceWindow1, testMessage),
      hasTextMessageBeenDeleted(bobWindow1, testMessage),
      hasTextMessageBeenDeleted(aliceWindow2, testMessage),
    ]);
  },
);

test_group_Alice_2W_Bob_1W_Charlie_1W(
  'Disappear after send groups',
  async ({
    aliceWindow1,
    aliceWindow2,
    bobWindow1,
    charlieWindow1,
    groupCreated,
  }) => {
    const controlMessage = englishStrippedStr('disappearingMessagesSetYou')
      .withArgs({
        time: '10 seconds',
        disappearing_messages_type: englishStrippedStr(
          'disappearingMessagesTypeSent',
        ).toString(),
      })
      .toString();
    const testMessage = 'Testing disappearing messages in groups';

    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      groupCreated.userName,
    );
    await setDisappearingMessages(aliceWindow1, [
      'group',
      'disappear-after-send-option',
      'time-option-10-seconds',
    ]);
    // Check control message is visible and correct
    await doesTextIncludeString(
      aliceWindow1,
      'disappear-control-message',
      controlMessage,
    );
    await sendMessage(aliceWindow1, testMessage);
    await Promise.all([
      waitForTextMessage(bobWindow1, testMessage),
      waitForTextMessage(charlieWindow1, testMessage),
      waitForTextMessage(aliceWindow2, testMessage),
    ]);
    // Wait 10 seconds for messages to disappear
    await sleepFor(10000);
    await Promise.all([
      hasTextMessageBeenDeleted(aliceWindow1, testMessage),
      hasTextMessageBeenDeleted(bobWindow1, testMessage),
      hasTextMessageBeenDeleted(charlieWindow1, testMessage),
      hasTextMessageBeenDeleted(aliceWindow2, testMessage),
    ]);
  },
);

test_Alice_2W(
  'Disappear after send note to self',
  async ({ alice, aliceWindow1, aliceWindow2 }) => {
    const testMessage = 'Message to test note to self';
    const testMessageDisappear = 'Message testing disappearing messages';
    const controlMessage = englishStrippedStr('disappearingMessagesSetYou')
      .withArgs({
        time: '10 seconds',
        disappearing_messages_type: englishStrippedStr(
          'disappearingMessagesTypeSent',
        ).toString(),
      })
      .toString();
    // Open Note to self conversation
    await sendNewMessage(aliceWindow1, alice.accountid, testMessage);
    // Check messages are syncing across linked devices
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      englishStrippedStr('noteToSelf').toString(),
    );
    await waitForTextMessage(aliceWindow2, testMessage);
    // Enable disappearing messages
    await setDisappearingMessages(aliceWindow1, [
      'note-to-self',
      'disappear-after-send-option',
      'input-10-seconds',
    ]);
    // Check control message is visible and correct
    await doesTextIncludeString(
      aliceWindow1,
      'disappear-control-message',
      controlMessage,
    );
    await sendMessage(aliceWindow1, testMessageDisappear);
    await waitForTextMessage(aliceWindow2, testMessageDisappear);
    await Promise.all([
      hasTextMessageBeenDeleted(aliceWindow1, testMessageDisappear),
      hasTextMessageBeenDeleted(aliceWindow2, testMessageDisappear),
    ]);
  },
);

test_Alice_2W_Bob_1W(
  'Disappear after send off 1:1',
  async ({ alice, bob, aliceWindow1, aliceWindow2, bobWindow1 }) => {
    const testMessage = 'Turning disappearing messages off';
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Click on conversation on linked device
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    // Set disappearing messages to on
    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', 'disappear-after-send-option', 'time-option-10-seconds'],
      bobWindow1,
    );
    // Check control message is visible and correct
    const controlMessage = englishStrippedStr('disappearingMessagesSetYou')
      .withArgs({
        time: '10 seconds',
        disappearing_messages_type: englishStrippedStr(
          'disappearingMessagesTypeSent',
        ).toString(),
      })
      .toString();
    await Promise.all([
      waitForTestIdWithText(
        aliceWindow1,
        'disappear-control-message',
        controlMessage,
      ),
      waitForTestIdWithText(
        aliceWindow2,
        'disappear-control-message',
        controlMessage,
      ),
      waitForTestIdWithText(
        bobWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSet')
          .withArgs({
            name: alice.userName,
            time: '10 seconds',
            disappearing_messages_type: englishStrippedStr(
              'disappearingMessagesTypeSent',
            ).toString(),
          })
          .toString(),
      ),
    ]);
    await sendMessage(aliceWindow1, testMessage);
    // Check message has appeared in receivers window and linked device
    await Promise.all([
      waitForTextMessage(bobWindow1, testMessage),
      waitForTextMessage(aliceWindow2, testMessage),
    ]);
    await clickOnTestIdWithText(
      aliceWindow1,
      'conversation-options-avatar',
      undefined,
      undefined,
      1000,
    );
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'disappearing-messages',
      maxWait: 100,
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'disappear-off-option',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'disappear-set-button',
    });
    // Select Follow setting in Bob's window
    await clickOnMatchingText(
      bobWindow1,
      englishStrippedStr('disappearingMessagesFollowSetting').toString(),
    );
    await clickOnElement({
      window: bobWindow1,
      strategy: 'data-testid',
      selector: 'session-confirm-ok-button',
    });
    // Check control message are visible and correct
    // Each window has two control messages: You turned off and other user turned off (because we're following settings)
    await Promise.all([
      waitForTestIdWithText(
        aliceWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesTurnedOffYou').toString(),
      ),
      waitForTestIdWithText(
        aliceWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesTurnedOff')
          .withArgs({ name: bob.userName })
          .toString(),
      ),
      waitForTestIdWithText(
        aliceWindow2,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesTurnedOffYou').toString(),
      ),
      waitForTestIdWithText(
        aliceWindow2,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesTurnedOff')
          .withArgs({ name: bob.userName })
          .toString(),
      ),
      waitForTestIdWithText(
        bobWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesTurnedOff')
          .withArgs({ name: alice.userName })
          .toString(),
      ),
      waitForTestIdWithText(
        bobWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesTurnedOffYou').toString(),
      ),
    ]);
    await Promise.all([
      hasElementBeenDeleted(
        aliceWindow1,
        'data-testid',
        'disappear-messages-type-and-time',
      ),
      hasElementBeenDeleted(
        aliceWindow2,
        'data-testid',
        'disappear-messages-type-and-time',
      ),
      hasElementBeenDeleted(
        bobWindow1,
        'data-testid',
        'disappear-messages-type-and-time',
      ),
    ]);
  },
);

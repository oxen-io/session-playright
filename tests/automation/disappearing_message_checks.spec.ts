import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import { testCommunityName } from './constants/community';
import { longText, mediaArray } from './constants/variables';
import { test_Alice_1W_Bob_1W } from './setup/sessionTest';
import { DMTimeOption } from './types/testing';
import { createContact } from './utilities/create_contact';
import { joinCommunity } from './utilities/join_community';
import {
  sendLinkPreview,
  sendMedia,
  sendVoiceMessage,
  trustUser,
} from './utilities/send_media';
import { setDisappearingMessages } from './utilities/set_disappearing_messages';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  hasElementBeenDeleted,
  hasTextMessageBeenDeleted,
  typeIntoInput,
  waitForElement,
  waitForLoadingAnimationToFinish,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';
import { makeVoiceCall } from './utilities/voice_call';

// Disappearing time settings for all tests
const timeOption: DMTimeOption = 'time-option-30-seconds';
const disappearingMessageType = 'disappear-after-send-option';
const disappearAction = 'sent';

mediaArray.forEach(({ mediaType, path, attachmentType }) => {
  test_Alice_1W_Bob_1W(
    `Send disappearing ${mediaType} 1:1`,
    async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
      const testMessage = `${alice.userName} sending disappearing ${mediaType} to ${bob.userName}`;
      await createContact(aliceWindow1, bobWindow1, alice, bob);
      // Set disappearing messages
      await setDisappearingMessages(
        aliceWindow1,
        ['1:1', disappearingMessageType, timeOption],
        bobWindow1,
      );
      await Promise.all([
        waitForTestIdWithText(
          aliceWindow1,
          'disappear-control-message',
          englishStrippedStr('disappearingMessagesSetYou')
            .withArgs({
              time: '30 seconds',
              disappearing_messages_type: disappearAction,
            })
            .toString(),
        ),
        waitForTestIdWithText(
          bobWindow1,
          'disappear-control-message',
          englishStrippedStr('disappearingMessagesSet')
            .withArgs({
              time: '30 seconds',
              disappearing_messages_type: disappearAction,
              name: alice.userName,
            })
            .toString(),
        ),
      ]);
      // Send media
      if (mediaType === 'voice') {
        await sendVoiceMessage(aliceWindow1);
      } else {
        await sendMedia(aliceWindow1, path, testMessage);
      }
      // Click on untrusted attachment
      await trustUser(bobWindow1, attachmentType);

      await waitForLoadingAnimationToFinish(bobWindow1, 'loading-animation');
      if (mediaType === 'voice') {
        // await waitForTestIdWithText(bobWindow1, 'audio-player');
        await waitForElement(bobWindow1, 'class', 'rhap_progress-section');
        await sleepFor(30000);
        // await hasElementBeenDeleted(bobWindow1, 'data-testid', 'audio-player');
        await hasElementBeenDeleted(
          bobWindow1,
          'class',
          'rhap_progress-section',
        );
      } else {
        await waitForTextMessage(bobWindow1, testMessage);
        // Wait 30 seconds for image to disappear
        await sleepFor(30000);
        await hasTextMessageBeenDeleted(bobWindow1, testMessage);
      }
    },
  );
});

test_Alice_1W_Bob_1W(
  `Send disappearing long text 1:1`,
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Set disappearing messages
    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', disappearingMessageType, timeOption],
      bobWindow1,
    );
    await Promise.all([
      waitForTestIdWithText(
        aliceWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSetYou')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
          })
          .toString(),
      ),
      waitForTestIdWithText(
        bobWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSet')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
            name: alice.userName,
          })
          .toString(),
      ),
    ]);
    await typeIntoInput(aliceWindow1, 'message-input-text-area', longText);
    await sleepFor(100);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'send-message-button',
    });
    //   Implementing in groups rebuild
    // await waitForSentTick(aliceWindow1, longText);
    await waitForTextMessage(bobWindow1, longText);
    // Wait 30 seconds for long text to disappear
    await sleepFor(30000);
    await hasTextMessageBeenDeleted(bobWindow1, longText);
  },
);

test_Alice_1W_Bob_1W(
  `Send disappearing link preview 1:1`,
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    const testLink = 'https://getsession.org/';
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Set disappearing messages
    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', disappearingMessageType, timeOption],
      bobWindow1,
    );
    await Promise.all([
      waitForTestIdWithText(
        aliceWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSetYou')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
          })
          .toString(),
      ),
      waitForTestIdWithText(
        bobWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSet')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
            name: alice.userName,
          })
          .toString(),
      ),
    ]);
    await sendLinkPreview(aliceWindow1, testLink);
    await waitForElement(
      bobWindow1,
      'class',
      'module-message__link-preview__title',
      undefined,
      'Session | Send Messages, Not Metadata. | Private Messenger',
    );
    // Wait 30 seconds for link preview to disappear
    await sleepFor(30000);
    await hasElementBeenDeleted(
      bobWindow1,
      'class',
      'module-message__link-preview__title',
      undefined,
      'Session | Send Messages, Not Metadata. | Private Messenger',
    );
  },
);

test_Alice_1W_Bob_1W(
  `Send disappearing community invite 1:1`,
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Set disappearing messages
    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', disappearingMessageType, timeOption],
      bobWindow1,
    );
    await Promise.all([
      waitForTestIdWithText(
        aliceWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSetYou')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
          })
          .toString(),
      ),
      waitForTestIdWithText(
        bobWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSet')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
            name: alice.userName,
          })
          .toString(),
      ),
    ]);
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
    // Wait 30 seconds for community invite to disappear
    await sleepFor(30000);
    await Promise.all([
      hasElementBeenDeleted(
        bobWindow1,
        'class',
        'group-name',
        undefined,
        testCommunityName,
      ),
      hasElementBeenDeleted(
        aliceWindow1,
        'class',
        'group-name',
        undefined,
        testCommunityName,
      ),
    ]);
  },
);

test_Alice_1W_Bob_1W(
  `Send disappearing call message 1:1`,
  async ({ alice, aliceWindow1, bob, bobWindow1 }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Set disappearing messages
    await setDisappearingMessages(
      aliceWindow1,
      ['1:1', disappearingMessageType, timeOption],
      bobWindow1,
    );
    await Promise.all([
      waitForTestIdWithText(
        aliceWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSetYou')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
          })
          .toString(),
      ),
      waitForTestIdWithText(
        bobWindow1,
        'disappear-control-message',
        englishStrippedStr('disappearingMessagesSet')
          .withArgs({
            time: '30 seconds',
            disappearing_messages_type: disappearAction,
            name: alice.userName,
          })
          .toString(),
      ),
    ]);
    await makeVoiceCall(aliceWindow1, bobWindow1, alice, bob);
    // In the receivers window, the message is 'Call in progress'
    await Promise.all([
      waitForTestIdWithText(
        bobWindow1,
        'call-notification-answered-a-call',
        englishStrippedStr('callsInProgress').toString(),
      ),
      // In the callers window, the message is 'You called {reciverName}'
      waitForTestIdWithText(
        aliceWindow1,
        'call-notification-started-call',
        englishStrippedStr('callsYouCalled')
          .withArgs({ name: bob.userName })
          .toString(),
      ),
    ]);
    // Wait 30 seconds for call message to disappear
    await sleepFor(30000);
    await Promise.all([
      hasElementBeenDeleted(
        bobWindow1,
        'data-testid',
        'call-notification-answered-a-call',
        undefined,
        englishStrippedStr('callsInProgress').toString(),
      ),
      hasElementBeenDeleted(
        aliceWindow1,
        'data-testid',
        'call-notification-started-call',
        undefined,
        englishStrippedStr('callsYouCalled')
          .withArgs({ name: bob.userName })
          .toString(),
      ),
    ]);
  },
);

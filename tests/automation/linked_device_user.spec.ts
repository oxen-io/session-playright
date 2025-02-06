/* eslint-disable no-await-in-loop */
import { Page, expect } from '@playwright/test';
import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import { forceCloseAllWindows } from './setup/closeWindows';
import { newUser } from './setup/new_user';
import {
  sessionTestOneWindow,
  test_Alice_2W,
  test_Alice_2W_Bob_1W,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { linkedDevice } from './utilities/linked_device';
import { sendMessage } from './utilities/message';
import {
  checkModalStrings,
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  clickOnTextMessage,
  doWhileWithMax,
  hasElementBeenDeleted,
  hasTextMessageBeenDeleted,
  typeIntoInput,
  waitForLoadingAnimationToFinish,
  waitForMatchingPlaceholder,
  waitForMatchingText,
  waitForTestIdWithText,
  waitForTextMessage,
} from './utilities/utils';

sessionTestOneWindow('Link a device', async ([aliceWindow1]) => {
  let aliceWindow2: Page | undefined;
  try {
    const userA = await newUser(aliceWindow1, 'Alice');
    aliceWindow2 = await linkedDevice(userA.recoveryPassword); // not using fixture here as we want to check the behavior finely
    await clickOnTestIdWithText(aliceWindow1, 'leftpane-primary-avatar');
    // Verify Username
    await waitForTestIdWithText(
      aliceWindow1,
      'your-profile-name',
      userA.userName,
    );
    // Verify Session ID
    await waitForTestIdWithText(
      aliceWindow1,
      'your-session-id',
      userA.accountid,
    );
    // exit profile modal
    await clickOnTestIdWithText(aliceWindow1, 'modal-close-button');
    // You're almost finished isn't displayed
    const errorDesc = 'Should not be found';
    try {
      const elemShouldNotBeFound = aliceWindow2.locator(
        '[data-testid=reveal-recovery-phrase]',
      );
      if (elemShouldNotBeFound) {
        console.error(
          'Continue to save recovery phrase not found, excellent news',
        );
        throw new Error(errorDesc);
      }
    } catch (e) {
      if (e.message !== errorDesc) {
        // this is NOT ok
        throw e;
      }
    }
  } finally {
    if (aliceWindow2) {
      await forceCloseAllWindows([aliceWindow2]);
    }
  }
});

test_Alice_2W(
  'Changed username syncs',
  async ({ aliceWindow1, aliceWindow2 }) => {
    const newUsername = 'Tiny bubble';
    await clickOnTestIdWithText(aliceWindow1, 'leftpane-primary-avatar');
    // Click on pencil icon
    await clickOnTestIdWithText(aliceWindow1, 'edit-profile-icon');
    // Replace old username with new username
    await typeIntoInput(aliceWindow1, 'profile-name-input', newUsername);
    // Press enter to confirm change
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'save-button-profile-update',
    });
    // Wait for loading animation
    await waitForLoadingAnimationToFinish(aliceWindow1, 'loading-spinner');

    // Check username change in window B
    // Click on profile settings in window B
    // Waiting for the username to change
    await doWhileWithMax(
      15000,
      500,
      'waiting for updated username in profile dialog',
      async () => {
        await clickOnTestIdWithText(aliceWindow2, 'leftpane-primary-avatar');
        // Verify username has changed to new username
        try {
          await waitForTestIdWithText(
            aliceWindow2,
            'your-profile-name',
            newUsername,
            100,
          );
          return true;
        } catch (e) {
          // if waitForTestIdWithText doesn't find the right username, close the window and retry
          return false;
        } finally {
          await clickOnElement({
            window: aliceWindow2,
            strategy: 'data-testid',
            selector: 'modal-close-button',
          });
        }
      },
    );
  },
);

test_Alice_2W(
  'Profile picture syncs',
  async ({ aliceWindow1, aliceWindow2 }, testinfo) => {
    await clickOnTestIdWithText(aliceWindow1, 'leftpane-primary-avatar');
    // Click on current profile picture
    await waitForTestIdWithText(
      aliceWindow1,
      'copy-button-profile-update',
      englishStrippedStr('copy').toString(),
    );

    await clickOnTestIdWithText(aliceWindow1, 'image-upload-section');
    await clickOnTestIdWithText(aliceWindow1, 'image-upload-click');
    await clickOnTestIdWithText(aliceWindow1, 'save-button-profile-update');
    await waitForTestIdWithText(aliceWindow1, 'loading-spinner');

    if (testinfo.config.updateSnapshots === 'all') {
      await sleepFor(15000, true); // long time to be sure a poll happened when we want to update the snapshot
    } else {
      await sleepFor(2000); // short time as we will loop right below until the snapshot is what we expect
    }
    const leftpaneAvatarContainer = await waitForTestIdWithText(
      aliceWindow2,
      'leftpane-primary-avatar',
    );
    const start = Date.now();
    let correctScreenshot = false;
    let tryNumber = 0;
    let lastError: Error | undefined;
    do {
      try {
        const screenshot = await leftpaneAvatarContainer.screenshot({
          type: 'jpeg',
        });
        expect(screenshot).toMatchSnapshot({
          name: 'avatar-updated-blue.jpeg',
        });
        correctScreenshot = true;
        console.info(
          `screenshot matching of "Check profile picture syncs" passed after "${tryNumber}" retries!`,
        );
      } catch (e) {
        lastError = e;
      }
      tryNumber++;
    } while (Date.now() - start <= 20000 && !correctScreenshot);

    if (!correctScreenshot) {
      console.info(
        `screenshot matching of "Check profile picture syncs" try "${tryNumber}" failed with: ${lastError?.message}`,
      );
      throw new Error('waited 20s and still the screenshot is not right');
    }
  },
);

test_Alice_2W_Bob_1W(
  'Contacts syncs',
  async ({ alice, aliceWindow1, aliceWindow2, bob, bobWindow1 }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // linked device (aliceWindow2)
    await waitForTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    console.info('Contacts correctly synced');
  },
);

test_Alice_2W_Bob_1W(
  'Deleted message syncs',
  async ({ alice, aliceWindow1, aliceWindow2, bob, bobWindow1 }) => {
    const messageToDelete = 'Testing deletion functionality for linked device';
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await sendMessage(aliceWindow1, messageToDelete);
    // Navigate to conversation on linked device and for message from user A to user B
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await Promise.all([
      waitForTextMessage(aliceWindow2, messageToDelete),
      waitForTextMessage(bobWindow1, messageToDelete),
    ]);
    await clickOnTextMessage(aliceWindow1, messageToDelete, true);
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('delete').toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('delete').toString(),
    );
    await waitForTestIdWithText(
      aliceWindow1,
      'session-toast',
      englishStrippedStr('deleteMessageDeleted')
        .withArgs({ count: 1 })
        .toString(),
    );
    await hasTextMessageBeenDeleted(aliceWindow1, messageToDelete, 6000);
    // linked device for deleted message
    // Waiting for message to be removed
    // Check for linked device
    await hasTextMessageBeenDeleted(aliceWindow2, messageToDelete, 10000);
    // Still should exist for user B
    await waitForMatchingText(bobWindow1, messageToDelete);
  },
);

test_Alice_2W_Bob_1W(
  'Unsent message syncs',
  async ({ alice, aliceWindow1, aliceWindow2, bob, bobWindow1 }) => {
    const unsentMessage = 'Testing unsending functionality for linked device';
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await sendMessage(aliceWindow1, unsentMessage);
    // Navigate to conversation on linked device and for message from user A to user B
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await Promise.all([
      waitForTextMessage(aliceWindow2, unsentMessage),
      waitForTextMessage(bobWindow1, unsentMessage),
    ]);
    await clickOnTextMessage(aliceWindow1, unsentMessage, true);
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
    await hasTextMessageBeenDeleted(aliceWindow1, unsentMessage, 1000);
    await waitForMatchingText(
      bobWindow1,
      englishStrippedStr('deleteMessageDeleted')
        .withArgs({ count: 1 })
        .toString(),
    );
    // linked device for deleted message
    await hasTextMessageBeenDeleted(aliceWindow2, unsentMessage, 1000);
  },
);

test_Alice_2W_Bob_1W(
  'Blocked user syncs',
  async ({ alice, aliceWindow1, aliceWindow2, bob, bobWindow1 }) => {
    const testMessage = 'Testing blocking functionality for linked device';

    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await sendMessage(aliceWindow1, testMessage);
    // Navigate to conversation on linked device and check for message from user A to user B
    await clickOnTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      bob.userName,
      true,
    );
    // Select block
    await clickOnTestIdWithText(
      aliceWindow2,
      'context-menu-item',
      englishStrippedStr('block').toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow2,
      'session-confirm-ok-button',
      englishStrippedStr('block').toString(),
    );
    // Verify the user was moved to the blocked contact list
    await waitForMatchingPlaceholder(
      aliceWindow1,
      'message-input-text-area',
      englishStrippedStr('blockBlockedDescription').toString(),
    );
    // reveal-blocked-user-settings is not updated once opened
    // Check linked device for blocked contact in settings screen
    // Click on settings tab
    await clickOnTestIdWithText(aliceWindow2, 'settings-section');
    await clickOnTestIdWithText(
      aliceWindow2,
      'conversations-settings-menu-item',
    );
    // a conf sync job can take 30s (if the last one failed) +  10s polling to show a change on a linked device.
    await clickOnTestIdWithText(
      aliceWindow2,
      'reveal-blocked-user-settings',
      undefined,
      undefined,
      50000,
    );
    // Check if user B is in blocked contact list
    await waitForMatchingText(aliceWindow2, bob.userName);
  },
);

test_Alice_2W_Bob_1W(
  'Deleted conversation syncs',
  async ({ alice, aliceWindow1, aliceWindow2, bob, bobWindow1 }) => {
    // Create contact and send new message
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Confirm contact by checking Messages tab (name should appear in list)
    await Promise.all([
      clickOnTestIdWithText(aliceWindow1, 'message-section'),
      clickOnTestIdWithText(bobWindow1, 'message-section'),
      clickOnTestIdWithText(aliceWindow2, 'message-section'),
    ]);
    await Promise.all([
      clickOnElement({
        window: aliceWindow1,
        strategy: 'data-testid',
        selector: 'new-conversation-button',
      }),
      clickOnElement({
        window: bobWindow1,
        strategy: 'data-testid',
        selector: 'new-conversation-button',
      }),
      clickOnElement({
        window: aliceWindow2,
        strategy: 'data-testid',
        selector: 'new-conversation-button',
      }),
    ]);
    await Promise.all([
      waitForTestIdWithText(
        aliceWindow1,
        'module-conversation__user__profile-name',
        bob.userName,
      ),
      waitForTestIdWithText(
        bobWindow1,
        'module-conversation__user__profile-name',
        alice.userName,
      ),
      waitForTestIdWithText(
        aliceWindow2,
        'module-conversation__user__profile-name',
        bob.userName,
      ),
    ]);
    // Delete contact
    await clickOnTestIdWithText(aliceWindow1, 'message-section');
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
      true,
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'context-menu-item',
      englishStrippedStr('conversationsDelete').toString(),
    );
    await checkModalStrings(
      aliceWindow1,
      englishStrippedStr('conversationsDelete').toString(),
      englishStrippedStr('conversationsDeleteDescription')
        .withArgs({ name: bob.userName })
        .toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('delete').toString(),
    );
    // Need to close 'New Conversation' screen
    await clickOnTestIdWithText(aliceWindow2, 'new-conversation-button');
    // Check if conversation is deleted
    // Need to wait for deletion to propagate to linked device
    await Promise.all([
      hasElementBeenDeleted(
        aliceWindow1,
        'data-testid',
        'module-conversation__user__profile-name',
        1000,
        bob.userName,
      ),
      hasElementBeenDeleted(
        aliceWindow2,
        'data-testid',
        'module-conversation__user__profile-name',
        8000,
        bob.userName,
      ),
    ]);
  },
);

test_Alice_2W(
  'Hide note to self syncs',
  async ({ alice, aliceWindow1, aliceWindow2 }) => {
    await clickOnTestIdWithText(aliceWindow1, 'new-conversation-button');
    await clickOnTestIdWithText(
      aliceWindow1,
      'chooser-new-conversation-button',
    );
    await typeIntoInput(
      aliceWindow1,
      'new-session-conversation',
      alice.accountid,
    );
    await clickOnTestIdWithText(aliceWindow1, 'next-new-conversation-button');
    await waitForTestIdWithText(
      aliceWindow1,
      'header-conversation-name',
      englishStrippedStr('noteToSelf').toString(),
    );
    await sendMessage(aliceWindow1, 'Testing note to self');
    // Check if note to self is visible in linked device
    await sleepFor(1000);
    await waitForTestIdWithText(
      aliceWindow2,
      'module-conversation__user__profile-name',
      englishStrippedStr('noteToSelf').toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      englishStrippedStr('noteToSelf').toString(),
      true,
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'context-menu-item',
      englishStrippedStr('noteToSelfHide').toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('hide').toString(),
    );
    // Check linked device for hidden note to self
    await sleepFor(1000);
    await Promise.all([
      hasElementBeenDeleted(
        aliceWindow1,
        'data-testid',
        'module-conversation__user__profile-name',
        5000,
        englishStrippedStr('noteToSelf').toString(),
      ),
      hasElementBeenDeleted(
        aliceWindow2,
        'data-testid',
        'module-conversation__user__profile-name',
        8000,
        englishStrippedStr('noteToSelf').toString(),
      ),
    ]);
  },
);

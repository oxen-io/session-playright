import { expect } from '@playwright/test';
import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import {
  sessionTestTwoWindows,
  test_Alice_1W_Bob_1W,
  test_Alice_1W_no_network,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { sendMessage } from './utilities/message';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  typeIntoInput,
  waitForMatchingText,
  waitForTestIdWithText,
} from './utilities/utils';
import { englishStrippedStr } from '../locale/localizedString';

// Send message in one to one conversation with new contact
sessionTestTwoWindows('Create contact', async ([windowA, windowB]) => {
  // no fixture for that one
  const [userA, userB] = await Promise.all([
    newUser(windowA, 'Alice'),
    newUser(windowB, 'Bob'),
  ]);
  await createContact(windowA, windowB, userA, userB);
  // Navigate to contacts tab in User B's window
  await waitForTestIdWithText(
    windowB,
    'message-request-response-message',
    englishStrippedStr('messageRequestYouHaveAccepted')
      .withArgs({
        name: userA.userName,
      })
      .toString(),
  );
  await Promise.all([
    clickOnElement({
      window: windowA,
      strategy: 'data-testid',
      selector: 'new-conversation-button',
    }),
    clickOnElement({
      window: windowB,
      strategy: 'data-testid',
      selector: 'new-conversation-button',
    }),
  ]);
  await Promise.all([
    waitForTestIdWithText(
      windowA,
      'module-conversation__user__profile-name',
      userB.userName,
    ),
    waitForTestIdWithText(
      windowB,
      'module-conversation__user__profile-name',
      userA.userName,
    ),
  ]);
});

test_Alice_1W_Bob_1W(
  'Block user in conversation list',
  async ({ aliceWindow1, bobWindow1, alice, bob }) => {
    // Create contact and send new message
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Check to see if User B is a contact
    await clickOnTestIdWithText(aliceWindow1, 'new-conversation-button');
    await waitForTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    // he is a contact, close the new conversation button tab as there is no right click allowed on it
    await clickOnTestIdWithText(aliceWindow1, 'new-conversation-button');
    // then right click on the contact conversation list item to show the menu
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
      true,
    );
    // Select block
    await clickOnTestIdWithText(
      aliceWindow1,
      'context-menu-item',
      englishStrippedStr('block').toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('block').toString(),
    );
    // Verify the user was moved to the blocked contact list
    // Click on settings tab
    await clickOnTestIdWithText(aliceWindow1, 'settings-section');
    // click on settings section 'conversation'
    await clickOnTestIdWithText(
      aliceWindow1,
      'conversations-settings-menu-item',
    );
    // Navigate to blocked users tab'
    await clickOnTestIdWithText(aliceWindow1, 'reveal-blocked-user-settings');
    // select the contact to unblock by clicking on it by name
    await clickOnMatchingText(aliceWindow1, bob.userName);
    // Unblock user by clicking on unblock
    await clickOnTestIdWithText(aliceWindow1, 'unblock-button-settings-screen');
    // make sure the confirm dialogs shows up
    await clickOnTestIdWithText(
      aliceWindow1,
      'block-unblock-modal-description',
      englishStrippedStr('blockUnblockName')
        .withArgs({ name: 'Bob' })
        .toString(),
    );

    // click on the unblock button
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('blockUnblock').toString(),
    );
    // make sure no blocked contacts are listed
    await waitForMatchingText(
      aliceWindow1,
      englishStrippedStr('blockBlockedNone').toString(),
    );
  },
);

test_Alice_1W_no_network('Change username', async ({ aliceWindow1 }) => {
  const newUsername = 'Tiny bubble';
  // Open Profile
  await clickOnTestIdWithText(aliceWindow1, 'leftpane-primary-avatar');
  // Click on current username to open edit field
  await clickOnTestIdWithText(aliceWindow1, 'edit-profile-icon');
  // Type in new username
  await typeIntoInput(aliceWindow1, 'profile-name-input', newUsername);
  // await window.fill('.profile-name-input', 'new username');
  // Press enter to confirm username input
  await aliceWindow1.keyboard.press('Enter');
  // Wait for Copy button to appear to verify username change
  await aliceWindow1.isVisible(`'${englishStrippedStr('copy').toString()}'`);
  // verify name change
  expect(await aliceWindow1.innerText('[data-testid=your-profile-name]')).toBe(
    newUsername,
  );
  // Exit profile modal
  await clickOnTestIdWithText(aliceWindow1, 'modal-close-button');
});

test_Alice_1W_no_network(
  'Change avatar',
  async ({ aliceWindow1 }, testInfo) => {
    // Open profile
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

    await sleepFor(500);
    const leftpaneAvatarContainer = await waitForTestIdWithText(
      aliceWindow1,
      'leftpane-primary-avatar',
    );
    const start = Date.now();
    let correctScreenshot = false;
    let tryNumber = 0;
    let lastError: Error | undefined;
    do {
      try {
        // if we were asked to update the snapshots, make sure we wait for the change to be received before taking a screenshot.
        if (testInfo.config.updateSnapshots === 'all') {
          await sleepFor(15000);
        } else {
          await sleepFor(500);
        }

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
      throw new Error('waiting 20s and still the screenshot is not right');
    }
  },
);

test_Alice_1W_Bob_1W(
  'Set nickname',
  async ({ aliceWindow1, bobWindow1, alice, bob }) => {
    const nickname = 'new nickname for Bob';

    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
      true,
    );
    await clickOnMatchingText(
      aliceWindow1,
      englishStrippedStr('nicknameSet').toString(),
    );
    await sleepFor(1000);

    await typeIntoInput(aliceWindow1, 'nickname-input', nickname);
    await sleepFor(100);
    await clickOnTestIdWithText(
      aliceWindow1,
      'confirm-nickname',
      englishStrippedStr('save').toString(),
    );
    await sleepFor(1000);

    const headerUsername = await waitForTestIdWithText(
      aliceWindow1,
      'header-conversation-name',
    );
    const headerUsernameText = await headerUsername.innerText();
    console.info('Innertext ', headerUsernameText);

    expect(headerUsernameText).toBe(nickname);
    // Check conversation list name also
    const conversationListUsernameText = await waitForTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
    );
    const conversationListUsername =
      await conversationListUsernameText.innerText();
    expect(conversationListUsername).toBe(nickname);
  },
);

test_Alice_1W_Bob_1W(
  'Read status',
  async ({ aliceWindow1, bobWindow1, alice, bob }) => {
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'settings-section',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'enable-read-receipts',
    });
    await clickOnElement({
      window: aliceWindow1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      bob.userName,
    );
    await clickOnElement({
      window: bobWindow1,
      strategy: 'data-testid',
      selector: 'settings-section',
    });
    await clickOnElement({
      window: bobWindow1,
      strategy: 'data-testid',
      selector: 'enable-read-receipts',
    });
    await clickOnElement({
      window: bobWindow1,
      strategy: 'data-testid',
      selector: 'message-section',
    });
    await clickOnTestIdWithText(
      bobWindow1,
      'module-conversation__user__profile-name',
      alice.userName,
    );
    await sendMessage(aliceWindow1, 'Testing read receipts');
  },
);

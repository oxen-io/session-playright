import { expect } from '@playwright/test';
import { englishStrippedStr } from '../locale/localizedString';
import { sleepFor } from '../promise_utils';
import { newUser } from './setup/new_user';
import {
  sessionTestTwoWindows,
  test_Alice_1W_Bob_1W,
  test_Alice_1W_no_network,
  test_Alice_2W,
} from './setup/sessionTest';
import { createContact } from './utilities/create_contact';
import { sendMessage } from './utilities/message';
import {
  clickOnElement,
  clickOnMatchingText,
  clickOnTestIdWithText,
  doesElementExist,
  hasElementBeenDeleted,
  typeIntoInput,
  waitForMatchingText,
  waitForTestIdWithText,
} from './utilities/utils';

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

test_Alice_1W_Bob_1W(
  'Delete conversation',
  async ({ aliceWindow1, bobWindow1, alice, bob }) => {
    // Create contact and send new message
    await createContact(aliceWindow1, bobWindow1, alice, bob);
    // Confirm contact by checking Messages tab (name should appear in list)
    await Promise.all([
      clickOnTestIdWithText(aliceWindow1, 'message-section'),
      clickOnTestIdWithText(bobWindow1, 'message-section'),
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
    // TODO add Check modal strings
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('delete').toString(),
    );
    // Check if conversation is deleted
    await hasElementBeenDeleted(
      aliceWindow1,
      'data-testid',
      'module-conversation__user__profile-name',
      1000,
      bob.userName,
    );
  },
);

test_Alice_2W(
  'Hide recovery password',
  async ({ aliceWindow1, aliceWindow2 }) => {
    await clickOnTestIdWithText(aliceWindow1, 'settings-section');
    await clickOnTestIdWithText(
      aliceWindow1,
      'recovery-password-settings-menu-item',
    );
    await clickOnTestIdWithText(aliceWindow1, 'hide-recovery-password-button');
    // Check first modal heading
    await waitForMatchingText(
      aliceWindow1,
      englishStrippedStr('recoveryPasswordHidePermanently').toString(),
    );
    // Check first modal description
    await waitForMatchingText(
      aliceWindow1,
      englishStrippedStr(
        'recoveryPasswordHidePermanentlyDescription1',
      ).toString(),
    );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('theContinue').toString(),
    );
    // Check second modal heading
    await waitForMatchingText(
      aliceWindow1,
      englishStrippedStr('recoveryPasswordHidePermanently').toString(),
    );
    // Check second modal description
    await waitForMatchingText(
      aliceWindow1,
      englishStrippedStr(
        'recoveryPasswordHidePermanentlyDescription2',
      ).toString(),
    );
    // Click yes
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('yes').toString(),
    );
    await doesElementExist(
      aliceWindow1,
      'data-testid',
      'recovery-password-settings-menu-item',
    );
    // Check linked device if Recovery Password is still visible (it should be)
    await clickOnTestIdWithText(aliceWindow2, 'settings-section');
    await waitForTestIdWithText(
      aliceWindow2,
      'recovery-password-settings-menu-item',
    );
  },
);

// test_Alice_1W_no_network('Invite a friend', async ({ aliceWindow1, alice }) => {
//   await clickOnTestIdWithText(aliceWindow1, 'new-conversation-button');
//   await clickOnTestIdWithText(aliceWindow1, 'chooser-invite-friend');
//   await waitForTestIdWithText(aliceWindow1, 'your-account-id', alice.accountid);
//   await clickOnTestIdWithText(aliceWindow1, 'copy-button-account-id');
//   // Toast
//   await waitForTestIdWithText(
//     aliceWindow1,
//     'session-toast',
//     englishStrippedStr('copied').toString(),
//   );
//   // Wait for copy to resolve
//   await sleepFor(1000);
//   await waitForMatchingText(
//     aliceWindow1,
//     englishStrippedStr('accountIdCopied').toString(),
//   );
//   await waitForMatchingText(
//     aliceWindow1,
//     englishStrippedStr('shareAccountIdDescriptionCopied').toString(),
//   );
//   // To exit invite a friend
//   await clickOnTestIdWithText(aliceWindow1, 'new-conversation-button');
//   // To create note to self
//   await clickOnTestIdWithText(aliceWindow1, 'new-conversation-button');
//   // New message
//   await clickOnTestIdWithText(aliceWindow1, 'chooser-new-conversation-button');
//   await clickOnTestIdWithText(aliceWindow1, 'new-session-conversation');
//   const isMac = process.platform === 'darwin';
//   await aliceWindow1.keyboard.press(`${isMac ? 'Meta' : 'Control'}+V`);
//   await clickOnTestIdWithText(aliceWindow1, 'next-new-conversation-button');
//   // Did the copied text create note to self?
//   await waitForTestIdWithText(
//     aliceWindow1,
//     'header-conversation-name',
//     englishStrippedStr('noteToSelf').toString(),
//   );
// });

test_Alice_1W_no_network(
  'Hide note to self',
  async ({ aliceWindow1, alice }) => {
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
    // Currently fails due to no test tag on description
    // await checkModalStrings(
    //   aliceWindow1,
    //   englishStrippedStr('noteToSelfHide').toString(),
    //   englishStrippedStr('noteToSelfHideDescription').toString(),
    // );
    await clickOnTestIdWithText(
      aliceWindow1,
      'session-confirm-ok-button',
      englishStrippedStr('hide').toString(),
    );
    await hasElementBeenDeleted(
      aliceWindow1,
      'data-testid',
      'module-conversation__user__profile-name',
      5000,
      englishStrippedStr('noteToSelf').toString(),
    );
  },
);

test_Alice_1W_no_network('Toggle password', async ({ aliceWindow1 }) => {
  await clickOnTestIdWithText(aliceWindow1, 'settings-section');
  await clickOnTestIdWithText(
    aliceWindow1,
    'recovery-password-settings-menu-item',
  );
  await waitForTestIdWithText(aliceWindow1, 'recovery-password-seed-modal');
  await clickOnMatchingText(
    aliceWindow1,
    englishStrippedStr('qrView').toString(),
  );
  // Wait for QR code to be visible
  await waitForTestIdWithText(aliceWindow1, 'session-recovery-password');
  // Then toggle back to text seed password
  await clickOnMatchingText(
    aliceWindow1,
    englishStrippedStr('recoveryPasswordView').toString(),
  );
  await waitForTestIdWithText(aliceWindow1, 'recovery-password-seed-modal');
});

test_Alice_2W(
  'Consistent avatar colours',
  async ({ aliceWindow1, aliceWindow2 }) => {
    const avatarColors = await Promise.all(
      [aliceWindow1, aliceWindow2].map((w) =>
        w
          .locator('[data-testid="leftpane-primary-avatar"] > svg > g > circle')
          .getAttribute('fill'),
      ),
    );

    console.log('avatar1Color', avatarColors[0]);
    console.log('avatar2Color', avatarColors[1]);

    if (avatarColors[0] !== avatarColors[1]) {
      throw new Error('Avatar colours are not consistent');
    }
  },
);

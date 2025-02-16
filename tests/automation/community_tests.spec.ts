import { testCommunityName } from './constants/community';
import { test_Alice_2W, test_Alice_2W_Bob_1W } from './setup/sessionTest';
import { joinCommunity } from './utilities/join_community';
import { sendMessage } from './utilities/message';
import { replyTo } from './utilities/reply_message';
import {
  clickOnTestIdWithText,
  typeIntoInput,
  waitForLoadingAnimationToFinish,
} from './utilities/utils';

test_Alice_2W('Join community', async ({ aliceWindow1, aliceWindow2 }) => {
  await joinCommunity(aliceWindow1);
  await waitForLoadingAnimationToFinish(aliceWindow1, 'loading-spinner');
  await clickOnTestIdWithText(aliceWindow1, 'scroll-to-bottom-button');
  await sendMessage(aliceWindow1, 'Hello, community!');
  // Check linked device for community
  await clickOnTestIdWithText(
    aliceWindow2,
    'module-conversation__user__profile-name',
    testCommunityName,
  );
});

test_Alice_2W_Bob_1W(
  'Send image to community',
  async ({ alice, bob, aliceWindow1, bobWindow1 }) => {
    const testMessage = 'Testing sending images to communities';
    const testImageMessage = `Image message + ${Date.now()}`;
    const testReply = `${bob.userName} replying to image from ${alice.userName}`;
    await Promise.all([joinCommunity(aliceWindow1), joinCommunity(bobWindow1)]);
    await Promise.all([
      waitForLoadingAnimationToFinish(aliceWindow1, 'loading-spinner'),
      waitForLoadingAnimationToFinish(bobWindow1, 'loading-spinner'),
    ]);
    await Promise.all([
      clickOnTestIdWithText(aliceWindow1, 'scroll-to-bottom-button'),
      clickOnTestIdWithText(bobWindow1, 'scroll-to-bottom-button'),
    ]);
    await sendMessage(aliceWindow1, testMessage);
    // Check linked device for community
    await clickOnTestIdWithText(
      aliceWindow1,
      'module-conversation__user__profile-name',
      testCommunityName,
    );
    await aliceWindow1.setInputFiles(
      "input[type='file']",
      'sample_files/test-image.png',
    );
    await typeIntoInput(
      aliceWindow1,
      'message-input-text-area',
      testImageMessage,
    );
    await clickOnTestIdWithText(aliceWindow1, 'send-message-button');
    await replyTo({
      senderWindow: bobWindow1,
      textMessage: testImageMessage,
      replyText: testReply,
      receiverWindow: aliceWindow1,
    });
  },
);

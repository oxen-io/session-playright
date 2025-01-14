import { sleepFor } from '../promise_utils';
import { mediaArray } from './constants/variables';
import { test_group_Alice_1W_Bob_1W_Charlie_1W } from './setup/sessionTest';
import { DMTimeOption } from './types/testing';
import { sendMedia, sendVoiceMessage } from './utilities/send_media';
import { setDisappearingMessages } from './utilities/set_disappearing_messages';
import {
  hasElementBeenDeleted,
  hasTextMessageBeenDeleted,
  waitForElement,
  waitForLoadingAnimationToFinish,
  waitForTextMessage,
} from './utilities/utils';

// Disappearing time settings for all tests
const timeOption: DMTimeOption = 'time-option-30-seconds';
const disappearingMessageType = 'disappear-after-send-option';
// Implementing in groups rebuild
// const disappearAction = 'sent';

mediaArray.forEach(({ mediaType, path }) => {
  test_group_Alice_1W_Bob_1W_Charlie_1W(
    `Send disappearing ${mediaType} groups`,
    async ({
      alice,
      aliceWindow1,
      bobWindow1,
      charlieWindow1,
      groupCreated,
    }) => {
      const testMessage = `${alice.userName} sending ${mediaType} to ${groupCreated.userName}`;
      await setDisappearingMessages(aliceWindow1, [
        'group',
        disappearingMessageType,
        timeOption,
      ]);
      // Send media
      if (mediaType === 'voice') {
        await sendVoiceMessage(aliceWindow1);
      } else {
        await sendMedia(aliceWindow1, path, testMessage);
      }
      await Promise.all([
        waitForLoadingAnimationToFinish(bobWindow1, 'loading-animation'),
        waitForLoadingAnimationToFinish(charlieWindow1, 'loading-animation'),
      ]);
      if (mediaType === 'voice') {
        await Promise.all([
          //   waitForTestIdWithText(bobWindow1, 'audio-player'),
          waitForElement(bobWindow1, 'class', 'rhap_progress-section'),
          //   waitForTestIdWithText(charlieWindow1, 'audio-player'),
          waitForElement(charlieWindow1, 'class', 'rhap_progress-section'),
        ]);
        await sleepFor(30000);
        await Promise.all([
          //   hasElementBeenDeleted(bobWindow1, 'data-testid', 'audio-player'),
          hasElementBeenDeleted(bobWindow1, 'class', 'rhap_progress-section'),
          //   hasElementBeenDeleted(charlieWindow1, 'data-testid', 'audio-player'),
          hasElementBeenDeleted(
            charlieWindow1,
            'class',
            'rhap_progress-section',
          ),
        ]);
      } else {
        await Promise.all([
          waitForTextMessage(bobWindow1, testMessage),
          waitForTextMessage(charlieWindow1, testMessage),
        ]);
        // Wait 30 seconds for image to disappear
        await sleepFor(30000);
        await Promise.all([
          hasTextMessageBeenDeleted(bobWindow1, testMessage),
          hasTextMessageBeenDeleted(charlieWindow1, testMessage),
        ]);
      }
    },
  );
});

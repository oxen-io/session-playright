import { Page } from '@playwright/test';
// eslint-disable-next-line import/no-cycle
import { clickOnElement, typeIntoInput } from './utils';

export const sendMessage = async (window: Page, message: string) => {
  // type into message input box
  await typeIntoInput(window, 'message-input-text-area', message);
  // click up arrow (send)
  await clickOnElement({
    window,
    strategy: 'data-testid',
    selector: 'send-message-button',
  });
  // TODO add back in once fix is merged
  // wait for confirmation tick to send reply message
  // const selc = `css=[data-testid=message-content]:has-text("${message}"):has([data-testid=msg-status][data-testtype=sent])`;
  // console.info('waiting for sent tick of message: ', message);

  // const tickMessageSent = await window.waitForSelector(selc, {
  //   timeout: 30000,
  // });
  // console.info(
  //   'found the tick of message sent: ',
  //   message,
  //   Boolean(tickMessageSent),
  // );
};

// export const sendMessage = async (window: Page, message: string) => {
//   // type into message input box
//   await typeIntoInput(window, 'message-input-text-area', message);
//   // click up arrow (send)
//   await clickOnElement({
//     window,
//     strategy: 'data-testid',
//     selector: 'send-message-button',
//   });
//   await waitForSentTick(window, message);
// };

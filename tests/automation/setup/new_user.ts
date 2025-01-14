import { Page } from '@playwright/test';
import chalk from 'chalk';
import { User } from '../types/testing';
import {
  checkPathLight,
  clickOnTestIdWithText,
  grabTextFromElement,
  typeIntoInput,
  waitForTestIdWithText,
} from '../utilities/utils';

export const newUser = async (
  window: Page,
  userName: string,
  awaitOnionPath = true,
): Promise<User> => {
  // Create User
  await clickOnTestIdWithText(window, 'create-account-button');
  // Input username = testuser
  await typeIntoInput(window, 'display-name-input', userName);
  await clickOnTestIdWithText(window, 'continue-button');
  // save recovery phrase
  await clickOnTestIdWithText(window, 'reveal-recovery-phrase');
  await waitForTestIdWithText(window, 'recovery-password-seed-modal');
  const recoveryPassword = await grabTextFromElement(
    window,
    'data-testid',
    'recovery-password-seed-modal',
  );
  // const recoveryPhrase = await window.innerText(
  //   '[data-testid=recovery-password-seed-modal]',
  // );
  // await clickOnTestIdWithText(window, 'modal-close-button');
  await clickOnTestIdWithText(window, 'leftpane-primary-avatar');

  // Save session ID to a variable
  let accountid = await window.innerText('[data-testid=your-session-id]');
  accountid = accountid.replace(/(\r\n|\n|\r)/gm, ''); // remove the new line in the SessionID as it is rendered with one forced

  console.log(
    `${userName}: Account ID: "${chalk.blue(
      accountid,
    )}" and Recovery password: "${chalk.green(recoveryPassword)}"`,
  );
  await clickOnTestIdWithText(window, 'modal-close-button');
  if (awaitOnionPath) {
    await checkPathLight(window);
  }
  await clickOnTestIdWithText(window, 'message-section');
  return { userName, accountid, recoveryPassword };
};

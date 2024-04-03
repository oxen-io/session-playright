import { Page } from '@playwright/test';
import chalk from 'chalk';
import { User } from '../types/testing';
import {
  checkPathLight,
  clickOnMatchingText,
  clickOnTestIdWithText,
  typeIntoInput,
} from '../utilities/utils';

export const newUser = async (
  window: Page,
  userName: string,
): Promise<User> => {
  // Create User
  await clickOnMatchingText(window, 'Create Session ID');
  await clickOnMatchingText(window, 'Continue');
  // Input username = testuser
  await typeIntoInput(window, 'display-name-input', userName);
  await clickOnMatchingText(window, 'Get started');
  // save recovery phrase
  await clickOnTestIdWithText(window, 'reveal-recovery-phrase');
  const recoveryPhrase = await window.innerText(
    '[data-testid=recovery-phrase-seed-modal]',
  );
  await window.click('.session-icon-button.small');

  await clickOnTestIdWithText(window, 'leftpane-primary-avatar');

  // Save session ID to a variable
  let sessionid = await window.innerText('[data-testid=your-session-id]');
  sessionid = sessionid.replace(/(\r\n|\n|\r)/gm, ''); // remove the new line in the SessionID as it is rendered with one forced

  console.log(
    `${userName}: Session ID: "${chalk.blue(
      sessionid,
    )}" and Recovery phrase2: "${chalk.green(recoveryPhrase)}"`,
  );
  await window.click('.session-icon-button.small');
  await checkPathLight(window);
  return { userName, sessionid, recoveryPhrase };
};

import { Page } from '@playwright/test';
import {
  clickOnTestIdWithText,
  doesElementExist,
  typeIntoInput,
  waitForLoadingAnimationToFinish,
} from '../utilities/utils';

export async function recoverFromSeed(window: Page, recoveryPhrase: string) {
  await clickOnTestIdWithText(window, 'existing-account-button');
  await typeIntoInput(window, 'recovery-phrase-input', recoveryPhrase);
  await clickOnTestIdWithText(window, 'continue-button');
  await waitForLoadingAnimationToFinish(window, 'loading-animation');
  const displayName = await doesElementExist(
    window,
    'data-testid',
    'display-name-input',
  );
  if (displayName) {
    throw new Error(`Display name was not found when restoring from seed`);
  }

  return { window };
}

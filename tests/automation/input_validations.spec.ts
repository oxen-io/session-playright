import { englishStrippedStr } from '../locale/localizedString';
import { sessionTestOneWindow } from './setup/sessionTest';
import {
  clickOnTestIdWithText,
  grabTextFromElement,
  typeIntoInput,
  waitForTestIdWithText,
} from './utilities/utils';

[
  {
    testName: 'Incorrect seed',
    // the word 'zork' is not on the mnemonic word list which triggers the expected error
    incorrectSeed:
      'ruby bakery illness push rift reef nabbing bawled hope zork silk lobster hope',
    expectedError: englishStrippedStr(
      'recoveryPasswordErrorMessageIncorrect',
    ).toString(),
  },
  {
    testName: 'Too short seed',
    incorrectSeed: 'zork',
    expectedError: englishStrippedStr(
      'recoveryPasswordErrorMessageShort',
    ).toString(),
  },
  {
    testName: 'Wrong seed',
    // the seed phrase is too long but contains only valid mnemonics which triggers the generic error
    incorrectSeed:
      'ruby bakery illness push rift reef nabbing bawled hope ruby silk lobster hope ruby ruby ruby',
    expectedError: englishStrippedStr(
      'recoveryPasswordErrorMessageGeneric',
    ).toString(),
  },
].forEach(({ testName, incorrectSeed, expectedError }) => {
  sessionTestOneWindow(`Seed validation: "${testName}"`, async ([window]) => {
    await clickOnTestIdWithText(window, 'existing-account-button');
    await typeIntoInput(window, 'recovery-phrase-input', incorrectSeed);
    await clickOnTestIdWithText(window, 'continue-button');
    await waitForTestIdWithText(window, 'session-error-message');
    const actualError = await grabTextFromElement(
      window,
      'data-testid',
      'session-error-message',
    );
    console.log('actualError', actualError);
    console.log('expectedError', expectedError);
    if (actualError !== expectedError) {
      throw new Error(
        `Expected error message: ${expectedError}, but got: ${actualError}`,
      );
    }
  });
});

[
  {
    testName: 'No name',
    // This currently fails - displays wrong error message
    displayName: ' ',
    expectedError: englishStrippedStr('displayNameErrorDescription').toString(),
  },
  {
    testName: 'Too long name',
    displayName:
      'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed int',
    expectedError: englishStrippedStr(
      'displayNameErrorDescriptionShorter',
    ).toString(),
  },
].forEach(({ testName, displayName, expectedError }) => {
  sessionTestOneWindow(
    `Display name validation: "${testName}"`,
    async ([window]) => {
      await clickOnTestIdWithText(window, 'create-account-button');
      await typeIntoInput(window, 'display-name-input', displayName);
      await clickOnTestIdWithText(window, 'continue-button');
      await waitForTestIdWithText(window, 'session-error-message');
      const actualError = await grabTextFromElement(
        window,
        'data-testid',
        'session-error-message',
      );
      if (testName === 'No name') {
        console.log('Expected failure: see SES-2832');
      }
      if (actualError !== expectedError) {
        throw new Error(
          `Expected error message: ${expectedError}, but got: ${actualError}`,
        );
      }
    },
  );
});

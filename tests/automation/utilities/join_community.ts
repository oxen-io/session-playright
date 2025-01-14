import { Page } from '@playwright/test';
import { testCommunityLink } from '../constants/community';
import { clickOnTestIdWithText } from './utils';

export const joinCommunity = async (window: Page) => {
  await clickOnTestIdWithText(window, 'new-conversation-button');
  await clickOnTestIdWithText(window, 'chooser-new-community');
  //   The follow two test tags are pending implementation
  // await typeIntoInput(window, 'join-community-conversation', testCommunityLink);
  const communityInput = `css=[id='session-input-floating-label']`;
  await window.click(communityInput);
  await window.fill(communityInput, testCommunityLink);
  await window.press(communityInput, 'Enter');
  // await clickOnTestIdWithText(window, 'join-community-button');
};

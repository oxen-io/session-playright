import { join } from 'path';
import { homedir } from 'os';
import { Page } from '@playwright/test';
import { readdirSync, rmdirSync } from 'fs-extra';
import { compact } from 'lodash';
import { isLinux, isMacOS } from '../../os_utils';
import { MULTI_PREFIX, NODE_ENV } from './open';

const getDirectoriesOfSessionDataPath = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      return dirent.name;
    })
    .filter((n) => n.includes(`${NODE_ENV}-${MULTI_PREFIX}`));

const alreadyCleaned = false;
let alreadyCleanedWaiting = false;

function cleanUpOtherTest() {
  if (alreadyCleaned || alreadyCleanedWaiting) {
    return;
  }

  alreadyCleanedWaiting = true;

  const parentFolderOfAllDataPath = isMacOS()
    ? join(homedir(), 'Library', 'Application Support')
    : isLinux()
    ? join(homedir(), '.config')
    : null;
  if (!parentFolderOfAllDataPath) {
    throw new Error('Only macOS is currrently supported ');
  }

  if (!parentFolderOfAllDataPath || parentFolderOfAllDataPath.length < 9) {
    throw new Error(
      `parentFolderOfAllDataPath not found or invalid: ${parentFolderOfAllDataPath}`,
    );
  }
  console.info('cleaning other tests leftovers...', parentFolderOfAllDataPath);

  const allAppDataPath = getDirectoriesOfSessionDataPath(
    parentFolderOfAllDataPath,
  );
  console.info('allAppDataPath', allAppDataPath);

  allAppDataPath.forEach((folder) => {
    const pathToRemove = join(parentFolderOfAllDataPath, folder);
    rmdirSync(pathToRemove, { recursive: true });
  });
  console.info('...done');
}

export const beforeAllClean = cleanUpOtherTest;

export const forceCloseAllWindows = async (
  windows: Array<Page | undefined>
) => {
  return Promise.all(compact(windows).map((w) => w.close()));
};

export const forceCloseAllWindowsObj = async (windows: OpenWindowsType) => {
  return Promise.all(
    compact([
      windows.windowA,
      windows.windowB,
      windows.windowC,
      windows.windowD,
      windows.windowE,
    ]).map((w) => w.close())
  );
};

export type OpenWindowsType = {
  windowA?: Page | undefined;
  windowB?: Page | undefined;
  windowC?: Page | undefined;
  windowD?: Page | undefined;
  windowE?: Page | undefined;
};

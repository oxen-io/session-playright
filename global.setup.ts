import { readdirSync, rm } from 'fs-extra';
import { homedir } from 'os';
import { join } from 'path';
import { MULTI_PREFIX, NODE_ENV } from './tests/automation/setup/open';
import { isLinux, isMacOS } from './tests/os_utils';
import { isEmpty } from 'lodash';

const getDirectoriesOfSessionDataPath = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      return dirent.name;
    })
    .filter((n) => n.includes(`${NODE_ENV}-${MULTI_PREFIX}`));

let needsClean = isEmpty(process.env.NO_CLEAN);

export default async function globalSetup() {
  console.log('Cleaning up all previous tests configs...');
  if (!needsClean) {
    return;
  }

  needsClean = false;
  if (process.env.CI) {
    console.info(
      'We are on CI, no need to clean up other tests (so we can run them in parallel)',
    );

    return;
  }

  try {
    const parentFolderOfAllDataPath = isMacOS()
      ? join(homedir(), 'Library', 'Application Support')
      : isLinux()
      ? join(homedir(), '.config')
      : null;
    if (!parentFolderOfAllDataPath) {
      throw new Error('Only macOS/linux are currently supported');
    }

    if (!parentFolderOfAllDataPath || parentFolderOfAllDataPath.length < 9) {
      throw new Error(
        `parentFolderOfAllDataPath not found or invalid: ${parentFolderOfAllDataPath}`,
      );
    }
    console.info(
      'cleaning other tests leftovers...',
      parentFolderOfAllDataPath,
    );

    const allAppDataPath = getDirectoriesOfSessionDataPath(
      parentFolderOfAllDataPath,
    );
    console.info('allAppDataPath to clean', allAppDataPath);

    await Promise.all(
      allAppDataPath.map((folder) => {
        const pathToRemove = join(parentFolderOfAllDataPath, folder);
        return rm(pathToRemove, { recursive: true });
      }),
    );
    console.info('...done');
  } catch (e) {
    console.error(`failed to cleanup old files: ${e.message}`);
  }
  console.log('Cleaning up done.');
}

# Automation testing for Session Desktop

This repository holds the code to do regression testing with Playwright for Session Desktop.

## Setup


`git clone https://github.com/oxen-io/session-playwright/`

Install [nvm](https://github.com/nvm-sh/nvm) or [nvm for windows](https://github.com/coreybutler/nvm-windows).

Once nvm is installed, install the node version declared in the `.nvmrc` file:
- `nvm install` on linux/macos
- `nvm install <specific version from the .nvmrc>` on windows

Install yarn & dependencies:
- `npm install -g yarn`
- `yarn install --frozen-lockfile`

## Config

Create your own config from the `.env.sample` and edit the values to match your environment & how you want to test.
- `cp .env.sample .env` Copy .env.sample to .env
- edit the `.env` file


### Config details

- `SESSION_DESKTOP_ROOT`
  - *type*: string
  - *default*: 1
  - *description*: the path to the root of session-desktop to test
- `PLAYWRIGHT_CUSTOM_REPORTER`
  - *type*: number
  - *default*: undefined
  - *description*: set to 1 to use our custom reporter, see `sessionReporter.ts`
- `PLAYWRIGHT_REPEAT_COUNT`
  - *type*: number
  - *default*: 0
  - *description*: how many times to repeat each test. So, if a test **passed or failed** on attempt x, and our current attempt is `< PLAYWRIGHT_REPEAT_COUNT` the test will be scheduled to be run again. This can be used to debug flaky tests
- `PLAYWRIGHT_RETRIES_COUNT`
  - *type*: number
  - *default*: 0
  - *description*: the number of retries each test. i.e. if a test **failed** on attempt x, and our current attempt is `< PLAYWRIGHT_RETRIES_COUNT` the test will be scheduled to be run again. This can be used to debug flaky tests
- `PLAYWRIGHT_WORKERS_COUNT`
  - *type*: number
  - *default*: 1
  - *description*: the number of workers to start in parallel. The more, the faster the test suite is going to run, but if you hit your CPU limit they'll start to be unnecessarily flaky. Should be fine with a value between 10-20 depending on the machine.


## Test run

To run a specific test, or tests matching a string you can do so with
`yarn test -g "<string to match>"`.

To run all the test suite, just do
`yarn test`.

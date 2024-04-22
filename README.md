# PuppetX

X(formerly Twitter) automation library & CLI.
> X(구 트위터) 자동화 라이브러리 + CLI.

using [Google Puppeteer](https://pptr.dev/) with specifying [userDataDir](https://pptr.dev/api/puppeteer.browserlaunchargumentoptions) to prevent frequent login on X.
> [구글의 Puppeteer](https://pptr.dev/)를 사용합니다. 빈번한 X 로그인을 피하기 위해 [userDataDir](https://pptr.dev/api/puppeteer.browserlaunchargumentoptions)를 지정합니다.

## as a CLI (CLI 사용법)

### `login`

```bash
pnpx puppetx login --user cutepuppetx
```

replace `cutepuppetx` with your X handle.
> `cutepuppetx` 대신 당신의 X 계정을 입력하세요.

NOTE: currently `login` command does NOT support headless mode.
> NOTE: 현재 `login` 커맨드는 headless mode를 지원하지 않습니다.

### `post`

```bash
pnpx puppetx post 'automate X with PuppetX' -u cutepuppetx
```

## as a library (library로 사용하기)

### Install

```bash
pnpm add puppetx
```

### class `PuppetX`

```typescript
const bot = new PuppetX('cutepuppetx', headless);
await bot.postTweet('automate X with PuppetX');
await bot.close();
```

take a look at `cli.ts` as a sample code.
> `cli.ts` 코드를 참고하세요.

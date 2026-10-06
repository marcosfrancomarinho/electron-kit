# Electron Kit

Create a minimal Electron + TypeScript project with a typed Node-to-Browser bridge.

## Create a project

### npm / npx

```bash
npx create-electron-kit
```

or:

```bash
npm create electron-kit
```

### Yarn

```bash
yarn create electron-kit
```

### pnpm

```bash
pnpm create electron-kit
```

Electron Kit asks for the project folder name and creates the template.

It does **not** install dependencies automatically.

After generation:

```bash
cd my-app
npm install
npm run dev
```

Use `yarn` or `pnpm install` when the project was created through those package managers.

## Generated architecture

```text
my-app/
├── src/
│   ├── node/
│   │   ├── main.ts
│   │   ├── file.ts
│   │   └── system.ts
│   ├── providers.ts
│   └── browser/
│       ├── index.html
│       ├── main.ts
│       └── style.css
├── electron-kit/
│   ├── runtime/
│   │   ├── node.ts
│   │   ├── browser.ts
│   │   └── shared.ts
│   ├── bridge/
│   │   └── preload.ts
│   └── build/
│       ├── dev.cjs
│       ├── build.cjs
│       ├── package.cjs
│       └── type.cjs
├── package.json
└── tsconfig.json
```

## Providers

Node code is registered with `providers.register()`:

```ts
import { providers } from '../electron-kit/runtime/node.js';
import { file } from './node/file.js';
import { system } from './node/system.js';

export default providers
  .register('file', file)
  .register('system', system)
  .register('version', () => '1.0.0');
```

The Browser consumes the same contract with `browser.get()`:

```ts
import { browser } from '../../electron-kit/runtime/browser.js';

const file = browser.get('file');
const content = await file.read('config.json');
```

Provider tokens, function parameters and return values are inferred by TypeScript. No duplicated provider interface is required.

IPC, `contextBridge`, `ipcMain` and `ipcRenderer` stay behind the template runtime.

## Generated commands

```bash
npm run dev
npm run build
npm run package
npm run type
```

- `dev`: build, open Electron and rebuild/restart on changes.
- `build`: create the main, preload and Browser bundles.
- `package`: build and package the desktop application.
- `type`: run the TypeScript type checker.

## Philosophy

Electron Kit follows the same minimal generator idea as Kit Dev:

- TypeScript first;
- small generated project;
- no framework required;
- no automatic dependency installation;
- typed Node/Browser boundary;
- minimal public API: `providers.register()` and `browser.get()`.

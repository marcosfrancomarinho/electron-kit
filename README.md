# Create Kit Electron

**Language:** English · [Português (Brasil)](README.pt-BR.md)

Build desktop apps with **Electron + React + TypeScript + CSS**, without configuring the project infrastructure from scratch.

Create Kit Electron generates a minimal starter with a typed bridge between React and Node.js. **It does not enforce an application architecture.**

## Get started

Requires Node.js 22 or later.

```bash
npx create-kit-electron
```

Enter your project name, then run:

```bash
cd my-app
npm install
npm run dev
```

Replace `my-app` with the name you entered. The CLI does not install dependencies automatically. **Generated projects contain only an English `README.md`; this repository provides documentation in both Portuguese and English.**

## Generated structure

```text
my-app/
├── src/
│   ├── ui/                  # React and CSS
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── style.css
│   └── system/              # Electron, Node.js, providers
│       ├── main.ts
│       └── providers.ts
├── kit_electron/            # Internal tooling
│   ├── build/
│   │   ├── dev.cjs
│   │   └── package.cjs
│   └── runtime/
│       ├── browser.ts
│       ├── node.ts
│       └── preload.ts
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

**`src/` contains your application.** Put the React interface in `src/ui/`, and Node.js or Electron functionality in `src/system/`. The `kit_electron/` directory contains build tools and the runtime communication layer.

## Providers

Register functions that the UI can call in `src/system/providers.ts`:

```ts
import { providers } from '../../kit_electron/runtime/node.js';

export default providers
  .register('version', () => process.versions.electron);
```

Call the registered function from React:

```ts
import { browser } from '../../kit_electron/runtime/browser.js';

const version = await browser.get('version')();
console.log(version);
```

Providers run in the Electron main process. React calls them through a typed IPC bridge without direct Node.js access.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Type-check, start Electron, and watch for changes |
| `npm run package` | Type-check, compile, and create an installer for the current OS |

Choose a packaging target explicitly:

```bash
npm run package -- win
npm run package -- linux
npm run package -- mac
```

Installers are written to `release/`. Development generates temporary files in `kit_electron/cache/`, which Git ignores.

## Security

Generated windows use `contextIsolation: true` and `nodeIntegration: false`. Only registered provider functionality is made available to the renderer.

# Kit Electron App

Generated with [Create Kit Electron](https://github.com/marcosfrancomarinho/electron-kit): Electron + React + TypeScript + Tailwind CSS.

## Get started

```bash
npm install
npm run dev
```

## Project structure

```text
src/
├── ui/
│   ├── App.tsx
│   ├── main.tsx
│   └── style.css
└── system/
    ├── main.ts
    └── providers.ts

kit_electron/
├── build/
│   ├── dev.cjs
│   └── package.cjs
└── runtime/
    ├── browser.ts
    ├── node.ts
    ├── preload.ts
    └── shared.ts

index.html               # HTML entry point
```

- **`src/ui/`**: React interface, HTML, and styles.
- **`src/system/main.ts`**: Electron window entry point.
- **`src/system/providers.ts`**: Node.js functions exposed to the interface.
- **`kit_electron/`**: internal build scripts and typed IPC runtime; normally no changes needed.

## Communicating between processes

Register a function in `src/system/providers.ts`:

```ts
import { providers } from '../../kit_electron/runtime/node.js';

export default providers
  .register('version', () => process.versions.electron);
```

Use it from React:

```ts
import { browser } from '../../kit_electron/runtime/browser.js';

const version = await browser.get('version')();
```

Providers execute in the Electron main process. The React interface accesses registered functions through the typed IPC bridge.

## Commands

```bash
npm run dev                # Type-check and run with automatic refresh
npm run package            # Type-check and package for the current OS
npm run package -- win     # Windows (NSIS)
npm run package -- linux   # Linux (AppImage and .deb)
npm run package -- mac     # macOS (.dmg)
```

There is no `npm run type` command. TypeScript checking is built into `dev` and `package`. Installers are generated in `release/`.

## Security

The window uses `contextIsolation: true` and `nodeIntegration: false`. Avoid exposing unsafe operations through providers.

# Electron Kit App

This project was generated with Electron Kit.

## Application structure

```text
browser/
node/
main.ts
global.d.ts
electron-kit/
package.json
tsconfig.json
```

Your application code normally stays in:

```text
browser/
node/
main.ts
```

Electron Kit internals stay inside:

```text
electron-kit/
├── build/
│   ├── dev.cjs
│   ├── package.cjs
│   └── type.cjs
├── bridge/
├── runtime/
└── cache/
```

## Browser

Vanilla projects use:

```text
browser/
├── main.ts
├── index.html
└── style.css
```

React projects use:

```text
browser/
├── main.tsx
├── App.tsx
├── index.html
└── style.css
```

## Node providers

Node functionality lives in `node/functions.ts`.

Example:

```ts
export const functions = {
  system: {
    platform() {
      return process.platform;
    },
  },
};
```

Register it in `node/provider.ts`:

```ts
export default providers
  .register('system', functions.system);
```

Then use it from Browser code:

```ts
const system = browser.get('system');

const platform = await system.platform();
```

The provider token, method parameters and return types are inferred by TypeScript.

## Commands

Only three public commands are generated:

```bash
npm run dev
npm run type
npm run package
```

### Dev

```bash
npm run dev
```

Runs the Electron application in development.

Generated JavaScript stays in:

```text
electron-kit/cache/
├── bundle.cjs
├── preload.cjs
└── browser.js
```

### Type

```bash
npm run type
```

Checks TypeScript without emitting files.

### Package

Current operating system:

```bash
npm run package
```

Specific target:

```bash
npm run package -- win
npm run package -- linux
npm run package -- mac
```

Outputs:

| Target | Format |
|---|---|
| `win` | NSIS / `.exe` |
| `linux` | AppImage + `.deb` |
| `mac` | `.dmg` |

Packaged applications are generated under:

```text
release/
```

For release builds, prefer packaging on the target operating system.

## Electron isolation

The generated window uses context isolation and keeps Node integration disabled.

Browser code accesses Node functionality only through the Electron Kit provider bridge.

# Electron Kit App

This project was generated with Electron Kit.

## Structure

```text
.electron-kit/
├── build/
│   ├── dev.cjs
│   ├── package.cjs
│   └── type.cjs
├── bridge/
├── runtime/
└── cache/

browser/
system/
main.ts
global.d.ts
package.json
tsconfig.json
```

The folder `.electron-kit/` contains Electron Kit internals and stays visually separated from the application code.

You normally work in:

```text
browser/
system/
main.ts
```

## Browser

Vanilla:

```text
browser/
├── main.ts
├── index.html
└── style.css
```

React:

```text
browser/
├── main.tsx
├── App.tsx
├── index.html
└── style.css
```

## System providers

Put System functionality in `system/functions.ts`:

```ts
export const functions = {
  system: {
    platform() {
      return process.platform;
    },
  },
};
```

Register it in `system/provider.ts`:

```ts
export default providers
  .register('system', functions.system);
```

Use it from Browser code:

```ts
const system = browser.get('system');

const platform = await system.platform();
```

Provider names, parameters and return values are inferred by TypeScript.

## Commands

```bash
npm run dev
npm run type
npm run package
```

### Development

```bash
npm run dev
```

Generated JavaScript stays in:

```text
.electron-kit/cache/
├── bundle.cjs
├── preload.cjs
└── browser.js
```

### Type checking

```bash
npm run type
```

### Packaging

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

| Target | Output |
|---|---|
| `win` | NSIS / `.exe` |
| `linux` | AppImage + `.deb` |
| `mac` | `.dmg` |

Packages are written to `release/`.

## Electron isolation

The generated BrowserWindow uses `contextIsolation: true` and `nodeIntegration: false`.

Browser code reaches System functionality only through the typed Electron Kit provider bridge.

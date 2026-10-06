# Electron Kit

Minimal Electron + TypeScript project generator with a typed system-to-UI bridge.

Electron Kit keeps its internal tooling inside `electron_kit/`, leaving the application code small and visible.

## Create a project

```bash
npx create-electron-kit
```

Also works with:

```bash
npm create electron-kit
yarn create electron-kit
pnpm create electron-kit
```

The CLI asks for the project name and then shows an interactive template selector:

```text
Enter project name: my-app

Select template:
❯ Vanilla
  React
```

Use the arrow keys and press Enter to confirm. Vanilla starts selected by default.

Dependencies are not installed automatically.

```bash
cd my-app
npm install
npm run dev
```

## Templates

Vanilla:

```text
src/ui/
├── main.ts
├── index.html
└── style.css
```

React:

```text
src/src/ui/
├── main.tsx
├── App.tsx
├── index.html
└── style.css
```

The system side is the same for both:

```text
src/system/
├── functions.ts
└── provider.ts
```

## Generated project

```text
my-app/
├── electron_kit/
│   ├── build/
│   │   ├── dev.cjs
│   │   ├── package.cjs
│   │   └── type.cjs
│   ├── bridge/
│   │   └── preload.ts
│   ├── runtime/
│   │   ├── node.ts
│   │   ├── browser.ts
│   │   └── shared.ts
│   └── cache/
├── src/
│   ├── ui/
│   └── system/
│   ├── functions.ts
│   └── provider.ts
├── main.ts
├── global.d.ts
├── package.json
├── tsconfig.json
└── README.md
```

Because the internal folder starts with a dot, it stays visually separated from `src/ui/` and `src/system/`.

## Typed providers

`src/system/functions.ts`:

```ts
export const functions = {
  system: {
    platform() {
      return process.platform;
    },
  },

  version() {
    return '1.0.0';
  },
};
```

`src/system/provider.ts`:

```ts
export default providers
  .register('system', functions.system)
  .register('version', functions.version);
```

UI or React:

```ts
const system = browser.get('system');

const platform = await system.platform();
```

The provider registry is the type source, so no duplicated contract file is required.

## Commands

Generated projects expose only:

```bash
npm run dev
npm run type
npm run package
```

### Dev

```bash
npm run dev
```

Generated JavaScript stays in:

```text
electron_kit/cache/
├── bundle.cjs
├── preload.cjs
└── browser.js
```

### Type

```bash
npm run type
```

### Package

```bash
npm run package
npm run package -- win
npm run package -- linux
npm run package -- mac
```

| Target | Output |
|---|---|
| `win` | NSIS / `.exe` |
| `linux` | AppImage + `.deb` |
| `mac` | `.dmg` |

Final packages are written to `release/`.

## Security

Generated windows use:

```text
contextIsolation: true
nodeIntegration: false
```

System access is exposed only through the preload/provider bridge.

## Philosophy

- TypeScript first
- Vanilla or React
- minimal visible structure
- no automatic dependency installation
- typed `providers.register()`
- typed `browser.get()`
- no duplicated provider contracts
- hidden internal tooling under `electron_kit/`
- only `dev`, `type` and `package` as public commands

# Create Kit Electron

Minimal Electron + React + TypeScript project generator.

## Create

```bash
npx create-kit-electron
```

Also works with:

```bash
npm create kit-electron
yarn create kit-electron
pnpm create kit-electron
```

The CLI asks only for the project name.

Dependencies are not installed automatically.

```bash
cd my-app
npm install
npm run dev
```

## Structure

```text
my-app/
├── kit_electron/
├── src/
│   ├── ui/
│   └── system/
├── main.ts
├── global.d.ts
├── package.json
├── tsconfig.json
└── README.md
```

Contexts:

```text
src/ui/        interface
src/system/    Node/system providers
main.ts        Electron window entry
kit_electron/  internal runtime and build tools
```

## Structure


The starter exposes only the Electron version:

```ts
export const functions = {
  version() {
    return process.versions.electron;
  },
};
```

```ts
export default providers
  .register('version', functions.version);
```

UI usage:

```ts
const version = browser.get('version');
const value = await version();
```

## Commands

```bash
npm run dev
npm run type
npm run package
```

Package for a specific platform:

```bash
npm run package -- win
npm run package -- linux
npm run package -- mac
```

Outputs are written to `release/`.

## Security

Generated windows use:

```text
contextIsolation: true
nodeIntegration: false
```

System access goes through the typed Create Kit Electron provider bridge.

# Create Kit Electron App

Generated with Create Kit Electron.

## Structure

```text
kit_electron/
src/
├── ui/
└── system/
main.ts
package.json
tsconfig.json
```

Contexts:

```text
src/ui/        interface
src/system/    Node/system providers
main.ts        Electron window entry
kit_electron/  internal tooling
```

## System

Add Node functionality in `src/system/functions.ts`.

Register what the UI can use in `src/system/provider.ts`.

Example:

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

Use it from the UI:

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

Specific package target:

```bash
npm run package -- win
npm run package -- linux
npm run package -- mac
```

Packages are written to `release/`.

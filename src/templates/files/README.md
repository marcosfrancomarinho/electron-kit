# Electron Kit App

Generated with Electron Kit.

## Structure

```text
browser/
node/
provider.ts
index.html
style.css
electron-kit/
package.json
tsconfig.json
```

The public application code stays at the project root. Internal bridge, build scripts, runtime helpers and cache stay inside `electron-kit/`.

## Install

```bash
npm install
```

## Commands

```bash
npm run dev
npm run build
npm start
npm run package
npm run type
```

`npm run build` generates:

```text
dist/
└── bundle.cjs
```

Electron Kit keeps generated preload and Browser bundles under `electron-kit/cache/`.

## Providers

Register Node functionality in `provider.ts`:

```ts
export default providers
  .register('file', file)
  .register('system', system);
```

Use it from Browser code:

```ts
const file = browser.get('file');

await file.read('config.json');
```

The Browser API is inferred from the registered providers.

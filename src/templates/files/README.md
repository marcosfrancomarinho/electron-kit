# Electron Kit App

Generated with Electron Kit.

## Structure

```text
browser/
node/
provider/
  provider.ts
main.ts
index.html
style.css
global.d.ts
electron-kit/
package.json
tsconfig.json
```

Your application code stays visible at the project root.

Electron Kit internals stay inside `electron-kit/`, including:

```text
electron-kit/
├── build/
├── bridge/
├── runtime/
└── cache/
```

The cache folder contains generated preload and Browser bundles.

## Commands

```bash
npm run dev
npm run build
npm start
npm run package
npm run type
```

`npm run build` generates only the production main bundle in the root `dist` folder:

```text
dist/
└── bundle.cjs
```

## Providers

Register Node functionality in `provider/provider.ts`:

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

Provider names, parameters and return values are inferred by TypeScript.

`global.d.ts` declares CSS modules for TypeScript.

# Electron Kit

Create a minimal Electron + TypeScript project with a typed Node-to-Browser bridge.

## Create

```bash
npx create-electron-kit
```

Also works with:

```bash
npm create electron-kit
yarn create electron-kit
pnpm create electron-kit
```

The generator asks for the project folder name and does not install dependencies automatically.

## Generated project

```text
my-app/
├── browser/
│   ├── main.ts
│   ├── index.html
│   └── style.css
├── node/
│   ├── functions.ts
│   └── provider.ts
├── main.ts
├── global.d.ts
├── electron-kit/
│   ├── build/
│   ├── bridge/
│   ├── runtime/
│   └── cache/
├── package.json
├── tsconfig.json
└── README.md
```

Application code stays visible and small. Internal build, IPC, preload, runtime and cache files stay inside `electron-kit/`.

## Typed providers

Node-side registration:

```ts
export default providers
  .register('file', file)
  .register('system', system)
  .register('version', () => '1.0.0');
```

Browser-side access:

```ts
const file = browser.get('file');

await file.read('config.json');
```

The Browser API is inferred directly from the provider registry.

## Commands

```bash
npm run dev
npm run build
npm start
npm run package
npm run type
```

`build` creates:

```text
dist/
└── bundle.cjs
```

Generated Browser and preload bundles stay under:

```text
electron-kit/cache/
```

## Philosophy

- TypeScript first
- minimal visible project structure
- no automatic dependency installation
- typed `providers.register()`
- typed `browser.get()`
- internal Electron plumbing hidden under `electron-kit/`

# Electron Kit App

This project was generated with Electron Kit.

## Install

Dependencies are intentionally not installed by the generator.

```bash
npm install
```

## Run

```bash
npm run dev
```

## Commands

```bash
npm run dev
npm run build
npm run package
npm run type
```

## Node to Browser bridge

Register Node/Electron functionality in `src/providers.ts`:

```ts
export default providers
  .register('file', file)
  .register('system', system);
```

Consume it from Browser code:

```ts
const file = browser.get('file');

await file.read('config.json');
```

The Browser API is inferred from the registered providers.

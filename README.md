# Electron Kit

Minimal Electron + TypeScript project generator with a typed Node-to-Browser bridge.

Electron Kit keeps the Electron plumbing inside `electron-kit/` and leaves the application code small and visible.

## Create a project

With npm:

```bash
npx create-electron-kit
```

Also works with:

```bash
npm create electron-kit
yarn create electron-kit
pnpm create electron-kit
```

The CLI asks for:

```text
Enter project name: my-app
Template [vanilla/react]:
```

Press Enter on the template prompt to use `vanilla`.

Electron Kit does **not** install dependencies automatically.

After generation:

```bash
cd my-app
npm install
npm run dev
```

## Templates

### Vanilla

```text
browser/
├── main.ts
├── index.html
└── style.css
```

### React

```text
browser/
├── main.tsx
├── App.tsx
├── index.html
└── style.css
```

The React template adds React 19, React DOM and their TypeScript types.

The Node side is the same for both templates:

```text
node/
├── functions.ts
└── provider.ts
```

## Generated project

```text
my-app/
├── browser/
├── node/
│   ├── functions.ts
│   └── provider.ts
├── electron-kit/
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
├── main.ts
├── global.d.ts
├── package.json
├── tsconfig.json
└── README.md
```

The folders you normally work in are:

```text
browser/
node/
main.ts
```

Internal Electron IPC, preload, generated JavaScript and build tooling stay inside `electron-kit/`.

## Typed providers

Node functionality can be kept in `node/functions.ts`:

```ts
export const functions = {
  file: {
    read(path: string) {
      return readFile(path, 'utf8');
    },
  },

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

Register it in `node/provider.ts`:

```ts
export default providers
  .register('file', functions.file)
  .register('system', functions.system)
  .register('version', functions.version);
```

Use it from Vanilla or React:

```ts
const system = browser.get('system');

const platform = await system.platform();
```

Provider names, method parameters and return values are inferred directly from the registry.

There is no separate interface file to keep synchronized.

## Commands

Generated projects intentionally expose only three commands:

```bash
npm run dev
npm run type
npm run package
```

### Development

```bash
npm run dev
```

Electron Kit compiles the application and runs Electron.

Generated JavaScript stays under:

```text
electron-kit/cache/
├── bundle.cjs
├── preload.cjs
└── browser.js
```

No `dist/` folder is created by the development command.

### Type checking

```bash
npm run type
```

Runs TypeScript checking without emitting JavaScript.

### Packaging

Package for the current operating system:

```bash
npm run package
```

Or choose the target explicitly:

```bash
npm run package -- win
npm run package -- linux
npm run package -- mac
```

Targets:

| Target | Output |
|---|---|
| `win` | NSIS / `.exe` |
| `linux` | AppImage + `.deb` |
| `mac` | `.dmg` |

Final packages are written to:

```text
release/
```

For reliable release builds, package each target on its native operating system, especially macOS.

## Package managers

The generator detects npm, Yarn and pnpm.

Typical commands are:

```bash
# npm
npm install
npm run dev

# Yarn
yarn
yarn dev

# pnpm
pnpm install
pnpm dev
```

## Security model

Generated Browser windows use:

```text
contextIsolation: true
nodeIntegration: false
```

Browser code does not receive direct Node.js access.

Node functionality is exposed through the typed provider bridge and Electron preload layer.

## Philosophy

- TypeScript first
- Vanilla or React
- minimal visible application structure
- no automatic dependency installation
- typed `providers.register()`
- typed `browser.get()`
- no duplicated provider contracts
- Electron plumbing hidden under `electron-kit/`
- only `dev`, `type` and `package` as public project commands

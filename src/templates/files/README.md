# Kit Electron App

Projeto gerado com [Create Kit Electron](https://github.com/marcosfrancomarinho/electron-kit): Electron + React + TypeScript + Tailwind CSS.

## Começar

```bash
npm install
npm run dev
```

## Pastas

```text
src/
├── ui/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.html
│   └── style.css
└── system/
    ├── main.ts
    └── providers.ts

kit_electron/
├── build/
│   ├── dev.cjs
│   └── package.cjs
└── runtime/
    ├── browser.ts
    ├── node.ts
    ├── preload.ts
    └── shared.ts
```

- **`src/ui/`**: interface React, HTML e estilos.
- **`src/system/main.ts`**: inicialização da janela Electron.
- **`src/system/providers.ts`**: funções Node.js disponibilizadas para a interface.
- **`kit_electron/`**: scripts de compilação e ponte de comunicação; normalmente não precisa de alterações.

## Comunicação entre os processos

Em `src/system/providers.ts`:

```ts
import { providers } from '../../kit_electron/runtime/node.js';

export default providers
  .register('version', () => process.versions.electron);
```

Na interface React:

```ts
import { browser } from '../../kit_electron/runtime/browser.js';

const version = await browser.get('version')();
```

Os providers executam no processo principal do Electron. O React acessa apenas as funções registradas, pela ponte IPC.

## Comandos

```bash
npm run dev                # Tipos + desenvolvimento com atualização automática
npm run package            # Tipos + instalador para o sistema atual
npm run package -- win     # Windows (NSIS)
npm run package -- linux   # Linux (AppImage e .deb)
npm run package -- mac     # macOS (.dmg)
```

Não existe `npm run type`: a verificação TypeScript já faz parte de `dev` e `package`. Os instaladores vão para `release/`.

## Segurança

A janela usa `contextIsolation: true` e `nodeIntegration: false`. Evite expor operações não confiáveis nos providers.

---

**English:** Application code lives in `src/ui` (React) and `src/system` (Electron/Node.js). Internal build and IPC files live in `kit_electron`. Run `npm install`, then `npm run dev` or `npm run package`; both scripts check TypeScript automatically.

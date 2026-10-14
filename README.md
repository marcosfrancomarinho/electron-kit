# Create Kit Electron

Crie aplicativos desktop com **Electron + React + TypeScript + Tailwind CSS**, sem configurar toda a infraestrutura do zero.

O Kit Electron gera uma base enxuta, com comunicação tipada entre a interface e o Node.js. **Não impõe arquitetura** ao seu código.

## Começar

Requer Node.js 22 ou superior.

```bash
npx create-kit-electron
```

Informe o nome do projeto e execute:

```bash
cd meu-app
npm install
npm run dev
```

O nome da pasta depende do nome informado na criação. A CLI não instala dependências automaticamente.

## Estrutura gerada

```text
meu-app/
├── src/
│   ├── ui/                  # React, HTML e estilos
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.html
│   │   └── style.css
│   └── system/              # Electron, Node.js e providers
│       ├── main.ts
│       └── providers.ts
├── kit_electron/            # Infraestrutura da ferramenta
│   ├── build/
│   │   ├── dev.cjs
│   │   └── package.cjs
│   └── runtime/
│       ├── browser.ts
│       ├── node.ts
│       ├── preload.ts
│       └── shared.ts
├── package.json
├── tsconfig.json
└── README.md
```

**`src/` é sua aplicação.** Use `src/ui` para a interface e `src/system` para funcionalidades que precisam do Electron ou do Node.js. A pasta `kit_electron/` contém os arquivos internos de compilação e comunicação.

## Providers

Registre funções disponíveis para o React em `src/system/providers.ts`:

```ts
import { providers } from '../../kit_electron/runtime/node.js';

export default providers
  .register('version', () => process.versions.electron);
```

Use na interface:

```ts
import { browser } from '../../kit_electron/runtime/browser.js';

const version = await browser.get('version')();
console.log(version);
```

Os providers executam no processo principal do Electron. O React os acessa pela ponte tipada baseada em IPC, sem acesso direto ao Node.js.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Verifica os tipos, inicia o Electron e acompanha alterações |
| `npm run package` | Verifica os tipos, compila e gera o instalador para o sistema atual |

Para selecionar a plataforma:

```bash
npm run package -- win
npm run package -- linux
npm run package -- mac
```

O resultado fica em `release/`. O desenvolvimento cria uma pasta temporária `kit_electron/cache/`, ignorada pelo Git.

**Não há comando `type` separado:** tanto `dev` quanto `package` executam a verificação TypeScript antes de compilar.

## Segurança

As janelas geradas utilizam `contextIsolation: true` e `nodeIntegration: false`. Apenas as funcionalidades registradas como providers ficam disponíveis para a interface.

---

## English

**Create Kit Electron** is a minimal starter generator for Electron, React, TypeScript and Tailwind CSS. It keeps your app in `src/ui` (React) and `src/system` (Electron/Node.js), with internal tooling under `kit_electron/`. No application architecture is enforced.

```bash
npx create-kit-electron
cd my-app
npm install
npm run dev
```

Use `npm run dev` to develop and `npm run package` to build installers. Both commands check TypeScript automatically. Packaging targets: `win`, `linux`, `mac`. Installers are written to `release/`.

Register functions in `src/system/providers.ts` with `providers.register(token, fn)`; invoke them in React with `browser.get(token)(...args)`. The bridge uses IPC with context isolation enabled.

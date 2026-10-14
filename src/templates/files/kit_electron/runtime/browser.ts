import type registry from '../../src/system/providers.js';
import type { ProviderRegistry } from './node.js';
export type Remote<T> =
  T extends (...args: infer Args) => infer Result
    ? (...args: Args) => Promise<Awaited<Result>>
    : T extends Record<string, unknown>
      ? { [Key in keyof T]: Remote<T[Key]> }
      : never;

type RegisteredProviders = ProviderRegistry<typeof registry>;

interface CreateKitElectronBridge {
  invoke(
    token: string,
    method: string | null,
    args: unknown[],
  ): Promise<unknown>;
}

declare global {
  interface Window {
    __createKitElectron?: CreateKitElectronBridge;
  }
}

function bridge(): CreateKitElectronBridge {
  if (!window.__createKitElectron) {
    throw new Error('Create Kit Electron bridge is unavailable.');
  }

  return window.__createKitElectron;
}

function objectProxy(token: string): object {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (typeof property !== 'string') return undefined;

        return (...args: unknown[]) =>
          bridge().invoke(token, property, args);
      },
    },
  );
}

export const browser = {
  get<Token extends keyof RegisteredProviders & string>(
    token: Token,
  ): Remote<RegisteredProviders[Token]> {
    return new Proxy(
      (...args: unknown[]) => bridge().invoke(token, null, args),
      {
        get(_target, property) {
          if (property === 'then') return undefined;
          return Reflect.get(objectProxy(token), property);
        },
      },
    ) as Remote<RegisteredProviders[Token]>;
  },
};

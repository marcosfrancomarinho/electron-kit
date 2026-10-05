import type { ProviderRegistry, Providers } from './node.js';
import type { Remote } from './shared.js';

export interface ProviderTypes {}

type RegisteredProviders =
  ProviderTypes extends { readonly __registry__: infer Registry }
    ? Registry extends Providers<any>
      ? ProviderRegistry<Registry>
      : never
    : never;

interface ElectronKitBridge {
  invoke(
    token: string,
    method: string | null,
    args: unknown[]
  ): Promise<unknown>;
}

declare global {
  interface Window {
    __electronKit?: ElectronKitBridge;
  }
}

function bridge(): ElectronKitBridge {
  if (!window.__electronKit) {
    throw new Error(
      'Electron Kit bridge is unavailable. Make sure the generated preload is active.'
    );
  }

  return window.__electronKit;
}

function createObjectProxy(token: string) {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (typeof property !== 'string') return undefined;

        return (...args: unknown[]) =>
          bridge().invoke(token, property, args);
      }
    }
  );
}

export const browser = {
  get<Token extends keyof RegisteredProviders & string>(
    token: Token
  ): Remote<RegisteredProviders[Token]> {
    return new Proxy(
      (...args: unknown[]) => bridge().invoke(token, null, args),
      {
        get(_target, property) {
          if (property === 'then') return undefined;
          return Reflect.get(createObjectProxy(token), property);
        }
      }
    ) as Remote<RegisteredProviders[Token]>;
  }
};

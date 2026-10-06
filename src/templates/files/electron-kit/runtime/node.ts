import { app, ipcMain } from 'electron';
import { join } from 'node:path';
import type { ProviderMap, ProviderValue } from './shared.js';

const channel = 'electron-kit:invoke';
const registry = new Map<string, ProviderValue>();
let listening = false;

function safeKey(value: string): boolean {
  return value !== '__proto__' &&
    value !== 'prototype' &&
    value !== 'constructor';
}

function listen(): void {
  if (listening) return;

  ipcMain.handle(
    channel,
    async (_event, token: string, method: string | null, args: unknown[]) => {
      if (!safeKey(token)) {
        throw new Error('Invalid provider token.');
      }

      const provider = registry.get(token);

      if (!provider) {
        throw new Error(`Provider "${token}" is not registered.`);
      }

      if (typeof provider === 'function') {
        if (method !== null) {
          throw new Error(`Provider "${token}" is a function.`);
        }

        return provider(...args);
      }

      if (!method || !safeKey(method)) {
        throw new Error('Invalid provider method.');
      }

      const fn = provider[method];

      if (typeof fn !== 'function') {
        throw new Error(`Method "${token}.${method}" is not registered.`);
      }

      return fn(...args);
    },
  );

  listening = true;
}

export class Providers<T extends ProviderMap = {}> {
  register<const Token extends string, Value extends ProviderValue>(
    token: Token,
    value: Value,
  ): Providers<T & Record<Token, Value>> {
    if (registry.has(token)) {
      throw new Error(`Provider "${token}" is already registered.`);
    }

    registry.set(token, value);
    listen();

    return this as Providers<T & Record<Token, Value>>;
  }
}

export type ProviderRegistry<T> =
  T extends Providers<infer Registry> ? Registry : never;

export const providers = new Providers();

export function preloadPath(): string {
  return join(
    app.getAppPath(),
    'electron-kit',
    'cache',
    'preload.cjs',
  );
}

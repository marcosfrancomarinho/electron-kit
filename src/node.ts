import { ipcMain } from 'electron';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProviderMap, ProviderValue } from './shared.js';

const channel = 'electron-kit:invoke';
const values = new Map<string, ProviderValue>();
let listening = false;

function isSafeKey(value: string) {
  return value !== '__proto__' && value !== 'prototype' && value !== 'constructor';
}

function ensureListener() {
  if (listening) return;

  ipcMain.handle(
    channel,
    async (_event, token: string, method: string | null, args: unknown[]) => {
      if (!isSafeKey(token)) {
        throw new Error('Invalid provider token.');
      }

      const provider = values.get(token);

      if (!provider) {
        throw new Error(`Provider "${token}" is not registered.`);
      }

      if (typeof provider === 'function') {
        if (method !== null) {
          throw new Error(`Provider "${token}" is a function.`);
        }

        return provider(...args);
      }

      if (!method || !isSafeKey(method)) {
        throw new Error('Invalid provider method.');
      }

      const fn = provider[method];

      if (typeof fn !== 'function') {
        throw new Error(`Method "${token}.${method}" is not registered.`);
      }

      return fn(...args);
    }
  );

  listening = true;
}

export class Providers<T extends ProviderMap = {}> {
  register<const Token extends string, Value extends ProviderValue>(
    token: Token,
    value: Value
  ): Providers<T & Record<Token, Value>> {
    if (values.has(token)) {
      throw new Error(`Provider "${token}" is already registered.`);
    }

    values.set(token, value);
    ensureListener();

    return this as Providers<T & Record<Token, Value>>;
  }
}

export const providers = new Providers();

export type ProviderRegistry<T> =
  T extends Providers<infer Registry> ? Registry : never;

export function preloadPath() {
  if (process.env.ELECTRON_KIT_PRELOAD) {
    return process.env.ELECTRON_KIT_PRELOAD;
  }

  return join(dirname(fileURLToPath(import.meta.url)), 'preload.cjs');
}

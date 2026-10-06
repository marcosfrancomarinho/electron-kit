export type ProviderFunction = (...args: any[]) => unknown;

export type ProviderValue =
  | ProviderFunction
  | Record<string, ProviderFunction>;

export type ProviderMap = Record<string, ProviderValue>;

export type Remote<T> =
  T extends (...args: infer Args) => infer Result
    ? (...args: Args) => Promise<Awaited<Result>>
    : T extends Record<string, unknown>
      ? { [Key in keyof T]: Remote<T[Key]> }
      : never;

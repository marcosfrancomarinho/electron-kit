import { useEffect, useState } from 'react';
import { browser } from '../../kit_electron/runtime/browser.js';

export function App() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    const getVersion = browser.get('version');
    void getVersion().then(setVersion);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 text-zinc-100">
      <div className="pointer-events-none absolute left-[8%] top-[14%] h-80 w-80 rounded-full bg-indigo-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[4%] h-80 w-80 rounded-full bg-cyan-400/15 blur-[120px]" />

      <section className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
          Electron + React + TypeScript
        </div>

        <div className="mt-8 grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-950 text-4xl font-black shadow-2xl">
          K
        </div>

        <h1 className="mt-6 text-5xl font-black tracking-[-0.06em] text-white sm:text-7xl">
          Create Kit
          <span className="text-zinc-500"> Electron</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">
          A minimal desktop starter with React, Tailwind CSS,
          typed providers and a clean project structure.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <div className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/80 px-4 font-mono text-sm text-zinc-300 backdrop-blur">
            <span className="text-emerald-500">$</span>
            yarn dev
          </div>

          <div className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 text-xs text-zinc-500 backdrop-blur">
            <span>Electron</span>
            <strong className="text-zinc-200">{version || '...'}</strong>
          </div>
        </div>

        <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
          {[
            ['01', 'React', 'Ready for your interface.'],
            ['02', 'Typed bridge', 'Safe access to Node.'],
            ['03', 'Tailwind CSS', 'Style directly with utilities.'],
          ].map(([number, title, text]) => (
            <article
              key={number}
              className="flex min-h-28 gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]"
            >
              <span className="font-mono text-xs text-zinc-600">{number}</span>
              <div>
                <strong className="text-sm text-zinc-200">{title}</strong>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="absolute bottom-6 left-7 right-7 flex justify-between text-[11px] tracking-wide text-zinc-600">
        <span>Create Kit Electron</span>
        <span>Ready to build.</span>
      </footer>
    </main>
  );
}

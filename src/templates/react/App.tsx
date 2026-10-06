import { useEffect, useState } from 'react';
import { browser } from '../../kit_electron/runtime/browser.js';

export function App() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    const getVersion = browser.get('version');

    void getVersion().then(setVersion);
  }, []);

  return (
    <main className="app-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <section className="hero">
        <div className="badge">
          <span className="badge-dot" />
          Electron + React + TypeScript
        </div>

        <div className="logo">
          <span className="logo-mark">K</span>
        </div>

        <h1>
          Create Kit
          <span> Electron</span>
        </h1>

        <p className="description">
          A minimal desktop starter focused on a clean structure,
          typed providers and a fast development experience.
        </p>

        <div className="actions">
          <div className="command">
            <span className="prompt">$</span>
            <code>yarn dev</code>
          </div>

          <div className="version">
            <span>Electron</span>
            <strong>{version || '...'}</strong>
          </div>
        </div>

        <div className="features">
          <article>
            <span>01</span>
            <div>
              <strong>React</strong>
              <p>Ready to build the interface.</p>
            </div>
          </article>

          <article>
            <span>02</span>
            <div>
              <strong>Typed bridge</strong>
              <p>Safe communication with Node.</p>
            </div>
          </article>

          <article>
            <span>03</span>
            <div>
              <strong>Minimal</strong>
              <p>Only the structure you need.</p>
            </div>
          </article>
        </div>
      </section>

      <footer>
        <span>Create Kit Electron</span>
        <span>Ready to build.</span>
      </footer>
    </main>
  );
}

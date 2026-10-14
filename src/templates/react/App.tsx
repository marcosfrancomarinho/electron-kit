import { useEffect, useState } from 'react';
import { browser } from '../../kit_electron/runtime/browser.js';

export function App() {
  const [version, setVersion] = useState('...');

  useEffect(() => {
    void browser.get('version')()
      .then(setVersion)
      .catch(() => setVersion('unavailable'));
  }, []);

  return (
    <main className="app">
      <section>
        <span className="subtitle">Electron + React + TypeScript</span>
        <h1>Kit Electron</h1>
        <p>A minimal desktop starter, ready for your ideas.</p>
        <div className="version">Electron {version}</div>
      </section>
      <footer>Powered by Create Kit Electron</footer>
    </main>
  );
}

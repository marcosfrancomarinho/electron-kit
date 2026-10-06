import { useEffect, useState } from 'react';
import { browser } from '../../_electron_kit/runtime/browser.js';

export function App() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    const getVersion = browser.get('version');

    void getVersion().then(setVersion);
  }, []);

  return (
    <main>
      <h1>Electron Kit</h1>
      <p>
        Version <span>{version || '...'}</span>
      </p>
    </main>
  );
}

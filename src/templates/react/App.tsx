import { useEffect, useState } from 'react';
import { browser } from '../../kit_electron/runtime/browser.js';

export function App() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    const getVersion = browser.get('version');

    void getVersion().then(setVersion);
  }, []);

  return (
    <main>
      <h1>Create Kit Electron</h1>
      <p>
        Version <span>{version || '...'}</span>
      </p>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { browser } from '../.electron-kit/runtime/browser.js';

export function App() {
  const [platform, setPlatform] = useState('');
  const [version, setVersion] = useState('');

  useEffect(() => {
    const system = browser.get('system');
    const getVersion = browser.get('version');

    void Promise.all([
      system.platform(),
      getVersion(),
    ]).then(([nextPlatform, nextVersion]) => {
      setPlatform(nextPlatform);
      setVersion(nextVersion);
    });
  }, []);

  return (
    <main>
      <h1>Electron Kit + React</h1>
      <p>
        {platform ? `Running on ${platform} · v${version}` : 'Loading...'}
      </p>
    </main>
  );
}

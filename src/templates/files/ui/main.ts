import { browser } from '../.electron-kit/runtime/browser.js';

async function main() {
  const version = browser.get('version');
  const appVersion = await version();

  const value = document.querySelector<HTMLSpanElement>('#version');

  if (value) {
    value.textContent = appVersion;
  }
}

void main();

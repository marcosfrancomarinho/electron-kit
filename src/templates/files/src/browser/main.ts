import { browser } from '../../electron-kit/runtime/browser.js';
import './style.css';

const system = browser.get('system');
const version = browser.get('version');

const platform = await system.platform();
const appVersion = await version();

const info = document.querySelector<HTMLParagraphElement>('#info');

if (info) {
  info.textContent = `Running on ${platform} · v${appVersion}`;
}

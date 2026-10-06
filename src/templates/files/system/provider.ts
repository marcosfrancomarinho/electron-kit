import { providers } from '../.electron-kit/runtime/node.js';
import { functions } from './functions.js';

export default providers
  .register('file', functions.file)
  .register('system', functions.system)
  .register('version', functions.version);

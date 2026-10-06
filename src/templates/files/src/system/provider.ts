import { providers } from '../../.electron-kit/runtime/node.js';
import { functions } from './functions.js';

export default providers
  .register('version', functions.version);

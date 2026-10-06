import { providers } from '../../kit_electron/runtime/node.js';
import { functions } from './functions.js';

export default providers
  .register('version', functions.version);

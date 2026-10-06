import { providers } from '../../electron_kit/runtime/node.js';
import { functions } from './functions.js';

export default providers
  .register('version', functions.version);

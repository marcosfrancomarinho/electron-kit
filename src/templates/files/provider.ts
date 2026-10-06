import { providers } from './electron-kit/runtime/node.js';
import { file } from './node/file.js';
import { system } from './node/system.js';

export default providers
  .register('file', file)
  .register('system', system)
  .register('version', () => '1.0.0');

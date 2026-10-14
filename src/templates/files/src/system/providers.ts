import { providers } from '../../kit_electron/runtime/node.js';

export default providers
  .register('version', () => process.versions.electron);

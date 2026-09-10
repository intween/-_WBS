import { createLocalAdapter } from './localAdapter';
import { createHttpAdapter } from './httpAdapter';
import { STORE_MODES } from './types';

const ADAPTERS = {
  [STORE_MODES.local]: createLocalAdapter,
  [STORE_MODES.http]: createHttpAdapter,
};

export const resolveStoreMode = () => {
  const mode = import.meta.env.VITE_STORE_MODE;
  return mode in ADAPTERS ? mode : STORE_MODES.local;
};

export const createStore = () => ADAPTERS[resolveStoreMode()]();

export const store = createStore();

export { STORE_MODES } from './types';

import type { LocalStore, PlayerIdentity } from '@arena-prototype/shared-types';
import { createContext, useContext } from 'react';

export const LocalStoreContext = createContext<LocalStore | null>(null);

export function useLocalStore(): LocalStore {
  const store = useContext(LocalStoreContext);
  if (!store) {
    throw new Error('LocalStoreContext is not available');
  }
  return store;
}

export function useIdentity(): PlayerIdentity | null {
  return useLocalStore().getIdentity();
}

import {
  generateKeypair,
  hasCompleteIdentity,
  toPlayerIdentity,
  zHandle,
  zPreferences,
  zStoredIdentity,
  type Handle,
  type LocalStore,
  type PlayerIdentity,
  type Preferences,
  type StoredIdentity,
} from '@arena-prototype/shared-types';
import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';

const IDENTITY_TABLE = 'identity';
const PREFERENCES_TABLE = 'preferences';
const IDENTITY_ROW = 'self';
const PREFERENCES_ROW = 'self';

type LocalStoreBundle = {
  store: LocalStore;
  readStored: () => StoredIdentity | null;
  ensureStarted: () => Promise<void>;
};

let bundle: LocalStoreBundle | null = null;

function createLocalStoreBundle(): LocalStoreBundle {
  const tinybase = createStore();
  const persister = createLocalPersister(tinybase, 'arena-prototype-local');

  let started = false;
  const startPromise = persister.startAutoPersisting().then(() => {
    started = true;
  });

  const ensureStarted = async () => {
    if (!started) await startPromise;
  };

  const readStored = (): StoredIdentity | null => {
    const row = tinybase.getRow(IDENTITY_TABLE, IDENTITY_ROW);
    if (!row || Object.keys(row).length === 0) return null;
    return zStoredIdentity.parse(row);
  };

  const localStore: LocalStore = {
    getIdentity() {
      const stored = readStored();
      if (!hasCompleteIdentity(stored)) return null;
      return toPlayerIdentity(stored);
    },

    saveIdentity(identity: PlayerIdentity) {
      tinybase.setRow(IDENTITY_TABLE, IDENTITY_ROW, identity);
    },

    getPreferences() {
      const row = tinybase.getRow(PREFERENCES_TABLE, PREFERENCES_ROW);
      if (!row || Object.keys(row).length === 0) {
        return zPreferences.parse({});
      }
      return zPreferences.parse(row);
    },

    savePreferences(prefs: Preferences) {
      tinybase.setRow(PREFERENCES_TABLE, PREFERENCES_ROW, prefs);
    },

    async ensureKeypair() {
      await ensureStarted();
      const existing = readStored();
      if (existing?.signingPubKey) return;

      const keypair = await generateKeypair();
      tinybase.setRow(IDENTITY_TABLE, IDENTITY_ROW, {
        ...keypair,
        handle: '',
      });
    },
  };

  return { store: localStore, readStored, ensureStarted };
}

export async function getLocalStore(): Promise<LocalStore> {
  if (!bundle) bundle = createLocalStoreBundle();
  await bundle.ensureStarted();
  return bundle.store;
}

export async function setHandle(handle: Handle): Promise<PlayerIdentity> {
  if (!bundle) bundle = createLocalStoreBundle();
  await bundle.ensureStarted();

  const parsedHandle = zHandle.parse(handle);
  const stored = bundle.readStored();
  if (!stored?.signingPubKey) {
    throw new Error('Signing keypair is missing. Reload the app to generate keys.');
  }

  const identity = toPlayerIdentity({
    ...stored,
    handle: parsedHandle,
  });
  bundle.store.saveIdentity(identity);
  return identity;
}

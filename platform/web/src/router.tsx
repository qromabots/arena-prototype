import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { LocalStore, PlayerIdentity } from '@arena-prototype/shared-types';
import { LocalStoreContext } from '@/sync/LocalStoreContext';
import { getLocalStore } from '@/sync/LocalStore';
import { WelcomePage } from '@/pages/WelcomePage';
import { HomePage } from '@/pages/HomePage';
import { SettingsPage } from '@/pages/SettingsPage';

async function requireIdentity(): Promise<PlayerIdentity> {
  const local = await getLocalStore();
  await local.ensureKeypair();
  const identity = local.getIdentity();
  if (!identity) {
    throw redirect({ to: '/welcome' });
  }
  return identity;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/welcome',
  component: WelcomePage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => ({ identity: await requireIdentity() }),
  component: HomePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: async () => ({ identity: await requireIdentity() }),
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  indexRoute,
  settingsRoute,
]);

function RootLayout() {
  const [localStore, setLocalStore] = useState<LocalStore | null>(null);

  useEffect(() => {
    void getLocalStore().then(setLocalStore);
  }, []);

  if (!localStore) {
    return (
      <div className="loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <LocalStoreContext.Provider value={localStore}>
      <Outlet />
    </LocalStoreContext.Provider>
  );
}

const basepath = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createRouter({
  routeTree,
  ...(basepath ? { basepath } : {}),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

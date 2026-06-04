import { HandleForm } from '@/components/HandleForm';
import { Layout } from '@/components/Layout';
import { setHandle } from '@/sync/LocalStore';
import { getRouteApi, Link } from '@tanstack/react-router';

const route = getRouteApi('/settings');

export function SettingsPage() {
  const { identity } = route.useRouteContext();

  return (
    <Layout title="Settings">
      <HandleForm
        initialHandle={identity.handle}
        submitLabel="Save handle"
        onSubmit={async (handle) => {
          await setHandle(handle);
        }}
      />
      <p className="muted" style={{ marginTop: '1.5rem' }}>
        Player id: <code className="mono">{identity.playerId}</code>
      </p>
      <p>
        <Link to="/">Back to home</Link>
        {' · '}
        <Link to="/usage">DO usage</Link>
      </p>
    </Layout>
  );
}

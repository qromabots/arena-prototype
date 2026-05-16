import { Layout } from '@/components/Layout';
import { getRouteApi, Link } from '@tanstack/react-router';

const route = getRouteApi('/');

export function HomePage() {
  const { identity } = route.useRouteContext();

  return (
    <Layout title="Home">
      <p className="lead">
        Welcome, <strong>{identity.handle}</strong>.
      </p>
      <p className="muted">
        Arena creation and joining arrive in the next milestone. Your identity is
        ready on this device.
      </p>
      <section className="card">
        <h2>Your player id</h2>
        <code className="mono">{identity.playerId}</code>
      </section>
      <p>
        <Link to="/settings">Settings</Link>
      </p>
    </Layout>
  );
}

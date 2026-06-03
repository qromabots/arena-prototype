import { Layout } from '@/components/Layout';
import { ArenaSyncApp } from '@/arena/ArenaSyncApp';
import { ArenaSyncBar } from '@/arena/ArenaSyncBar';
import { ArenaCanvas } from '@/arena/ArenaCanvas';
import { ArenaControllerPanel } from '@/arena/ArenaControllerPanel';
import { getRouteApi, Link } from '@tanstack/react-router';

const route = getRouteApi('/arena');

export function ArenaPage() {
  const { identity } = route.useRouteContext();

  return (
    <Layout title="Robot Arena" wide>
      <p className="lead">
        Plug in a gamepad and use the left stick or D-pad to drive your robot. Keyboard
        (<kbd>WASD</kbd> / arrows) works as a fallback.
      </p>
      <ArenaSyncApp identity={identity}>
        <ArenaSyncBar />
        <div className="arena-stage">
          <ArenaCanvas playerId={identity.playerId} />
        </div>
        <ArenaControllerPanel />
      </ArenaSyncApp>      <p className="muted arena-hint">
        Create an arena to invite others — each connected player spawns their own robot
        on the shared field.
      </p>
      <p>
        <Link to="/">Home</Link>
        {' · '}
        <Link to="/drawing">Drawing demo</Link>
      </p>
    </Layout>
  );
}

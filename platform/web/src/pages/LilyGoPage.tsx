import { Link } from '@tanstack/react-router';
import { Layout } from '@/components/Layout';
import { LilyGoBoardPanel } from '@/lilygo/LilyGoBoardPanel';
import { LilyGoSyncApp } from '@/lilygo/LilyGoSyncApp';
import { LilyGoSyncBar } from '@/lilygo/LilyGoSyncBar';

export function LilyGoPage() {
  return (
    <Layout title="LilyGO boards" wide>
      <p className="lead">
        Push text to a LilyGO board — share a room so any browser can edit; one host
        tab owns WebSerial.
      </p>
      <p className="muted">
        Flash the{' '}
        <a href="https://github.com/qromabots/arena-prototype/tree/main/platform/firmware">
          LilyGO firmware
        </a>{' '}
        (T-Display S3 or T5 2.13"), connect USB on the host machine, then start sharing
        like the drawing room. Guests open the link and type; the host pushes{' '}
        <code className="mono">SET</code> over serial.
      </p>

      <LilyGoSyncApp>
        <LilyGoSyncBar />
        <LilyGoBoardPanel />
      </LilyGoSyncApp>

      <section className="card">
        <h2>Protocol</h2>
        <p className="muted">
          Boards announce themselves with <code className="mono">HELLO T-DISPLAY-S3</code> or{' '}
          <code className="mono">HELLO T5-2.13</code> at 115200 baud. The host sends{' '}
          <code className="mono">SET &lt;text&gt;</code> (newline-terminated); the board replies{' '}
          <code className="mono">OK</code> after re-rendering. Shared rooms use the same
          Cloudflare Durable Object WebSocket as the drawing demo.
        </p>
      </section>

      <p>
        <Link to="/">Home</Link>
      </p>
    </Layout>
  );
}

import { DrawingApp } from '@/drawing/DrawingApp';
import { Link } from '@tanstack/react-router';

export function DrawingPage() {
  return (
    <div className="drawing-page">
      <header className="drawing-page-header">
        <Link to="/">← Home</Link>
        <p className="muted">
          TinyBase drawing demo — drag shapes, resize with grips, undo/redo. Start
          sharing, then open the link on another device. Local dev uses the Cloudflare
          Durable Object via <code className="mono">npm run dev</code>; production uses
          the deployed Worker (<code className="mono">wss://…workers.dev/</code>).
        </p>
      </header>
      <div className="drawing-page-body">
        <DrawingApp />
      </div>
    </div>
  );
}

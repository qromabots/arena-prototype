import { DrawingApp } from '@/drawing/DrawingApp';
import { Link } from '@tanstack/react-router';

export function DrawingPage() {
  return (
    <div className="drawing-page">
      <header className="drawing-page-header">
        <Link to="/">← Home</Link>
        <p className="muted">
          TinyBase drawing demo — drag shapes, resize with grips, undo/redo. Start
          sharing, then open the link on another device on the same Wi‑Fi (local dev) or
          anywhere once the WsServer is deployed.
        </p>
      </header>
      <div className="drawing-page-body">
        <DrawingApp />
      </div>
    </div>
  );
}

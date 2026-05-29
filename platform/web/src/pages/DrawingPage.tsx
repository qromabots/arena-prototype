import { DrawingApp } from '@/drawing/DrawingApp';
import { Link } from '@tanstack/react-router';

export function DrawingPage() {
  return (
    <div className="drawing-page">
      <header className="drawing-page-header">
        <Link to="/">← Home</Link>
        <p className="muted">
          TinyBase drawing demo — drag shapes, resize with grips, undo/redo. Click
          &ldquo;Start sharing&rdquo; to sync with other browsers. Best on desktop.
        </p>
      </header>
      <div className="drawing-page-body">
        <DrawingApp />
      </div>
    </div>
  );
}

import { type FormEvent, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Layout } from '@/components/Layout';
import { MAX_TEXT_LEN } from '@/serial/protocol';
import { useWebSerial } from '@/serial/useWebSerial';

export function LilyGoPage() {
  const [text, setText] = useState('Hello from the browser');
  const { supported, status, boardId, error, lastAck, connect, disconnect, sendText } =
    useWebSerial();

  async function handleConnect() {
    if (status === 'connected') {
      await disconnect();
      return;
    }
    await connect();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await sendText(text);
  }

  const connected = status === 'connected';

  return (
    <Layout title="LilyGO boards" wide>
      <p className="lead">Push text to a LilyGO dev board over WebSerial.</p>
      <p className="muted">
        Flash the{' '}
        <a href="https://github.com/qromabots/arena-prototype/tree/main/platform/firmware">
          LilyGO firmware
        </a>{' '}
        (T-Display S3 or T5 2.13"), connect USB, then use Chrome or Edge to open a serial port.
        Type below and the board re-renders live.
      </p>

      {!supported && (
        <p className="error">
          WebSerial is not available in this browser. Use Chrome or Edge on desktop.
        </p>
      )}

      <section className="card lilygo-connect">
        <h2>Connection</h2>
        <div className="lilygo-connect-row">
          <button
            type="button"
            className="lilygo-button primary"
            onClick={() => void handleConnect()}
            disabled={!supported || status === 'connecting'}
          >
            {status === 'connecting'
              ? 'Connecting…'
              : connected
                ? 'Disconnect'
                : 'Connect board'}
          </button>
          <span className="lilygo-status">
            Status: <strong>{status}</strong>
            {boardId ? (
              <>
                {' '}
                · board: <code className="mono">{boardId}</code>
              </>
            ) : null}
          </span>
        </div>
        {lastAck ? (
          <p className="muted lilygo-ack">
            Last response: <code className="mono">{lastAck}</code>
          </p>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <form className="card handle-form lilygo-form" onSubmit={(e) => void handleSubmit(e)}>
        <h2>Display text</h2>
        <label htmlFor="lilygo-text">Text to show on the board</label>
        <input
          id="lilygo-text"
          type="text"
          value={text}
          maxLength={MAX_TEXT_LEN}
          onChange={(event) => setText(event.target.value)}
          disabled={!connected}
          placeholder="Type a short message"
        />
        <p className="muted lilygo-counter">
          {text.length}/{MAX_TEXT_LEN} characters
        </p>
        <button type="submit" disabled={!connected}>
          Send to board
        </button>
      </form>

      <section className="card">
        <h2>Protocol</h2>
        <p className="muted">
          Boards announce themselves with <code className="mono">HELLO T-DISPLAY-S3</code> or{' '}
          <code className="mono">HELLO T5-2.13</code> at 115200 baud. The page sends{' '}
          <code className="mono">SET &lt;text&gt;</code> (newline-terminated); the board replies{' '}
          <code className="mono">OK</code> after re-rendering.
        </p>
      </section>

      <p>
        <Link to="/">Home</Link>
      </p>
    </Layout>
  );
}

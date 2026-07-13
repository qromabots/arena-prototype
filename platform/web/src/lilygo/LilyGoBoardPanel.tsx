import { type ChangeEvent, type FormEvent, useCallback } from 'react';
import { useCell, useSetCellCallback, useStore } from 'tinybase/ui-react';
import { MAX_TEXT_LEN } from '@/serial/protocol';
import { BOARD, BOARD_ROW, DEFAULT_BOARD_TEXT } from './constants';
import { useHostBoardSerial } from './useHostBoardSerial';
import { useLilyGoSync } from './LilyGoSyncApp';

export function LilyGoBoardPanel() {
  const { roomId } = useLilyGoSync();
  const store = useStore();
  const serial = useHostBoardSerial();

  const text =
    (useCell(BOARD, BOARD_ROW, 'text') as string | undefined) ?? DEFAULT_BOARD_TEXT;
  const hostConnected = Boolean(useCell(BOARD, BOARD_ROW, 'hostConnected'));
  const remoteBoardId = (useCell(BOARD, BOARD_ROW, 'boardId') as string | undefined) ?? '';
  const remoteLastAck = (useCell(BOARD, BOARD_ROW, 'lastAck') as string | undefined) ?? '';

  const setText = useSetCellCallback(
    BOARD,
    BOARD_ROW,
    'text',
    (event: ChangeEvent<HTMLInputElement>) => event.target.value.slice(0, MAX_TEXT_LEN),
    [],
  );

  const connected = serial.status === 'connected';
  const sharing = Boolean(roomId);

  async function handleConnect() {
    if (connected) {
      await serial.disconnect();
      return;
    }
    await serial.connect();
  }

  const pushNow = useCallback(async () => {
    if (!connected) return;
    await serial.sendText(text);
  }, [connected, serial, text]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim().slice(0, MAX_TEXT_LEN);
    store?.setCell(BOARD, BOARD_ROW, 'text', trimmed);
    store?.setCell(BOARD, BOARD_ROW, 'updatedAt', Date.now());
    if (connected) {
      void serial.sendText(trimmed);
    }
  }

  const displayBoardId = connected ? serial.boardId : remoteBoardId || null;
  const displayAck = connected ? serial.lastAck : remoteLastAck || null;

  return (
    <>
      <section className="card lilygo-connect">
        <h2>Board connection (host)</h2>
        <p className="muted">
          One browser tab connects over USB (Chrome/Edge). Guests edit text without
          WebSerial — the host pushes updates to the board automatically.
        </p>
        {!serial.supported && (
          <p className="error">
            WebSerial is not available in this browser. You can still edit shared text;
            open Chrome or Edge on the machine with the board to connect.
          </p>
        )}
        <div className="lilygo-connect-row">
          <button
            type="button"
            className="lilygo-button primary"
            onClick={() => void handleConnect()}
            disabled={!serial.supported || serial.status === 'connecting'}
          >
            {serial.status === 'connecting'
              ? 'Connecting…'
              : connected
                ? 'Disconnect'
                : 'Connect board'}
          </button>
          <span className="lilygo-status">
            Local: <strong>{serial.status}</strong>
            {sharing ? (
              <>
                {' '}
                · room host:{' '}
                <strong>{hostConnected ? 'board connected' : 'no board'}</strong>
              </>
            ) : null}
            {displayBoardId ? (
              <>
                {' '}
                · board: <code className="mono">{displayBoardId}</code>
              </>
            ) : null}
          </span>
        </div>
        {displayAck ? (
          <p className="muted lilygo-ack">
            Last response: <code className="mono">{displayAck}</code>
          </p>
        ) : null}
        {serial.error ? <p className="error">{serial.error}</p> : null}
      </section>

      <form className="card handle-form lilygo-form" onSubmit={handleSubmit}>
        <h2>Display text</h2>
        <label htmlFor="lilygo-text">Text to show on the board</label>
        <input
          id="lilygo-text"
          type="text"
          value={text}
          maxLength={MAX_TEXT_LEN}
          onChange={setText}
          placeholder="Type a short message"
        />
        <p className="muted lilygo-counter">
          {text.length}/{MAX_TEXT_LEN} characters
          {sharing
            ? ' · synced across browsers'
            : ' · local only until you start sharing'}
        </p>
        <div className="lilygo-form-actions">
          <button type="submit">
            {connected ? 'Send to board' : sharing ? 'Update shared text' : 'Save text'}
          </button>
          {connected ? (
            <button type="button" className="lilygo-button" onClick={() => void pushNow()}>
              Push now
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}

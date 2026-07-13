import { useEffect, useRef } from 'react';
import { useStore } from 'tinybase/ui-react';
import { useWebSerial } from '@/serial/useWebSerial';
import { BOARD, BOARD_ROW } from './constants';

const PUSH_DEBOUNCE_MS = 400;

/**
 * Host-side bridge: owns the WebSerial port and pushes synced board text to the
 * physical LilyGO when connected. Only the tab that holds the serial port publishes
 * host status into the TinyBase store.
 */
export function useHostBoardSerial() {
  const store = useStore();
  const serial = useWebSerial();
  const lastPushedRef = useRef<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const wasHostRef = useRef(false);

  // Publish host connection status only from the tab that owns the serial port.
  useEffect(() => {
    if (!store) return;

    const connected = serial.status === 'connected';
    if (connected) {
      wasHostRef.current = true;
      store.setPartialRow(BOARD, BOARD_ROW, {
        hostConnected: true,
        boardId: serial.boardId ?? '',
        lastAck: serial.lastAck ?? '',
        updatedAt: Date.now(),
      });
      return;
    }

    if (wasHostRef.current) {
      wasHostRef.current = false;
      store.setPartialRow(BOARD, BOARD_ROW, {
        hostConnected: false,
        boardId: '',
        lastAck: '',
        updatedAt: Date.now(),
      });
    }
  }, [store, serial.status, serial.boardId, serial.lastAck]);

  // If this tab was the host, clear status on unmount so guests do not see a stale host.
  useEffect(() => {
    return () => {
      if (!store || !wasHostRef.current) return;
      wasHostRef.current = false;
      store.setPartialRow(BOARD, BOARD_ROW, {
        hostConnected: false,
        boardId: '',
        lastAck: '',
        updatedAt: Date.now(),
      });
    };
  }, [store]);

  // When connected, push store text to the board (debounced for e-paper).
  useEffect(() => {
    if (!store || serial.status !== 'connected') return;

    const pushText = (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed === lastPushedRef.current) return;
      lastPushedRef.current = trimmed;
      void serial.sendText(trimmed);
    };

    const schedulePush = () => {
      const text = String(store.getCell(BOARD, BOARD_ROW, 'text') ?? '');
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        debounceRef.current = null;
        pushText(text);
      }, PUSH_DEBOUNCE_MS);
    };

    // Immediate push of current text when the port first connects.
    lastPushedRef.current = null;
    const initial = String(store.getCell(BOARD, BOARD_ROW, 'text') ?? '');
    pushText(initial);

    const listenerId = store.addCellListener(
      BOARD,
      BOARD_ROW,
      'text',
      () => schedulePush(),
    );

    return () => {
      store.delListener(listenerId);
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [store, serial.status, serial.sendText]);

  return serial;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  formatSetCommand,
  MAX_TEXT_LEN,
  parseBoardHello,
  SERIAL_BAUD,
} from './protocol';

export type WebSerialStatus = 'disconnected' | 'connecting' | 'connected';

function getSerialError(err: unknown): string {
  if (err instanceof DOMException && err.name === 'NotFoundError') {
    return 'No port selected.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Serial connection failed.';
}

function isWebSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

export function useWebSerial() {
  const [status, setStatus] = useState<WebSerialStatus>('disconnected');
  const [boardId, setBoardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAck, setLastAck] = useState<string | null>(null);
  const portRef = useRef<SerialPort | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const disconnect = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;

    const port = portRef.current;
    portRef.current = null;

    if (port) {
      try {
        await port.close();
      } catch {
        // Port may already be closed after abort.
      }
    }

    setStatus('disconnected');
    setBoardId(null);
    setLastAck(null);
  }, []);

  const readLoop = useCallback(async (port: SerialPort, signal: AbortSignal) => {
    const reader = port.readable?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex = buffer.indexOf('\n');
        while (newlineIndex >= 0) {
          const line = buffer.slice(0, newlineIndex).replace(/\r$/, '').trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('HELLO ')) {
            setBoardId(parseBoardHello(line));
          } else if (line === 'OK') {
            setLastAck('OK');
          } else if (line.startsWith('ERR ')) {
            setLastAck(line);
            setError(line.slice(4));
          }

          newlineIndex = buffer.indexOf('\n');
        }
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(getSerialError(err));
        setStatus('disconnected');
      }
    } finally {
      reader.releaseLock();
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isWebSerialSupported()) {
      setError('WebSerial is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    setError(null);
    setLastAck(null);
    setBoardId(null);
    setStatus('connecting');

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: SERIAL_BAUD });

      portRef.current = port;
      const abort = new AbortController();
      abortRef.current = abort;

      setStatus('connected');
      void readLoop(port, abort.signal);
    } catch (err) {
      setStatus('disconnected');
      setError(getSerialError(err));
    }
  }, [readLoop]);

  const sendText = useCallback(async (text: string) => {
    const port = portRef.current;
    if (!port?.writable) {
      setError('Not connected to a board.');
      return false;
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setError('Enter some text to send.');
      return false;
    }
    if (trimmed.length > MAX_TEXT_LEN) {
      setError(`Text must be ${MAX_TEXT_LEN} characters or fewer.`);
      return false;
    }

    setError(null);
    setLastAck(null);

    const writer = port.writable.getWriter();
    try {
      const encoded = new TextEncoder().encode(formatSetCommand(trimmed));
      await writer.write(encoded);
      return true;
    } catch (err) {
      setError(getSerialError(err));
      return false;
    } finally {
      writer.releaseLock();
    }
  }, []);

  useEffect(() => {
    return () => {
      void disconnect();
    };
  }, [disconnect]);

  return {
    supported: isWebSerialSupported(),
    status,
    boardId,
    error,
    lastAck,
    connect,
    disconnect,
    sendText,
  };
}

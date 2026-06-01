import { getUniqueId } from 'tinybase';
import { useCallback, useState } from 'react';

function readRoomId(): string {
  return new URLSearchParams(window.location.search).get('room') ?? '';
}

export function useGamepadRoomId() {
  const [roomId, setRoomId] = useState(readRoomId);

  const createRoom = useCallback(() => {
    const id = getUniqueId();
    const url = new URL(window.location.href);
    url.searchParams.set('room', id);
    window.history.replaceState(null, '', url);
    setRoomId(id);
  }, []);

  return [roomId, createRoom] as const;
}

export function gamepadShareUrl(roomId: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  const path = base === '/' ? '/' : `${base}/`;
  const url = new URL(path, window.location.origin);
  url.searchParams.set('room', roomId);
  return url.toString();
}

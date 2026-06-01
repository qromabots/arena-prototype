import { useRow, useRowIds } from 'tinybase/ui-react';
import type { PlayerId } from '@arena-prototype/shared-types';
import { useGamepad } from '@/hooks/useGamepad';
import { GamepadVisualPanel } from '@/components/gamepad/GamepadVisual';
import { CONTROLLERS } from './constants';
import { snapshotFromControllerRow } from './gamepadRows';

type RemotePanelProps = {
  playerId: string;
};

function RemoteGamepadPanel({ playerId }: RemotePanelProps) {
  const row = useRow(CONTROLLERS, playerId);
  const handle = String(row?.handle ?? playerId);
  const snapshot = snapshotFromControllerRow(row);

  return (
    <GamepadVisualPanel
      title={handle}
      subtitle={snapshot?.id}
      snapshot={snapshot}
      emptyHint={`${handle} has not connected a gamepad yet`}
    />
  );
}

type Props = {
  playerId: PlayerId;
};

export function SyncedGamepadPanels({ playerId }: Props) {
  const rowIds = useRowIds(CONTROLLERS) ?? [];
  const remoteIds = rowIds.filter((id) => id !== playerId);
  const localSnapshot = useGamepad(0);

  return (
    <div className="gamepad-panels">
      <GamepadVisualPanel
        title="You"
        subtitle={localSnapshot?.id}
        snapshot={localSnapshot}
        emptyHint="Plug in a USB or Bluetooth gamepad, then press any button so the browser can detect it."
      />
      {remoteIds.map((id) => (
        <RemoteGamepadPanel key={id} playerId={id} />
      ))}
      {remoteIds.length === 0 ? (
        <p className="muted gamepad-remote-hint">
          No other browsers in this room yet. Share the link to mirror their controller here.
        </p>
      ) : null}
    </div>
  );
}

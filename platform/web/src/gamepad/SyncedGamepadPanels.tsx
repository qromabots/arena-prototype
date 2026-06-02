import { useRow, useRowIds } from 'tinybase/ui-react';
import type { GamepadSnapshot } from '@/hooks/useGamepad';
import { useGamepad } from '@/hooks/useGamepad';
import { GamepadVisualPanel } from '@/components/gamepad/GamepadVisual';
import { CONTROLLERS } from './constants';
import { snapshotFromControllerRow } from './gamepadRows';
import { useGamepadSync } from './GamepadSyncApp';

type ParticipantPanelProps = {
  playerId: string;
  isSelf: boolean;
  localSnapshot: GamepadSnapshot | null;
};

function ParticipantGamepadPanel({ playerId, isSelf, localSnapshot }: ParticipantPanelProps) {
  const row = useRow(CONTROLLERS, playerId);
  const handle = String(row?.handle ?? playerId);
  const syncedSnapshot = snapshotFromControllerRow(row);
  const snapshot = isSelf && localSnapshot ? localSnapshot : syncedSnapshot;
  const title = isSelf ? 'You' : handle;
  const emptyHint = isSelf
    ? 'No controller connected. Plug in a USB or Bluetooth gamepad, then press any button so the browser can detect it.'
    : 'No controller connected';

  return (
    <GamepadVisualPanel
      title={title}
      subtitle={snapshot?.id}
      snapshot={snapshot}
      emptyHint={emptyHint}
    />
  );
}

type Props = {
  playerId: string;
};

export function SyncedGamepadPanels({ playerId }: Props) {
  const { roomId } = useGamepadSync();
  const rowIds = useRowIds(CONTROLLERS) ?? [];
  const localSnapshot = useGamepad(0);

  if (!roomId) {
    return (
      <div className="gamepad-panels">
        <GamepadVisualPanel
          title="You"
          subtitle={localSnapshot?.id}
          snapshot={localSnapshot}
          emptyHint="Plug in a USB or Bluetooth gamepad, then press any button so the browser can detect it."
        />
      </div>
    );
  }

  const orderedIds = [
    ...rowIds.filter((id) => id === playerId),
    ...rowIds.filter((id) => id !== playerId).sort(),
  ];

  return (
    <div className="gamepad-panels">
      {orderedIds.map((id) => (
        <ParticipantGamepadPanel
          key={id}
          playerId={id}
          isSelf={id === playerId}
          localSnapshot={localSnapshot}
        />
      ))}
      {orderedIds.length <= 1 ? (
        <p className="muted gamepad-remote-hint">
          No other browsers in this room yet. Share the link so others can join — they
          appear here even without a controller plugged in.
        </p>
      ) : null}
    </div>
  );
}

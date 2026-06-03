import { useGamepad } from '@/hooks/useGamepad';
import { GamepadVisualPanel } from '@/components/gamepad/GamepadVisual';

export function ArenaControllerPanel() {
  const snapshot = useGamepad(0);

  return (
    <div className="arena-controller">
      <GamepadVisualPanel
        title="Your controller"
        subtitle={snapshot?.id}
        snapshot={snapshot}
        emptyHint="Plug in a USB or Bluetooth gamepad, then press any button so the browser can detect it."
      />
    </div>
  );
}

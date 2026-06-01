import type { GamepadSnapshot } from '@/hooks/useGamepad';
import { useGamepad } from '@/hooks/useGamepad';

const STICK_TRAVEL = 14;

type StickProps = {
  cx: number;
  cy: number;
  x: number;
  y: number;
};

function Stick({ cx, cy, x, y }: StickProps) {
  return (
    <g className="gamepad-stick">
      <circle className="gamepad-stick-well" cx={cx} cy={cy} r={18} />
      <circle
        className="gamepad-stick-cap"
        cx={cx + x * STICK_TRAVEL}
        cy={cy + y * STICK_TRAVEL}
        r={10}
      />
    </g>
  );
}

type BtnProps = {
  cx: number;
  cy: number;
  r: number;
  label: string;
  pressed: boolean;
};

function FaceButton({ cx, cy, r, label, pressed }: BtnProps) {
  return (
    <g className={pressed ? 'gamepad-btn pressed' : 'gamepad-btn'}>
      <circle cx={cx} cy={cy} r={r} />
      <text x={cx} y={cy + 4} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function triggerValue(buttons: { value: number }[] | undefined, index: number): number {
  return buttons?.[index]?.value ?? 0;
}

function isPressed(buttons: { pressed: boolean }[] | undefined, index: number): boolean {
  return buttons?.[index]?.pressed ?? false;
}

type PanelProps = {
  title: string;
  subtitle?: string;
  snapshot: GamepadSnapshot | null;
  emptyHint: string;
};

export function GamepadVisualPanel({ title, subtitle, snapshot, emptyHint }: PanelProps) {
  const axes = snapshot?.axes ?? [];
  const buttons = snapshot?.buttons;

  const leftX = axes[0] ?? 0;
  const leftY = axes[1] ?? 0;
  const rightX = axes[2] ?? 0;
  const rightY = axes[3] ?? 0;

  const l2 = triggerValue(buttons, 6);
  const r2 = triggerValue(buttons, 7);

  return (
    <section className="card gamepad-panel" aria-label={`${title} game controller`}>
      <h2>{title}</h2>
      {!snapshot ? (
        <p className="muted gamepad-hint">{emptyHint}</p>
      ) : (
        <>
          {subtitle ? <p className="gamepad-id muted">{subtitle}</p> : null}
          <svg
            className="gamepad-visual"
            viewBox="0 0 360 200"
            role="img"
            aria-label={`${title} live gamepad input`}
          >
            <rect className="gamepad-body" x="20" y="50" width="320" height="120" rx="36" />

            <g className={isPressed(buttons, 4) ? 'gamepad-btn pressed' : 'gamepad-btn'}>
              <rect className="gamepad-bumper" x="52" y="58" width="44" height="16" rx="6" />
              <text x="74" y="70" textAnchor="middle">
                LB
              </text>
            </g>
            <g className={isPressed(buttons, 5) ? 'gamepad-btn pressed' : 'gamepad-btn'}>
              <rect className="gamepad-bumper" x="264" y="58" width="44" height="16" rx="6" />
              <text x="286" y="70" textAnchor="middle">
                RB
              </text>
            </g>

            <rect
              className="gamepad-trigger"
              x="58"
              y="78"
              width="36"
              height={6 + l2 * 28}
              rx="3"
            />
            <rect
              className="gamepad-trigger"
              x="266"
              y="78"
              width="36"
              height={6 + r2 * 28}
              rx="3"
            />

            <Stick cx={110} cy={120} x={leftX} y={leftY} />
            <Stick cx={250} cy={120} x={rightX} y={rightY} />

            <g className="gamepad-dpad" aria-label="D-pad">
              <rect
                className={isPressed(buttons, 12) ? 'pressed' : ''}
                x="48"
                y="112"
                width="12"
                height="12"
                rx="2"
              />
              <rect
                className={isPressed(buttons, 13) ? 'pressed' : ''}
                x="48"
                y="136"
                width="12"
                height="12"
                rx="2"
              />
              <rect
                className={isPressed(buttons, 14) ? 'pressed' : ''}
                x="36"
                y="124"
                width="12"
                height="12"
                rx="2"
              />
              <rect
                className={isPressed(buttons, 15) ? 'pressed' : ''}
                x="60"
                y="124"
                width="12"
                height="12"
                rx="2"
              />
            </g>

            <FaceButton cx={300} cy={108} r={11} label="Y" pressed={isPressed(buttons, 3)} />
            <FaceButton cx={318} cy={126} r={11} label="B" pressed={isPressed(buttons, 1)} />
            <FaceButton cx={282} cy={126} r={11} label="X" pressed={isPressed(buttons, 2)} />
            <FaceButton cx={300} cy={144} r={11} label="A" pressed={isPressed(buttons, 0)} />

            <g className={isPressed(buttons, 8) ? 'gamepad-btn pressed' : 'gamepad-btn'}>
              <rect className="gamepad-meta" x="148" y="92" width="28" height="12" rx="4" />
              <text x="162" y="101" textAnchor="middle">
                Sel
              </text>
            </g>
            <g className={isPressed(buttons, 9) ? 'gamepad-btn pressed' : 'gamepad-btn'}>
              <rect className="gamepad-meta" x="184" y="92" width="28" height="12" rx="4" />
              <text x="198" y="101" textAnchor="middle">
                Sta
              </text>
            </g>
          </svg>
        </>
      )}
    </section>
  );
}

/** Standalone local-only controller panel (no TinyBase sync). */
export function GamepadVisual() {
  const gamepad = useGamepad(0);

  return (
    <GamepadVisualPanel
      title="Controller"
      subtitle={gamepad?.id}
      snapshot={gamepad}
      emptyHint="Plug in a USB or Bluetooth gamepad, then press any button so the browser can detect it."
    />
  );
}

/** Fixed client → DO publish rate (~12.5 Hz). Matches server-side usage rollup cadence. */
export const SYNC_PUBLISH_INTERVAL_MS = 80;

/** Ignore sub-pixel robot motion when syncing. */
export const ROBOT_POSITION_EPSILON = 0.5;

/** Ignore tiny angle deltas when syncing (radians). */
export const ROBOT_ANGLE_EPSILON = 0.04;

/** Ignore analog stick noise below this threshold. */
export const GAMEPAD_AXIS_EPSILON = 0.02;

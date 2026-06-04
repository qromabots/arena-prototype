export function pickChangedFields<T extends Record<string, unknown>>(
  prev: Partial<T>,
  next: T,
  fields: (keyof T)[],
  epsilon = 0,
): Partial<T> | null {
  const partial: Partial<T> = {};
  let changed = false;

  for (const field of fields) {
    const previous = prev[field];
    const value = next[field];
    if (typeof value === 'number' && typeof previous === 'number') {
      if (Math.abs(value - previous) > epsilon) {
        partial[field] = value;
        changed = true;
      }
    } else if (previous !== value) {
      partial[field] = value;
      changed = true;
    }
  }

  return changed ? partial : null;
}

export function axesChanged(
  prevAxesJson: string,
  nextAxes: number[],
  epsilon: number,
): boolean {
  let prevAxes: number[];
  try {
    prevAxes = JSON.parse(prevAxesJson) as number[];
  } catch {
    return true;
  }
  if (prevAxes.length !== nextAxes.length) return true;
  for (let i = 0; i < nextAxes.length; i++) {
    const nextVal = nextAxes[i] ?? 0;
    if (Math.abs(nextVal - (prevAxes[i] ?? 0)) > epsilon) return true;
  }
  return false;
}

export function buttonsChanged(
  prevButtonsJson: string,
  nextButtons: { pressed: boolean; value: number }[],
): boolean {
  let prevButtons: { pressed: boolean; value: number }[];
  try {
    prevButtons = JSON.parse(prevButtonsJson) as {
      pressed: boolean;
      value: number;
    }[];
  } catch {
    return true;
  }
  if (prevButtons.length !== nextButtons.length) return true;
  for (let i = 0; i < nextButtons.length; i++) {
    const prev = prevButtons[i];
    const next = nextButtons[i];
    if (!prev || !next || prev.pressed !== next.pressed || prev.value !== next.value) {
      return true;
    }
  }
  return false;
}

/** Newline-delimited serial protocol shared by LilyGO firmware and the web client. */

export const SERIAL_BAUD = 115200;

/** Max characters the boards accept for a single SET command. */
export const MAX_TEXT_LEN = 80;

/** Board identification line sent on boot: `HELLO <board-id>`. */
export const HELLO_PREFIX = 'HELLO ';

/** Command to update on-screen text: `SET <text>`. */
export const SET_PREFIX = 'SET ';

export function formatSetCommand(text: string): string {
  return `${SET_PREFIX}${text}\n`;
}

export function parseBoardHello(line: string): string | null {
  if (!line.startsWith(HELLO_PREFIX)) return null;
  const id = line.slice(HELLO_PREFIX.length).trim();
  return id.length > 0 ? id : null;
}

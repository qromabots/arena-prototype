/// <reference types="vite/client" />

interface SerialPort {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}

interface Serial extends EventTarget {
  requestPort(): Promise<SerialPort>;
}

interface Navigator {
  readonly serial: Serial;
}

interface ImportMetaEnv {
  readonly VITE_DRAWING_WS_ORIGIN?: string;
  readonly VITE_DRAWING_WS_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

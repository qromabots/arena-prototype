/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DRAWING_WS_ORIGIN?: string;
  readonly VITE_DRAWING_WS_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

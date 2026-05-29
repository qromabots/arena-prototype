/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DRAWING_WS_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

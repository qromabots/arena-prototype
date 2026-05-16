import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { pathSegmentsToKeep, spa404Plugin } from './plugins/spa404.js';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const base = isGitHubPages ? '/arena-prototype/' : '/';

export default defineConfig({
  appType: 'spa',
  plugins: [react(), spa404Plugin(pathSegmentsToKeep(base))],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

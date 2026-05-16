import { copyFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/** Segments under the host to preserve (1 for project Pages at /repo-name/). */
export function pathSegmentsToKeep(base: string): number {
  const trimmed = base.replace(/^\/|\/$/g, '');
  if (!trimmed) return 0;
  return trimmed.split('/').filter(Boolean).length;
}

const RESTORE_SCRIPT = `
<script>
(function (l) {
  if (l.search.length > 1 && l.search[1] === '/') {
    var decoded = l.search
      .slice(1)
      .split('&')
      .map(function (s) {
        return s.replace(/~and~/g, '&');
      })
      .join('?');
    window.history.replaceState(
      null,
      null,
      l.pathname.slice(0, -1) + decoded + l.hash,
    );
  }
})(window.location);
</script>
`.trim();

function redirect404Html(pathSegmentsToKeep: number): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>arena-prototype</title>
    <script>
      var pathSegmentsToKeep = ${pathSegmentsToKeep};
      var l = window.location;
      l.replace(
        l.protocol +
          '//' +
          l.hostname +
          (l.port ? ':' + l.port : '') +
          l.pathname
            .split('/')
            .slice(0, 1 + pathSegmentsToKeep)
            .join('/') +
          '/?/' +
          l.pathname
            .slice(1)
            .split('/')
            .slice(pathSegmentsToKeep)
            .join('/')
            .replace(/&/g, '~and~') +
          (l.search
            ? '&' + l.search.slice(1).replace(/&/g, '~and~')
            : '') +
          l.hash,
      );
    </script>
  </head>
  <body></body>
</html>
`;
}

/**
 * GitHub Pages SPA fallback (https://github.com/rafgraph/spa-github-pages):
 * - 404.html redirects deep links to index.html with a path query
 * - index.html restores the real path before the client router boots
 * When pathSegmentsToKeep is 0, also copies index.html to 404.html for hosts
 * that serve the SPA shell on 404 without a redirect.
 */
export function spa404Plugin(pathSegmentsToKeep: number): Plugin {
  let outDir = 'dist';

  return {
    name: 'spa404',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      if (!html.includes('<head>')) return html;
      return html.replace('<head>', `<head>\n    ${RESTORE_SCRIPT}`);
    },
    closeBundle() {
      const indexPath = path.join(outDir, 'index.html');
      const notFoundPath = path.join(outDir, '404.html');

      if (pathSegmentsToKeep > 0) {
        writeFileSync(notFoundPath, redirect404Html(pathSegmentsToKeep), 'utf8');
      } else {
        copyFileSync(indexPath, notFoundPath);
      }
    },
  };
}

// Liten statisk server för dist/ med fallback till index.html (för appens sidor).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 8071);
const HOST = process.env.HOST ?? '127.0.0.1';
const BASE = (process.env.BASE ?? '').replace(/\/$/, '');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.css': 'text/css',
};

createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length) || '/';
  let file = join(ROOT, path);
  try {
    if (!file.startsWith(ROOT) || !(await stat(file)).isFile()) throw 0;
  } catch {
    file = join(ROOT, 'index.html');
    path = '/index.html';
  }
  const ext = extname(file);
  const immutable = path.startsWith('/_expo/') || path.startsWith('/assets/');
  res.writeHead(200, {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  res.end(await readFile(file));
}).listen(PORT, HOST, () => console.log(`MXEX på http://${HOST}:${PORT}`));

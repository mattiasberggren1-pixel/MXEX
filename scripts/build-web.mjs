// Bygger webbappen till dist/ och gör den installerbar (PWA) och offline-kapabel.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, cpSync } from 'node:fs';
import { join } from 'node:path';

// BASE = undersökväg, t.ex. "/mxex" på GitHub Pages (tom vid egen server).
const BASE = (process.env.BASE ?? '').replace(/\/$/, '');
if (BASE) {
  const app = JSON.parse(readFileSync('app.json', 'utf8'));
  app.expo.experiments = { ...app.expo.experiments, baseUrl: BASE };
  writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
}
execSync('npx expo export --platform web', { stdio: 'inherit' });
cpSync('public', 'dist', { recursive: true });

const manifest = {
  name: 'MXEX',
  short_name: 'MXEX',
  description: 'Fjädring, mappning och inställningar för crosscykeln',
  start_url: BASE + '/',
  scope: BASE + '/',
  display: 'standalone',
  background_color: '#0f1115',
  theme_color: '#1a1d24',
  lang: 'sv',
  icons: [
    { src: BASE + '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: BASE + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
};
writeFileSync('dist/manifest.webmanifest', JSON.stringify(manifest, null, 2));

// Alla byggfiler förcachas så appen funkar utan täckning ute på banan.
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) walk(p);
  else if (!p.endsWith('.map') && !p.endsWith('sw.js')) files.push(BASE + '/' + p.slice('dist/'.length));
});
walk('dist');
const version = Date.now().toString(36);
writeFileSync('dist/sw.js', `const CACHE = 'mxex-${version}';
const FILES = ${JSON.stringify(files.filter((f) => f !== BASE + '/index.html').concat(BASE + '/'))};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Sidor: nätet först (för uppdateringar), annars cachad app.
    e.respondWith(fetch(req).catch(() => caches.match('${BASE}/')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
`);

const head = `
    <link rel="manifest" href="${BASE}/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png" />
    <link rel="icon" type="image/png" href="${BASE}/favicon.png" />
    <meta name="theme-color" content="#1a1d24" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="MXEX" />
    <script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('${BASE}/sw.js'));</script>
  </head>`;
let html = readFileSync('dist/index.html', 'utf8').replace('</head>', head);
html = html.replace(/<html lang="[^"]*"/, '<html lang="sv"');
writeFileSync('dist/index.html', html);
writeFileSync('dist/404.html', html); // GitHub Pages: okända sökvägar → appen
console.log(`PWA klar: ${files.length} filer förcachade (version ${version}).`);

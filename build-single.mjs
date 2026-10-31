// Builds cloudflare-single/index.js — the whole app (pages, styles, scripts, engine, Durable Object) in ONE file.
//   node build-single.mjs
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const pub = 'public';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const files = {};
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else files['/' + path.relative(pub, p).split(path.sep).join('/')] = { type: types[path.extname(p)] || 'application/octet-stream', body: fs.readFileSync(p, 'utf8') };
  }
})(pub);
fs.mkdirSync('cloudflare-single', { recursive: true });
fs.writeFileSync('.single-assets.js', 'export default ' + JSON.stringify(files) + ';\n');

fs.writeFileSync('.single-entry.js', `
import FILES from './.single-assets.js';
export { GameRoom } from './worker.js';
const ROUTES = { '/': '/index.html', '/admin': '/admin.html', '/team': '/team.html', '/screen': '/screen.html', '/judge': '/judge.html' };
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ws' || url.pathname === '/health') return env.GAME.get(env.GAME.idFromName('main')).fetch(request);
    const p = ROUTES[url.pathname.replace(/\\/$/, '') || '/'] || url.pathname;
    const f = FILES[p];
    if (!f) return new Response('Not found', { status: 404 });
    return new Response(f.body, { headers: { 'content-type': f.type, 'cache-control': 'no-cache' } });
  },
};
`);

await build({
  entryPoints: ['.single-entry.js'], bundle: true, format: 'esm', platform: 'neutral', target: 'es2022',
  outfile: 'cloudflare-single/index.js', legalComments: 'none',
  banner: { js: '/* The Leadership Hackathon — complete app in one file for Cloudflare Workers.\n * Pages, styles, browser scripts, game engine and the GameRoom Durable Object are all inside.\n * Deploy together with wrangler.jsonc (see README.md). Admin password: env var ADMIN_PASSWORD (default admin123).\n */' },
});
fs.rmSync('.single-assets.js'); fs.rmSync('.single-entry.js');
console.log('Built cloudflare-single/index.js', (fs.statSync('cloudflare-single/index.js').size / 1024).toFixed(1) + ' KB');

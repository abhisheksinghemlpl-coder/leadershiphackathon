/*
 * The Leadership Hackathon — Node.js host (laptop / LAN / Render / Railway / any VPS).
 * For Cloudflare Workers, worker.js is the host instead. Both use src/engine.js.
 */
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const { createGame } = await import('./src/engine.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SAVE_FILE = process.env.SAVE_FILE || path.join(__dirname, 'game-state.json');

function lanUrls() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(`http://${i.address}:${PORT}`);
  return out;
}

let saved = null;
if (process.env.RESUME !== '0' && fs.existsSync(SAVE_FILE)) {
  try { saved = fs.readFileSync(SAVE_FILE, 'utf8'); console.log('Resuming saved game (paused). Use "npm run fresh" for a clean game.'); } catch {}
}

const clients = new Set();
const game = createGame({
  adminPassword: ADMIN_PASSWORD,
  saved,
  pauseOnLoad: true,
  lanUrls,
  hub: { clients: () => clients },
  persist: (json) => fs.writeFile(SAVE_FILE + '.tmp', json, (err) => { if (!err) fs.rename(SAVE_FILE + '.tmp', SAVE_FILE, () => {}); }),
});

const app = express();
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.get('/health', (_q, r) => r.json({ ok: true, host: 'node', stage: game.stage }));
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  const c = {
    data: {}, rooms: new Set(),
    sendRaw: (s) => { if (ws.readyState === 1) ws.send(s); },
    close: () => { try { ws.close(4000, 'kicked'); } catch {} },
  };
  clients.add(c);
  game.connect(c);
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.e === 'ping') return;
    game.message(c, m.e, m.d, m.id ? (res) => c.sendRaw(JSON.stringify({ ack: m.id, d: res })) : null);
  });
  ws.on('close', () => { clients.delete(c); game.disconnect(c); });
  ws.on('error', () => {});
});

setInterval(() => game.tick(), 1000);
process.on('SIGINT', () => { game.save(true); setTimeout(() => process.exit(0), 300); });

server.listen(PORT, () => {
  console.log('\n  ▲▼  THE LEADERSHIP HACKATHON is live\n');
  console.log(`  This computer:   http://localhost:${PORT}`);
  for (const u of lanUrls()) console.log(`  On the network:  ${u}   ← students open this`);
  console.log(`\n  Admin console:   http://localhost:${PORT}/admin   (password: ${ADMIN_PASSWORD === 'admin123' ? 'admin123 — change with ADMIN_PASSWORD' : '••••••'})`);
  console.log(`  Big screen:      http://localhost:${PORT}/screen\n  Judges:          http://localhost:${PORT}/judge\n`);
});

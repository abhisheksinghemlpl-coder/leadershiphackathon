/*
 * The Leadership Hackathon — Cloudflare Workers host.
 *
 * Static pages (public/) are served by Workers Static Assets.
 * The live game runs inside ONE Durable Object ("GameRoom"), which keeps all game state in memory,
 * ticks the market every second, talks to every browser over WebSockets, and saves to Durable Object storage.
 */
import { createGame } from './src/engine.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ws' || url.pathname === '/health') {
      const id = env.GAME.idFromName('main');
      return env.GAME.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};

export class GameRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.clients = new Set();
    this.game = null;
    this.timer = null;
    this.ready = this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get('state');
      this.game = createGame({
        adminPassword: env.ADMIN_PASSWORD || 'admin123',
        saved: saved || null,
        pauseOnLoad: false,
        hub: { clients: () => this.clients },
        persist: (json) => { this.ctx.storage.put('state', json).catch((e) => console.error('storage put failed', e)); },
      });
    });
  }

  ensureTicking() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.game.tick();
      // Nobody connected and nothing running → stop the clock so the object can sleep.
      if (this.clients.size === 0 && !['r1-prep','r1-pitch','r2-build','r3-live'].includes(this.game.stage)) { clearInterval(this.timer); this.timer = null; this.game.save(true); }
    }, 1000);
  }

  async fetch(request) {
    await this.ready;
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({ ok: true, host: 'cloudflare', stage: this.game.stage, clients: this.clients.size });
    }
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });

    const pair = new WebSocketPair();
    const [browser, server] = Object.values(pair);
    server.accept();
    const c = {
      data: {}, rooms: new Set(),
      sendRaw: (s) => { try { server.send(s); } catch {} },
      close: () => { try { server.close(4000, 'kicked'); } catch {} this.clients.delete(c); },
    };
    this.clients.add(c);
    this.game.connect(c);
    server.addEventListener('message', (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.e === 'ping') return;
      this.game.message(c, m.e, m.d, m.id ? (res) => c.sendRaw(JSON.stringify({ ack: m.id, d: res })) : null);
    });
    const gone = () => { this.clients.delete(c); this.game.disconnect(c); };
    server.addEventListener('close', gone);
    server.addEventListener('error', gone);
    this.ensureTicking();
    return new Response(null, { status: 101, webSocket: browser });
  }
}

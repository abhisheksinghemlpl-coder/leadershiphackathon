/* The Leadership Hackathon — complete app in one file for Cloudflare Workers.
 * Pages, styles, browser scripts, game engine and the GameRoom Durable Object are all inside.
 * Deploy together with wrangler.jsonc (see README.md). Admin password: env var ADMIN_PASSWORD (default admin123).
 */

// .single-assets.js
var single_assets_default = { "/admin.html": { "type": "text/html; charset=utf-8", "body": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Organiser \u2014 The Leadership Hackathon</title>
<link rel="stylesheet" href="/css/style.css">
<style>
  .wrap { max-width: 1440px; margin: 0 auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
  header { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r); flex-wrap: wrap; }
  header .grow { flex: 1; }
  .tabs { display: flex; gap: 4px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r); padding: 4px; overflow-x: auto; }
  .tabs button { background: transparent; border: 0; color: var(--muted); font-weight: 700; padding: 9px 16px; border-radius: 10px; cursor: pointer; white-space: nowrap; font-family: var(--sans); font-size: 14px; }
  .tabs button.on { background: var(--panel2); color: var(--text); box-shadow: inset 0 -2px 0 var(--gold); }
  .g2 { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 12px; align-items: start; }
  @media (max-width: 1000px) { .g2 { grid-template-columns: 1fr; } }
  .stage-title { font-family: var(--display); font-size: 28px; font-weight: 800; margin: 4px 0; }
  .bigtimer { font-family: var(--mono); font-size: 62px; font-weight: 700; line-height: 1; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .feed div { padding: 7px 0; border-bottom: 1px solid rgba(35,44,94,.6); font-size: 13.5px; }
  .feed .good { color: var(--teal); } .feed .bad { color: #ff8fa3; } .feed .cmd { color: var(--gold); }
  .codes { font-family: var(--mono); font-size: 18px; font-weight: 700; letter-spacing: .15em; color: var(--gold); }
  .online { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--dim); margin-right: 6px; } .online.on { background: var(--teal); box-shadow: 0 0 8px var(--teal); }
  .formgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
  .chk { display: flex; gap: 10px; align-items: center; font-size: 14px; } .chk input { width: 18px; height: 18px; }
  .note { font-size: 12.5px; color: var(--muted); line-height: 1.5; }
  .cmdgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }
  #login { display: grid; place-items: center; min-height: 100vh; }
  #login form { width: min(380px, 92vw); background: var(--panel); border: 1px solid var(--line2); border-radius: 18px; padding: 28px; display: flex; flex-direction: column; gap: 14px; }
  td input.mini { width: 70px; padding: 5px 8px; font-size: 13px; }
  td select.mini { width: 210px; padding: 5px 8px; font-size: 13px; }
  .pbar { height: 6px; background: #080c22; border-radius: 6px; overflow: hidden; width: 90px; display: inline-block; vertical-align: middle; } .pbar > div { height: 100%; background: linear-gradient(90deg, var(--violet), var(--teal)); }
</style>
</head>
<body>
<div id="login" class="hidden"><form id="lf"><div class="brand"><span class="logo">L</span>ORGANISER CONSOLE</div><label class="f">Admin password<input id="pw" type="password" autofocus></label><button class="btn gold lg">Log in</button><div class="note">Default password: <span class="mono">admin123</span> \u2014 change it with the ADMIN_PASSWORD setting.</div></form></div>
<div class="wrap hidden" id="app">
  <header><div class="brand"><span class="logo">L</span><span id="ev">ORGANISER</span></div><span class="pill" id="stagePill">\u2014</span><div class="grow"></div>
    <a class="btn violet" href="/screen" target="_blank" rel="noopener">\u26F6 Big screen</a><a class="btn" href="/judge" target="_blank" rel="noopener" id="judgeLink">\u{1F9D1}\u200D\u2696\uFE0F Score as organiser</a><button class="btn ghost sm" id="logout">Log out</button></header>
  <nav class="tabs" id="tabs"><button class="on" data-t="run">\u25B6 Run event</button><button data-t="teams">\u{1F465} Teams & judges</button><button data-t="r1">\u2460 Case Pitch</button><button data-t="r2">\u2461 Tower</button><button data-t="r3">\u2462 Escape Room</button><button data-t="scores">\u{1F3C6} Scores</button><button data-t="settings">\u2699 Settings</button></nav>

  <section data-p="run" class="g2">
    <div class="panel"><div class="panel-b" style="display:flex;flex-direction:column;gap:16px">
      <div class="stepper" id="stepper"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap"><div><div class="muted" style="font-weight:800;font-size:12px;letter-spacing:.1em">CURRENT STAGE</div><div class="stage-title" id="stTitle">\u2014</div><div class="muted" id="stSub"></div></div><div class="bigtimer" id="bigT">--:--</div></div>
      <div class="row"><button class="btn gold lg" id="nextBtn">Next \u25B6</button><button class="btn" id="pauseBtn">\u23F8 Pause</button><button class="btn teal" id="resumeBtn">\u25B6 Resume</button><button class="btn" id="extBtn">+1 min</button><button class="btn red" id="endBtn">\u25A0 End timer now</button></div>
      <div id="stageCtl"></div>
      <div class="row"><label class="chk"><input type="checkbox" id="boardChk"> Show overall leaderboard on the big screen</label></div>
      <div class="row"><input id="annTxt" placeholder="Announcement to all screens (e.g. 5 minutes left!)" style="flex:1;min-width:220px"><button class="btn" id="annBtn">\u{1F4E2} Announce</button></div>
      <div class="note" id="joinNote"></div>
    </div></div>
    <div class="panel"><div class="panel-h">Live feed</div><div class="panel-b feed" id="feed" style="max-height:560px"><div class="muted">Events appear here.</div></div></div>
  </section>

  <section data-p="teams" class="hidden g2">
    <div class="panel"><div class="panel-h">Teams <span class="muted" id="tCount" style="text-transform:none;letter-spacing:0"></span></div><div class="panel-b">
      <div class="row" style="align-items:flex-end;margin-bottom:12px"><label class="f" style="flex:1;min-width:240px">Add teams \u2014 one per line or comma separated<textarea id="tNames" rows="3" placeholder="Team Phoenix&#10;Team Orion&#10;Team Titan"></textarea></label><button class="btn gold" id="tAdd">+ Add</button><button class="btn" id="tCopy">Copy codes</button></div>
      <table><thead><tr><th>Team</th><th>Code</th><th class="c">Devices</th><th></th></tr></thead><tbody id="tT"></tbody></table></div></div>
    <div class="panel"><div class="panel-h">Judges (Round 1 scoring)</div><div class="panel-b">
      <div class="row" style="margin-bottom:12px"><input id="jName" placeholder="Judge name"><button class="btn gold" id="jAdd">+ Add judge</button></div>
      <table><thead><tr><th>Judge</th><th>Code</th><th></th></tr></thead><tbody id="jT"></tbody></table>
      <div class="note" style="margin-top:12px">Judges open the same link as teams and enter their code (starts with J). They see each team's case, sheet and a 5-criteria rubric. The organiser can also score using \u201CScore as organiser\u201D.</div></div></div>
  </section>

  <section data-p="r1" class="hidden" style="display:flex;flex-direction:column;gap:12px">
    <div class="g2"><div class="panel"><div class="panel-h">Pitch control</div><div class="panel-b" id="pitchCtl"></div></div>
      <div class="panel"><div class="panel-h">Cases</div><div class="panel-b"><div class="row"><button class="btn" id="redrawAll">\u{1F3B2} Redraw all cases</button><button class="btn" id="shuffleOrd">\u{1F500} Shuffle pitch order</button></div><div class="note" style="margin-top:10px">Case pool and timings are in Settings. Change one team's case from the table below (resets their sheet).</div></div></div></div>
    <div class="panel"><div class="panel-h">Teams \u2014 Round 1</div><div class="panel-b" style="padding:0;overflow:auto"><table><thead><tr><th>#</th><th>Team</th><th>Case</th><th>Sheet</th><th class="r">Pitch</th><th class="r">Judges</th><th class="r">Peer \u2605</th><th class="r">Score /50</th><th></th></tr></thead><tbody id="r1T"></tbody></table></div></div>
  </section>

  <section data-p="r2" class="hidden" style="display:flex;flex-direction:column;gap:12px">
    <div class="g2"><div class="panel"><div class="panel-h">Crisis commands <span id="cmdNext" style="text-transform:none;letter-spacing:0"></span></div><div class="panel-b">
        <div id="cmdActive" style="margin-bottom:12px"></div><div class="cmdgrid" id="cmdBtns"></div>
        <div class="row" style="margin-top:12px"><button class="btn red" id="tremorBtn">\u{1F30B} Trigger tremor</button><label class="chk"><input type="checkbox" id="autoCmd" checked> Auto-issue commands</label></div>
        <div class="note" style="margin-top:8px">Commands fire automatically at random 60\u2013120 s intervals during the build (set in Settings). Issue one manually anytime.</div></div></div>
      <div class="panel"><div class="panel-h">Command log</div><div class="panel-b" id="cmdLog" style="max-height:330px"></div></div></div>
    <div class="panel"><div class="panel-h">Round 2 scores (live) <span class="muted" style="text-transform:none;letter-spacing:0">Height \xF7 tallest \xD7 20 \xD7 (cmd \xF7 15) + cmd /15 + stability /15</span></div><div class="panel-b" style="padding:0;overflow:auto"><table><thead><tr><th>Team</th><th class="r">Height</th><th class="r">Height /20</th><th class="r">Commands /15</th><th class="r">Real height</th><th class="r">Stability (auto)</th><th>Moderator stability</th><th class="r">Total /50</th></tr></thead><tbody id="r2T"></tbody></table></div></div>
  </section>

  <section data-p="r3" class="hidden"><div class="panel"><div class="panel-h">Escape room progress</div><div class="panel-b" style="padding:0;overflow:auto"><table><thead><tr><th>Team</th><th>Locks</th><th class="r">Wrong</th><th class="r">Hints</th><th class="r">Cooldown</th><th>Status</th><th class="r">Points</th><th></th></tr></thead><tbody id="r3T"></tbody></table></div></div>
    <div class="note" style="margin-top:10px">Answer key: see README (kept off the network so nobody can sniff it).</div></section>

  <section data-p="scores" class="hidden"><div class="panel"><div class="panel-h">Overall leaderboard</div><div class="panel-b" style="padding:0"><table><thead><tr><th>#</th><th>Team</th><th class="r">R1 Case Pitch /50</th><th class="r">R2 Tower /50</th><th class="r">R3 Escape /50</th><th class="r">Total /150</th></tr></thead><tbody id="scT"></tbody></table></div></div></section>

  <section data-p="settings" class="hidden"><div class="panel"><div class="panel-h">Settings</div><div class="panel-b" style="display:flex;flex-direction:column;gap:18px">
    <div class="formgrid">
      <label class="f">Event name<input data-s="eventName"></label>
      <label class="f">R1 case pool<select data-s="r1CasePool"><option value="all">All 50 caselets</option><option value="school">School set (1\u201320)</option><option value="advanced">Advanced set (21\u201350)</option></select></label>
      <label class="f">R1 prep time (min)<input type="number" data-s="r1PrepMin"></label>
      <label class="f">R1 pitch length (sec)<input type="number" data-s="r1PitchSec"></label>
      <label class="f">R1 grace before penalty (sec)<input type="number" data-s="r1GraceSec"></label>
      <label class="f">R1 overtime penalty (points)<input type="number" data-s="r1OvertimePenalty"></label>
      <label class="f">R2 build time (min)<input type="number" data-s="r2BuildMin"></label>
      <label class="f">R2 budget (coins)<input type="number" data-s="r2Budget"></label>
      <label class="f">R2 command gap min (sec)<input type="number" data-s="r2CmdMinSec"></label>
      <label class="f">R2 command gap max (sec)<input type="number" data-s="r2CmdMaxSec"></label>
      <label class="f">R3 time (min)<input type="number" data-s="r3Min"></label>
      <label class="f">R3 wrong-answer cooldown (sec)<input type="number" data-s="r3CooldownSec"></label>
      <label class="f">R3 hint unlocks after (min on a lock)<input type="number" data-s="r3HintAfterMin"></label>
      <label class="f">R3 points for 1st, 2nd, 3rd\u2026<input data-s="r3Points" placeholder="50,40,30"></label>
      <label class="f">R3 points for other finishers<input type="number" data-s="r3OtherPoints"></label>
    </div>
    <label class="chk"><input type="checkbox" data-s="r2FinalTremor"> Run the final stability test (tremor) when Round 2 ends</label>
    <label class="chk"><input type="checkbox" data-s="showScoresToTeams"> Show scores and leaderboard on team devices</label>
    <div class="row"><button class="btn gold" id="saveSet">Save settings</button></div>
    <div class="panel" style="background:#0a0e26"><div class="panel-b"><b>Danger zone</b><div class="row" style="margin-top:10px"><button class="btn sm" data-reset="1">Reset Round 1</button><button class="btn sm" data-reset="2">Reset Round 2</button><button class="btn sm" data-reset="3">Reset Round 3</button><button class="btn sm red" id="resetKeep">Reset event (keep teams)</button><button class="btn sm red" id="wipe">Wipe everything</button></div></div></div>
  </div></div></section>
</div>
<div id="toasts"></div>
<script src="/js/rt.js"></script>
<script src="/js/common.js"></script>
<script src="/js/admin.js"></script>
</body>
</html>
` }, "/css/style.css": { "type": "text/css; charset=utf-8", "body": "@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');\n:root {\n  --bg: #070a1a; --bg2: #0b1027; --panel: #10163a; --panel2: #161e4a; --line: #232c5e; --line2: #2f3a78;\n  --text: #eef1ff; --muted: #9aa3d0; --dim: #616a9e;\n  --gold: #ffc947; --gold-bg: rgba(255,201,71,.12); --violet: #8b6cff; --violet-bg: rgba(139,108,255,.14);\n  --teal: #2ad1b0; --teal-bg: rgba(42,209,176,.12); --red: #ff4d6d; --red-bg: rgba(255,77,109,.12); --blue: #4aa8ff;\n  --sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; --display: 'Sora', var(--sans);\n  --mono: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace; --r: 14px;\n}\n* { box-sizing: border-box; }\nhtml, body { margin: 0; min-height: 100%; }\nbody { background: radial-gradient(1000px 600px at 85% -10%, rgba(139,108,255,.18), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(42,209,176,.10), transparent 60%), var(--bg); color: var(--text); font-family: var(--sans); font-size: 15px; -webkit-font-smoothing: antialiased; }\nh1, h2, h3, .display { font-family: var(--display); letter-spacing: -.01em; }\n.mono, .num { font-family: var(--mono); font-variant-numeric: tabular-nums; }\n.muted { color: var(--muted); } .dim { color: var(--dim); } .gold { color: var(--gold); } .teal { color: var(--teal); } .red { color: var(--red); } .violet { color: var(--violet); }\n.hidden { display: none !important; }\na { color: var(--blue); } a.btn { text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }\n.panel { background: linear-gradient(180deg, var(--panel), var(--bg2)); border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; display: flex; flex-direction: column; min-height: 0; }\n.panel-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 16px; border-bottom: 1px solid var(--line); font-weight: 800; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }\n.panel-b { padding: 14px 16px; overflow: auto; min-height: 0; }\n.pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; background: var(--panel2); border: 1px solid var(--line2); color: var(--muted); white-space: nowrap; }\n.pill.live { color: var(--teal); border-color: rgba(42,209,176,.45); background: var(--teal-bg); }\n.pill.live::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: pulse 1.4s infinite; }\n.pill.warn { color: var(--gold); border-color: rgba(255,201,71,.45); background: var(--gold-bg); }\n.pill.bad { color: var(--red); border-color: rgba(255,77,109,.45); background: var(--red-bg); }\n@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(42,209,176,.7); } 70% { box-shadow: 0 0 0 8px rgba(42,209,176,0); } 100% { box-shadow: 0 0 0 0 rgba(42,209,176,0); } }\n.btn { appearance: none; border: 1px solid var(--line2); background: var(--panel2); color: var(--text); padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: var(--sans); transition: transform .05s, background .15s, border-color .15s, opacity .15s; }\n.btn:hover { border-color: #4a57a8; background: #1c2659; } .btn:active { transform: translateY(1px); } .btn:disabled { opacity: .4; cursor: not-allowed; }\n.btn.sm { padding: 6px 11px; font-size: 12.5px; border-radius: 8px; } .btn.lg { padding: 14px 22px; font-size: 16px; } .btn.ghost { background: transparent; }\n.btn.gold { background: linear-gradient(180deg, #ffd56b, #f0b323); color: #1b1300; border-color: #ffd56b; } .btn.gold:hover { filter: brightness(1.06); }\n.btn.violet { background: linear-gradient(180deg, #9a80ff, #7656f0); border-color: #a690ff; }\n.btn.teal { background: linear-gradient(180deg, #33dcba, #17ad8f); border-color: #4ae6c6; color: #00241c; }\n.btn.red { background: linear-gradient(180deg, #ff6680, #e2304f); border-color: #ff7a90; }\ninput, select, textarea { font-family: inherit; font-size: 15px; color: var(--text); background: #080c22; border: 1px solid var(--line2); border-radius: 10px; padding: 10px 12px; outline: none; width: 100%; }\ntextarea { resize: vertical; min-height: 64px; line-height: 1.45; }\ninput:focus, select:focus, textarea:focus { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(139,108,255,.2); }\nlabel.f { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--muted); font-weight: 700; }\ntable { width: 100%; border-collapse: collapse; }\nth { text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: var(--dim); padding: 9px 10px; border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--panel); z-index: 1; }\ntd { padding: 9px 10px; border-bottom: 1px solid rgba(35,44,94,.7); vertical-align: middle; }\ntd.r, th.r { text-align: right; } td.c, th.c { text-align: center; }\n.tag { display: inline-block; font-size: 10.5px; font-weight: 800; letter-spacing: .07em; padding: 3px 7px; border-radius: 5px; background: var(--panel2); color: var(--muted); border: 1px solid var(--line2); }\n.tag.ok { color: var(--teal); background: var(--teal-bg); border-color: rgba(42,209,176,.4); }\n.tag.bad { color: var(--red); background: var(--red-bg); border-color: rgba(255,77,109,.4); }\n.tag.gold { color: var(--gold); background: var(--gold-bg); border-color: rgba(255,201,71,.4); }\n.logo { display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: conic-gradient(from 200deg, var(--gold), var(--violet), var(--teal), var(--gold)); color: #0b0f25; font-weight: 900; font-size: 15px; font-family: var(--display); box-shadow: 0 6px 22px rgba(139,108,255,.35); }\n.brand { display: flex; align-items: center; gap: 10px; font-family: var(--display); font-weight: 800; letter-spacing: .01em; }\n.stepper { display: flex; gap: 6px; flex-wrap: wrap; }\n.stepper .s { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--line); font-size: 12px; font-weight: 700; color: var(--dim); background: #0a0e26; cursor: pointer; }\n.stepper .s.done { color: var(--muted); border-color: var(--line2); }\n.stepper .s.now { color: #1b1300; background: var(--gold); border-color: var(--gold); }\n#toasts { position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 200; max-width: min(440px, calc(100vw - 32px)); }\n.toast { padding: 12px 15px; border-radius: 12px; background: #141b45; border: 1px solid var(--line2); box-shadow: 0 12px 34px rgba(0,0,0,.5); font-weight: 600; animation: tin .25s ease-out; }\n.toast.ok { border-color: rgba(42,209,176,.55); } .toast.error { border-color: rgba(255,77,109,.6); background: #2a1023; } .toast.warn { border-color: rgba(255,201,71,.5); }\n@keyframes tin { from { transform: translateY(10px); opacity: 0; } }\n.modal-bg { position: fixed; inset: 0; background: rgba(3,5,15,.72); backdrop-filter: blur(5px); display: grid; place-items: center; z-index: 150; padding: 16px; }\n.modal { background: var(--panel); border: 1px solid var(--line2); border-radius: 18px; padding: 24px; width: min(460px, 100%); box-shadow: 0 30px 80px rgba(0,0,0,.6); }\n.modal h3 { margin: 0 0 8px; } .modal .row { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }\n.notice-big { position: fixed; left: 50%; top: 16%; transform: translateX(-50%); z-index: 160; padding: 22px 34px; border-radius: 18px; font-family: var(--display); font-size: clamp(18px, 3vw, 34px); font-weight: 800; text-align: center; background: #12183f; border: 2px solid var(--gold); color: var(--gold); box-shadow: 0 0 90px rgba(255,201,71,.25); animation: nb 4.2s ease forwards; pointer-events: none; max-width: 92vw; }\n.notice-big.error { border-color: var(--red); color: #ff95a8; box-shadow: 0 0 90px rgba(255,77,109,.3); }\n.notice-big.ok { border-color: var(--teal); color: var(--teal); box-shadow: 0 0 90px rgba(42,209,176,.3); }\n@keyframes nb { 0% { opacity: 0; transform: translate(-50%, -20px) scale(.95); } 8% { opacity: 1; transform: translate(-50%, 0) scale(1); } 85% { opacity: 1; } 100% { opacity: 0; } }\n.shake { animation: shake .9s cubic-bezier(.36,.07,.19,.97) both; }\n@keyframes shake { 10%, 90% { transform: translate3d(-2px,0,0) rotate(-.4deg); } 20%, 80% { transform: translate3d(4px,0,0) rotate(.5deg); } 30%, 50%, 70% { transform: translate3d(-7px,0,0) rotate(-.8deg); } 40%, 60% { transform: translate3d(7px,0,0) rotate(.8deg); } }\n.stars { display: inline-flex; gap: 4px; } .stars button { background: none; border: 0; font-size: 30px; cursor: pointer; color: #3a4380; padding: 0 2px; transition: transform .1s; } .stars button.on { color: var(--gold); } .stars button:hover { transform: scale(1.15); }\n.empty { color: var(--dim); text-align: center; padding: 26px 10px; }\n::-webkit-scrollbar { width: 9px; height: 9px; } ::-webkit-scrollbar-thumb { background: #262f66; border-radius: 9px; } ::-webkit-scrollbar-track { background: transparent; }\n" }, "/index.html": { "type": "text/html; charset=utf-8", "body": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Leadership Hackathon \u2014 Join</title>
<link rel="stylesheet" href="/css/style.css">
<style>
  body { display: grid; place-items: center; min-height: 100vh; padding: 20px; }
  .card { width: min(460px, 100%); background: rgba(16,22,58,.9); border: 1px solid var(--line2); border-radius: 22px; padding: 34px 30px; box-shadow: 0 40px 100px rgba(0,0,0,.55); backdrop-filter: blur(8px); position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; inset: -40% -40% auto auto; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,201,71,.25), transparent 65%); }
  h1 { margin: 20px 0 6px; font-size: 32px; line-height: 1.08; }
  h1 em { font-style: normal; background: linear-gradient(90deg, var(--gold), var(--violet)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .rounds { display: flex; gap: 8px; margin: 16px 0 24px; flex-wrap: wrap; }
  .rounds span { font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 999px; background: var(--panel2); border: 1px solid var(--line2); color: var(--muted); }
  #code { font-family: var(--mono); font-size: 30px; letter-spacing: .4em; text-align: center; text-transform: uppercase; padding: 14px; }
  .btn.lg { width: 100%; margin-top: 14px; }
  .err { color: var(--red); min-height: 22px; margin-top: 10px; font-weight: 600; }
  .foot { margin-top: 18px; display: flex; justify-content: space-between; font-size: 12.5px; color: var(--dim); }
</style>
</head>
<body>
<form class="card" id="f" autocomplete="off">
  <div class="brand"><span class="logo">L</span><span id="ev">THE LEADERSHIP HACKATHON</span></div>
  <h1>Lead. Build. <em>Escape.</em></h1>
  <div class="rounds"><span>\u2460 Case Pitch</span><span>\u2461 Tower Under Pressure</span><span>\u2462 Escape Room</span></div>
  <label class="f">Your team code (or judge code)<input id="code" maxlength="5" placeholder="\u2022\u2022\u2022\u2022\u2022" autofocus autocapitalize="characters" spellcheck="false"></label>
  <button class="btn gold lg" id="go">Enter \u2192</button>
  <div class="err" id="err"></div>
  <div class="foot"><span>One code per team \xB7 join from any device</span><a href="/admin">Organiser</a></div>
</form>
<script src="/js/rt.js"></script>
<script src="/js/common.js"></script>
<script>
  const sock = io();
  const tt = store.get('lh_team'), jt = store.get('lh_judge');
  if (tt) sock.emit('auth', { role: 'team', token: tt }, (r) => { if (r.ok) location.href = '/team'; else store.del('lh_team'); });
  else if (jt) sock.emit('auth', { role: 'judge', token: jt }, (r) => { if (r.ok) location.href = '/judge'; else store.del('lh_judge'); });
  $('#f').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = $('#code').value.trim();
    if (code.length < 5) { $('#err').textContent = 'Codes are 5 characters long.'; return; }
    $('#go').disabled = true;
    sock.emit('join', { code }, (r) => {
      $('#go').disabled = false;
      if (!r.ok) { $('#err').textContent = r.error; return; }
      if (r.role === 'judge') { store.set('lh_judge', r.token); location.href = '/judge'; }
      else { store.set('lh_team', r.token); location.href = '/team'; }
    });
  });
</script>
</body>
</html>
` }, "/js/admin.js": { "type": "text/javascript; charset=utf-8", "body": `/* Organiser console */
const sock = io();
let tok = store.get('lh_admin');
let A = null, pub = null, board = [], feedList = [], setLoaded = false;
const NEXT_LABEL = { lobby: 'Start Round 1: draw cases', 'r1-draw': 'Start prep timer', 'r1-prep': 'Go to pitches', 'r1-pitch': 'Finish Round 1', 'r1-done': 'Set up Round 2', 'r2-ready': 'Start building!', 'r2-build': 'Stop building & score', 'r2-done': 'Set up Round 3', 'r3-ready': 'Open the escape room!', 'r3-live': 'Close the escape room', 'r3-done': 'Show final results', final: '\u2014' };
const SUB = {
  lobby: 'Add teams (and judges), open the big screen, share the join link.', 'r1-draw': 'Every team has drawn a caselet. Teams can already start their sheet.',
  'r1-prep': 'Teams fill their Case Solving Sheet. The sheet locks automatically at the end.', 'r1-pitch': 'Select a team, start their 60-second timer, judges score.',
  'r1-done': 'Round 1 complete.', 'r2-ready': 'Teams read the rules and materials. Building has not started.', 'r2-build': 'Building live \u2014 crisis commands fire automatically.',
  'r2-done': 'Building closed, stability test done. Review / adjust stability in the Tower tab.', 'r3-ready': 'Teams read the escape-room rules.', 'r3-live': 'The race is on \u2014 watch progress in the Escape Room tab.',
  'r3-done': 'Round 3 complete.', final: 'Final standings are on the big screen.',
};

function showLogin() { $('#login').classList.remove('hidden'); $('#app').classList.add('hidden'); }
function auth() {
  if (!tok) return showLogin();
  sock.emit('auth', { role: 'admin', token: tok }, (r) => {
    if (!r.ok) { store.del('lh_admin'); tok = null; return showLogin(); }
    $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
    A = r.admin; pub = r.pub; board = r.board; setLoaded = false; renderAll();
  });
}
sock.on('connect', auth); sock.on('reload', auth);
$('#lf').addEventListener('submit', (e) => { e.preventDefault(); sock.emit('adminLogin', { password: $('#pw').value }, (r) => { if (!r.ok) return toast(r.error, 'error'); tok = r.token; store.set('lh_admin', tok); auth(); }); });
$('#logout').addEventListener('click', () => { store.del('lh_admin'); location.reload(); });
sock.on('admin', (a) => { A = a; renderAll(); });
sock.on('pub', (p) => { pub = p; renderRun(); });
sock.on('board', (b) => { board = b; renderScores(); });
sock.on('feed', (f) => { feedList.unshift(f); feedList = feedList.slice(0, 80); renderFeed(); });
const act = (a, ok) => new Promise((res) => sock.emit('admin', a, (r) => { toast(r.ok ? (ok || r.msg) : r.error, r.ok ? 'ok' : 'error'); res(r); }));

$$('#tabs button').forEach((b) => b.addEventListener('click', () => { $$('#tabs button').forEach((x) => x.classList.toggle('on', x === b)); $$('section[data-p]').forEach((s) => s.classList.toggle('hidden', s.dataset.p !== b.dataset.t)); }));
const setHtml = (el, html) => { if (el && el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; return true; } return false; };

function renderAll() { if (!A) return; renderRun(); renderTeams(); renderR1(); renderR2(); renderR3(); renderScores(); if (!setLoaded) loadSettings(); }

// ------------------------------------------------------------------ RUN
function renderRun() {
  if (!A || !pub) return;
  const st = A.stage, si = STAGE_INFO[st];
  $('#ev').textContent = A.config.eventName.toUpperCase() + ' \xB7 ORGANISER';
  $('#stagePill').className = 'pill ' + (A.paused ? 'warn' : si.pill); $('#stagePill').textContent = A.paused ? '\u23F8 Paused' : si.label;
  const idx = A.stages.indexOf(st);
  setHtml($('#stepper'), A.stages.map((s, i) => \`<span class="s \${i < idx ? 'done' : i === idx ? 'now' : ''}" data-go="\${s}">\${esc(STAGE_INFO[s].label.replace('Round ', 'R').replace(' \xB7 ', ' '))}</span>\`).join(''));
  $('#stTitle').textContent = si.label + (si.round >= 1 && si.round <= 3 ? \` \u2014 \${ROUND_NAMES[si.round]}\` : '');
  $('#stSub').textContent = SUB[st] || '';
  const timed = !!pub.clock;
  let left = timed ? pub.clock.duration - pub.clock.elapsed : null;
  if (st === 'r1-pitch' && pub.r1.current) left = pub.r1.pitchSec - pub.r1.pitchElapsed;
  $('#bigT').textContent = left == null ? '--:--' : left < 0 ? '+' + mmss(-left) : mmss(left);
  $('#bigT').className = 'bigtimer ' + (left != null && left <= 10 ? 'red' : left != null && left <= 60 ? 'gold' : '');
  $('#nextBtn').textContent = (NEXT_LABEL[st] || 'Next') + ' \u25B6'; $('#nextBtn').disabled = st === 'final';
  $('#pauseBtn').disabled = A.paused || !(timed || st === 'r1-pitch'); $('#resumeBtn').disabled = !A.paused;
  $('#extBtn').disabled = !timed; $('#endBtn').disabled = !timed;
  $('#boardChk').checked = A.showBoard;
  const urls = A.lanUrls.length ? A.lanUrls : [location.origin];
  $('#joinNote').innerHTML = \`Teams and judges join at <b class="mono" style="color:var(--text)">\${esc(urls[0])}</b>. The big screen shows this link in the lobby.\`;
  let ctl = '';
  if (st === 'r1-pitch') ctl = pitchCtlHtml();
  if (st === 'r2-build') ctl = \`<div class="row"><button class="btn red" data-q="tremor">\u{1F30B} Tremor</button>\${A.commands.slice(0, 5).map((c) => \`<button class="btn sm" data-cmd="\${c.type}">\u{1F4E3} \${esc(c.title)}</button>\`).join('')}</div>\`;
  if (setHtml($('#stageCtl'), ctl)) bindStageCtl($('#stageCtl'));
  if (st === 'r1-pitch') updatePitchTimer();
}
$('#stepper').addEventListener('click', async (e) => { const s = e.target.dataset.go; if (!s || s === A.stage) return; if (await confirmBox(\`Jump to \u201C\${STAGE_INFO[s].label}\u201D?\`, 'Entering a timed stage restarts its timer. Entering Round 2 build or Round 3 live from another stage resets that round.', 'Jump', 'gold')) act({ type: 'goto', stage: s }); });
$('#nextBtn').addEventListener('click', async () => { const st = A.stage; if ((st === 'r2-build' || st === 'r3-live' || st === 'r1-prep') && pub.clock && pub.clock.duration - pub.clock.elapsed > 5) { if (!(await confirmBox('End this stage early?', 'The timer still has time left.', 'End now', 'red'))) return; } act({ type: 'next' }); });
$('#pauseBtn').addEventListener('click', () => act({ type: 'pause' }));
$('#resumeBtn').addEventListener('click', () => act({ type: 'resume' }));
$('#extBtn').addEventListener('click', () => act({ type: 'extend', minutes: 1 }));
$('#endBtn').addEventListener('click', async () => { if (await confirmBox('End the timer now?', 'This moves to the next stage immediately.', 'End now')) act({ type: 'endTimer' }); });
$('#boardChk').addEventListener('change', (e) => act({ type: 'board', on: e.target.checked }));
$('#annBtn').addEventListener('click', () => { act({ type: 'announce', text: $('#annTxt').value }); $('#annTxt').value = ''; });
function renderFeed() { setHtml($('#feed'), feedList.map((f) => \`<div class="\${f.kind}"><span class="mono dim">\${new Date(f.t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span> \${esc(f.text)}</div>\`).join('') || '<div class="muted">Events appear here.</div>'); }

// ------------------------------------------------------------------ TEAMS & JUDGES
function renderTeams() {
  $('#tCount').textContent = \`\${A.teams.length} teams \xB7 \${A.teams.filter((t) => t.online).length} online\`;
  setHtml($('#tT'), A.teams.map((t) => \`<tr><td><span class="online \${t.online ? 'on' : ''}"></span><b>\${esc(t.name)}</b></td><td class="codes">\${esc(t.code)}</td><td class="c num">\${t.online}</td><td class="r"><button class="btn sm ghost" data-a="rename" data-id="\${t.id}">Rename</button> <button class="btn sm ghost" data-a="code" data-id="\${t.id}">New code</button> <button class="btn sm ghost red" data-a="del" data-id="\${t.id}">\u2715</button></td></tr>\`).join('') || '<tr><td colspan="4" class="empty">No teams yet.</td></tr>');
  setHtml($('#jT'), A.judges.map((j) => \`<tr><td><span class="online \${j.online ? 'on' : ''}"></span><b>\${esc(j.name)}</b></td><td class="codes">\${esc(j.code)}</td><td class="r"><button class="btn sm ghost red" data-j="\${j.id}">\u2715</button></td></tr>\`).join('') || '<tr><td colspan="3" class="empty">No judges \u2014 the organiser can score alone.</td></tr>');
}
$('#tAdd').addEventListener('click', async () => { const r = await act({ type: 'addTeams', names: $('#tNames').value }); if (r.ok) $('#tNames').value = ''; });
$('#tCopy').addEventListener('click', () => navigator.clipboard?.writeText(A.teams.map((t) => \`\${t.name}: \${t.code}\`).concat(A.judges.map((j) => \`Judge \${j.name}: \${j.code}\`)).join('\\n')).then(() => toast('Codes copied')).catch(() => toast('Copy failed \u2014 select them in the table', 'warn')));
$('#tT').addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b) return; const t = A.teams.find((x) => x.id === b.dataset.id); if (!t) return;
  if (b.dataset.a === 'del' && await confirmBox(\`Remove \${t.name}?\`, 'All their progress is deleted.', 'Remove')) act({ type: 'removeTeam', id: t.id });
  if (b.dataset.a === 'code' && await confirmBox(\`New code for \${t.name}?\`, 'Their devices are logged out.', 'New code', 'gold')) act({ type: 'newCode', id: t.id });
  if (b.dataset.a === 'rename') promptBox('Rename team', t.name, (v) => act({ type: 'renameTeam', id: t.id, name: v }));
});
$('#jAdd').addEventListener('click', async () => { const r = await act({ type: 'addJudge', name: $('#jName').value }); if (r.ok) $('#jName').value = ''; });
$('#jT').addEventListener('click', async (e) => { const id = e.target.dataset.j; if (id && await confirmBox('Remove judge?', 'Their scores stay recorded.', 'Remove')) act({ type: 'removeJudge', id }); });
function promptBox(title, val, cb) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = \`<div class="modal"><h3>\${esc(title)}</h3><input id="pv" value="\${esc(val)}" maxlength="28"><div class="row"><button class="btn ghost" data-v="0">Cancel</button><button class="btn gold" data-v="1">Save</button></div></div>\`;
  document.body.appendChild(bg);
  bg.addEventListener('click', (e) => { const v = e.target.dataset?.v; if (v === '1') cb($('#pv', bg).value); if (v !== undefined || e.target === bg) bg.remove(); });
}

// ------------------------------------------------------------------ ROUND 1
function pitchCtlHtml() {
  const cur = A.teams.find((t) => t.id === A.r1.current);
  return \`<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:200px"><div class="muted" style="font-size:12px;font-weight:800;letter-spacing:.1em">ON STAGE</div><div style="font-family:var(--display);font-size:22px;font-weight:800">\${cur ? esc(cur.name) : '\u2014 select a team \u2014'}</div><div class="muted">\${cur ? esc(cur.r1.caseTitle || '') : ''}</div></div>
    <div class="mono" style="font-size:40px;font-weight:700" data-ptimer>\${mmss(A.config.r1PitchSec)}</div></div>
    <div class="row" style="margin-top:10px"><button class="btn teal" data-q="pitchStart" \${!cur || A.r1.pitchRunning ? 'disabled' : ''}>\u25B6 Start \${A.config.r1PitchSec}s timer</button><button class="btn red" data-q="pitchStop" \${!A.r1.pitchRunning ? 'disabled' : ''}>\u25A0 Stop</button><button class="btn gold" data-q="pitchNext">\u23ED Next team</button></div>\`;
}
function updatePitchTimer() { const el = $('[data-ptimer]'); if (!el || !pub) return; const left = pub.r1.pitchSec - pub.r1.pitchElapsed; el.textContent = left < 0 ? '+' + mmss(-left) : mmss(left); el.className = 'mono ' + (left < 0 ? 'red' : left <= 10 ? 'gold' : ''); el.style.cssText = 'font-size:40px;font-weight:700'; }
function bindStageCtl(root) {
  $$('[data-q]', root).forEach((b) => b.addEventListener('click', () => act({ type: b.dataset.q })));
  $$('[data-cmd]', root).forEach((b) => b.addEventListener('click', () => act({ type: 'command', cmd: b.dataset.cmd })));
}
function renderR1() {
  if (setHtml($('#pitchCtl'), A.stage === 'r1-pitch' ? pitchCtlHtml() : '<div class="muted">Pitch controls appear when the event reaches the <b>Pitches</b> stage.</div>')) bindStageCtl($('#pitchCtl'));
  updatePitchTimer();
  const order = A.r1.order.length ? A.r1.order : A.teams.map((t) => t.id);
  const rows = order.map((id, i) => A.teams.find((t) => t.id === id)).filter(Boolean);
  for (const t of A.teams) if (!rows.includes(t)) rows.push(t);
  const caseOpts = (sel) => A.cases.map((c) => \`<option value="\${c.id}" \${c.id === sel ? 'selected' : ''}>\${c.id}. \${esc(c.title)}</option>\`).join('');
  const html = rows.map((t, i) => {
    const r = t.r1, over = r.pitchSec != null && r.pitchSec > A.config.r1PitchSec + A.config.r1GraceSec;
    return \`<tr \${t.id === A.r1.current ? 'style="background:rgba(255,201,71,.08)"' : ''}><td class="num">\${i + 1}</td><td><b>\${esc(t.name)}</b></td><td><select class="mini" data-case="\${t.id}"><option value="">\u2014</option>\${caseOpts(r.caseId)}</select></td>
      <td><span class="pbar"><div style="width:\${r.progress}%"></div></span> <span class="mono dim">\${r.progress}%</span></td>
      <td class="r num \${over ? 'red' : ''}">\${r.pitchSec != null ? r.pitchSec + 's' : '\u2014'}</td><td class="r num" title="\${esc(Object.entries(r.byJudge).map(([k, v]) => \`\${k === 'admin' ? 'Organiser' : (A.judges.find((j) => j.id === k)?.name || 'judge')}: \${v}\`).join(', '))}">\${r.judges}</td>
      <td class="r num">\${r.peerAvg ?? '\u2014'}</td><td class="r num gold"><b>\${r.score ?? '\u2014'}</b>\${r.penalty ? \` <span class="tag bad">\u2212\${r.penalty}</span>\` : ''}</td>
      <td class="r"><button class="btn sm" data-sel="\${t.id}" \${A.stage !== 'r1-pitch' ? 'disabled' : ''}>\u{1F3A4} Select</button> \${r.pitchSec != null ? \`<button class="btn sm ghost" data-clr="\${t.id}" title="Clear pitch time">\u21BA</button>\` : ''}</td></tr>\`;
  }).join('') || '<tr><td colspan="9" class="empty">No teams.</td></tr>';
  if (document.activeElement?.dataset?.case) return;
  setHtml($('#r1T'), html);
}
$('#r1T').addEventListener('change', async (e) => { const id = e.target.dataset.case; if (!id) return; if (await confirmBox('Change this team\\'s case?', 'Their solving sheet is cleared.', 'Change', 'gold')) act({ type: 'setCase', id, caseId: e.target.value }); else renderR1(); });
$('#r1T').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.sel) act({ type: 'pitchSelect', id: b.dataset.sel }); if (b.dataset.clr) act({ type: 'clearPitch', id: b.dataset.clr }); });
$('#redrawAll').addEventListener('click', async () => { if (await confirmBox('Redraw every case?', 'All teams get new cases and their sheets are cleared.', 'Redraw')) act({ type: 'redraw' }); });
$('#shuffleOrd').addEventListener('click', () => act({ type: 'shuffleOrder' }));

// ------------------------------------------------------------------ ROUND 2
function renderR2() {
  const r2 = A.r2, a = r2.active;
  const def = a && A.commands.find((c) => c.type === a.type);
  setHtml($('#cmdActive'), a ? \`<div style="padding:12px 14px;border-radius:12px;border:2px solid #ff6680;background:#3a0d1c"><b>\u{1F4E3} \${esc(def.title)}</b> \u2014 \${esc(def.text)}<div class="mono gold" style="margin-top:6px">\${Math.max(0, a.endsAt - A.clock.elapsed)}s left</div></div>\` : '<div class="muted">No active command.</div>');
  $('#cmdNext').textContent = A.stage === 'r2-build' && r2.nextCmdIn != null && !a ? \`\xB7 next auto command in ~\${Math.max(0, r2.nextCmdIn)}s\` : '';
  $('#autoCmd').checked = r2.nextCmdIn != null || !!a || A.stage !== 'r2-build';
  if (setHtml($('#cmdBtns'), A.commands.map((c) => \`<button class="btn sm" data-cmd="\${c.type}" title="\${esc(c.text)}" \${A.stage !== 'r2-build' ? 'disabled' : ''}>\u{1F4E3} \${esc(c.title)}</button>\`).join(''))) bindStageCtl($('#cmdBtns'));
  $('#tremorBtn').disabled = A.stage !== 'r2-build';
  setHtml($('#cmdLog'), r2.history.slice().reverse().map((h) => \`<div style="padding:6px 0;border-bottom:1px solid rgba(35,44,94,.6)"><span class="mono dim">\${mmss(h.issuedAt)}</span> <b>\${esc(h.title)}</b> <span class="tag \${a && a.id === h.id ? 'gold' : 'ok'}">\${a && a.id === h.id ? 'ACTIVE' : \`\${h.ok}/\${A.teams.length} complied\`}</span></div>\`).join('') || '<div class="muted">No commands yet.</div>');
  if (document.activeElement?.dataset?.stab) return;
  setHtml($('#r2T'), r2.scores.rows.slice().sort((x, y) => y.total - x.total).map((r) => \`<tr><td><b>\${esc(r.name)}</b></td><td class="r num">\${r.height * 5} cm</td><td class="r num">\${fmt(r.heightScore)}</td><td class="r num">\${fmt(r.cmd)} <span class="dim">(\${r.okN}\u2713 \${r.failN}\u2715)</span></td><td class="r num">\${fmt(r.realHeight)}</td><td class="r num">\${fmt(r.stabAuto)}</td>
    <td><input class="mini" type="number" min="0" max="15" step="0.5" placeholder="auto" data-stab="\${r.id}" value="\${r.override ? r.stab : ''}"></td><td class="r num gold"><b>\${fmt(r.total)}</b></td></tr>\`).join('') || '<tr><td colspan="8" class="empty">Scores appear once building starts.</td></tr>');
}
$('#tremorBtn').addEventListener('click', async () => { if (await confirmBox('Trigger a tremor?', 'Every tower shakes. Weak, unbalanced sections collapse.', 'Shake it', 'red')) act({ type: 'tremor' }); });
$('#autoCmd').addEventListener('change', (e) => act({ type: 'autoCmd', on: e.target.checked }));
$('#r2T').addEventListener('change', (e) => { const id = e.target.dataset.stab; if (id) act({ type: 'stab', id, value: e.target.value === '' ? null : e.target.value }); });

// ------------------------------------------------------------------ ROUND 3
function renderR3() {
  const rows = A.teams.slice().sort((x, y) => (x.r3.rank || 99) - (y.r3.rank || 99) || y.r3.level - x.r3.level);
  setHtml($('#r3T'), rows.map((t) => { const r = t.r3; return \`<tr><td><b>\${esc(t.name)}</b></td><td>\${Array.from({ length: A.puzzles.length }, (_, i) => \`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;margin-right:2px;background:\${i < r.level || r.finishedAt != null ? 'var(--teal)' : i === r.level && !r.dq ? 'var(--gold)' : '#232c5e'}" title="\${esc(A.puzzles[i].title)}"></span>\`).join('')} <span class="mono dim">\${r.finishedAt != null ? 10 : r.level}/10</span></td>
    <td class="r num">\${r.wrong}</td><td class="r num">\${r.hints}</td><td class="r num">\${r.cooldown ? r.cooldown + 's' : '\u2014'}</td>
    <td>\${r.dq ? '<span class="tag bad">DISQUALIFIED</span>' : r.finishedAt != null ? \`<span class="tag ok">ESCAPED #\${r.rank} \xB7 \${mmss(r.finishedAt)}</span>\` : '<span class="tag">IN PROGRESS</span>'}</td><td class="r num gold"><b>\${r.points}</b></td>
    <td class="r">\${r.dq ? \`<button class="btn sm" data-rein="\${t.id}">Reinstate</button>\` : ''}\${r.cooldown ? \`<button class="btn sm ghost" data-cool="\${t.id}">Clear cooldown</button>\` : ''}</td></tr>\`; }).join('') || '<tr><td colspan="8" class="empty">No teams.</td></tr>');
}
$('#r3T').addEventListener('click', async (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.rein && await confirmBox('Reinstate this team?', 'Undo their disqualification (e.g. after a typo dispute). They can try the Master Vault again.', 'Reinstate', 'gold')) act({ type: 'reinstate', id: b.dataset.rein }); if (b.dataset.cool) act({ type: 'clearCooldown', id: b.dataset.cool }); });

// ------------------------------------------------------------------ SCORES & SETTINGS
function renderScores() { setHtml($('#scT'), board.map((r) => \`<tr><td class="num gold"><b>\${r.rank}</b></td><td><b>\${esc(r.name)}</b></td><td class="r num">\${fmt(r.r1)}</td><td class="r num">\${fmt(r.r2)}</td><td class="r num">\${fmt(r.r3, 0)}</td><td class="r num gold"><b>\${fmt(r.total)}</b></td></tr>\`).join('') || '<tr><td colspan="6" class="empty">No teams.</td></tr>'); }
function loadSettings() {
  setLoaded = true;
  $$('[data-s]').forEach((el) => { const v = A.config[el.dataset.s]; if (el.type === 'checkbox') el.checked = !!v; else el.value = Array.isArray(v) ? v.join(',') : v; });
}
$('#saveSet').addEventListener('click', async () => {
  const c = {}; $$('[data-s]').forEach((el) => { c[el.dataset.s] = el.type === 'checkbox' ? el.checked : el.value; });
  const r = await act({ type: 'config', config: c }); if (!r.ok) setLoaded = false;
});
$$('[data-reset]').forEach((b) => b.addEventListener('click', async () => { if (await confirmBox(\`Reset Round \${b.dataset.reset}?\`, 'All progress and scores for this round are cleared.', 'Reset')) act({ type: 'resetRound', round: Number(b.dataset.reset) }); }));
$('#resetKeep').addEventListener('click', async () => { if (await confirmBox('Reset the whole event?', 'Back to the lobby with all scores cleared. Teams, codes and judges are kept.', 'Reset event')) act({ type: 'reset', keepTeams: true }); });
$('#wipe').addEventListener('click', async () => { if (await confirmBox('Wipe everything?', 'Deletes all teams, judges, codes and scores.', 'Wipe')) act({ type: 'reset', keepTeams: false }); });
` }, "/js/common.js": { "type": "text/javascript; charset=utf-8", "body": `/* Shared helpers */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mmss = (sec) => { sec = Math.max(0, Math.ceil(sec)); return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); };
const fmt = (n, d = 1) => (n == null ? '\u2014' : (Math.round(n * 10 ** d) / 10 ** d).toString());
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} }, del(k) { try { localStorage.removeItem(k); } catch {} } };
const STAGE_INFO = {
  lobby: { round: 0, label: 'Welcome', pill: '' },
  'r1-draw': { round: 1, label: 'Round 1 \xB7 Case draw', pill: 'warn' },
  'r1-prep': { round: 1, label: 'Round 1 \xB7 Prep time', pill: 'live' },
  'r1-pitch': { round: 1, label: 'Round 1 \xB7 Pitches', pill: 'live' },
  'r1-done': { round: 1, label: 'Round 1 \xB7 Complete', pill: '' },
  'r2-ready': { round: 2, label: 'Round 2 \xB7 Get ready', pill: 'warn' },
  'r2-build': { round: 2, label: 'Round 2 \xB7 Build!', pill: 'live' },
  'r2-done': { round: 2, label: 'Round 2 \xB7 Complete', pill: '' },
  'r3-ready': { round: 3, label: 'Round 3 \xB7 Get ready', pill: 'warn' },
  'r3-live': { round: 3, label: 'Round 3 \xB7 Escape room', pill: 'live' },
  'r3-done': { round: 3, label: 'Round 3 \xB7 Complete', pill: '' },
  final: { round: 4, label: 'Final results', pill: 'warn' },
};
const ROUND_NAMES = { 1: 'Case Pitch', 2: 'Tower Under Pressure', 3: 'The Escape Room' };

function toast(msg, type = 'ok', ms = 3400) {
  let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'toast ' + type; el.textContent = msg; box.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, ms);
  while (box.children.length > 5) box.firstChild.remove();
}
function bigNotice(msg, type = '') {
  $$('.notice-big').forEach((e) => e.remove());
  const el = document.createElement('div'); el.className = 'notice-big ' + type; el.textContent = msg; document.body.appendChild(el);
  setTimeout(() => el.remove(), 4300);
}
function confirmBox(title, text, okLabel = 'Confirm', okClass = 'red') {
  return new Promise((res) => {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = \`<div class="modal"><h3>\${esc(title)}</h3><div class="muted">\${esc(text)}</div><div class="row"><button class="btn ghost" data-v="0">Cancel</button><button class="btn \${okClass}" data-v="1">\${esc(okLabel)}</button></div></div>\`;
    bg.addEventListener('click', (e) => { const v = e.target.dataset?.v; if (v !== undefined || e.target === bg) { bg.remove(); res(v === '1'); } });
    document.body.appendChild(bg);
  });
}
function beep(freq = 880, ms = 180, vol = 0.15) {
  try { const A = window.__ac || (window.__ac = new (window.AudioContext || window.webkitAudioContext)()); const o = A.createOscillator(), g = A.createGain(); o.frequency.value = freq; g.gain.value = vol; o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime + ms / 1000); } catch {}
}

/* Draw a tower. opts: { gridW, mats, maxH, ghost, ghostBad, braces, label, compact, highlightCols } */
function drawTower(canvas, blocks, opts = {}) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return null;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const G = opts.gridW || 24;
  let top = 0; for (const b of blocks) top = Math.max(top, b.y + b.h);
  if (opts.ghost) top = Math.max(top, opts.ghost.y + opts.ghost.h);
  const maxH = Math.max(opts.maxH || 0, top + 3, 12);
  const padB = opts.compact ? 6 : 22, padL = opts.compact ? 2 : 30, padT = 6;
  const u = Math.min((w - padL - 4) / G, (h - padB - padT) / maxH);
  const ox = padL + ((w - padL - 4) - u * G) / 2, gy = h - padB;
  const X = (x) => ox + x * u, Y = (y) => gy - y * u;
  // grid
  ctx.strokeStyle = 'rgba(80,92,170,.16)'; ctx.lineWidth = 1;
  if (!opts.compact) {
    for (let c = 0; c <= G; c++) { ctx.beginPath(); ctx.moveTo(X(c), gy); ctx.lineTo(X(c), Y(maxH)); ctx.stroke(); }
    ctx.fillStyle = '#616a9e'; ctx.font = '10px JetBrains Mono, monospace';
    for (let y = 0; y <= maxH; y += 4) { ctx.fillText(String(y * 5), 2, Y(y) + 3); ctx.beginPath(); ctx.moveTo(X(0), Y(y)); ctx.lineTo(X(G), Y(y)); ctx.stroke(); }
    ctx.fillText('cm', 2, Y(maxH) + 12);
  }
  if (opts.highlightCols) { ctx.fillStyle = 'rgba(255,201,71,.08)'; ctx.fillRect(X(opts.highlightCols[0]), Y(maxH), (opts.highlightCols[1] - opts.highlightCols[0]) * u, maxH * u); }
  // ground
  ctx.fillStyle = '#2a3270'; ctx.fillRect(X(0) - 4, gy, G * u + 8, 4);
  const mats = opts.mats || {};
  for (const b of blocks) {
    const m = mats[b.m] || { color: '#999' };
    if (b.m === 'flag') {
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = Math.max(1, u * 0.12); ctx.beginPath(); ctx.moveTo(X(b.x + 0.2), Y(b.y)); ctx.lineTo(X(b.x + 0.2), Y(b.y + 1.6)); ctx.stroke();
      ctx.fillStyle = m.color; ctx.beginPath(); ctx.moveTo(X(b.x + 0.2), Y(b.y + 1.6)); ctx.lineTo(X(b.x + 1.2), Y(b.y + 1.3)); ctx.lineTo(X(b.x + 0.2), Y(b.y + 1.0)); ctx.fill();
      continue;
    }
    ctx.fillStyle = m.color; ctx.fillRect(X(b.x) + 0.5, Y(b.y + b.h) + 0.5, b.w * u - 1, b.h * u - 1);
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(X(b.x) + 0.5, Y(b.y + b.h) + 0.5, b.w * u - 1, Math.max(1, u * 0.18));
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.strokeRect(X(b.x) + 0.5, Y(b.y + b.h) + 0.5, b.w * u - 1, b.h * u - 1);
  }
  // braces (diagonal cables)
  if (opts.braces && top > 0) {
    let L = G, R = 0; for (const b of blocks) if (b.y === 0) { L = Math.min(L, b.x); R = Math.max(R, b.x + b.w); }
    const realTop = Math.max(...blocks.filter((b) => b.m !== 'flag').map((b) => b.y + b.h), 0);
    ctx.strokeStyle = 'rgba(42,209,176,.75)'; ctx.lineWidth = Math.max(1.2, u * 0.08); ctx.setLineDash([u * 0.5, u * 0.3]);
    for (let k = 1; k <= opts.braces; k++) {
      const yy = realTop * (k / (opts.braces + 1)) + realTop * 0.15;
      ctx.beginPath(); ctx.moveTo(X(Math.max(0, L - 2)), gy); ctx.lineTo(X((L + R) / 2), Y(Math.min(realTop, yy))); ctx.lineTo(X(Math.min(G, R + 2)), gy); ctx.stroke();
    }
    ctx.setLineDash([]);
  }
  if (opts.ghost) {
    const g = opts.ghost;
    ctx.fillStyle = opts.ghostBad ? 'rgba(255,77,109,.35)' : 'rgba(255,255,255,.22)';
    ctx.strokeStyle = opts.ghostBad ? '#ff4d6d' : 'rgba(255,255,255,.75)'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
    ctx.fillRect(X(g.x), Y(g.y + g.h), g.w * u, g.h * u); ctx.strokeRect(X(g.x), Y(g.y + g.h), g.w * u, g.h * u); ctx.setLineDash([]);
  }
  if (opts.label) { ctx.fillStyle = '#eef1ff'; ctx.font = \`700 \${Math.max(10, Math.min(15, u * 0.9))}px Inter, sans-serif\`; ctx.textAlign = 'center'; ctx.fillText(opts.label, X(G / 2), gy + 16); ctx.textAlign = 'left'; }
  return { X, Y, u, ox, gy, G, toCol: (px) => Math.floor((px - ox) / u) };
}
` }, "/js/rt.js": { "type": "text/javascript; charset=utf-8", "body": `/* Tiny real-time client over native WebSockets (works on Cloudflare Workers and on the Node server).
 * API mirrors what the pages need:  const sock = io();  sock.on(evt, fn);  sock.emit(evt, data, ackFn);  sock.connected
 */
function io() {
  const handlers = {}, acks = {}, queue = [];
  let ws = null, seq = 0, retry = 0, pingTimer = null;
  const sock = {
    connected: false,
    on(e, fn) { (handlers[e] = handlers[e] || []).push(fn); return sock; },
    emit(e, d, cb) {
      if (typeof d === 'function') { cb = d; d = undefined; }
      const m = { e, d };
      if (cb) {
        m.id = ++seq;
        acks[m.id] = cb;
        setTimeout(() => { if (acks[m.id]) { delete acks[m.id]; cb({ ok: false, error: 'No response from server \u2014 check your connection and try again.' }); } }, 15000);
      }
      const s = JSON.stringify(m);
      if (sock.connected) ws.send(s); else queue.push(s);
      return sock;
    },
  };
  const fire = (e, d) => (handlers[e] || []).forEach((fn) => { try { fn(d); } catch (err) { console.error(err); } });
  function connect() {
    ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
    ws.onopen = () => {
      sock.connected = true; retry = 0;
      while (queue.length) ws.send(queue.shift());
      clearInterval(pingTimer);
      pingTimer = setInterval(() => { if (sock.connected) ws.send('{"e":"ping"}'); }, 25000);
      fire('connect');
    };
    ws.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.ack) { const cb = acks[m.ack]; delete acks[m.ack]; if (cb) cb(m.d); }
      else fire(m.e, m.d);
    };
    ws.onclose = () => {
      const was = sock.connected;
      sock.connected = false;
      clearInterval(pingTimer);
      if (was) fire('disconnect');
      setTimeout(connect, Math.min(5000, 800 + retry++ * 700));
    };
    ws.onerror = () => {};
  }
  connect();
  return sock;
}
` }, "/js/screen.js": { "type": "text/javascript; charset=utf-8", "body": `/* Big-screen projector display */
const sock = io();
let tok = store.get('lh_admin');
let pub = null, board = [], towers = [], M = {}, GW = 24, NP = 10, lanUrls = [], viewKey = '', lastAnnounce = null;

function auth() {
  if (!tok) { $('#login').classList.remove('hidden'); return; }
  sock.emit('auth', { role: 'screen', token: tok }, (r) => {
    if (!r.ok) { store.del('lh_admin'); tok = null; $('#login').classList.remove('hidden'); return; }
    $('#login').classList.add('hidden');
    pub = r.pub; board = r.board; towers = r.towers; M = r.materials; GW = r.gridW; NP = r.puzzles; lanUrls = r.lanUrls || [];
    viewKey = ''; render();
  });
  fetch('/health').catch(() => {});
}
sock.on('connect', auth); sock.on('reload', auth);
$('#lf').addEventListener('submit', (e) => { e.preventDefault(); sock.emit('adminLogin', { password: $('#pw').value }, (r) => { if (!r.ok) return toast(r.error, 'error'); tok = r.token; store.set('lh_admin', tok); auth(); }); });
$('#fsBtn').addEventListener('click', () => { const d = document.documentElement; (document.fullscreenElement ? document.exitFullscreen() : d.requestFullscreen?.())?.catch?.(() => {}); });
sock.on('pub', (p) => { const prev = pub; pub = p; render(prev); });
sock.on('board', (b) => { board = b; renderBoard(); if (pub && ['r1-done', 'final'].includes(pub.stage)) update(); });
sock.on('towers', (t) => { towers = t; if (pub && pub.stage.startsWith('r2')) drawTowers(); });
sock.on('feed', (f) => { const el = $('#feed'); el.className = 'txt ' + (f.kind === 'good' ? 'teal' : f.kind === 'bad' ? 'red' : f.kind === 'cmd' ? 'gold' : ''); el.textContent = f.text; void el.offsetWidth; });
sock.on('notice', (n) => { if (n.big && !/^ROUND|FINAL|\u{1F4E2}/.test(n.text)) bigNotice(n.text, n.type === 'error' ? 'error' : n.type === 'ok' ? 'ok' : ''); });
sock.on('command', () => { beep(660, 200); setTimeout(() => beep(880, 260), 220); const o = $('#cmdOv'); if (o) { o.classList.remove('enter'); void o.offsetWidth; o.classList.add('enter'); } });
sock.on('tremor', () => { beep(110, 900, 0.3); const m = $('#main'); m.classList.remove('shake'); void m.offsetWidth; m.classList.add('shake'); });
sock.on('pitchBuzz', () => beep(300, 700, 0.3));
sock.on('draw', () => { viewKey = ''; });
window.addEventListener('resize', () => { if (pub?.stage.startsWith('r2')) drawTowers(); });

function joinUrl() { const h = location.hostname; return (h !== 'localhost' && h !== '127.0.0.1') ? location.origin : (lanUrls[0] || location.origin); }

function render(prev) {
  if (!pub) return;
  const st = pub.stage, si = STAGE_INFO[st];
  $('#ev').textContent = pub.eventName.toUpperCase();
  $('#pill').className = 'pill ' + (pub.paused ? 'warn' : si.pill); $('#pill').textContent = pub.paused ? '\u23F8 Paused' : si.label;
  $('#rn').textContent = si.round >= 1 && si.round <= 3 ? \`Round \${si.round} \xB7 \${ROUND_NAMES[si.round]}\` : st === 'final' ? 'Final Results' : 'Welcome';
  let left = pub.clock ? pub.clock.duration - pub.clock.elapsed : null;
  const t = $('#timer'); t.classList.toggle('hidden', left == null);
  if (left != null) { t.textContent = mmss(left); t.className = 'timer' + (left <= 10 ? ' crit' : left <= 60 ? ' warn' : ''); }
  const key = st + (st === 'r1-pitch' ? ':' + (pub.r1.current?.id || '') : '') + (st.startsWith('r2') ? ':' + towers.length : '');
  if (key !== viewKey) { viewKey = key; build(st); }
  update();
  $('#boardOv').classList.toggle('hidden', !pub.showBoard); renderBoard();
  if (pub.announce && pub.announce.t !== lastAnnounce) { lastAnnounce = pub.announce.t; $('#annTxt').textContent = '\u{1F4E2} ' + pub.announce.text; $('#annOv').classList.remove('hidden'); setTimeout(() => $('#annOv').classList.add('hidden'), 7000); }
  if (prev && prev.stage !== 'final' && st === 'final') confetti();
}
const main = () => $('#main');

function build(st) {
  if (st === 'lobby') main().innerHTML = \`<div class="center"><div><h1 class="huge">Lead. Build. <span class="gold">Escape.</span></h1><div class="sub">Join on your phone or laptop and enter your team code</div><div class="joinurl" id="ju"></div><div class="chips" id="chips"></div>
    <div class="rounds"><div><span>ROUND 1</span><b>\u{1F3A4} Case Pitch</b><p>Draw a leadership caselet, solve it as a team, pitch it in 60 seconds.</p></div><div><span>ROUND 2</span><b>\u{1F3D7}\uFE0F Tower Under Pressure</b><p>Build tall and stable on a budget \u2014 while obeying crisis commands.</p></div><div><span>ROUND 3</span><b>\u{1F510} The Escape Room</b><p>10 locks. Vault letters. One shot at the master vault.</p></div></div></div></div>\`;
  else if (st === 'r1-draw' || st === 'r1-prep') main().innerHTML = \`<div class="cards" id="cards"></div>\`;
  else if (st === 'r1-pitch') buildPitch();
  else if (st === 'r1-done') main().innerHTML = \`<div style="height:100%;overflow:hidden"><h1 class="huge" style="font-size:2.6rem;margin-bottom:1rem">Round 1 \xB7 Case Pitch results</h1><table class="bigtable"><tbody id="r1t"></tbody></table></div>\`;
  else if (st === 'r2-ready') main().innerHTML = \`<div class="center"><div><h1 class="huge">\u{1F3D7}\uFE0F Tower Under Pressure</h1><div class="sub">Tallest \xB7 Most stable \xB7 Obey every crisis command</div>
    <div class="rounds"><div><span>HEIGHT \xB7 20</span><b>Height \xF7 tallest \xD7 20</b><p>\u2026then multiplied by your command score \xF7 15. Ignore commands, lose height.</p></div><div><span>COMMANDS \xB7 15</span><b>Every 60\u2013120 s</b><p>Freeze, supply cuts, roll calls, flags, inspections. Obey within the window.</p></div><div><span>STABILITY \xB7 15</span><b>Physics decides</b><p>Overhangs topple. Tremors shake every tower. Wide bases and braces win.</p></div></div></div></div>\`;
  else if (st === 'r2-build' || st === 'r2-done') { main().innerHTML = \`<div class="towers" id="towers"></div>\`; buildTowers(); }
  else if (st === 'r3-ready') main().innerHTML = \`<div class="center"><div><h1 class="huge">\u{1F510} The Escape Room</h1><div class="sub">10 locks \xB7 vault letters \xB7 one attempt at the Master Vault</div>
    <div class="rounds"><div><span>LOCKS 1\u20139</span><b>Solve in order</b><p>Each lock opens the next and reveals a vault letter. Wrong answers jam the lock.</p></div><div><span>LOCK 10</span><b>The Master Vault</b><p>Unscramble the vault letters. ONE attempt \u2014 wrong means disqualified.</p></div><div><span>POINTS</span><b>50 \xB7 40 \xB7 30 \xB7 20</b><p>First three teams out win big. Everyone else who escapes in time gets 20.</p></div></div></div></div>\`;
  else if (st === 'r3-live' || st === 'r3-done') main().innerHTML = \`<div class="race" id="race"></div>\`;
  else if (st === 'final') main().innerHTML = \`<div style="height:100%;display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center"><div><h1 class="huge" style="text-align:center">Champions \u{1F3C6}</h1><div class="podium" id="pod"></div></div><div style="overflow:hidden;max-height:100%"><table class="bigtable"><thead><tr><th>#</th><th>Team</th><th style="text-align:right">R1</th><th style="text-align:right">R2</th><th style="text-align:right">R3</th><th style="text-align:right">Total</th></tr></thead><tbody id="fint"></tbody></table></div></div>\`;
}
function update() {
  const st = pub.stage;
  if (st === 'lobby') { $('#ju').textContent = joinUrl().replace(/^https?:\\/\\//, ''); setH($('#chips'), board.map((r) => \`<span class="chip">\${esc(r.name)}</span>\`).join('')); }
  else if (st === 'r1-draw' || st === 'r1-prep') updateCards(st);
  else if (st === 'r1-pitch') updatePitch();
  else if (st === 'r1-done') setH($('#r1t'), board.filter((r) => r.r1 != null).sort((a, b) => b.r1 - a.r1).concat(board.filter((r) => r.r1 == null)).map((r, i) => \`<tr class="\${i === 0 && r.r1 != null ? 'p1' : ''}"><td>\${i + 1}</td><td><b>\${esc(r.name)}</b></td><td style="text-align:right" class="mono gold">\${fmt(r.r1)} / 50</td></tr>\`).join(''));
  else if (st === 'r2-build' || st === 'r2-done') updateCmd();
  else if (st === 'r3-live' || st === 'r3-done') updateRace();
  else if (st === 'final') {
    const top = board.slice(0, 3), order = [1, 0, 2].filter((i) => top[i]);
    setH($('#pod'), order.map((i) => \`<div class="pod p\${i + 1}"><div class="md">\${['\u{1F947}', '\u{1F948}', '\u{1F949}'][i]}</div><div class="n">\${esc(top[i].name)}</div><div class="w">\${fmt(top[i].total)}</div></div>\`).join(''));
    setH($('#fint'), board.map((r) => \`<tr class="\${r.rank === 1 ? 'p1' : ''}"><td>\${r.rank}</td><td><b>\${esc(r.name)}</b></td><td style="text-align:right" class="mono">\${fmt(r.r1)}</td><td style="text-align:right" class="mono">\${fmt(r.r2)}</td><td style="text-align:right" class="mono">\${fmt(r.r3, 0)}</td><td style="text-align:right" class="mono gold"><b>\${fmt(r.total)}</b></td></tr>\`).join(''));
  }
}
const setH = (el, html) => { if (el && el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } };

// ---- Round 1
function updateCards(st) {
  const box = $('#cards'); if (!box) return;
  const list = pub.r1.teams;
  if (box.children.length !== list.length) box.innerHTML = list.map((t, i) => \`<div class="card flip" data-id="\${t.id}" style="animation-delay:\${i * 0.12}s"><div class="tn"></div><div class="ct"></div><div class="prog"><div></div></div></div>\`).join('');
  list.forEach((t) => { const c = box.querySelector(\`[data-id="\${t.id}"]\`); if (!c) return; c.querySelector('.tn').textContent = t.name; c.querySelector('.ct').textContent = t.caseTitle ? \`#\${t.caseId} \xB7 \${t.caseTitle}\` : '\u2026'; c.querySelector('.prog div').style.width = (st === 'r1-prep' ? t.progress : 0) + '%'; c.querySelector('.prog').style.visibility = st === 'r1-prep' ? 'visible' : 'hidden'; });
}
function buildPitch() {
  const c = pub.r1.current;
  main().innerHTML = c ? \`<div class="spot"><div class="l"><div class="muted" style="font-weight:800;letter-spacing:.15em">\u{1F3A4} NOW PITCHING</div><div class="team">\${esc(c.name)}</div><div class="case"><b>Case #\${c.caseId} \xB7 \${esc(c.caseTitle || '')}</b><br>\${esc(c.caseText || '')}</div>
      <div class="cue"><div class="k">THEIR DECISION</div><div id="dec"></div></div><div class="cue"><div class="k">ACTION PLAN</div><div id="plan"></div></div></div>
      <div style="display:flex;flex-direction:column;justify-content:center"><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#1d2566" stroke-width="7"/><circle id="arc" cx="50" cy="50" r="44" fill="none" stroke="#ffc947" stroke-width="7" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="t" id="rt">01:00</div></div>
      <div style="text-align:center;font-size:1.4rem;margin-top:1rem" id="peer"></div><div class="queue" id="queue"></div></div></div>\`
    : \`<div class="center"><div><h1 class="huge">\u{1F3A4} Pitch time</h1><div class="sub">\${pub.r1.pitchSec} seconds per team \xB7 Judges are scoring \xB7 Rate others on your device</div><div class="queue" id="queue" style="margin-top:2rem;font-size:1.3rem"></div></div></div>\`;
}
function updatePitch() {
  const r = pub.r1, c = r.current;
  setH($('#queue'), r.teams.map((t) => \`<span class="\${c && t.id === c.id ? 'now' : t.pitched ? 'done' : ''}">\${t.pitched ? '\u2713 ' : ''}\${esc(t.name)}</span>\`).join(''));
  if (!c) return;
  $('#dec').textContent = c.decision || '\u2014';
  setH($('#plan'), c.plan.length ? c.plan.map((p, i) => \`<div>\${i + 1}. \${esc(p)}</div>\`).join('') : '\u2014');
  const left = r.pitchSec - r.pitchElapsed;
  $('#rt').textContent = !r.pitchRunning && r.pitchElapsed === 0 ? mmss(r.pitchSec) : left < 0 ? '+' + mmss(-left) : mmss(left);
  $('#rt').className = 't ' + (left < 0 ? 'red' : left <= 10 ? 'gold' : '');
  const frac = Math.max(0, Math.min(1, r.pitchElapsed / r.pitchSec));
  const arc = $('#arc'); arc.setAttribute('stroke-dashoffset', String(276.5 * frac)); arc.setAttribute('stroke', left < 0 ? '#ff4d6d' : left <= 10 ? '#ff9f43' : '#ffc947');
  $('#peer').innerHTML = c.peerN ? \`Audience rating <b class="gold">\${'\u2605'.repeat(Math.round(c.peerAvg))}\${'\u2606'.repeat(5 - Math.round(c.peerAvg))}</b> \${c.peerAvg} <span class="muted">(\${c.peerN} teams)</span>\` : '<span class="muted">Teams: rate this pitch on your devices \u2605</span>';
}

// ---- Round 2
function buildTowers() {
  const n = Math.max(1, towers.length), box = $('#towers');
  const cols = n <= 4 ? n : n <= 8 ? Math.ceil(n / 2) : n <= 15 ? Math.ceil(n / 3) : Math.ceil(n / 4);
  box.style.gridTemplateColumns = \`repeat(\${cols}, 1fr)\`;
  box.style.gridTemplateRows = \`repeat(\${Math.ceil(n / cols)}, minmax(0, 1fr))\`;
  box.innerHTML = towers.map((t) => \`<div class="tw" data-id="\${t.id}"><div class="h"><span>\${esc(t.name)}</span><span class="m"></span></div><canvas></canvas><div class="f"></div></div>\`).join('') + '<div id="cmdOv" class="hidden"></div>';
  drawTowers();
}
function drawTowers() {
  const box = $('#towers'); if (!box) return;
  if (box.querySelectorAll('.tw').length !== towers.length) { buildTowers(); return; }
  const maxH = Math.max(14, ...towers.map((t) => t.height + 3));
  const tallest = Math.max(0, ...towers.map((t) => t.height));
  for (const t of towers) {
    const el = box.querySelector(\`[data-id="\${t.id}"]\`); if (!el) continue;
    el.classList.toggle('top', tallest > 0 && t.height === tallest);
    el.querySelector('.m').textContent = \`\${t.height * 5} cm\`;
    const s = t.score;
    el.querySelector('.f').innerHTML = pub.stage === 'r2-done' && s ? \`<span>H \${fmt(s.realHeight)} \xB7 C \${fmt(s.cmd)} \xB7 S \${fmt(s.stab)}</span><span class="gold"><b>\${fmt(s.total)}/50</b></span>\` : \`<span>\u{1FA99} \${t.coins}</span><span>\u{1F529} \${t.braces}</span><span>\${s ? \`\u{1F4E3} \${fmt(s.cmd)}/15\` : ''}</span>\`;
    drawTower(el.querySelector('canvas'), t.blocks, { gridW: GW, mats: M, maxH, braces: t.braces, compact: true });
  }
}
function updateCmd() {
  const o = $('#cmdOv'); if (!o) return;
  const a = pub.r2.active;
  o.classList.toggle('hidden', !a || pub.stage !== 'r2-build');
  if (!a) return;
  setH(o, \`<div><div class="t">\u{1F4E3} \${esc(a.title)}</div><div class="x">\${esc(a.text)}</div></div><div><div class="cd">\${mmss(a.left)}</div><div class="cnt">\${a.kind === 'action' ? \`\u2714 \${a.okN} done\` : \`\u2715 \${a.failN} broke it\`} \xB7 \${towers.length} teams</div></div>\`);
}

// ---- Round 3
function updateRace() {
  const box = $('#race'); if (!box) return;
  const race = pub.r3.race;
  setH(box, race.map((t, i) => \`<div class="lane \${t.rank === 1 ? 'win' : ''} \${t.dq ? 'dq' : ''}"><span class="rk">\${t.rank ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][t.rank - 1] || '#' + t.rank : i + 1}</span><span class="nm">\${esc(t.name)}</span>
    <div class="locks">\${Array.from({ length: NP }, (_, k) => \`<i class="\${k < t.level || t.done ? 'o' : k === t.level && !t.dq && pub.stage === 'r3-live' ? 'c' : ''} \${k === NP - 1 ? 'v' : ''}">\${k < t.level || t.done ? '\u{1F513}' : k === NP - 1 ? '\u{1F3DB}\uFE0F' : '\u{1F512}'}</i>\`).join('')}</div>
    <span class="st \${t.dq ? 'red' : t.done ? 'gold' : 'muted'}">\${t.dq ? 'DISQUALIFIED' : t.done ? \`ESCAPED #\${t.rank}\` : \`\${t.level}/\${NP}\`}</span></div>\`).join(''));
  const n = race.length, h = Math.max(2.4, Math.min(5, 52 / Math.max(n, 1)));
  $$('.lane', box).forEach((l) => { l.style.minHeight = h + 'rem'; });
}

// ---- overlays
function renderBoard() { setH($('#boardT'), board.map((r) => \`<tr class="\${r.rank === 1 ? 'p1' : ''}"><td>\${r.rank}</td><td><b>\${esc(r.name)}</b></td><td style="text-align:right" class="mono">\${fmt(r.r1)}</td><td style="text-align:right" class="mono">\${fmt(r.r2)}</td><td style="text-align:right" class="mono">\${fmt(r.r3, 0)}</td><td style="text-align:right" class="mono gold"><b>\${fmt(r.total)}</b></td></tr>\`).join('')); }
function confetti() {
  const colors = ['#ffc947', '#8b6cff', '#2ad1b0', '#ff4d6d', '#4aa8ff', '#ffffff'];
  for (let i = 0; i < 170; i++) { const c = document.createElement('div'); c.className = 'confetti'; c.style.left = Math.random() * 100 + 'vw'; c.style.background = colors[i % colors.length]; c.style.animationDuration = 3 + Math.random() * 4 + 's'; c.style.animationDelay = Math.random() * 2 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 9000); }
}
` }, "/js/team.js": { "type": "text/javascript; charset=utf-8", "body": `/* Team terminal */
const token = store.get('lh_team');
if (!token) location.href = '/';
const sock = io();
let pub = null, me = null, board = null, M = {}, GW = 24, BRACE = 60, MAXB = 3, QUALS = [];
let viewKey = '', mat = store.get('lh_mat') || 'cube', ghostX = null, geo = null, order8 = null;
const ACTION_LABEL = { ack: '\u270B ACKNOWLEDGE', donate: '\u{1F91D} DONATE 50 COINS', flag: '\u{1F6A9} PLANT THE FLAG', demolish: '\u{1F528} REMOVE TOP BLOCK', brace: '\u{1F529} INSTALL FREE BRACE' };

function auth() {
  sock.emit('auth', { role: 'team', token }, (r) => {
    if (!r.ok) { store.del('lh_team'); location.href = '/'; return; }
    M = r.materials; GW = r.gridW; BRACE = r.braceCost; MAXB = r.maxBraces; QUALS = r.qualities;
    pub = r.pub; me = r.me; viewKey = ''; render();
  });
}
sock.on('connect', auth);
sock.on('reload', auth);
sock.on('kicked', () => { store.del('lh_team'); location.href = '/'; });
sock.on('pub', (p) => { pub = p; render(); });
sock.on('me', (m) => { me = m; render(); });
sock.on('board', (b) => { board = b; });
sock.on('notice', (n) => { if (n.big) bigNotice(n.text, n.type === 'error' ? 'error' : n.type === 'ok' ? 'ok' : ''); else toast(n.text, n.type === 'error' ? 'error' : n.type === 'warn' ? 'warn' : 'ok'); });
sock.on('command', (c) => { beep(660, 160); setTimeout(() => beep(880, 220), 180); bigNotice(\`\u{1F4E3} \${c.title}: \${c.text}\`, 'error'); });
sock.on('tremor', (t) => { beep(140, 600, 0.25); document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); toast(\`\u{1F30B} \${t.label}!\`, 'warn'); });
sock.on('pitchBuzz', () => beep(320, 500, 0.2));
sock.on('sheet', (s) => { if (!me) return; me.r1.sheet[s.field] = s.value; const el = document.querySelector(\`[data-f="\${s.field}"]\`); if (el && document.activeElement !== el && s.field !== 'qualities') el.value = s.value || ''; if (s.field === 'qualities') syncQualities(); });
$('#logout').addEventListener('click', async () => { if (await confirmBox('Leave this device?', 'You can rejoin with your team code anytime.', 'Leave', 'gold')) { store.del('lh_team'); location.href = '/'; } });
$('#scoresBtn').addEventListener('click', showBoard);

function showBoard() {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  const rows = board && board.length ? board.map((r) => \`<tr class="\${r.id === me?.id ? 'gold' : ''}"><td class="num"><b>\${r.rank}</b></td><td><b>\${esc(r.name)}</b></td><td class="r num">\${fmt(r.r1)}</td><td class="r num">\${fmt(r.r2)}</td><td class="r num">\${fmt(r.r3, 0)}</td><td class="r num"><b>\${fmt(r.total)}</b></td></tr>\`).join('') : '<tr><td colspan="6" class="empty">Scores are hidden by the organiser.</td></tr>';
  bg.innerHTML = \`<div class="modal" style="width:min(640px,100%)"><h3>\u{1F3C6} Leaderboard</h3><div style="max-height:60vh;overflow:auto"><table><thead><tr><th>#</th><th>Team</th><th class="r">R1</th><th class="r">R2</th><th class="r">R3</th><th class="r">Total</th></tr></thead><tbody>\${rows}</tbody></table></div><div class="row"><button class="btn" data-v="1">Close</button></div></div>\`;
  bg.addEventListener('click', (e) => { if (e.target.dataset.v || e.target === bg) bg.remove(); });
  document.body.appendChild(bg);
}

// ------------------------------------------------------------------ header
function renderHeader() {
  const si = STAGE_INFO[pub.stage] || {};
  $('#ev').textContent = pub.eventName.toUpperCase();
  $('#stage').className = 'pill ' + (pub.paused ? 'warn' : si.pill || ''); $('#stage').textContent = pub.paused ? '\u23F8 Paused' : si.label;
  $('#tname').textContent = me.name;
  const mine = board?.find((r) => r.id === me.id);
  $('#tscore').textContent = mine ? \`#\${mine.rank} \xB7 \${fmt(mine.total)} pts\` : '';
  $('#scoresBtn').classList.toggle('hidden', !board);
  const t = $('#timer');
  let left = null;
  if (pub.clock) left = pub.clock.duration - pub.clock.elapsed;
  if (pub.stage === 'r1-pitch' && pub.r1.current) left = pub.r1.pitchSec - pub.r1.pitchElapsed;
  t.classList.toggle('hidden', left == null);
  if (left != null) { t.textContent = left < 0 ? '+' + mmss(-left) : mmss(left); t.className = 'timer' + (left <= 10 ? ' crit' : left <= 60 && pub.clock ? ' warn' : ''); }
}

// ------------------------------------------------------------------ main render
function render() {
  if (!pub || !me) return;
  renderHeader();
  const st = pub.stage;
  const key = st + (st === 'r3-live' ? ':' + me.r3.level + ':' + me.r3.dq + ':' + me.r3.finished + ':' + (me.r3.puzzle?.id || 0) : '') + (st === 'r1-pitch' ? ':' + (pub.r1.current?.id || '') : '') + (st.startsWith('r1') ? ':' + (me.r1.case?.id || 0) : '');
  if (key !== viewKey) { viewKey = key; build(st); }
  update(st);
}
const V = () => $('#view');

function build(st) {
  $('#cmdTop').innerHTML = '';
  if (st === 'lobby') V().innerHTML = \`
    <div class="hero"><h2>Welcome, \${esc(me.name)} \u{1F44B}</h2><div class="muted">Keep this screen open. Everything you need appears here when the organiser starts each round.</div></div>
    <div class="grid3" style="margin-top:12px">
      <div class="rcard"><div class="n">ROUND 1</div><h3>\u{1F3A4} Case Pitch</h3><div class="muted">Draw a real-world leadership caselet, fill the solving sheet as a team, then pitch your solution in 60 seconds to the judges.</div></div>
      <div class="rcard"><div class="n">ROUND 2</div><h3>\u{1F3D7}\uFE0F Tower Under Pressure</h3><div class="muted">Build the tallest, most stable tower on a budget \u2014 while obeying crisis commands that arrive without warning.</div></div>
      <div class="rcard"><div class="n">ROUND 3</div><h3>\u{1F510} The Escape Room</h3><div class="muted">Crack 10 locks in sequence. Each one reveals a vault letter. The final master vault allows ONE attempt.</div></div>
    </div>\`;
  else if (st === 'r1-draw' || st === 'r1-prep') buildSheet(st);
  else if (st === 'r1-pitch') buildPitch();
  else if (st === 'r1-done') V().innerHTML = \`<div class="result"><div class="muted" style="font-weight:800;letter-spacing:.1em">ROUND 1 COMPLETE</div><div class="big" id="r1res">\u2014</div><div class="muted" id="r1det"></div></div>\`;
  else if (st === 'r2-ready') buildR2Ready();
  else if (st === 'r2-build' || st === 'r2-done') buildR2(st);
  else if (st === 'r3-ready') buildR3Ready();
  else if (st === 'r3-live') buildR3();
  else if (st === 'r3-done') V().innerHTML = \`<div class="result"><div class="muted" style="font-weight:800;letter-spacing:.1em">ROUND 3 COMPLETE</div><div class="big" id="r3res">\u2014</div><div class="muted" id="r3det"></div></div>\`;
  else if (st === 'final') V().innerHTML = \`<div class="result"><div class="muted" style="font-weight:800;letter-spacing:.15em">FINAL RESULTS</div><div class="big" id="finres">\u2014</div><div class="muted" id="findet" style="font-size:18px"></div><button class="btn gold lg" style="margin-top:24px" onclick="showBoard()">\u{1F3C6} See the leaderboard</button></div>\`;
}
function update(st) {
  if (st === 'r1-draw' || st === 'r1-prep') updateSheet();
  else if (st === 'r1-pitch') updatePitch();
  else if (st === 'r1-done') { const s = me.r1.score; $('#r1res').textContent = s != null ? \`\${fmt(s)} / 50\` : 'Well pitched! \u{1F3A4}'; $('#r1det').textContent = s != null ? \`Judges' average\${me.r1.penalty ? \` \u2212 \${me.r1.penalty} overtime penalty\` : ''} \xB7 Peer rating \${me.r1.peerAvg ?? '\u2014'}\u2605\` : 'Scores will be revealed by the organiser.'; }
  else if (st === 'r2-build' || st === 'r2-done') updateR2(st);
  else if (st === 'r3-live') updateR3();
  else if (st === 'r3-done') { const r = me.r3; $('#r3res').textContent = r.dq ? 'Disqualified \u{1F480}' : r.finished ? \`Escaped #\${r.rank} \u{1F3C6}\` : \`\${r.level} / \${r.total} locks\`; $('#r3det').textContent = r.points != null ? \`Round 3 points: \${r.points}\` : ''; }
  else if (st === 'final') { const mine = board?.find((r) => r.id === me.id); $('#finres').textContent = mine ? \`#\${mine.rank}\` : '\u{1F389}'; $('#findet').textContent = mine ? \`\${fmt(mine.total)} points \xB7 R1 \${fmt(mine.r1)} \xB7 R2 \${fmt(mine.r2)} \xB7 R3 \${fmt(mine.r3, 0)}\` : 'Thank you for leading!'; }
}

// ------------------------------------------------------------------ ROUND 1
const SHEET = [
  { n: 1, t: 'Understand the situation', hint: 'Summarise the caselet in your own words (2\u20133 lines)', f: [['summary', 'textarea']] },
  { n: 2, t: 'Identify the core problem', hint: 'What is the key issue or decision?', f: [['problem', 'textarea']] },
  { n: 3, t: 'Brainstorm options', hint: 'Three different ways to tackle it', f: [['opt1', 'input', 'Option 1'], ['opt2', 'input', 'Option 2'], ['opt3', 'input', 'Option 3']] },
  { n: 4, t: 'Decision taken', hint: 'Which option and why? This is shown on the big screen when you pitch.', f: [['decision', 'textarea']] },
  { n: 5, t: 'Action plan', hint: 'Steps to implement \u2014 also shown on the big screen', f: [['plan1', 'input', 'Step 1'], ['plan2', 'input', 'Step 2'], ['plan3', 'input', 'Step 3']] },
  { n: 6, t: 'Leadership reflection', hint: 'Which leadership qualities does this plan need?', f: [['qualities', 'qual'], ['explain', 'textarea', 'Explain briefly']] },
];
function caseCard(c, anim) { return c ? \`<div class="casecard \${anim ? 'flip' : ''}"><div class="no">CASELET \${c.id} \xB7 \${c.set === 'advanced' ? 'ADVANCED' : 'SCHOOL'}</div><h2>\${esc(c.title)}</h2><p>\${esc(c.text)}</p></div>\` : '<div class="casecard"><h2>Drawing your case\u2026</h2></div>'; }
function buildSheet(st) {
  const c = me.r1.case;
  V().innerHTML = \`<div class="two"><div>\${caseCard(c, st === 'r1-draw')}
      <div class="panel" style="margin-top:12px"><div class="panel-b"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><b>Sheet progress</b><span class="saved" id="saved"></span></div><div class="prog"><div id="prog"></div></div>
      <div class="muted" style="font-size:13px;margin-top:10px">\${st === 'r1-draw' ? 'Prep time starts soon \u2014 you can begin filling your sheet now.' : 'Everyone in your team can type at the same time \u2014 it saves automatically and syncs to all your devices. The sheet locks when pitches begin.'}</div></div></div></div>
    <div class="sheet">\${SHEET.map((s) => \`<div class="sec"><h4><i>\${s.n}</i>\${esc(s.t)}</h4><div class="muted" style="font-size:12.5px;margin:-4px 0 8px">\${esc(s.hint)}</div><div class="row3">\${s.f.map(([k, type, ph]) =>
      type === 'qual' ? \`<div class="qual" data-qual>\${QUALS.map((q) => \`<label><input type="checkbox" value="\${esc(q)}"> \${esc(q)}</label>\`).join('')}</div>\`
        : type === 'textarea' ? \`<textarea data-f="\${k}" maxlength="800" placeholder="\${esc(ph || '')}"></textarea>\` : \`<input data-f="\${k}" maxlength="300" placeholder="\${esc(ph || '')}">\`).join('')}</div></div>\`).join('')}</div></div>\`;
  for (const el of $$('[data-f]')) {
    el.value = me.r1.sheet[el.dataset.f] || '';
    let t; el.addEventListener('input', () => { clearTimeout(t); $('#saved').textContent = 'typing\u2026'; t = setTimeout(() => saveField(el.dataset.f, el.value), 500); });
    el.addEventListener('blur', () => { clearTimeout(t); saveField(el.dataset.f, el.value); });
  }
  $$('[data-qual] input').forEach((i) => i.addEventListener('change', () => { const v = $$('[data-qual] input').filter((x) => x.checked).map((x) => x.value); me.r1.sheet.qualities = v; syncQualities(); saveField('qualities', v); }));
  syncQualities();
}
function saveField(field, value) {
  if (JSON.stringify(me.r1.sheet[field] ?? '') === JSON.stringify(value) && field !== 'qualities') { $('#saved') && ($('#saved').textContent = '\u2713 saved'); return; }
  me.r1.sheet[field] = value;
  sock.emit('r1:sheet', { field, value }, (r) => { if ($('#saved')) $('#saved').textContent = r.ok ? '\u2713 saved' : ''; if (!r.ok) toast(r.error, 'error'); });
}
function syncQualities() { const q = me.r1.sheet.qualities || []; $$('[data-qual] label').forEach((l) => { const i = l.querySelector('input'); i.checked = q.includes(i.value); l.classList.toggle('on', i.checked); }); }
function updateSheet() { const p = $('#prog'); if (p) p.style.width = me.r1.progress + '%'; }
function buildPitch() {
  const cur = pub.r1.current?.id || null, mine = cur === me.id;
  V().innerHTML = mine
    ? \`<div class="hero spot" style="border-color:var(--gold)"><div class="gold" style="font-weight:800;letter-spacing:.15em">\u{1F3A4} YOU'RE ON STAGE</div><h2 style="font-size:34px;margin:8px 0">\${esc(pub.r1.current ? me.name : '')}</h2><div class="bigtime" id="pt">01:00</div><div class="muted" style="margin-top:10px">Face the judges \u2014 your decision and action plan are on the big screen. You have \${pub.r1.pitchSec} seconds.</div></div>\`
    : \`<div class="two"><div>\${cur ? \`<div class="casecard"><div class="no">NOW PITCHING</div><h2 id="ptn"></h2><p id="ptc"></p></div>\` : \`<div class="casecard"><div class="no">PITCHES</div><h2>Waiting for the next team\u2026</h2><p>Your pitch order: <b class="gold">#\${me.r1.order || '\u2014'}</b></p></div>\`}</div>
       <div class="panel"><div class="panel-b" style="text-align:center;padding:28px">\${cur ? \`<div class="bigtime" id="pt" style="font-size:64px">01:00</div><h3 style="margin:18px 0 6px">Would you back this plan?</h3><div class="muted" style="margin-bottom:10px">Rate their pitch \u2014 the People's Choice award goes to the highest-rated team.</div><div class="stars" id="stars">\${[1, 2, 3, 4, 5].map((n) => \`<button data-s="\${n}">\u2605</button>\`).join('')}</div>\` : \`<div class="muted">Listen in and rate each team when they pitch.</div>\`}
       <div class="muted" style="margin-top:22px;font-size:13px">Your team: \${me.r1.pitchSec != null ? \`<b class="teal">pitched \u2713 (\${me.r1.pitchSec}s)</b>\` : \`pitch order <b class="gold">#\${me.r1.order || '\u2014'}</b>\`}</div></div></div></div>\`;
  $$('#stars button').forEach((b) => b.addEventListener('click', () => sock.emit('r1:rate', { stars: Number(b.dataset.s) }, (r) => toast(r.ok ? r.msg : r.error, r.ok ? 'ok' : 'error'))));
}
function updatePitch() {
  const r = pub.r1, pt = $('#pt');
  if (pt) { const left = r.pitchSec - r.pitchElapsed; pt.textContent = left < 0 ? '+' + mmss(-left) : mmss(left); pt.className = 'bigtime ' + (left < 0 ? 'red' : left <= 10 ? 'gold' : ''); if (!r.pitchRunning && r.pitchElapsed === 0) pt.textContent = mmss(r.pitchSec); }
  if (r.current && $('#ptn')) { $('#ptn').textContent = r.current.name; $('#ptc').textContent = \`\${r.current.caseTitle} \u2014 \${r.current.caseText}\`; }
  $$('#stars button').forEach((b) => b.classList.toggle('on', me.r1.myRating != null && Number(b.dataset.s) <= me.r1.myRating));
}

// ------------------------------------------------------------------ ROUND 2
function matsList() { return Object.entries(M).filter(([, m]) => !m.special); }
function buildR2Ready() {
  V().innerHTML = \`<div class="hero"><div class="gold" style="font-weight:800;letter-spacing:.12em">ROUND 2</div><h2>\u{1F3D7}\uFE0F Tower Under Pressure</h2><div class="muted">Build the tallest, most stable tower you can with a budget of coins. Crisis commands will arrive every 1\u20132 minutes \u2014 obey them fast.</div></div>
  <div class="grid3" style="margin-top:12px">
    <div class="rcard"><h3>\u{1F4CF} Height \xB7 20</h3><div class="muted">Your height \xF7 tallest tower \xD7 20, then multiplied by your command score \xF7 15. Ignore commands and your height counts for less!</div></div>
    <div class="rcard"><h3>\u{1F4E3} Commands \xB7 15</h3><div class="muted">Each crisis command must be obeyed within its window. Some need an action (press a button). Some are restrictions (don't build, no pillars\u2026).</div></div>
    <div class="rcard"><h3>\u{1F9F1} Stability \xB7 15</h3><div class="muted">Unbalanced blocks topple instantly. Tremors shake every tower. A wide base, centred loads and braces score high. The final stability test runs at the bell.</div></div>
  </div>
  <div class="panel" style="margin-top:12px"><div class="panel-h">Materials</div><div class="panel-b"><table><thead><tr><th>Material</th><th>Size (w \xD7 h)</th><th>Weight</th><th class="r">Cost</th><th>Notes</th></tr></thead><tbody>\${matsList().map(([, m]) => \`<tr><td><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:\${m.color};vertical-align:middle;margin-right:8px"></span><b>\${m.name}</b></td><td class="num">\${m.w} \xD7 \${m.h}</td><td class="num">\${m.wt}</td><td class="r num gold">\${m.cost}</td><td class="muted">\${esc(m.desc)}</td></tr>\`).join('')}<tr><td><b>\u{1F529} Brace</b></td><td>\u2014</td><td>\u2014</td><td class="r num gold">\${BRACE}</td><td class="muted">Reduces sway in tremors (max \${MAXB})</td></tr></tbody></table></div></div>\`;
}
function buildR2(st) {
  V().innerHTML = \`<div class="r2">
    <div class="panel"><div class="panel-h">Materials</div><div class="panel-b" id="mats">\${matsList().map(([k, m]) => \`<div class="mat" data-m="\${k}"><span class="sw" style="height:\${Math.min(30, 6 + m.h * 6)}px;background:\${m.color}"></span><div><b>\${m.name} <span class="muted mono" style="font-size:11px">\${m.w}\xD7\${m.h}</span></b><small>\${esc(m.desc)}</small></div><span class="cost">\${m.cost}</span></div>\`).join('')}
      <button class="btn teal" id="braceBtn" style="width:100%;margin-top:4px">\u{1F529} Buy brace (\${BRACE})</button>
      <div class="muted" style="font-size:12px;margin-top:10px;line-height:1.4">Select a material, then tap/click on the tower area to drop it. A <b class="red">red</b> preview means it will topple.</div></div></div>
    <div><div class="kpis"><div class="kpi"><div class="k">Coins</div><div class="v gold" id="kc">\u2014</div></div><div class="kpi"><div class="k">Height</div><div class="v" id="kh">\u2014</div></div><div class="kpi"><div class="k">Braces</div><div class="v teal" id="kb">\u2014</div></div><div class="kpi"><div class="k">Toppled</div><div class="v red" id="kt">\u2014</div></div></div>
      <canvas id="tower"></canvas><div id="cmdM" class="mobile-only" style="margin-top:10px"></div><div id="r2score"></div></div>
    <div style="display:flex;flex-direction:column;gap:12px"><div id="cmd"></div>
      <div class="panel"><div class="panel-h">Command record</div><div class="panel-b" id="hist" style="max-height:220px"></div></div>
      <div class="panel"><div class="panel-h">Site log</div><div class="panel-b loglist" id="log"></div></div></div></div>\`;
  $$('.mat').forEach((el) => el.addEventListener('click', () => { mat = el.dataset.m; store.set('lh_mat', mat); paintMats(); drawMine(); }));
  $('#braceBtn').addEventListener('click', () => sock.emit('r2:brace', {}, (r) => toast(r.ok ? r.msg : r.error, r.ok ? 'ok' : 'error')));
  const cv = $('#tower');
  const pos = (e) => { const rect = cv.getBoundingClientRect(); return (e.clientX - rect.left); };
  cv.addEventListener('pointermove', (e) => { if (!geo) return; ghostX = geo.toCol(pos(e)) - Math.floor(M[mat].w / 2) + (M[mat].w % 2 ? 0 : 1); drawMine(); });
  cv.addEventListener('pointerleave', () => { ghostX = null; drawMine(); });
  cv.addEventListener('pointerdown', (e) => {
    if (pub.stage !== 'r2-build' || pub.paused || !geo) return;
    const x = geo.toCol(pos(e)) - Math.floor(M[mat].w / 2) + (M[mat].w % 2 ? 0 : 1);
    ghostX = x;
    sock.emit('r2:place', { mat, x }, (r) => { toast(r.ok ? r.msg : r.error, !r.ok ? 'error' : r.toppled ? 'warn' : 'ok'); if (r.toppled) beep(200, 260, 0.2); });
  });
  paintMats();
  window.onresize = drawMine;
}
function paintMats() { $$('.mat').forEach((el) => el.classList.toggle('on', el.dataset.m === mat)); }
function drawMine() {
  if (!$('#tower') || !me) return;
  const blocks = me.r2.blocks;
  let ghost = null, bad = false;
  if (ghostX != null && pub.stage === 'r2-build') { ghost = TowerLib.makeBlock(blocks, mat, ghostX); bad = !TowerLib.staticOk([...blocks, ghost]); }
  const act = pub.r2.active;
  geo = drawTower($('#tower'), blocks, { gridW: GW, mats: M, ghost, ghostBad: bad, braces: me.r2.braces, highlightCols: act && act.type === 'center' ? [GW / 2 - 1.5, GW / 2 + 1.5] : null });
}
function updateR2(st) {
  const r = me.r2;
  $('#kc').textContent = r.coins; $('#kh').textContent = (r.height * 5) + ' cm'; $('#kb').textContent = \`\${r.braces}/\${MAXB}\`; $('#kt').textContent = r.toppled;
  drawMine();
  $$('.mat').forEach((el) => el.style.opacity = M[el.dataset.m].cost > r.coins ? 0.4 : 1);
  $('#braceBtn').disabled = r.coins < BRACE || r.braces >= MAXB || st !== 'r2-build';
  // command
  const a = pub.r2.active, my = r.myCmd;
  const cmdHtml = a && st === 'r2-build' ? \`<div class="cmdbar \${my === 'ok' ? 'ok' : my === 'fail' ? 'fail' : ''}"><span class="cd">\${mmss(a.left)}</span><div class="t">\u{1F4E3} \${esc(a.title)}</div><div style="margin:6px 0 10px;font-size:15px">\${esc(a.text)}</div>
      \${my === 'ok' ? \`<b class="teal">\${a.kind === 'action' ? '\u2714 Done \u2014 command complied' : '\u2714 Obeying so far \u2014 keep it up'}</b>\` : my === 'fail' ? '<b class="red">\u2715 Command missed \u2014 marks deducted</b>' : a.kind === 'action' ? \`<button class="btn gold lg actBtn" style="width:100%">\${ACTION_LABEL[a.type] || 'COMPLY'}</button>\` : '<b class="gold">\u26A0 Restriction active \u2014 obey until the timer ends</b>'}</div>\`
    : \`<div class="panel"><div class="panel-b muted" style="text-align:center">\${st === 'r2-build' ? '\u{1F4E1} No active command. Stay alert\u2026' : 'Building closed.'}</div></div>\`;
  for (const box of [$('#cmd'), $('#cmdM')]) if (box && box.dataset.h !== cmdHtml) { box.innerHTML = cmdHtml; box.dataset.h = cmdHtml; const b = box.querySelector('.actBtn'); if (b) b.addEventListener('click', () => sock.emit('r2:action', { type: a.type }, (x) => toast(x.ok ? x.msg : x.error, x.ok ? 'ok' : 'error'))); }
  const hist = r.cmdHistory.map((h) => \`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(35,44,94,.6)"><span>\${esc(h.title)}</span><span class="tag \${h.res === 'ok' ? 'ok' : h.res === 'fail' ? 'bad' : 'gold'}">\${h.res === 'ok' ? 'COMPLIED' : h.res === 'fail' ? 'MISSED' : 'ACTIVE'}</span></div>\`).reverse().join('') || '<div class="muted">No commands yet.</div>';
  if ($('#hist').dataset.h !== hist) { $('#hist').innerHTML = hist; $('#hist').dataset.h = hist; }
  const log = r.log.map((l) => \`<div><span class="mono dim">\${mmss(l.t)}</span> \${esc(l.text)}</div>\`).join('') || '<div>Empty site. Start building!</div>';
  if ($('#log').dataset.h !== log) { $('#log').innerHTML = log; $('#log').dataset.h = log; }
  const s = r.score;
  $('#r2score').innerHTML = s && st === 'r2-done' ? \`<div class="panel" style="margin-top:12px"><div class="panel-h">Your Round 2 score</div><div class="panel-b"><table><tr><td>Height \${s.height * 5} cm \u2192 height score</td><td class="r num">\${fmt(s.heightScore)} / 20</td></tr><tr><td>Real height (\xD7 command \${fmt(s.cmd)}/15)</td><td class="r num">\${fmt(s.realHeight)}</td></tr><tr><td>Crisis commands (\${s.okN}/\${s.okN + s.failN} obeyed)</td><td class="r num">\${fmt(s.cmd)} / 15</td></tr><tr><td>Stability\${s.override ? ' (moderator)' : ''}</td><td class="r num">\${fmt(s.stab)} / 15</td></tr><tr><td><b>Total</b></td><td class="r num gold"><b>\${fmt(s.total)} / 50</b></td></tr></table></div></div>\` : '';
}

// ------------------------------------------------------------------ ROUND 3
function buildR3Ready() {
  V().innerHTML = \`<div class="hero"><div class="gold" style="font-weight:800;letter-spacing:.12em">ROUND 3</div><h2>\u{1F510} The Escape Room</h2><div class="muted" style="font-size:16px">10 locks stand between your team and the exit. Open them in order \u2014 each one reveals a <b class="gold">vault letter</b>.</div></div>
  <div class="grid3" style="margin-top:12px">
    <div class="rcard"><h3>\u{1F513} Locks 1\u20139</h3><div class="muted">Type, select or arrange your answer. A wrong answer jams the lock for a few seconds \u2014 then try again.</div></div>
    <div class="rcard"><h3>\u{1F3DB}\uFE0F Master Vault</h3><div class="muted">Lock 10 uses your vault letters. You get <b class="red">ONE attempt</b>. A wrong answer disqualifies the team from this round.</div></div>
    <div class="rcard"><h3>\u{1F3C6} Points</h3><div class="muted">1st to escape 50 \xB7 2nd 40 \xB7 3rd 30 \xB7 everyone else who escapes in time 20. Hints unlock if you're stuck on a lock for a while.</div></div>
  </div>\`;
}
function locksHtml() {
  const r = me.r3;
  return \`<div class="locks">\${Array.from({ length: r.total }, (_, i) => \`<div class="lock \${i < r.level || r.finished ? 'open' : i === r.level ? 'cur' : ''} \${i === r.total - 1 ? 'final' : ''}">\${i < r.level || r.finished ? '\u{1F513}' : i === r.total - 1 ? '\u{1F3DB}\uFE0F' : '\u{1F512}'}<small>\${i + 1}</small></div>\`).join('')}</div>
  <div class="muted" style="font-size:12px;font-weight:800;letter-spacing:.08em;margin-top:14px">VAULT LETTERS</div>
  <div class="vault">\${Array.from({ length: r.total - 1 }, (_, i) => r.frags[i] ? \`<span>\${esc(r.frags[i])}</span>\` : '<span class="empty">?</span>').join('')}</div>\`;
}
function buildR3() {
  const r = me.r3, p = r.puzzle;
  const side = \`<div class="panel"><div class="panel-h">Progress <span class="mono">\${r.level}/\${r.total}</span></div><div class="panel-b">\${locksHtml()}<div class="muted" style="font-size:12.5px;margin-top:14px">Wrong attempts so far: <b id="wr">\${r.wrong}</b></div></div></div>\`;
  if (!r.dq && !r.finished && !p) { V().innerHTML = \`<div class="r3">\${side}<div class="puzzle result"><h2>Unlocking the room\u2026</h2></div></div>\`; return; }
  if (r.dq || r.finished) {
    V().innerHTML = \`<div class="r3">\${side}<div class="puzzle result">\${r.dq ? '<div class="big red">\u{1F480}</div><h2>Disqualified</h2><div class="muted">The master key was wrong. Your team scores 0 in this round \u2014 cheer on the others!</div>' : \`<div class="big gold">\u{1F3C6}</div><h2>You escaped!</h2><div class="muted" style="font-size:18px">Finished <b class="gold">#\${r.rank}</b>\${r.points != null ? \` \xB7 +\${r.points} points\` : ''}</div>\`}</div></div>\`;
    return;
  }
  order8 = null;
  const field = (f) => {
    if (f.type === 'text') return \`<label class="f">\${esc(f.label)}<input data-k="\${f.key}" placeholder="\${esc(f.placeholder || '')}" \${f.maxlength ? \`maxlength="\${f.maxlength}"\` : ''} \${f.inputmode ? \`inputmode="\${f.inputmode}"\` : ''} autocomplete="off" spellcheck="false"></label>\`;
    if (f.type === 'textarea') return \`<label class="f wide">\${esc(f.label)}<textarea data-k="\${f.key}"></textarea></label>\`;
    if (f.type === 'select') return \`<label class="f">\${esc(f.label)}<select data-k="\${f.key}"><option value="">\u2014 choose \u2014</option>\${f.options.map((o) => \`<option>\${esc(o)}</option>\`).join('')}</select></label>\`;
    if (f.type === 'mcq') return \`<div class="f wide"><div class="muted" style="font-size:12.5px;font-weight:700;margin-bottom:6px">\${esc(f.label)}</div><div class="opts" data-mcq="\${f.key}">\${f.options.map((o) => \`<label><input type="radio" name="\${f.key}" value="\${esc(o)}"> \${esc(o)}</label>\`).join('')}</div></div>\`;
    if (f.type === 'multi') return \`<div class="f wide"><div class="muted" style="font-size:12.5px;font-weight:700;margin-bottom:6px">\${esc(f.label)}</div><div class="opts" data-multi="\${f.key}" style="flex-direction:row;flex-wrap:wrap">\${f.options.map((o) => \`<label><input type="checkbox" value="\${esc(o)}"> Event \${esc(o)}</label>\`).join('')}</div></div>\`;
    if (f.type === 'order') { order8 = f.options.map((_, i) => i); return \`<div class="f wide"><div class="muted" style="font-size:12.5px;font-weight:700;margin-bottom:6px">\${esc(f.label)} \u2014 use \u25B2 \u25BC to reorder</div><ol class="order" data-order="\${f.key}"></ol></div>\`; }
    return '';
  };
  V().innerHTML = \`<div class="r3">\${side}<div class="puzzle" id="pz"><div class="k">LOCK \${String(p.id).padStart(2, '0')} OF \${r.total}\${p.final ? ' \xB7 \u26A0 ONE ATTEMPT' : ''}</div><h2>\${p.icon} \${esc(p.title)}</h2><div class="story">\${esc(p.story)}</div>
    <div class="lines">\${p.lines.map((l) => \`<div>\${esc(l)}</div>\`).join('')}</div>
    \${p.final ? \`<div class="vault" style="margin:0 0 6px">\${r.frags.map((f) => \`<span>\${esc(f)}</span>\`).join('')}</div>\` : ''}
    <div class="fields">\${p.fields.map(field).join('')}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn \${p.final ? 'red' : 'gold'} lg" id="sub">\${p.final ? '\u{1F3DB}\uFE0F Open the Master Vault' : '\u{1F513} Try to unlock'}</button><button class="btn ghost" id="hintBtn">\u{1F4A1} Hint</button><span class="muted" id="hintInfo" style="font-size:13px"></span></div>
    <div id="hint"></div><div class="cool hidden" id="cool"><div><div class="muted" style="font-weight:800;letter-spacing:.1em">LOCK JAMMED</div><div class="big" id="coolT">0</div><div class="muted">Check your answer and try again.</div></div></div></div></div>\`;
  if (order8) renderOrder(p.fields.find((f) => f.type === 'order'));
  $$('.opts').forEach((box) => box.addEventListener('change', () => $$('label', box).forEach((l) => l.classList.toggle('on', l.querySelector('input').checked))));
  $('#sub').addEventListener('click', () => submit(p));
  $('#hintBtn').addEventListener('click', () => sock.emit('r3:hint', {}, (x) => { if (!x.ok) return toast(x.error, 'warn'); me.r3.hint = x.hint; showHint(); }));
  $$('#pz input[data-k]').forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(p); }));
  showHint();
}
function renderOrder(f) {
  const ol = $('[data-order]');
  ol.innerHTML = order8.map((idx, pos) => \`<li><span class="n">\${pos + 1}</span><span class="t">\${esc(f.options[idx])}</span><button class="btn sm" data-up="\${pos}" \${pos === 0 ? 'disabled' : ''}>\u25B2</button><button class="btn sm" data-dn="\${pos}" \${pos === order8.length - 1 ? 'disabled' : ''}>\u25BC</button></li>\`).join('');
  $$('[data-up]', ol).forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.up); [order8[i - 1], order8[i]] = [order8[i], order8[i - 1]]; renderOrder(f); }));
  $$('[data-dn]', ol).forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.dn); [order8[i + 1], order8[i]] = [order8[i], order8[i + 1]]; renderOrder(f); }));
}
function collect(p) {
  const a = {};
  for (const f of p.fields) {
    if (f.type === 'mcq') a[f.key] = ($(\`[data-mcq="\${f.key}"] input:checked\`) || {}).value || '';
    else if (f.type === 'multi') a[f.key] = $$(\`[data-multi="\${f.key}"] input:checked\`).map((i) => i.value);
    else if (f.type === 'order') a[f.key] = order8.slice();
    else a[f.key] = ($(\`[data-k="\${f.key}"]\`) || {}).value || '';
  }
  return a;
}
let submitting = false;
async function submit(p) {
  if (submitting) return;
  const answers = collect(p);
  if (p.final && !(await confirmBox('Open the Master Vault?', \`You are submitting "\${String(answers.word || '').toUpperCase()}". You have ONE attempt \u2014 a wrong answer disqualifies your team.\`, 'Yes, open it', 'red'))) return;
  submitting = true; $('#sub').disabled = true;
  sock.emit('r3:submit', { answers }, (r) => {
    submitting = false; if ($('#sub')) $('#sub').disabled = false;
    if (!r.ok) return toast(r.error, 'error');
    if (r.correct) { beep(988, 120); setTimeout(() => beep(1318, 200), 130); if (!r.escaped) bigNotice(r.msg, 'ok'); }
    else if (r.dq) { beep(160, 700, 0.25); }
    else { beep(220, 300, 0.2); toast(r.msg, 'error'); $('#pz')?.classList.remove('shake'); void $('#pz')?.offsetWidth; $('#pz')?.classList.add('shake'); }
  });
}
function showHint() {
  const h = $('#hint'); if (!h) return;
  h.innerHTML = me.r3.hint ? \`<div class="hintbox">\u{1F4A1} \${esc(me.r3.hint)}</div>\` : '';
}
function updateR3() {
  const r = me.r3, c = $('#cool');
  if (c) { c.classList.toggle('hidden', !(r.cooldown > 0)); $('#coolT').textContent = r.cooldown + 's'; }
  if ($('#hintBtn')) { const ready = r.hintIn <= 0; $('#hintBtn').disabled = !ready || !!r.hint; $('#hintInfo').textContent = r.hint ? '' : ready ? 'Hint available' : \`Hint unlocks in \${mmss(r.hintIn)}\`; }
  if ($('#wr')) $('#wr').textContent = r.wrong;
  if (r.hint && $('#hint') && !$('#hint').innerHTML) showHint();
}
` }, "/js/tower-lib.js": { "type": "text/javascript; charset=utf-8", "body": 'var TowerLib = (() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // src/tower.js\n  var tower_exports = {};\n  __export(tower_exports, {\n    analyse: () => analyse,\n    colTops: () => colTops,\n    dropY: () => dropY,\n    makeBlock: () => makeBlock,\n    stabilityScore: () => stabilityScore,\n    staticOk: () => staticOk,\n    topRemovableIndex: () => topRemovableIndex,\n    towerHeight: () => towerHeight,\n    tremor: () => tremor\n  });\n\n  // data/tower.js\n  var MATERIALS = {\n    pillar: { name: "Pillar", w: 1, h: 4, wt: 3, cost: 60, color: "#c9a36b", desc: "Tall and thin \\u2014 great height, poor balance" },\n    cube: { name: "Cube", w: 2, h: 2, wt: 4, cost: 40, color: "#5fb3a1", desc: "Compact all-rounder" },\n    block: { name: "Block", w: 3, h: 2, wt: 10, cost: 45, color: "#8f7ad6", desc: "Heavy and solid \\u2014 a strong foundation" },\n    beam: { name: "Beam", w: 5, h: 1, wt: 4, cost: 35, color: "#e0875a", desc: "Light span to bridge gaps" },\n    plank: { name: "Plank", w: 7, h: 1, wt: 7, cost: 50, color: "#d9c25a", desc: "Wide platform" },\n    flag: { name: "Flag", w: 1, h: 1, wt: 0.5, cost: 0, color: "#ff4d6d", desc: "Only via the FLAG command", special: true }\n  };\n  var GRID_W = 24;\n  var MAX_BRACES = 3;\n  var TREMOR = 0.08;\n\n  // src/tower.js\n  function colTops(blocks) {\n    const tops = new Array(GRID_W).fill(0);\n    for (const b of blocks) for (let c = b.x; c < b.x + b.w; c++) tops[c] = Math.max(tops[c], b.y + b.h);\n    return tops;\n  }\n  function dropY(blocks, x, w) {\n    const tops = colTops(blocks);\n    let y = 0;\n    for (let c = x; c < x + w; c++) y = Math.max(y, tops[c]);\n    return y;\n  }\n  function supportersOf(blocks, b) {\n    if (b.y === 0) return [];\n    return blocks.filter((o) => o !== b && o.y + o.h === b.y && o.x < b.x + b.w && o.x + o.w > b.x);\n  }\n  function supportSpan(blocks, b) {\n    if (b.y === 0) return [b.x, b.x + b.w];\n    let L = Infinity, R = -Infinity;\n    for (const o of supportersOf(blocks, b)) {\n      L = Math.min(L, Math.max(o.x, b.x));\n      R = Math.max(R, Math.min(o.x + o.w, b.x + b.w));\n    }\n    return L === Infinity ? null : [L, R];\n  }\n  function aboveSets(blocks) {\n    const restsOn = blocks.map((b) => supportersOf(blocks, b).map((o) => blocks.indexOf(o)));\n    const children = blocks.map(() => []);\n    restsOn.forEach((sup, i) => sup.forEach((j) => children[j].push(i)));\n    return blocks.map((_, i) => {\n      const seen = /* @__PURE__ */ new Set(), st = [...children[i]];\n      while (st.length) {\n        const k = st.pop();\n        if (!seen.has(k)) {\n          seen.add(k);\n          st.push(...children[k]);\n        }\n      }\n      return seen;\n    });\n  }\n  function analyse(blocks) {\n    const above = aboveSets(blocks);\n    const sup = blocks.map((b) => supportersOf(blocks, b).map((o) => blocks.indexOf(o)));\n    const incoming = blocks.map(() => []);\n    const order = blocks.map((_, i) => i).sort((a, b) => blocks[b].y - blocks[a].y);\n    const res = new Array(blocks.length);\n    for (const i of order) {\n      const b = blocks[i];\n      let W = b.wt, X = b.wt * (b.x + b.w / 2), Y = b.wt * (b.y + b.h / 2);\n      for (const l of incoming[i]) {\n        W += l.w;\n        X += l.w * l.x;\n        Y += l.w * l.y;\n      }\n      const cx = X / W, cy = Y / W;\n      const span = supportSpan(blocks, b);\n      const margin = span ? Math.min(cx - span[0], span[1] - cx) : -1;\n      res[i] = { i, margin, lever: Math.max(0.5, cy - b.y), above: above[i] };\n      const ss = sup[i];\n      if (ss.length === 1) incoming[ss[0]].push({ w: W, x: cx, y: cy });\n      else if (ss.length > 1) {\n        const parts = ss.map((j) => {\n          const o = blocks[j];\n          const a = Math.max(o.x, b.x), c = Math.min(o.x + o.w, b.x + b.w);\n          return { j, a, c, len: c - a };\n        });\n        const tot = parts.reduce((s, p) => s + p.len, 0);\n        for (const p of parts) incoming[p.j].push({ w: W * p.len / tot, x: Math.min(p.c - 0.01, Math.max(p.a + 0.01, (p.a + p.c) / 2)), y: cy });\n      }\n    }\n    return res;\n  }\n  function staticOk(blocks) {\n    return analyse(blocks).every((a) => a.margin >= -1e-9);\n  }\n  function makeBlock(blocks, mat, x) {\n    const m = MATERIALS[mat];\n    x = Math.max(0, Math.min(GRID_W - m.w, Math.round(x)));\n    return { m: mat, x, y: dropY(blocks, x, m.w), w: m.w, h: m.h, wt: m.wt };\n  }\n  function towerHeight(blocks) {\n    let h = 0;\n    for (const b of blocks) if (b.m !== "flag") h = Math.max(h, b.y + b.h);\n    return h;\n  }\n  function tremor(blocks, braces = 0, intensity = 1) {\n    let cur = blocks.slice(), removed = 0;\n    const s = TREMOR * intensity * (1 - 0.15 * Math.min(braces, MAX_BRACES));\n    for (let guard = 0; guard < 50; guard++) {\n      const an = analyse(cur);\n      const fails = an.filter((a) => a.margin < s * a.lever).sort((a, b) => cur[a.i].y - cur[b.i].y);\n      if (!fails.length) break;\n      const f = fails[0];\n      const kill = /* @__PURE__ */ new Set([f.i, ...f.above]);\n      removed += kill.size;\n      cur = cur.filter((_, k) => !kill.has(k));\n    }\n    return { blocks: cur, removed };\n  }\n  function stabilityScore(blocks, braces = 0) {\n    const real = blocks.filter((b) => b.m !== "flag");\n    if (!real.length) return 0;\n    const an = analyse(blocks).filter((a) => blocks[a.i].m !== "flag");\n    const sf = an.map((a) => Math.max(0, Math.min(2, a.margin / (TREMOR * a.lever))) / 2);\n    const min = Math.min(...sf), avg = sf.reduce((x, y) => x + y, 0) / sf.length;\n    return Math.round(Math.min(15, 12 * (0.5 * min + 0.5 * avg) + Math.min(braces, MAX_BRACES)) * 10) / 10;\n  }\n  function topRemovableIndex(blocks) {\n    const an = analyse(blocks);\n    let best = -1;\n    an.forEach((a, i) => {\n      if (a.above.size === 0 && (best < 0 || blocks[i].y + blocks[i].h >= blocks[best].y + blocks[best].h)) best = i;\n    });\n    return best;\n  }\n  return __toCommonJS(tower_exports);\n})();\n' }, "/judge.html": { "type": "text/html; charset=utf-8", "body": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Judge \u2014 The Leadership Hackathon</title>
<link rel="stylesheet" href="/css/style.css">
<style>
  .app { max-width: 920px; margin: 0 auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }
  header { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r); flex-wrap: wrap; }
  .grow { flex: 1; }
  .tcard { padding: 18px; border-radius: 16px; background: var(--panel); border: 1px solid var(--line); }
  .tcard.live { border-color: var(--gold); box-shadow: 0 0 30px rgba(255,201,71,.2); }
  .tcard h3 { margin: 0; font-size: 20px; } .case { color: var(--muted); margin: 4px 0 10px; }
  .sheet { font-size: 13.5px; line-height: 1.45; background: #0a0e28; border-radius: 10px; padding: 10px 12px; border: 1px solid var(--line); margin-bottom: 12px; }
  .sheet b { color: var(--gold); font-weight: 700; }
  .rub { display: grid; grid-template-columns: 1fr auto; gap: 10px 14px; align-items: center; }
  .rub input[type=range] { width: 100%; accent-color: #ffc947; padding: 0; }
  .rub .v { font-family: var(--mono); font-size: 18px; font-weight: 700; width: 34px; text-align: right; color: var(--gold); }
  .tot { font-family: var(--mono); font-size: 22px; font-weight: 700; }
  details summary { cursor: pointer; color: var(--muted); font-size: 13px; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="app">
  <header><div class="brand"><span class="logo">L</span>JUDGE PANEL</div><span class="pill" id="stage">\u2014</span><div class="grow"></div><b id="jname"></b><button class="btn sm ghost" id="logout">\u238B</button></header>
  <div class="muted" style="font-size:13.5px">Score each team's Round 1 pitch on 5 criteria (0\u201310 each, total /50). The team currently on stage is highlighted at the top. You can edit a score anytime \u2014 the final Round 1 score is the average of all judges.</div>
  <div id="list"></div>
</div>
<div id="toasts"></div>
<script src="/js/rt.js"></script>
<script src="/js/common.js"></script>
<script>
  const params = new URLSearchParams(location.search);
  let tok = store.get('lh_judge'); let asAdmin = false;
  if (!tok && store.get('lh_admin')) { tok = store.get('lh_admin'); asAdmin = true; }
  if (!tok) location.href = '/';
  const sock = io(); let J = null, pub = null; const drafts = {};
  function auth() { sock.emit('auth', { role: 'judge', token: tok }, (r) => { if (!r.ok) { store.del('lh_judge'); location.href = '/'; return; } $('#jname').textContent = r.name; J = r.judge; pub = r.pub; render(true); }); }
  sock.on('connect', auth); sock.on('reload', auth); sock.on('kicked', () => { store.del('lh_judge'); location.href = '/'; });
  sock.on('pub', (p) => { pub = p; header(); });
  let lastCur = null;
  sock.on('judge', (j) => { const curChanged = j.current !== lastCur; J = j; render(curChanged); });
  $('#logout').addEventListener('click', () => { store.del('lh_judge'); location.href = '/'; });
  function header() { if (!pub) return; const si = STAGE_INFO[pub.stage]; $('#stage').textContent = si.label; $('#stage').className = 'pill ' + si.pill; }
  function render(full) {
    header();
    lastCur = J.current;
    const teams = [...J.teams].sort((a, b) => (b.id === J.current) - (a.id === J.current));
    if (!full && $('#list').children.length === teams.length) { // update badges only
      teams.forEach((t) => { const el = $(\`[data-t="\${t.id}"] .st\`); if (el) el.innerHTML = status(t); });
      return;
    }
    $('#list').innerHTML = teams.map((t) => {
      const d = drafts[t.id] || t.mine || {};
      const s = t.sheet || {};
      return \`<div class="tcard \${t.id === J.current ? 'live' : ''}" data-t="\${t.id}" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><h3>\${t.id === J.current ? '\u{1F3A4} ' : ''}\${esc(t.name)}</h3><div class="case">\${esc(t.caseTitle || '')}</div></div><div class="st" style="text-align:right">\${status(t)}</div></div>
        <details \${t.id === J.current ? 'open' : ''}><summary>Case & their solving sheet</summary><div class="sheet"><div style="margin-bottom:6px">\${esc(t.caseText || '')}</div>
          <div><b>Problem:</b> \${esc(s.problem || '\u2014')}</div><div><b>Options:</b> \${[s.opt1, s.opt2, s.opt3].filter(Boolean).map(esc).join(' \xB7 ') || '\u2014'}</div>
          <div><b>Decision:</b> \${esc(s.decision || '\u2014')}</div><div><b>Plan:</b> \${[s.plan1, s.plan2, s.plan3].filter(Boolean).map(esc).join(' \u2192 ') || '\u2014'}</div><div><b>Qualities:</b> \${(s.qualities || []).map(esc).join(', ') || '\u2014'}</div></div></details>
        <div class="rub">\${J.rubric.map((r) => \`<div><div style="font-weight:600;font-size:14px">\${esc(r.label)}</div><input type="range" min="0" max="10" step="1" data-c="\${r.key}" value="\${d[r.key] ?? 5}"></div><span class="v" data-v="\${r.key}">\${d[r.key] ?? 5}</span>\`).join('')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><span class="tot">Total <span data-tot>0</span>/50</span><button class="btn gold" data-save>\${t.mine ? 'Update score' : 'Submit score'}</button></div></div>\`;
    }).join('') || '<div class="empty">No teams yet.</div>';
    $$('.tcard').forEach((card) => {
      const id = card.dataset.t;
      const recalc = () => { let s = 0; $$('[data-c]', card).forEach((i) => { s += Number(i.value); $(\`[data-v="\${i.dataset.c}"]\`, card).textContent = i.value; }); $('[data-tot]', card).textContent = s; drafts[id] = Object.fromEntries($$('[data-c]', card).map((i) => [i.dataset.c, Number(i.value)])); };
      $$('[data-c]', card).forEach((i) => i.addEventListener('input', recalc)); recalc();
      $('[data-save]', card).addEventListener('click', () => sock.emit('judge:score', { id, scores: drafts[id] }, (r) => toast(r.ok ? r.msg : r.error, r.ok ? 'ok' : 'error')));
    });
  }
  function status(t) { return \`\${t.pitchSec != null ? \`<span class="tag \${t.pitchSec > (pub?.r1.pitchSec || 60) + (pub?.r1.graceSec || 0) ? 'bad' : 'ok'}">PITCHED \${t.pitchSec}s</span>\` : '<span class="tag">NOT YET</span>'}<div style="margin-top:6px">\${t.mine ? \`<span class="tag gold">YOUR SCORE \${t.mine.total}</span>\` : ''}</div>\`; }
</script>
</body>
</html>
` }, "/screen.html": { "type": "text/html; charset=utf-8", "body": '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Big Screen \u2014 The Leadership Hackathon</title>\n<link rel="stylesheet" href="/css/style.css">\n<style>\n  html { font-size: clamp(11px, .85vw, 22px); }\n  body { overflow: hidden; height: 100vh; }\n  .scr { height: 100vh; display: grid; grid-template-rows: auto 1fr auto; gap: 1rem; padding: 1.2rem 1.5rem 1rem; }\n  header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1.5rem; }\n  .ev { display: flex; align-items: center; gap: .9rem; font-family: var(--display); font-weight: 800; font-size: 1.7rem; }\n  .ev .logo { width: 2.8rem; height: 2.8rem; font-size: 1.3rem; border-radius: .8rem; }\n  .ev small { display: block; font-size: .8rem; color: var(--muted); letter-spacing: .14em; font-weight: 700; }\n  .mid { text-align: center; } .mid .rn { font-family: var(--display); font-size: 2.3rem; font-weight: 800; line-height: 1.1; } .mid .pill { font-size: .85rem; }\n  .right { display: flex; justify-content: flex-end; }\n  .timer { font-family: var(--mono); font-size: 4.6rem; font-weight: 700; line-height: 1; padding: .3rem 1.2rem; border-radius: 1rem; background: var(--panel); border: 1px solid var(--line2); min-width: 14rem; text-align: center; }\n  .timer.warn { color: var(--gold); border-color: rgba(255,201,71,.5); } .timer.crit { color: var(--red); border-color: var(--red); animation: blink 1s infinite; }\n  @keyframes blink { 50% { opacity: .5; } }\n  main { min-height: 0; position: relative; }\n  .center { height: 100%; display: grid; place-items: center; text-align: center; }\n  h1.huge { font-size: 4.6rem; margin: 0; line-height: 1.05; }\n  .sub { font-size: 1.6rem; color: var(--muted); margin-top: .6rem; }\n  .joinurl { margin: 2rem auto 1rem; font-family: var(--mono); font-size: 3.2rem; font-weight: 700; color: var(--gold); padding: 1rem 2.2rem; border: 2px dashed rgba(255,201,71,.5); border-radius: 1.2rem; display: inline-block; }\n  .chips { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; max-width: 80vw; margin: 1.4rem auto 0; }\n  .chip { padding: .5rem 1.1rem; border-radius: 999px; background: var(--panel2); border: 1px solid var(--line2); font-weight: 700; font-size: 1.15rem; }\n  .rounds { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; margin-top: 2.4rem; text-align: left; }\n  .rounds div { padding: 1.3rem; border-radius: 1.2rem; background: var(--panel); border: 1px solid var(--line); }\n  .rounds b { font-family: var(--display); font-size: 1.5rem; display: block; margin: .3rem 0; } .rounds span { color: var(--gold); font-weight: 800; letter-spacing: .12em; font-size: .9rem; } .rounds p { margin: 0; color: var(--muted); font-size: 1.05rem; line-height: 1.4; }\n  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 1rem; align-content: start; height: 100%; overflow: hidden; }\n  .card { padding: 1.1rem 1.2rem; border-radius: 1.1rem; background: linear-gradient(160deg, #1b2360, #10163a); border: 1px solid var(--line2); }\n  .card .tn { font-family: var(--display); font-weight: 800; font-size: 1.35rem; } .card .ct { color: var(--gold); font-weight: 700; font-size: 1.15rem; margin-top: .3rem; }\n  .card.flip { animation: flip .8s cubic-bezier(.2,.8,.2,1) both; }\n  @keyframes flip { from { transform: perspective(900px) rotateY(90deg); opacity: 0; } to { transform: none; opacity: 1; } }\n  .prog { height: .55rem; background: #080c22; border-radius: 1rem; overflow: hidden; margin-top: .8rem; } .prog > div { height: 100%; background: linear-gradient(90deg, var(--violet), var(--teal)); transition: width .6s; }\n  /* pitch spotlight */\n  .spot { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.4rem; height: 100%; }\n  .spot .l { padding: 2rem 2.2rem; border-radius: 1.6rem; background: linear-gradient(160deg, #1d2566, #10163a); border: 1px solid rgba(255,201,71,.35); display: flex; flex-direction: column; gap: 1rem; overflow: hidden; }\n  .spot .team { font-family: var(--display); font-size: 3.6rem; font-weight: 800; line-height: 1; }\n  .spot .case { font-size: 1.35rem; color: #dbe0ff; line-height: 1.45; } .spot .case b { color: var(--gold); }\n  .cue { padding: 1rem 1.2rem; border-radius: 1rem; background: rgba(8,12,34,.7); border: 1px solid var(--line2); font-size: 1.3rem; line-height: 1.4; }\n  .cue .k { font-size: .85rem; font-weight: 800; letter-spacing: .12em; color: var(--violet); margin-bottom: .3rem; }\n  .ring { position: relative; width: 26rem; height: 26rem; margin: 0 auto; }\n  .ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }\n  .ring .t { position: absolute; inset: 0; display: grid; place-items: center; font-family: var(--mono); font-size: 6rem; font-weight: 700; }\n  .queue { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; margin-top: 1.2rem; }\n  .queue span { padding: .35rem .8rem; border-radius: 999px; font-size: .95rem; font-weight: 700; background: var(--panel2); border: 1px solid var(--line2); color: var(--muted); }\n  .queue span.done { color: var(--teal); border-color: rgba(42,209,176,.4); } .queue span.now { background: var(--gold); color: #1b1300; border-color: var(--gold); }\n  /* towers */\n  .towers { height: 100%; display: grid; gap: .8rem; }\n  .tw { background: linear-gradient(180deg, #0f1540, #0a0f2a); border: 1px solid var(--line); border-radius: 1rem; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }\n  .tw canvas { flex: 1; width: 100%; min-height: 0; }\n  .tw .h { display: flex; justify-content: space-between; padding: .5rem .8rem; font-weight: 800; font-size: 1.05rem; }\n  .tw .h .m { font-family: var(--mono); color: var(--gold); }\n  .tw .f { display: flex; justify-content: space-between; padding: .3rem .8rem .6rem; font-size: .85rem; color: var(--muted); font-family: var(--mono); }\n  .tw.top { border-color: var(--gold); box-shadow: 0 0 30px rgba(255,201,71,.2); }\n  #cmdOv { position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: min(76rem, 96%); z-index: 20; padding: 1.2rem 1.8rem; border-radius: 1.2rem; background: linear-gradient(90deg, #5a0f24, #8f1736); border: 3px solid #ff6680; box-shadow: 0 0 80px rgba(255,77,109,.45); display: grid; grid-template-columns: 1fr auto; gap: 1.5rem; align-items: center; }\n  #cmdOv .t { font-family: var(--display); font-size: 2.4rem; font-weight: 800; } #cmdOv .x { font-size: 1.4rem; margin-top: .3rem; } #cmdOv .cd { font-family: var(--mono); font-size: 4rem; font-weight: 700; text-align: right; } #cmdOv .cnt { font-size: 1.1rem; text-align: right; }\n  #cmdOv.enter { animation: drop .5s cubic-bezier(.2,.8,.2,1); } @keyframes drop { from { transform: translate(-50%, -120%); } }\n  /* race */\n  .race { height: 100%; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }\n  .lane { display: grid; grid-template-columns: 3rem 16rem 1fr 10rem; gap: 1rem; align-items: center; padding: .55rem 1rem; border-radius: .9rem; background: var(--panel); border: 1px solid var(--line); }\n  .lane .rk { font-family: var(--mono); font-size: 1.5rem; font-weight: 800; color: var(--muted); } .lane .nm { font-family: var(--display); font-weight: 800; font-size: 1.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n  .locks { display: grid; grid-template-columns: repeat(10, 1fr); gap: .4rem; }\n  .locks i { height: 2.1rem; border-radius: .5rem; background: #141b45; border: 1px solid var(--line); display: grid; place-items: center; font-style: normal; font-size: 1.1rem; transition: background .4s; }\n  .locks i.o { background: linear-gradient(180deg, #2ad1b0, #149a80); border-color: #4ae6c6; } .locks i.c { border-color: var(--gold); box-shadow: 0 0 14px rgba(255,201,71,.45); } .locks i.v { border-style: dashed; }\n  .lane.win { border-color: var(--gold); background: linear-gradient(90deg, rgba(255,201,71,.18), var(--panel)); } .lane.dq { opacity: .45; }\n  .lane .st { text-align: right; font-weight: 800; font-size: 1.05rem; }\n  /* tables */\n  .bigtable { width: 100%; border-collapse: separate; border-spacing: 0 .45rem; }\n  .bigtable th { background: transparent; font-size: .9rem; padding: .3rem 1rem; position: static; } .bigtable td { background: var(--panel); padding: .75rem 1rem; font-size: 1.35rem; border: 0; }\n  .bigtable td:first-child { border-radius: .8rem 0 0 .8rem; font-family: var(--mono); font-weight: 800; color: var(--gold); } .bigtable td:last-child { border-radius: 0 .8rem .8rem 0; }\n  .bigtable tr.p1 td { background: #2a2a4a; box-shadow: inset 0 1px 0 rgba(255,201,71,.5), inset 0 -1px 0 rgba(255,201,71,.5); }\n  .podium { display: flex; align-items: flex-end; justify-content: center; gap: 1.6rem; margin-top: 2rem; }\n  .pod { width: 18rem; border-radius: 1.2rem 1.2rem 0 0; padding: 1.4rem 1rem; background: var(--panel2); border: 1px solid var(--line2); border-bottom: 0; display: flex; flex-direction: column; align-items: center; gap: .3rem; }\n  .pod .md { font-size: 3.2rem; } .pod .n { font-family: var(--display); font-size: 1.7rem; font-weight: 800; text-align: center; } .pod .w { font-family: var(--mono); font-size: 1.4rem; font-weight: 700; color: var(--gold); }\n  .pod.p1 { height: 22rem; border-color: var(--gold); background: linear-gradient(180deg, rgba(255,201,71,.25), var(--panel2)); } .pod.p2 { height: 17rem; } .pod.p3 { height: 14rem; }\n  #boardOv, #annOv { position: fixed; inset: 0; z-index: 60; background: rgba(5,7,20,.9); backdrop-filter: blur(6px); display: grid; place-items: center; }\n  #boardOv .in { width: min(90rem, 92vw); }\n  #annOv .in { font-family: var(--display); font-size: 4rem; font-weight: 800; text-align: center; max-width: 80vw; color: var(--gold); }\n  .feedline { height: 2.6rem; overflow: hidden; background: var(--panel); border: 1px solid var(--line); border-radius: .8rem; display: flex; align-items: center; padding: 0 1rem; gap: .8rem; font-size: 1.1rem; }\n  .feedline .lbl { font-weight: 800; letter-spacing: .12em; font-size: .8rem; color: var(--gold); white-space: nowrap; }\n  .feedline .txt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; animation: tin .4s; }\n  .confetti { position: fixed; top: -20px; width: 10px; height: 16px; z-index: 70; animation: fall linear forwards; } @keyframes fall { to { transform: translateY(110vh) rotate(720deg); } }\n  #login { position: fixed; inset: 0; display: grid; place-items: center; z-index: 99; background: var(--bg); }\n  #login form { width: 360px; background: var(--panel); border: 1px solid var(--line2); border-radius: 16px; padding: 26px; display: flex; flex-direction: column; gap: 12px; font-size: 15px; }\n  .fs { position: fixed; right: .8rem; bottom: 4rem; opacity: .2; z-index: 80; } .fs:hover { opacity: 1; }\n</style>\n</head>\n<body>\n<div id="login" class="hidden"><form id="lf"><div class="brand"><span class="logo">L</span>BIG-SCREEN DISPLAY</div><label class="f">Admin password<input id="pw" type="password" autofocus></label><button class="btn gold lg">Open display</button></form></div>\n<div class="scr">\n  <header><div class="ev"><span class="logo">L</span><div><span id="ev">THE LEADERSHIP HACKATHON</span><small>LEAD \xB7 BUILD \xB7 ESCAPE</small></div></div>\n    <div class="mid"><span class="pill" id="pill">\u2014</span><div class="rn" id="rn">\u2014</div></div>\n    <div class="right"><div class="timer hidden" id="timer">--:--</div></div></header>\n  <main id="main"></main>\n  <div class="feedline"><span class="lbl">LIVE</span><span class="txt" id="feed">Welcome to The Leadership Hackathon</span></div>\n</div>\n<div id="boardOv" class="hidden"><div class="in"><h1 class="huge" style="text-align:center;font-size:3rem;margin-bottom:1rem">\u{1F3C6} Leaderboard</h1><table class="bigtable"><thead><tr><th>#</th><th>Team</th><th style="text-align:right">R1</th><th style="text-align:right">R2</th><th style="text-align:right">R3</th><th style="text-align:right">Total</th></tr></thead><tbody id="boardT"></tbody></table></div></div>\n<div id="annOv" class="hidden"><div class="in" id="annTxt"></div></div>\n<button class="btn sm fs" id="fsBtn">\u26F6 Full screen</button>\n<script src="/js/rt.js"></script>\n<script src="/js/common.js"></script>\n<script src="/js/screen.js"></script>\n</body>\n</html>\n' }, "/team.html": { "type": "text/html; charset=utf-8", "body": '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Team \u2014 The Leadership Hackathon</title>\n<link rel="stylesheet" href="/css/style.css">\n<style>\n  .app { max-width: 1320px; margin: 0 auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }\n  header { display: flex; align-items: center; gap: 14px; padding: 10px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r); flex-wrap: wrap; }\n  header .grow { flex: 1; min-width: 120px; }\n  .timer { font-family: var(--mono); font-size: 28px; font-weight: 700; padding: 2px 12px; border-radius: 10px; background: #080c22; border: 1px solid var(--line2); }\n  .timer.warn { color: var(--gold); } .timer.crit { color: var(--red); animation: blink 1s infinite; }\n  @keyframes blink { 50% { opacity: .45; } }\n  .tname { text-align: right; line-height: 1.2; } .tname b { font-family: var(--display); font-size: 16px; }\n  .hero { padding: 28px; border-radius: 20px; background: linear-gradient(135deg, rgba(139,108,255,.18), rgba(42,209,176,.08)); border: 1px solid var(--line2); }\n  .hero h2 { margin: 0 0 6px; font-size: 28px; }\n  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }\n  .rcard { padding: 18px; border-radius: 16px; background: var(--panel); border: 1px solid var(--line); }\n  .rcard .n { font-family: var(--display); font-size: 13px; font-weight: 800; color: var(--gold); letter-spacing: .1em; }\n  .rcard h3 { margin: 6px 0; }\n  .two { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.4fr); gap: 12px; align-items: start; }\n  .casecard { padding: 26px; border-radius: 20px; background: linear-gradient(160deg, #1b2360, #10163a); border: 1px solid rgba(255,201,71,.35); box-shadow: 0 20px 60px rgba(0,0,0,.35); }\n  .two > div:first-child { position: sticky; top: 12px; }\n  .casecard .no { font-family: var(--mono); color: var(--gold); font-size: 13px; font-weight: 700; letter-spacing: .1em; }\n  .casecard h2 { margin: 8px 0 12px; font-size: 30px; line-height: 1.1; }\n  .casecard p { font-size: 17px; line-height: 1.55; color: #dfe3ff; margin: 0; }\n  .flip { animation: flip .9s cubic-bezier(.2,.8,.2,1); }\n  @keyframes flip { from { transform: perspective(800px) rotateY(90deg); opacity: 0; } to { transform: none; opacity: 1; } }\n  .sheet { display: flex; flex-direction: column; gap: 14px; }\n  .sheet .sec { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; }\n  .sheet .sec h4 { margin: 0 0 8px; font-size: 13.5px; letter-spacing: .02em; display: flex; gap: 8px; align-items: center; }\n  .sheet .sec h4 i { font-style: normal; display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; background: var(--violet-bg); color: var(--violet); font-size: 12px; }\n  .sheet .row3 { display: grid; gap: 8px; }\n  .qual { display: flex; flex-wrap: wrap; gap: 6px; }\n  .qual label { display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border-radius: 999px; border: 1px solid var(--line2); cursor: pointer; font-size: 13px; font-weight: 600; user-select: none; }\n  .qual input { width: auto; }\n  .qual label.on { background: var(--violet-bg); border-color: var(--violet); color: #d7ccff; }\n  .prog { height: 8px; background: #080c22; border-radius: 8px; overflow: hidden; border: 1px solid var(--line); }\n  .prog > div { height: 100%; background: linear-gradient(90deg, var(--violet), var(--teal)); transition: width .4s; }\n  .saved { font-size: 12px; color: var(--teal); }\n  .spot { text-align: center; padding: 36px 24px; }\n  .bigtime { font-family: var(--mono); font-size: 84px; font-weight: 700; line-height: 1; }\n  /* round 2 */\n  .r2 { display: grid; grid-template-columns: 230px minmax(0, 1fr) 300px; gap: 12px; align-items: start; }\n  .mat { display: grid; grid-template-columns: 30px 1fr auto; gap: 10px; align-items: center; padding: 10px; border-radius: 12px; border: 1px solid var(--line); background: #0b1030; cursor: pointer; margin-bottom: 8px; }\n  .mat.on { border-color: var(--gold); background: var(--gold-bg); }\n  .mat .sw { width: 30px; border-radius: 4px; }\n  .mat b { display: block; font-size: 14px; } .mat small { color: var(--muted); font-size: 11.5px; line-height: 1.25; display: block; }\n  .mat .cost { font-family: var(--mono); font-weight: 700; color: var(--gold); }\n  #tower { width: 100%; height: min(62vh, 560px); display: block; cursor: crosshair; touch-action: none; border-radius: 12px; background: linear-gradient(180deg, #0d1336, #0a0f2a); }\n  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }\n  .kpi { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 8px 12px; } .kpi .k { font-size: 11px; color: var(--muted); font-weight: 800; letter-spacing: .07em; text-transform: uppercase; } .kpi .v { font-family: var(--mono); font-size: 20px; font-weight: 700; }\n  .cmdbar { border-radius: 14px; padding: 14px 16px; background: linear-gradient(90deg, #4a0d1e, #7a1430); border: 2px solid #ff6680; box-shadow: 0 0 40px rgba(255,77,109,.3); }\n  .cmdbar.ok { background: linear-gradient(90deg, #083a30, #0d5444); border-color: var(--teal); box-shadow: 0 0 30px rgba(42,209,176,.25); }\n  .cmdbar.fail { background: #2a1023; border-color: #883046; box-shadow: none; }\n  .cmdbar .t { font-family: var(--display); font-weight: 800; font-size: 20px; letter-spacing: .02em; }\n  .cmdbar .cd { font-family: var(--mono); font-weight: 700; font-size: 26px; float: right; }\n  .loglist { font-size: 12.5px; color: var(--muted); max-height: 200px; overflow: auto; }\n  .loglist div { padding: 5px 0; border-bottom: 1px solid rgba(35,44,94,.6); }\n  /* round 3 */\n  .r3 { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 12px; align-items: start; }\n  .locks { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }\n  .lock { aspect-ratio: 1; border-radius: 12px; display: grid; place-items: center; background: #0b1030; border: 1px solid var(--line); font-size: 20px; position: relative; }\n  .lock.open { background: var(--teal-bg); border-color: rgba(42,209,176,.6); }\n  .lock.cur { border-color: var(--gold); box-shadow: 0 0 18px rgba(255,201,71,.35); }\n  .lock.final { border-style: dashed; }\n  .lock small { position: absolute; bottom: 3px; font-size: 10px; color: var(--dim); font-family: var(--mono); }\n  .vault { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }\n  .vault span { width: 34px; height: 42px; display: grid; place-items: center; border-radius: 8px; font-family: var(--mono); font-size: 20px; font-weight: 700; background: var(--gold-bg); border: 1px solid rgba(255,201,71,.5); color: var(--gold); }\n  .vault span.empty { background: #0b1030; border: 1px dashed var(--line2); color: var(--dim); }\n  .puzzle { padding: 24px; border-radius: 20px; background: linear-gradient(160deg, #1a2160, #10163a); border: 1px solid var(--line2); position: relative; }\n  .puzzle .k { font-family: var(--mono); font-size: 12.5px; color: var(--gold); font-weight: 700; letter-spacing: .12em; }\n  .puzzle h2 { margin: 6px 0 10px; font-size: 26px; }\n  .puzzle .story { color: #d7dcff; font-size: 16px; line-height: 1.5; }\n  .puzzle .lines { margin: 14px 0; padding: 14px 16px; border-radius: 12px; background: #0a0e28; border: 1px solid var(--line); font-size: 15.5px; line-height: 1.6; }\n  .puzzle .lines div + div { margin-top: 6px; }\n  .fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin: 16px 0; }\n  .fields .wide { grid-column: 1 / -1; }\n  .opts { display: flex; flex-direction: column; gap: 8px; }\n  .opts label { display: flex; gap: 10px; align-items: center; padding: 11px 14px; border-radius: 10px; border: 1px solid var(--line2); cursor: pointer; font-weight: 600; color: var(--text); font-size: 14.5px; }\n  .opts label.on { border-color: var(--gold); background: var(--gold-bg); }\n  .opts input { width: auto; }\n  .order li { display: flex; gap: 8px; align-items: center; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line2); background: #0b1030; margin-bottom: 8px; font-size: 14.5px; color: var(--text); font-weight: 500; }\n  .order li .n { font-family: var(--mono); color: var(--gold); font-weight: 700; width: 18px; }\n  .order li .t { flex: 1; } .order { list-style: none; padding: 0; margin: 0; }\n  .cool { position: absolute; inset: 0; border-radius: 20px; background: rgba(40,8,20,.82); display: grid; place-items: center; text-align: center; backdrop-filter: blur(2px); }\n  .cool .big { font-family: var(--mono); font-size: 56px; font-weight: 700; color: var(--red); }\n  .hintbox { margin-top: 10px; padding: 12px 14px; border-radius: 12px; background: var(--gold-bg); border: 1px solid rgba(255,201,71,.4); color: #ffe7a6; }\n  .result { text-align: center; padding: 40px 20px; }\n  .result .big { font-family: var(--display); font-size: 64px; font-weight: 800; }\n  #newsFlash { position: fixed; left: 50%; top: 80px; transform: translateX(-50%); z-index: 120; width: min(680px, 94vw); }\n  .mobile-only { display: none; }\n  @media (max-width: 1080px) {\n    .two, .r2, .r3 { grid-template-columns: 1fr; }\n    .two > div:first-child { position: static; }\n    .grid3 { grid-template-columns: 1fr; }\n    #tower { height: 52vh; }\n  }\n  @media (max-width: 1080px) {\n    .r2 > div:nth-child(2) { order: -2; } .r2 > div:nth-child(1) { order: -1; }\n    .r2 #cmd { display: none; } .mobile-only { display: block !important; }\n    #mats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } #mats .mat { margin: 0; grid-template-columns: 22px 1fr auto; padding: 8px; } #mats .mat small { display: none; } #mats .mat .sw { width: 22px; }\n    #mats #braceBtn, #mats > div.muted { grid-column: 1 / -1; }\n  }\n  @media (max-width: 560px) { .kpis { grid-template-columns: repeat(2, 1fr); } .timer { font-size: 22px; } .bigtime { font-size: 64px; } .hero { padding: 20px; } .casecard h2 { font-size: 24px; } }\n</style>\n</head>\n<body>\n<div class="app">\n  <header>\n    <div class="brand"><span class="logo">L</span><span id="ev" style="font-size:14px">THE LEADERSHIP HACKATHON</span></div>\n    <span class="pill" id="stage">\u2014</span>\n    <div class="grow"></div>\n    <div class="timer hidden" id="timer">--:--</div>\n    <button class="btn sm ghost" id="scoresBtn">\u{1F3C6} Scores</button>\n    <div class="tname"><b id="tname">\u2014</b><div class="muted mono" style="font-size:12px" id="tscore"></div></div>\n    <button class="btn sm ghost" id="logout" title="Leave">\u238B</button>\n  </header>\n  <div id="cmdTop"></div>\n  <main id="view"></main>\n</div>\n<div id="toasts"></div>\n<script src="/js/rt.js"></script>\n<script src="/js/common.js"></script>\n<script src="/js/tower-lib.js"></script>\n<script src="/js/team.js"></script>\n</body>\n</html>\n' } };

// data/cases.js
var cases_default = [
  { id: 1, set: "school", title: "Canteen Chaos", text: "School canteen prices are rising. As student council leaders, propose a win-win for students and the canteen vendor." },
  { id: 2, set: "school", title: "Lost & Found Startup", text: "A student wants to start a 'Lost & Found' locker system in school for a fee. Should it be allowed? If yes, how should it operate?" },
  { id: 3, set: "school", title: "Toxic Teammate", text: "One team member bullies others but delivers great results. What leadership action do you take as project lead?" },
  { id: 4, set: "school", title: "Fest Budget Blowout", text: "Your school fest committee has overspent. What would you cut, retain, or justify to the principal?" },
  { id: 5, set: "school", title: "The 100 Rupee Investment", text: "You're given \u20B9100 per student to run a business at the school fest. Propose an idea that earns profit and engages peers." },
  { id: 6, set: "school", title: "Cheat Sheet Scandal", text: "A class is caught using cheat sheets in an internal exam. You're the class rep. How do you lead the response?" },
  { id: 7, set: "school", title: "Eco Bag Dilemma", text: "Your school sells eco-friendly bags, but they are more expensive than plastic. How do you increase adoption without forcing students?" },
  { id: 8, set: "school", title: "Peer Pressure Project", text: "Some top students refuse to work with weaker ones in group projects. Design a new, fair team allocation system." },
  { id: 9, set: "school", title: "Class Magazine Revival", text: "The annual class magazine is outdated and boring. How do you revamp it to make it cool and financially viable?" },
  { id: 10, set: "school", title: "Tech vs Chalk", text: "The school debates whether to replace all notebooks with tablets. You lead the student side. What's your stand and why?" },
  { id: 11, set: "school", title: "T-shirt Controversy", text: "A popular house team designed its own T-shirts without permission. Should they be penalised or appreciated?" },
  { id: 12, set: "school", title: "Mental Health Week", text: "You propose a Mental Health Week in school. Convince management and propose 3 unique events on a tight budget." },
  { id: 13, set: "school", title: "The Free-Period Utilisation", text: "You get 3 extra free periods per week. Propose a student-led, value-building initiative." },
  { id: 14, set: "school", title: "Cultural Fest Clash", text: "Two school clubs want to host events on the same day. How do you mediate and create synergy?" },
  { id: 15, set: "school", title: "Digital Detox Day", text: "Some parents propose banning phones in school completely. What leadership solution balances freedom and discipline?" },
  { id: 16, set: "school", title: "Classroom Mini-Business", text: "You want to start a mini thrift exchange in school (books, stationery). Propose how to run it and ensure transparency." },
  { id: 17, set: "school", title: "Social Media Crisis", text: "A meme page starts mocking teachers anonymously. How would you, as a student leader, address this fairly?" },
  { id: 18, set: "school", title: "School Bus Protest", text: "Transport fees have increased sharply. Students plan a protest. You're the bridge between students and the school. What's your role?" },
  { id: 19, set: "school", title: "Inclusivity in Sports", text: "Only select students make it to inter-school teams. Design a system that balances merit with mass participation." },
  { id: 20, set: "school", title: "Commerce Fair Leadership", text: "You're in charge of hosting a Commerce-themed fair. Pick a theme and three key stalls/events to engage the school and parents." },
  { id: 21, set: "advanced", title: "Startup vs Studies", text: "A student runs a hoodie startup earning \u20B950,000/month but skips classes. Teachers want strict action. What do you recommend?" },
  { id: 22, set: "advanced", title: "IPL Fever vs Board Exams", text: "Attendance drops during IPL. Students are distracted, but a ban may hurt morale. How do you lead through it?" },
  { id: 23, set: "advanced", title: "AI Homework Crisis", text: "Students use AI tools for assignments. Teachers worry learning is declining. Propose a fair AI policy." },
  { id: 24, set: "advanced", title: "Influencer in School", text: "A student influencer shoots brand reels on campus without permission. How should the school respond?" },
  { id: 25, set: "advanced", title: "Paid Notes Marketplace", text: "Toppers have started selling their notes to classmates. Allow it, ban it, or redesign it?" },
  { id: 26, set: "advanced", title: "Fest Sponsorship Deal", text: "A caf\xE9 offers \u20B950,000 sponsorship for the fest \u2014 with heavy branding demands. Do you accept? On what terms?" },
  { id: 27, set: "advanced", title: "Coaching vs School Conflict", text: "Students skip school for coaching classes, affecting attendance. How do you balance both?" },
  { id: 28, set: "advanced", title: "WhatsApp Rumour Panic", text: "A fake exam-postponement rumour spreads on WhatsApp. How do you contain it and rebuild trust?" },
  { id: 29, set: "advanced", title: "Elite Club Formation", text: "Some students want an invite-only entrepreneurship club. Approve it, reject it, or reshape it?" },
  { id: 30, set: "advanced", title: "Free vs Paid Events", text: "Free events lack seriousness; paid events may reduce participation. Design the right model." },
  { id: 31, set: "advanced", title: "Sustainability vs Cost", text: "Solar panels need a high upfront cost but bring long-term savings. Make the case \u2014 and the funding plan." },
  { id: 32, set: "advanced", title: "Inter-School Rivalry Escalation", text: "A sports rivalry with another school turns toxic on social media. How do you de-escalate?" },
  { id: 33, set: "advanced", title: "Attendance Manipulation", text: "Students are faking attendance through proxies. How do you fix the system and the culture?" },
  { id: 34, set: "advanced", title: "Gaming Addiction", text: "Rising esports interest is affecting academics. Can you channel it instead of banning it?" },
  { id: 35, set: "advanced", title: "Teacher Popularity Gap", text: "Some teachers are loved, others openly criticised. How do you build constructive student feedback?" },
  { id: 36, set: "advanced", title: "Luxury vs Equality", text: "Students flaunting expensive gadgets is creating peer pressure. What do you propose?" },
  { id: 37, set: "advanced", title: "Scholarship Allocation", text: "One scholarship, two claims: merit vs financial need. Design a fair allocation policy." },
  { id: 38, set: "advanced", title: "Event Overload", text: "Too many events are causing student and teacher burnout. What stays, what goes, and how do you decide?" },
  { id: 39, set: "advanced", title: "Student Council Power Misuse", text: "Some council leaders are misusing their authority. As council head, what do you do?" },
  { id: 40, set: "advanced", title: "Parent vs Student Aspirations", text: "Career conflicts between parents and students are rising. Design a school initiative to bridge the gap." },
  { id: 41, set: "advanced", title: "Ahmedabad Heatwave Policy", text: "Extreme heat is disrupting school schedules. Propose a heatwave policy that keeps learning on track." },
  { id: 42, set: "advanced", title: "Food Quality Complaints", text: "Canteen food quality drops under a contract vendor. How do you resolve it without a boycott?" },
  { id: 43, set: "advanced", title: "Internship Opportunity", text: "A startup offers students unpaid internships. Should the school promote them? With what safeguards?" },
  { id: 44, set: "advanced", title: "Language Divide", text: "Fluent English speakers dominate leadership roles. How do you make leadership more inclusive?" },
  { id: 45, set: "advanced", title: "Groupism in Class", text: "Students are forming exclusive groups, leaving others isolated. What do you do as class leader?" },
  { id: 46, set: "advanced", title: "Digital Notes vs Physical Books", text: "Students are shifting to PDFs over textbooks. What should the school policy be?" },
  { id: 47, set: "advanced", title: "Festival Celebration Budget", text: "Navratri celebrations need high spending. How do you plan a grand but responsible celebration?" },
  { id: 48, set: "advanced", title: "Late Submission Culture", text: "Late submissions are becoming normal. Flexibility vs discipline \u2014 what policy do you propose?" },
  { id: 49, set: "advanced", title: "Peer Tutoring System", text: "Toppers feel exploited while tutoring others. Redesign peer tutoring so everyone benefits." },
  { id: 50, set: "advanced", title: "School Brand Positioning", text: "Build the plan to position your school as 'India's most future-ready school'." }
];

// data/puzzles.js
var norm = (s) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
var hasAll = (s, stems) => {
  const n = norm(s);
  return stems.every((st) => Array.isArray(st) ? st.some((x) => n.includes(x)) : n.includes(st));
};
var STYLES = ["Autocratic", "Democratic", "Situational", "Laissez-faire", "Transformational", "Servant"];
var GRID_OPTS = ["1", "5", "9"];
var puzzles_default = [
  {
    id: 1,
    icon: "\u{1F50D}",
    title: "Leadership Quote Cipher",
    story: "A famous leader left a message for future changemakers \u2014 but every word has been flipped.",
    lines: ["\u201CeB eht egnahc uoy hsiw ot ees ni eht dlrow\u201D", "Decode the quote AND name the leader who said it."],
    fields: [
      { key: "quote", type: "text", label: "Decoded quote", placeholder: "Type the full quote" },
      { key: "leader", type: "text", label: "Leader", placeholder: "Who said it?" }
    ],
    hint: "Read each word backwards. The leader guided India's non-violent freedom movement.",
    frag: "R",
    check: (a) => norm(a.quote) === "be the change you wish to see in the world" && norm(a.leader).includes("gandhi")
  },
  {
    id: 2,
    icon: "\u{1F9E9}",
    title: "Business Acronym Decoder",
    story: "Every great leader speaks the language of strategy. Expand all four acronyms.",
    lines: ["All four must be correct to unlock."],
    fields: [
      { key: "kpi", type: "text", label: "KPI \u2014 a performance metric" },
      { key: "swot", type: "text", label: "SWOT \u2014 strategic planning" },
      { key: "dei", type: "text", label: "DEI \u2014 an inclusion priority" },
      { key: "okr", type: "text", label: "OKR \u2014 a goal-setting method" }
    ],
    hint: "SWOT has two internal and two external factors. OKR pairs an ambition with measurable outcomes.",
    frag: "I",
    check: (a) => hasAll(a.kpi, ["key", "perform", "indicat"]) && hasAll(a.swot, ["strength", "weakness", "opportunit", "threat"]) && hasAll(a.dei, ["divers", "equit", "inclus"]) && hasAll(a.okr, ["objective", "key", "result"])
  },
  {
    id: 3,
    icon: "\u{1F30D}",
    title: "Decode the VUCA",
    story: "The modern world is described as VUCA. Leaders who understand VUCA can navigate uncertainty.",
    lines: ["Decode each letter of the acronym."],
    fields: [
      { key: "v", type: "text", label: "V =" },
      { key: "u", type: "text", label: "U =" },
      { key: "c", type: "text", label: "C =" },
      { key: "a", type: "text", label: "A =" }
    ],
    hint: "Think: things change fast, the future is unclear, many parts interact, and meaning is unclear.",
    frag: "O",
    check: (a) => hasAll(a.v, ["volatil"]) && hasAll(a.u, ["uncertain"]) && hasAll(a.c, ["complex"]) && hasAll(a.a, ["ambigu"])
  },
  {
    id: 4,
    icon: "\u{1F4CA}",
    title: "The Leadership Grid",
    story: "A leader balances concern for PEOPLE and concern for RESULTS (Blake\u2013Mouton grid, 1 = low, 9 = high).",
    lines: ["Give each style its People and Results score.", "Hint from the kit: one style scores (9,1), another (1,9). The best leader scores (9,9)."],
    fields: [
      { key: "cc_p", type: "select", label: "Country Club Manager \u2014 People", options: GRID_OPTS },
      { key: "cc_r", type: "select", label: "Country Club Manager \u2014 Results", options: GRID_OPTS },
      { key: "tl_p", type: "select", label: "Team Leader \u2014 People", options: GRID_OPTS },
      { key: "tl_r", type: "select", label: "Team Leader \u2014 Results", options: GRID_OPTS },
      { key: "im_p", type: "select", label: "Impoverished Manager \u2014 People", options: GRID_OPTS },
      { key: "im_r", type: "select", label: "Impoverished Manager \u2014 Results", options: GRID_OPTS },
      { key: "ao_p", type: "select", label: "Authority-Obedience Manager \u2014 People", options: GRID_OPTS },
      { key: "ao_r", type: "select", label: "Authority-Obedience Manager \u2014 Results", options: GRID_OPTS },
      { key: "mr_p", type: "select", label: "Middle-of-the-Road Manager \u2014 People", options: GRID_OPTS },
      { key: "mr_r", type: "select", label: "Middle-of-the-Road Manager \u2014 Results", options: GRID_OPTS }
    ],
    hint: 'A "country club" is all comfort, no output. "Authority-obedience" is all output, no care. "Middle of the road" is a compromise.',
    frag: "S",
    cooldownMult: 2,
    check: (a) => a.cc_p === "9" && a.cc_r === "1" && a.tl_p === "9" && a.tl_r === "9" && a.im_p === "1" && a.im_r === "1" && a.ao_p === "1" && a.ao_r === "9" && a.mr_p === "5" && a.mr_r === "5"
  },
  {
    id: 5,
    icon: "\u{1F50E}",
    title: "Spot the Leadership Style",
    story: "Read each scenario and identify the leadership style being demonstrated.",
    lines: [
      "A: \u201CThe captain sets the vision and makes all final decisions, expecting the team to follow without question.\u201D",
      "B: \u201CThe manager asks each team member for input, holds a vote, and goes with the majority.\u201D",
      "C: \u201CThe leader assigns tasks based on individual strengths and mentors each person differently.\u201D",
      "D: \u201CThe CEO steps back entirely and lets the team self-organise with no oversight.\u201D"
    ],
    fields: ["A", "B", "C", "D"].map((k) => ({ key: k, type: "select", label: `Scenario ${k}`, options: STYLES })),
    hint: "Two of the six options are distractors. Who decides alone? Who votes? Who adapts? Who disappears?",
    frag: "A",
    cooldownMult: 2,
    check: (a) => a.A === "Autocratic" && a.B === "Democratic" && a.C === "Situational" && a.D === "Laissez-faire"
  },
  {
    id: 6,
    icon: "\u2696\uFE0F",
    title: "Ethical Maze",
    story: "You're the CEO of a mid-size company. Revenue is dangerously low and staff layoffs are imminent.",
    lines: ["A vendor privately offers you a secret personal bonus of \u20B910 lakh if you extend their contract for another 3 years \u2014 no questions asked.", "What do you do?"],
    fields: [
      { key: "choice", type: "mcq", label: "Your decision", options: ["A. Accept the bonus and use it to prevent layoffs", "B. Reject the offer and report it to the ethics board", "C. Delay the decision and search for alternative funding"] },
      { key: "why", type: "textarea", label: "Justify in one or two lines (shown to the moderator)", optional: true }
    ],
    hint: "A secret personal payment tied to a contract is a bribe. Delaying keeps the offer alive.",
    frag: "Y",
    cooldownMult: 4,
    check: (a) => String(a.choice || "").startsWith("B")
  },
  {
    id: 7,
    icon: "\u{1F4B0}",
    title: "Resource Allocation Crunch",
    story: "You're the student council treasurer with a budget of \u20B925,000 for Leadership Week.",
    lines: [
      "Fund AS MANY events as possible, and use the budget as fully as possible \u2014 the total must not exceed \u20B925,000.",
      "A. Guest Speaker Session \u2014 \u20B912,000",
      "B. Leadership Escape Room \u2014 \u20B95,000",
      "C. Debate Competition \u2014 \u20B98,000",
      "D. Team-Building Outdoor Activity \u2014 \u20B910,000",
      "E. Social Media Campaign + Certificates \u2014 \u20B96,000"
    ],
    fields: [{ key: "events", type: "multi", label: "Select the events you will fund", options: ["A", "B", "C", "D", "E"] }],
    hint: "First find the largest number of events that can fit. Then, among those combinations, the one that spends the most.",
    frag: "N",
    cooldownMult: 3,
    check: (a) => {
      const s = [...a.events || []].sort().join("");
      return s === "ABC";
    }
  },
  {
    id: 8,
    icon: "\u{1F4E2}",
    title: "Crisis Communication",
    story: "BREAKING: Your school's Annual Day has been cancelled 2 days before the date due to heavy rain and waterlogging in Ahmedabad.",
    lines: [
      "As student body president, arrange these 5 sentences into an announcement that:",
      "\u2460 acknowledges disappointment \u2192 \u2461 explains the reason \u2192 \u2462 shows empathy for those who prepared \u2192 \u2463 proposes a new date \u2192 \u2464 ends with a motivating call to action."
    ],
    fields: [{
      key: "order",
      type: "order",
      label: "Arrange top to bottom",
      options: [
        "To every performer, volunteer and teacher who rehearsed for weeks \u2014 your effort has not gone to waste.",
        "Keep rehearsing, keep the energy high, and let's make the new date our best show yet!",
        "We know how much everyone was looking forward to Annual Day this Saturday, and we share your disappointment.",
        "Annual Day will now be held on Saturday, 21st December, with every performance retained.",
        "Due to heavy rain and waterlogging across the city, the campus is not safe for an event of this size."
      ]
    }],
    hint: "Start with feelings, then facts. Thank people before you announce the new plan. End with energy.",
    frag: "V",
    cooldownMult: 2,
    check: (a) => Array.isArray(a.order) && a.order.join(",") === "2,4,0,3,1"
  },
  {
    id: 9,
    icon: "\u{1F510}",
    title: "The Principal's Lockbox",
    story: "The principal's lockbox has a 3-digit code. Your team found these notes from the last person who tried:",
    lines: [
      "6 8 2 \u2014 one digit is right and in its right place",
      "6 1 4 \u2014 one digit is right but in the wrong place",
      "2 0 6 \u2014 two digits are right but both in the wrong place",
      "7 3 8 \u2014 nothing is right",
      "7 8 0 \u2014 one digit is right but in the wrong place"
    ],
    fields: [{ key: "code", type: "text", label: "3-digit code", placeholder: "_ _ _", inputmode: "numeric", maxlength: 3 }],
    hint: 'Start with "nothing is right" \u2014 that eliminates 7, 3 and 8. Then 6 8 2 tells you something about 6 or 2.',
    frag: "I",
    check: (a) => String(a.code || "").replace(/\D/g, "") === "042"
  },
  {
    id: 10,
    icon: "\u{1F3DB}\uFE0F",
    title: "The Master Vault",
    final: true,
    story: "Every lock you opened gave you a vault letter. Together, they spell the quality every great leader shares.",
    lines: ["Unscramble your 9 vault letters into ONE word: a leader who can see the future before others do.", "\u26A0\uFE0F ONE ATTEMPT ONLY. A wrong answer disqualifies your team from this round."],
    fields: [{ key: "word", type: "text", label: "Master key", placeholder: "9-letter word" }],
    hint: "It starts with V.",
    frag: "",
    check: (a) => norm(a.word).replace(/ /g, "") === "visionary"
  }
];

// data/tower.js
var MATERIALS = {
  pillar: { name: "Pillar", w: 1, h: 4, wt: 3, cost: 60, color: "#c9a36b", desc: "Tall and thin \u2014 great height, poor balance" },
  cube: { name: "Cube", w: 2, h: 2, wt: 4, cost: 40, color: "#5fb3a1", desc: "Compact all-rounder" },
  block: { name: "Block", w: 3, h: 2, wt: 10, cost: 45, color: "#8f7ad6", desc: "Heavy and solid \u2014 a strong foundation" },
  beam: { name: "Beam", w: 5, h: 1, wt: 4, cost: 35, color: "#e0875a", desc: "Light span to bridge gaps" },
  plank: { name: "Plank", w: 7, h: 1, wt: 7, cost: 50, color: "#d9c25a", desc: "Wide platform" },
  flag: { name: "Flag", w: 1, h: 1, wt: 0.5, cost: 0, color: "#ff4d6d", desc: "Only via the FLAG command", special: true }
};
var GRID_W = 24;
var BRACE_COST = 60;
var MAX_BRACES = 3;
var TREMOR = 0.08;
var COMMANDS = [
  { type: "freeze", kind: "restraint", window: 30, title: "HANDS OFF!", text: "Freeze! No building of any kind for 30 seconds." },
  { type: "supply", kind: "restraint", window: 60, title: "SUPPLY CUT", text: "Pillar supply is cut. Do NOT place any Pillars for 60 seconds." },
  { type: "light", kind: "restraint", window: 60, title: "WEIGHT LIMIT", text: "Crane overload! Only Beams and Planks may be placed for 60 seconds." },
  { type: "center", kind: "restraint", window: 50, title: "CENTRE LINE", text: "Inspector on site: every block placed in the next 50 seconds must be centred on the middle line (\xB11 column)." },
  { type: "flag", kind: "action", window: 45, title: "PLANT THE FLAG", text: "Sponsor visit! Plant a flag on top of your tower within 45 seconds." },
  { type: "demolish", kind: "action", window: 45, title: "SAFETY INSPECTION", text: "Your top block failed inspection. Remove it within 45 seconds." },
  { type: "ack", kind: "action", window: 25, title: "ROLL CALL", text: "Captain's roll call! Press ACKNOWLEDGE within 25 seconds." },
  { type: "donate", kind: "action", window: 45, title: "RELIEF FUND", text: "A nearby site needs help. Donate 50 coins within 45 seconds." },
  { type: "brace", kind: "action", window: 50, title: "REINFORCE", text: "High winds forecast. Install the FREE safety brace within 50 seconds." }
];

// src/tower.js
function colTops(blocks) {
  const tops = new Array(GRID_W).fill(0);
  for (const b of blocks) for (let c = b.x; c < b.x + b.w; c++) tops[c] = Math.max(tops[c], b.y + b.h);
  return tops;
}
function dropY(blocks, x, w) {
  const tops = colTops(blocks);
  let y = 0;
  for (let c = x; c < x + w; c++) y = Math.max(y, tops[c]);
  return y;
}
function supportersOf(blocks, b) {
  if (b.y === 0) return [];
  return blocks.filter((o) => o !== b && o.y + o.h === b.y && o.x < b.x + b.w && o.x + o.w > b.x);
}
function supportSpan(blocks, b) {
  if (b.y === 0) return [b.x, b.x + b.w];
  let L = Infinity, R = -Infinity;
  for (const o of supportersOf(blocks, b)) {
    L = Math.min(L, Math.max(o.x, b.x));
    R = Math.max(R, Math.min(o.x + o.w, b.x + b.w));
  }
  return L === Infinity ? null : [L, R];
}
function aboveSets(blocks) {
  const restsOn = blocks.map((b) => supportersOf(blocks, b).map((o) => blocks.indexOf(o)));
  const children = blocks.map(() => []);
  restsOn.forEach((sup, i) => sup.forEach((j) => children[j].push(i)));
  return blocks.map((_, i) => {
    const seen = /* @__PURE__ */ new Set(), st = [...children[i]];
    while (st.length) {
      const k = st.pop();
      if (!seen.has(k)) {
        seen.add(k);
        st.push(...children[k]);
      }
    }
    return seen;
  });
}
function analyse(blocks) {
  const above = aboveSets(blocks);
  const sup = blocks.map((b) => supportersOf(blocks, b).map((o) => blocks.indexOf(o)));
  const incoming = blocks.map(() => []);
  const order = blocks.map((_, i) => i).sort((a, b) => blocks[b].y - blocks[a].y);
  const res = new Array(blocks.length);
  for (const i of order) {
    const b = blocks[i];
    let W = b.wt, X = b.wt * (b.x + b.w / 2), Y = b.wt * (b.y + b.h / 2);
    for (const l of incoming[i]) {
      W += l.w;
      X += l.w * l.x;
      Y += l.w * l.y;
    }
    const cx = X / W, cy = Y / W;
    const span = supportSpan(blocks, b);
    const margin = span ? Math.min(cx - span[0], span[1] - cx) : -1;
    res[i] = { i, margin, lever: Math.max(0.5, cy - b.y), above: above[i] };
    const ss = sup[i];
    if (ss.length === 1) incoming[ss[0]].push({ w: W, x: cx, y: cy });
    else if (ss.length > 1) {
      const parts = ss.map((j) => {
        const o = blocks[j];
        const a = Math.max(o.x, b.x), c = Math.min(o.x + o.w, b.x + b.w);
        return { j, a, c, len: c - a };
      });
      const tot = parts.reduce((s, p) => s + p.len, 0);
      for (const p of parts) incoming[p.j].push({ w: W * p.len / tot, x: Math.min(p.c - 0.01, Math.max(p.a + 0.01, (p.a + p.c) / 2)), y: cy });
    }
  }
  return res;
}
function staticOk(blocks) {
  return analyse(blocks).every((a) => a.margin >= -1e-9);
}
function makeBlock(blocks, mat, x) {
  const m = MATERIALS[mat];
  x = Math.max(0, Math.min(GRID_W - m.w, Math.round(x)));
  return { m: mat, x, y: dropY(blocks, x, m.w), w: m.w, h: m.h, wt: m.wt };
}
function towerHeight(blocks) {
  let h = 0;
  for (const b of blocks) if (b.m !== "flag") h = Math.max(h, b.y + b.h);
  return h;
}
function tremor(blocks, braces = 0, intensity = 1) {
  let cur = blocks.slice(), removed = 0;
  const s = TREMOR * intensity * (1 - 0.15 * Math.min(braces, MAX_BRACES));
  for (let guard = 0; guard < 50; guard++) {
    const an = analyse(cur);
    const fails = an.filter((a) => a.margin < s * a.lever).sort((a, b) => cur[a.i].y - cur[b.i].y);
    if (!fails.length) break;
    const f = fails[0];
    const kill = /* @__PURE__ */ new Set([f.i, ...f.above]);
    removed += kill.size;
    cur = cur.filter((_, k) => !kill.has(k));
  }
  return { blocks: cur, removed };
}
function stabilityScore(blocks, braces = 0) {
  const real = blocks.filter((b) => b.m !== "flag");
  if (!real.length) return 0;
  const an = analyse(blocks).filter((a) => blocks[a.i].m !== "flag");
  const sf = an.map((a) => Math.max(0, Math.min(2, a.margin / (TREMOR * a.lever))) / 2);
  const min = Math.min(...sf), avg = sf.reduce((x, y) => x + y, 0) / sf.length;
  return Math.round(Math.min(15, 12 * (0.5 * min + 0.5 * avg) + Math.min(braces, MAX_BRACES)) * 10) / 10;
}
function topRemovableIndex(blocks) {
  const an = analyse(blocks);
  let best = -1;
  an.forEach((a, i) => {
    if (a.above.size === 0 && (best < 0 || blocks[i].y + blocks[i].h >= blocks[best].y + blocks[best].h)) best = i;
  });
  return best;
}

// src/engine.js
var STAGES = ["lobby", "r1-draw", "r1-prep", "r1-pitch", "r1-done", "r2-ready", "r2-build", "r2-done", "r3-ready", "r3-live", "r3-done", "final"];
var TIMED = { "r1-prep": "r1PrepMin", "r2-build": "r2BuildMin", "r3-live": "r3Min" };
var AUTO_NEXT = { "r1-prep": "r1-pitch", "r2-build": "r2-done", "r3-live": "r3-done" };
var DEFAULT_CONFIG = {
  eventName: "The Leadership Hackathon",
  r1CasePool: "all",
  // school | advanced | all
  r1PrepMin: 10,
  r1PitchSec: 60,
  r1GraceSec: 10,
  r1OvertimePenalty: 5,
  r2BuildMin: 15,
  r2Budget: 1e3,
  r2CmdMinSec: 60,
  r2CmdMaxSec: 120,
  r2FinalTremor: true,
  r3Min: 30,
  r3CooldownSec: 15,
  r3HintAfterMin: 4,
  r3Points: [50, 40, 30],
  r3OtherPoints: 20,
  showScoresToTeams: true
};
var RUBRIC = [
  { key: "c1", label: "Problem understanding" },
  { key: "c2", label: "Options & creativity" },
  { key: "c3", label: "Decision & reasoning" },
  { key: "c4", label: "Action plan feasibility" },
  { key: "c5", label: "Pitch delivery" }
];
var SHEET_FIELDS = ["summary", "problem", "opt1", "opt2", "opt3", "decision", "plan1", "plan2", "plan3", "qualities", "explain"];
var QUALITIES = ["Teamwork", "Communication", "Empathy", "Courage", "Creativity", "Problem-Solving", "Conflict Resolution"];
var r1 = (n) => Math.round(n * 10) / 10;
var uid = (n = 12) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");
var randInt = (n) => crypto.getRandomValues(new Uint32Array(1))[0] % n;
var shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
var rand = (lo, hi) => lo + randInt(Math.max(1, hi - lo + 1));
var GameError = class extends Error {
};
var fail = (m) => {
  throw new GameError(m);
};
function freshR1() {
  return { order: [], current: null, pitchElapsed: 0, pitchRunning: false };
}
function freshR2() {
  return { nextCmdAt: null, active: null, history: [], deck: [], seq: 0, tremors: 0, final: null };
}
function freshR3() {
  return { finishOrder: [] };
}
function freshState(config, adminTokens) {
  return {
    config: Object.assign({}, DEFAULT_CONFIG, config || {}),
    stage: "lobby",
    paused: false,
    clock: { elapsed: 0, duration: 0 },
    teams: {},
    judges: {},
    adminTokens: adminTokens || [],
    r1: freshR1(),
    r2: freshR2(),
    r3: freshR3(),
    showBoard: false,
    announce: null
  };
}
function teamR1() {
  return { caseId: null, sheet: { qualities: [] }, scores: {}, peer: {}, pitchSec: null };
}
function teamR2(budget) {
  return { blocks: [], coins: budget, braces: 0, cmd: {}, log: [], spent: 0, toppled: 0, lost: 0 };
}
function teamR3() {
  return { level: 0, frags: [], cooldownUntil: 0, attempts: 0, wrong: 0, solvedAt: [], startedAt: 0, finishedAt: null, rank: null, dq: false, hints: {}, lastAnswers: {} };
}
function createGame({ adminPassword = "admin123", saved = null, persist = () => {
}, lanUrls = () => [], hub, pauseOnLoad = true }) {
  let state = null;
  if (saved) {
    try {
      state = typeof saved === "string" ? JSON.parse(saved) : saved;
      state.config = Object.assign({}, DEFAULT_CONFIG, state.config);
      if (pauseOnLoad && TIMED[state.stage]) state.paused = true;
    } catch (e) {
      console.error("Saved game unreadable \u2014 starting fresh", e);
      state = null;
    }
  }
  if (!state) state = freshState();
  let dirty = true, tickNo = 0;
  const msg = (e, d) => JSON.stringify({ e, d });
  const emitAll = (e, d) => {
    const m = msg(e, d);
    for (const c of hub.clients()) c.sendRaw(m);
  };
  const emitRoom = (room, e, d) => {
    const m = msg(e, d);
    for (const c of hub.clients()) if (c.rooms.has(room)) c.sendRaw(m);
  };
  const emitRooms = (rooms, e, d) => {
    const m = msg(e, d);
    for (const c of hub.clients()) if (rooms.some((r) => c.rooms.has(r))) c.sendRaw(m);
  };
  const emitOne = (c, e, d) => c.sendRaw(msg(e, d));
  const notice = (text, type = "info", big = false, room = null) => room ? emitRoom(room, "notice", { text, type, big }) : emitAll("notice", { text, type, big });
  const feed = (text, kind = "info") => emitRooms(["screen", "admin"], "feed", { text, kind, t: Date.now() });
  function save(force) {
    if (!dirty && !force) return;
    dirty = false;
    try {
      persist(JSON.stringify(state));
    } catch (e) {
      console.error("save failed", e);
    }
  }
  const teams = () => Object.values(state.teams);
  const cfg = () => state.config;
  const caseById = (id) => cases_default.find((c) => c.id === id);
  function genCode(prefix = "") {
    const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let c;
    const taken = /* @__PURE__ */ new Set([...teams().map((t) => t.code), ...Object.values(state.judges).map((j) => j.code)]);
    do {
      c = prefix + Array.from({ length: 5 - prefix.length }, () => A[randInt(A.length)]).join("");
    } while (taken.has(c));
    return c;
  }
  function addTeam(name) {
    name = String(name || "").trim().replace(/\s+/g, " ").slice(0, 28);
    if (!name) fail("Team name required");
    if (teams().some((t2) => t2.name.toLowerCase() === name.toLowerCase())) fail(`Team "${name}" already exists`);
    const t = { id: uid(6), name, code: genCode(), token: uid(16), r1: teamR1(), r2: teamR2(cfg().r2Budget), r3: teamR3() };
    state.teams[t.id] = t;
    if (state.stage !== "lobby" && STAGES.indexOf(state.stage) >= STAGES.indexOf("r1-draw")) assignCase(t);
    dirty = true;
    return t;
  }
  function kick(pred) {
    for (const c of [...hub.clients()]) if (pred(c)) {
      emitOne(c, "kicked");
      c.close();
    }
  }
  function casePool() {
    const p = cfg().r1CasePool;
    return cases_default.filter((c) => p === "all" || c.set === p);
  }
  function assignCase(t, avoid = /* @__PURE__ */ new Set()) {
    const used = new Set(teams().map((x) => x.r1.caseId).filter(Boolean));
    let pool = casePool().filter((c) => !used.has(c.id) && !avoid.has(c.id));
    if (!pool.length) pool = casePool().filter((c) => c.id !== t.r1.caseId);
    t.r1.caseId = pool[randInt(pool.length)].id;
    t.r1.sheet = { qualities: [] };
  }
  function drawAll() {
    for (const t of teams()) t.r1.caseId = null;
    for (const t of shuffle(teams())) assignCase(t);
  }
  function sheetProgress(t) {
    const s = t.r1.sheet;
    const keys = ["summary", "problem", "opt1", "opt2", "opt3", "decision", "plan1", "plan2", "plan3", "explain"];
    const filled = keys.filter((k) => String(s[k] || "").trim().length >= 3).length + ((s.qualities || []).length ? 1 : 0);
    return Math.round(filled / 11 * 100);
  }
  function r1Score(t) {
    const js = Object.values(t.r1.scores);
    if (!js.length) return { score: null, judges: 0, avg: null, penalty: 0 };
    const avg = js.reduce((a, s) => a + s.total, 0) / js.length;
    const over = t.r1.pitchSec != null && t.r1.pitchSec > cfg().r1PitchSec + cfg().r1GraceSec;
    const penalty = over ? cfg().r1OvertimePenalty : 0;
    return { score: r1(Math.max(0, avg - penalty)), judges: js.length, avg: r1(avg), penalty };
  }
  function peerAvg(t) {
    const v = Object.values(t.r1.peer);
    return v.length ? r1(v.reduce((a, b) => a + b, 0) / v.length) : null;
  }
  function issueCommand(type) {
    const def = COMMANDS.find((c) => c.type === type);
    if (!def) fail("Unknown command");
    if (state.r2.active) resolveCommand();
    const id = ++state.r2.seq;
    state.r2.active = { id, type, issuedAt: state.clock.elapsed, endsAt: state.clock.elapsed + def.window };
    state.r2.history.push({ id, type, issuedAt: state.clock.elapsed });
    for (const t of teams()) t.r2.cmd[id] = "pending";
    emitAll("command", { id, type, title: def.title, text: def.text, kind: def.kind, window: def.window });
    feed(`\u{1F4E3} Crisis command: ${def.title}`, "cmd");
    dirty = true;
  }
  function resolveCommand() {
    const a = state.r2.active;
    if (!a) return;
    const def = COMMANDS.find((c) => c.type === a.type);
    let ok = 0;
    for (const t of teams()) {
      if (t.r2.cmd[a.id] === "pending") t.r2.cmd[a.id] = def.kind === "restraint" ? "ok" : "fail";
      if (t.r2.cmd[a.id] === "ok") ok++;
    }
    feed(`\u2714 ${def.title} closed \u2014 ${ok}/${teams().length} teams complied`, "cmd");
    emitAll("commandEnd", { id: a.id });
    state.r2.active = null;
    dirty = true;
  }
  function scheduleNextCommand() {
    const c = cfg();
    state.r2.nextCmdAt = state.clock.elapsed + rand(c.r2CmdMinSec, Math.max(c.r2CmdMinSec, c.r2CmdMaxSec));
  }
  function r2Tick() {
    const a = state.r2.active;
    if (a && state.clock.elapsed >= a.endsAt) resolveCommand();
    if (!state.r2.active && state.r2.nextCmdAt != null && state.clock.elapsed >= state.r2.nextCmdAt && state.clock.duration - state.clock.elapsed > 20) {
      if (!state.r2.deck.length) state.r2.deck = shuffle(COMMANDS.map((c) => c.type));
      issueCommand(state.r2.deck.shift());
      scheduleNextCommand();
    }
  }
  function violate(t, reason) {
    const a = state.r2.active;
    if (!a || t.r2.cmd[a.id] !== "pending") return;
    const def = COMMANDS.find((c) => c.type === a.type);
    if (def.kind !== "restraint") return;
    t.r2.cmd[a.id] = "fail";
    notice(`\u26A0 Command violated: ${def.title} \u2014 ${reason}. Marks deducted.`, "error", true, "team:" + t.id);
    feed(`\u26A0 ${t.name} violated ${def.title}`, "bad");
  }
  function r2Log(t, text) {
    t.r2.log.unshift({ t: state.clock.elapsed, text });
    if (t.r2.log.length > 40) t.r2.log.pop();
  }
  function r2Place(t, { mat, x }) {
    if (state.stage !== "r2-build" || state.paused) fail("Building is closed right now.");
    const m = MATERIALS[mat];
    if (!m || m.special) fail("Unknown material");
    if (t.r2.coins < m.cost) fail(`Not enough coins (need ${m.cost})`);
    const a = state.r2.active;
    if (a && t.r2.cmd[a.id] === "pending") {
      const blk2 = makeBlock(t.r2.blocks, mat, x);
      const centre = blk2.x + blk2.w / 2, mid = GRID_W / 2;
      if (a.type === "freeze") violate(t, "you built during the freeze");
      if (a.type === "supply" && mat === "pillar") violate(t, "you placed a Pillar");
      if (a.type === "light" && !["beam", "plank"].includes(mat)) violate(t, `you placed a ${m.name}`);
      if (a.type === "center" && Math.abs(centre - mid) > 1) violate(t, "block was not on the centre line");
    }
    const blk = makeBlock(t.r2.blocks, mat, x);
    t.r2.coins -= m.cost;
    t.r2.spent += m.cost;
    const next = [...t.r2.blocks, blk];
    dirty = true;
    if (!staticOk(next)) {
      t.r2.toppled++;
      t.r2.lost += m.cost;
      r2Log(t, `\u{1F4A5} ${m.name} toppled off and fell (\u2212${m.cost} coins)`);
      return { ok: true, toppled: true, msg: `\u{1F4A5} The ${m.name} was unbalanced and fell! (\u2212${m.cost} coins)` };
    }
    t.r2.blocks = next;
    r2Log(t, `Placed ${m.name} at column ${blk.x + 1}`);
    return { ok: true, msg: `${m.name} placed (\u2212${m.cost} coins)` };
  }
  function r2Brace(t) {
    if (state.stage !== "r2-build" || state.paused) fail("Building is closed right now.");
    if (t.r2.braces >= MAX_BRACES) fail(`Maximum ${MAX_BRACES} braces`);
    if (t.r2.coins < BRACE_COST) fail(`Not enough coins (need ${BRACE_COST})`);
    const a = state.r2.active;
    if (a && a.type === "freeze") violate(t, "you bought a brace during the freeze");
    t.r2.coins -= BRACE_COST;
    t.r2.spent += BRACE_COST;
    t.r2.braces++;
    r2Log(t, `\u{1F529} Bought a stability brace (\u2212${BRACE_COST})`);
    dirty = true;
    return { ok: true, msg: "Brace installed" };
  }
  function r2Action(t, { type }) {
    if (state.stage !== "r2-build" || state.paused) fail("Building is closed right now.");
    const a = state.r2.active;
    if (!a || a.type !== type) fail("That command is not active");
    if (t.r2.cmd[a.id] !== "pending") fail(t.r2.cmd[a.id] === "ok" ? "Already done \u2714" : "Too late \u2014 command missed");
    switch (type) {
      case "ack":
        break;
      case "donate":
        if (t.r2.coins < 50) fail("Not enough coins to donate");
        t.r2.coins -= 50;
        r2Log(t, "\u{1F91D} Donated 50 coins to the relief fund");
        break;
      case "brace":
        t.r2.braces = Math.min(MAX_BRACES, t.r2.braces + 1);
        r2Log(t, "\u{1F529} Installed the free safety brace");
        break;
      case "flag": {
        const real = t.r2.blocks.filter((b) => b.m !== "flag");
        let x = Math.floor(GRID_W / 2);
        if (real.length) {
          const top = real.reduce((a2, b) => b.y + b.h > a2.y + a2.h ? b : a2);
          x = top.x + Math.floor(top.w / 2);
        }
        const f = { m: "flag", x, y: 0, w: 1, h: 1, wt: MATERIALS.flag.wt };
        f.y = makeBlock(t.r2.blocks, "flag", x).y;
        t.r2.blocks = [...t.r2.blocks, f];
        r2Log(t, "\u{1F6A9} Planted the sponsor flag");
        break;
      }
      case "demolish": {
        const i = topRemovableIndex(t.r2.blocks.filter((b) => b.m !== "flag"));
        if (i >= 0) {
          const real = t.r2.blocks.filter((b) => b.m !== "flag");
          const victim = real[i];
          t.r2.blocks = t.r2.blocks.filter((b) => b !== victim);
          r2Log(t, `\u{1F528} Removed top ${MATERIALS[victim.m].name} for inspection`);
        }
        break;
      }
      default:
        fail("This command needs no action \u2014 just obey it");
    }
    t.r2.cmd[a.id] = "ok";
    dirty = true;
    return { ok: true, msg: "Command complied \u2714" };
  }
  function runTremor(label = "TREMOR") {
    let total = 0;
    for (const t of teams()) {
      const r = tremor(t.r2.blocks, t.r2.braces, 1);
      if (r.removed) {
        t.r2.blocks = r.blocks;
        r2Log(t, `\u{1F30B} ${label}: ${r.removed} block(s) collapsed`);
        total += r.removed;
      }
    }
    state.r2.tremors++;
    emitAll("tremor", { label });
    feed(`\u{1F30B} ${label}! ${total} blocks collapsed across all towers`, "bad");
    dirty = true;
  }
  function r2Scores() {
    const resolved = state.r2.history.filter((h) => !state.r2.active || h.id !== state.r2.active.id);
    const issued = resolved.length;
    const rows = teams().map((t) => {
      const h = towerHeight(t.r2.blocks);
      const okN = resolved.filter((x) => t.r2.cmd[x.id] === "ok").length;
      const failN = resolved.filter((x) => t.r2.cmd[x.id] === "fail").length;
      const cmd = issued ? r1(15 * Math.max(0, issued - failN) / issued) : 15;
      const stabAuto = stabilityScore(t.r2.blocks, t.r2.braces);
      const stab = t.r2.stabOverride != null ? t.r2.stabOverride : stabAuto;
      return { id: t.id, name: t.name, height: h, cmd, okN, failN, stab, stabAuto, override: t.r2.stabOverride != null };
    });
    const tallest = Math.max(0, ...rows.map((r) => r.height));
    for (const r of rows) {
      r.heightScore = tallest ? r1(20 * r.height / tallest) : 0;
      r.realHeight = r1(r.heightScore * r.cmd / 15);
      r.total = r1(r.realHeight + r.cmd + r.stab);
    }
    return { rows, tallest, issued };
  }
  const pubPuzzle = (p) => {
    const { check, frag, ...rest } = p;
    return rest;
  };
  function r3Points(t) {
    if (t.r3.dq || t.r3.finishedAt == null) return 0;
    const pts = cfg().r3Points;
    return t.r3.rank <= pts.length ? pts[t.r3.rank - 1] : cfg().r3OtherPoints;
  }
  function r3Submit(t, answers) {
    if (state.stage !== "r3-live" || state.paused) fail("The escape room is not open right now.");
    const r = t.r3;
    if (r.dq) fail("Your team has been disqualified from this round.");
    if (r.finishedAt != null) fail("You have already escaped! \u{1F389}");
    const now = state.clock.elapsed;
    if (r.cooldownUntil > now) fail(`Cooling down \u2014 try again in ${r.cooldownUntil - now}s`);
    const p = puzzles_default[r.level];
    const a = answers && typeof answers === "object" ? answers : {};
    for (const f of p.fields) if (!f.optional) {
      const v = a[f.key];
      if (v == null || typeof v === "string" && !v.trim() || Array.isArray(v) && !v.length) fail(`Fill in: ${f.label}`);
    }
    r.attempts++;
    r.lastAnswers[p.id] = a;
    dirty = true;
    if (p.check(a)) {
      r.solvedAt.push(now);
      if (p.frag) r.frags.push(p.frag);
      if (p.final) {
        r.finishedAt = now;
        state.r3.finishOrder.push(t.id);
        r.rank = state.r3.finishOrder.length;
        const pts = r3Points(t);
        notice(`\u{1F3C6} ${t.name} ESCAPED! Finished #${r.rank} (+${pts} points)`, "ok", true);
        feed(`\u{1F3C6} ${t.name} escaped \u2014 #${r.rank}`, "good");
        if (teams().every((x) => x.r3.dq || x.r3.finishedAt != null)) setTimeout(() => {
          try {
            if (state.stage === "r3-live") {
              goto("r3-done");
              pushAll();
            }
          } catch {
          }
        }, 1500);
        return { ok: true, correct: true, escaped: true, rank: r.rank, points: pts };
      }
      r.level++;
      r.startedAt = now;
      const first = teams().filter((x) => x.r3.level >= r.level || x.r3.finishedAt != null).length === 1;
      if (first) feed(`\u{1F513} ${t.name} is first to open Lock ${r.level}!`, "good");
      return { ok: true, correct: true, frag: p.frag, msg: `\u{1F513} Lock ${p.id} opened! Vault letter: ${p.frag}` };
    }
    r.wrong++;
    if (p.final) {
      r.dq = true;
      notice(`\u{1F480} ${t.name} entered the wrong master key \u2014 DISQUALIFIED`, "error", true);
      feed(`\u{1F480} ${t.name} disqualified on the Master Vault`, "bad");
      return { ok: true, correct: false, dq: true };
    }
    const cd = Math.round(cfg().r3CooldownSec * (p.cooldownMult || 1));
    r.cooldownUntil = now + cd;
    return { ok: true, correct: false, cooldown: cd, msg: `\u2715 Not quite. Lock jammed for ${cd}s.` };
  }
  function r3Hint(t) {
    if (state.stage !== "r3-live") fail("Escape room is not open");
    const r = t.r3;
    if (r.dq || r.finishedAt != null) fail("No hints needed");
    const wait = cfg().r3HintAfterMin * 60 - (state.clock.elapsed - r.startedAt);
    if (wait > 0) fail(`Hint unlocks in ${Math.ceil(wait / 60)} min`);
    const p = puzzles_default[r.level];
    r.hints[p.id] = true;
    dirty = true;
    feed(`\u{1F4A1} ${t.name} used a hint on Lock ${p.id}`, "info");
    return { ok: true, hint: p.hint };
  }
  function scoreboard() {
    const r2 = r2Scores();
    const rows = teams().map((t) => {
      const s1 = r1Score(t);
      const s2 = r2.rows.find((r) => r.id === t.id);
      const r2done = STAGES.indexOf(state.stage) >= STAGES.indexOf("r2-build");
      const r3started = STAGES.indexOf(state.stage) >= STAGES.indexOf("r3-live");
      const R1 = s1.score ?? 0, R2 = r2done ? s2.total : 0, R3 = r3started ? r3Points(t) : 0;
      return { id: t.id, name: t.name, r1: s1.score, r2: r2done ? s2.total : null, r3: r3started ? R3 : null, total: r1(R1 + R2 + R3) };
    });
    rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    rows.forEach((r, i) => {
      r.rank = i + 1;
    });
    return rows;
  }
  function goto(stage) {
    if (!STAGES.includes(stage)) fail("Unknown stage");
    if (!teams().length && stage !== "lobby") fail("Add teams first");
    const prev = state.stage;
    if (prev === "r2-build" && stage !== "r2-build") {
      if (state.r2.active) resolveCommand();
    }
    state.stage = stage;
    state.paused = false;
    if (TIMED[stage]) state.clock = { elapsed: 0, duration: Math.max(1, Number(cfg()[TIMED[stage]])) * 60 };
    switch (stage) {
      case "r1-draw":
        if (teams().some((t) => !t.r1.caseId)) {
          for (const t of teams()) if (!t.r1.caseId) assignCase(t);
        }
        emitAll("draw");
        break;
      case "r1-prep":
        for (const t of teams()) if (!t.r1.caseId) assignCase(t);
        break;
      case "r1-pitch":
        if (!state.r1.order.length || state.r1.order.some((id) => !state.teams[id]) || teams().some((t) => !state.r1.order.includes(t.id))) state.r1.order = shuffle(teams().map((t) => t.id));
        state.r1.current = null;
        state.r1.pitchRunning = false;
        state.r1.pitchElapsed = 0;
        break;
      case "r2-ready":
        for (const t of teams()) if (!t.r2 || prev === "lobby") t.r2 = teamR2(cfg().r2Budget);
        break;
      case "r2-build":
        if (prev !== "r2-build") {
          for (const t of teams()) t.r2 = teamR2(cfg().r2Budget);
          state.r2 = freshR2();
          scheduleNextCommand();
        }
        break;
      case "r2-done":
        if (prev === "r2-build" && cfg().r2FinalTremor) runTremor("FINAL STABILITY TEST");
        break;
      case "r3-live":
        if (prev !== "r3-live") {
          for (const t of teams()) t.r3 = teamR3();
          state.r3 = freshR3();
        }
        break;
    }
    const labels = { "r1-draw": "ROUND 1 \xB7 Case Pitch \u2014 cases drawn!", "r1-prep": "ROUND 1 \xB7 Prep time starts NOW", "r1-pitch": "ROUND 1 \xB7 Pitch time!", "r2-build": "ROUND 2 \xB7 Tower Under Pressure \u2014 BUILD!", "r2-done": "ROUND 2 \xB7 Building closed", "r3-live": "ROUND 3 \xB7 The Escape Room is OPEN", "r3-done": "ROUND 3 \xB7 Time up!", final: "FINAL RESULTS" };
    if (labels[stage]) notice(labels[stage], "info", true);
    dirty = true;
    save(true);
  }
  function pubPayload() {
    const cur = state.r1.current && state.teams[state.r1.current];
    const cs = cur && caseById(cur.r1.caseId);
    const a = state.r2.active, def = a && COMMANDS.find((c) => c.type === a.type);
    return {
      eventName: cfg().eventName,
      stage: state.stage,
      paused: state.paused,
      clock: TIMED[state.stage] ? { elapsed: state.clock.elapsed, duration: state.clock.duration } : null,
      r1: {
        pitchSec: cfg().r1PitchSec,
        graceSec: cfg().r1GraceSec,
        current: cur ? { id: cur.id, name: cur.name, caseTitle: cs?.title, caseText: cs?.text, caseId: cs?.id, decision: cur.r1.sheet.decision || "", plan: [cur.r1.sheet.plan1, cur.r1.sheet.plan2, cur.r1.sheet.plan3].filter(Boolean), peerAvg: peerAvg(cur), peerN: Object.keys(cur.r1.peer).length } : null,
        pitchElapsed: state.r1.pitchElapsed,
        pitchRunning: state.r1.pitchRunning,
        done: state.r1.order.filter((id) => state.teams[id]?.r1.pitchSec != null).length,
        total: teams().length,
        teams: (state.r1.order.length ? state.r1.order.map((id) => state.teams[id]).filter(Boolean) : teams()).map((t) => ({ id: t.id, name: t.name, caseTitle: caseById(t.r1.caseId)?.title || null, caseId: t.r1.caseId, progress: sheetProgress(t), pitched: t.r1.pitchSec != null, pitchSec: t.r1.pitchSec }))
      },
      r2: { active: a ? { id: a.id, type: a.type, title: def.title, text: def.text, kind: def.kind, left: Math.max(0, a.endsAt - state.clock.elapsed), window: def.window, okN: teams().filter((t) => t.r2.cmd[a.id] === "ok").length, failN: teams().filter((t) => t.r2.cmd[a.id] === "fail").length } : null, issued: state.r2.history.length },
      r3: { race: teams().map((t) => ({ id: t.id, name: t.name, level: t.r3.level, done: t.r3.finishedAt != null, rank: t.r3.rank, dq: t.r3.dq })).sort((x, y) => (x.rank || 99) - (y.rank || 99) || y.level - x.level || x.name.localeCompare(y.name)), total: puzzles_default.length },
      showBoard: state.showBoard,
      announce: state.announce
    };
  }
  function teamPayload(t) {
    const cs = caseById(t.r1.caseId);
    const st = state.stage;
    const r3 = t.r3, p = puzzles_default[r3.level];
    const r2s = STAGES.indexOf(st) >= STAGES.indexOf("r2-build") ? r2Scores().rows.find((r) => r.id === t.id) : null;
    const showScores = cfg().showScoresToTeams;
    const s1 = r1Score(t);
    return {
      id: t.id,
      name: t.name,
      r1: { case: cs || null, sheet: t.r1.sheet, progress: sheetProgress(t), locked: STAGES.indexOf(st) >= STAGES.indexOf("r1-pitch"), pitchSec: t.r1.pitchSec, score: showScores ? s1.score : null, penalty: s1.penalty, judges: s1.judges, peerAvg: peerAvg(t), myRating: state.r1.current ? state.teams[state.r1.current]?.r1.peer[t.id] ?? null : null, order: state.r1.order.indexOf(t.id) + 1 },
      r2: { blocks: t.r2.blocks, coins: t.r2.coins, braces: t.r2.braces, spent: t.r2.spent, toppled: t.r2.toppled, log: t.r2.log.slice(0, 15), myCmd: state.r2.active ? t.r2.cmd[state.r2.active.id] : null, cmdHistory: state.r2.history.map((h) => ({ type: h.type, title: COMMANDS.find((c) => c.type === h.type).title, res: t.r2.cmd[h.id] })), score: showScores ? r2s : null, height: towerHeight(t.r2.blocks) },
      r3: { level: r3.level, frags: r3.frags, cooldown: Math.max(0, r3.cooldownUntil - state.clock.elapsed), finished: r3.finishedAt != null, finishedAt: r3.finishedAt, rank: r3.rank, dq: r3.dq, points: showScores ? r3Points(t) : null, puzzle: st === "r3-live" && !r3.dq && r3.finishedAt == null ? pubPuzzle(p) : null, hint: p && r3.hints[p.id] ? p.hint : null, hintIn: Math.max(0, cfg().r3HintAfterMin * 60 - (state.clock.elapsed - r3.startedAt)), wrong: r3.wrong, total: puzzles_default.length }
    };
  }
  function towersPayload() {
    const sc = r2Scores();
    return teams().map((t) => ({ id: t.id, name: t.name, blocks: t.r2.blocks, braces: t.r2.braces, coins: t.r2.coins, height: towerHeight(t.r2.blocks), score: sc.rows.find((r) => r.id === t.id) }));
  }
  function adminPayload() {
    const online = {};
    for (const c of hub.clients()) if (c.data.teamId) online[c.data.teamId] = (online[c.data.teamId] || 0) + 1;
    return {
      config: cfg(),
      stage: state.stage,
      paused: state.paused,
      clock: state.clock,
      stages: STAGES,
      showBoard: state.showBoard,
      teams: teams().map((t) => {
        const cs = caseById(t.r1.caseId), s1 = r1Score(t);
        return {
          id: t.id,
          name: t.name,
          code: t.code,
          online: online[t.id] || 0,
          r1: { caseId: t.r1.caseId, caseTitle: cs?.title, progress: sheetProgress(t), pitchSec: t.r1.pitchSec, ...s1, peerAvg: peerAvg(t), byJudge: Object.fromEntries(Object.entries(t.r1.scores).map(([k, v]) => [k, v.total])) },
          r2: { coins: t.r2.coins, braces: t.r2.braces, blocks: t.r2.blocks.length, toppled: t.r2.toppled, stabOverride: t.r2.stabOverride ?? null },
          r3: { level: t.r3.level, wrong: t.r3.wrong, dq: t.r3.dq, rank: t.r3.rank, finishedAt: t.r3.finishedAt, hints: Object.keys(t.r3.hints).length, points: r3Points(t), cooldown: Math.max(0, t.r3.cooldownUntil - state.clock.elapsed) }
        };
      }),
      judges: Object.values(state.judges).map((j) => ({ id: j.id, name: j.name, code: j.code, online: [...hub.clients()].some((c) => c.data.judgeId === j.id) })),
      r1: { order: state.r1.order, current: state.r1.current, pitchElapsed: state.r1.pitchElapsed, pitchRunning: state.r1.pitchRunning },
      r2: { active: state.r2.active, history: state.r2.history.map((h) => ({ ...h, title: COMMANDS.find((c) => c.type === h.type).title, ok: teams().filter((t) => t.r2.cmd[h.id] === "ok").length })), nextCmdIn: state.r2.nextCmdAt != null ? state.r2.nextCmdAt - state.clock.elapsed : null, scores: r2Scores() },
      commands: COMMANDS.map((c) => ({ type: c.type, title: c.title, text: c.text })),
      cases: cases_default.map((c) => ({ id: c.id, title: c.title, set: c.set })),
      puzzles: puzzles_default.map((p) => ({ id: p.id, title: p.title })),
      rubric: RUBRIC,
      lanUrls: lanUrls()
    };
  }
  function judgePayload(j) {
    return {
      name: j.name,
      rubric: RUBRIC,
      current: state.r1.current,
      stage: state.stage,
      teams: (state.r1.order.length ? state.r1.order.map((id) => state.teams[id]).filter(Boolean) : teams()).map((t) => {
        const cs = caseById(t.r1.caseId);
        return { id: t.id, name: t.name, caseTitle: cs?.title, caseText: cs?.text, sheet: t.r1.sheet, pitchSec: t.r1.pitchSec, mine: t.r1.scores[j.id] || null };
      })
    };
  }
  function adminAction(a, who = "admin") {
    const c = cfg();
    switch (a.type) {
      case "goto":
        goto(a.stage);
        return `Moved to ${a.stage}`;
      case "next": {
        const i = STAGES.indexOf(state.stage);
        if (i >= STAGES.length - 1) fail("Already at the end");
        goto(STAGES[i + 1]);
        return "Next stage";
      }
      case "pause":
        if (!TIMED[state.stage] && state.stage !== "r1-pitch") fail("Nothing is running");
        state.paused = true;
        notice("\u23F8 PAUSED by the organiser", "warn", true);
        dirty = true;
        return "Paused";
      case "resume":
        state.paused = false;
        notice("\u25B6 Resumed", "info");
        dirty = true;
        return "Resumed";
      case "extend":
        if (!TIMED[state.stage]) fail("No timer running");
        state.clock.duration += (Number(a.minutes) || 1) * 60;
        notice(`\u23F1 +${Number(a.minutes) || 1} min added`, "info");
        dirty = true;
        return "Extended";
      case "endTimer":
        if (!TIMED[state.stage]) fail("No timer running");
        goto(AUTO_NEXT[state.stage]);
        return "Ended";
      case "board":
        state.showBoard = !!a.on;
        dirty = true;
        return a.on ? "Leaderboard shown on big screen" : "Leaderboard hidden";
      case "announce":
        state.announce = a.text ? { text: String(a.text).slice(0, 200), t: Date.now() } : null;
        if (a.text) notice("\u{1F4E2} " + String(a.text).slice(0, 200), "info", true);
        dirty = true;
        return "Announced";
      // teams & judges
      case "addTeams": {
        const names = String(a.names || "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
        if (!names.length) fail("Enter at least one name");
        const errs = [];
        for (const n of names) {
          try {
            addTeam(n);
          } catch (e) {
            errs.push(e.message);
          }
        }
        if (errs.length) fail(errs.join("; "));
        return `${names.length} team(s) added`;
      }
      case "removeTeam":
        delete state.teams[a.id];
        state.r1.order = state.r1.order.filter((x) => x !== a.id);
        kick((cl) => cl.data.teamId === a.id);
        dirty = true;
        return "Team removed";
      case "renameTeam": {
        const t = state.teams[a.id];
        if (!t) fail("No such team");
        const n = String(a.name || "").trim().slice(0, 28);
        if (!n) fail("Name required");
        t.name = n;
        dirty = true;
        return "Renamed";
      }
      case "newCode": {
        const t = state.teams[a.id];
        if (!t) fail("No such team");
        t.code = genCode();
        t.token = uid(16);
        kick((cl) => cl.data.teamId === a.id);
        dirty = true;
        return "New code issued";
      }
      case "addJudge": {
        const n = String(a.name || "").trim().slice(0, 28);
        if (!n) fail("Judge name required");
        const j = { id: uid(6), name: n, code: genCode("J"), token: uid(16) };
        state.judges[j.id] = j;
        dirty = true;
        return `Judge added \u2014 code ${j.code}`;
      }
      case "removeJudge":
        delete state.judges[a.id];
        kick((cl) => cl.data.judgeId === a.id);
        dirty = true;
        return "Judge removed";
      // round 1
      case "redraw": {
        if (a.id) {
          const t = state.teams[a.id];
          if (!t) fail("No such team");
          assignCase(t, /* @__PURE__ */ new Set([t.r1.caseId]));
        } else drawAll();
        emitAll("draw");
        dirty = true;
        return "Cases drawn";
      }
      case "setCase": {
        const t = state.teams[a.id];
        if (!t || !caseById(Number(a.caseId))) fail("Invalid");
        t.r1.caseId = Number(a.caseId);
        t.r1.sheet = { qualities: [] };
        dirty = true;
        return "Case set";
      }
      case "pitchSelect": {
        if (state.stage !== "r1-pitch") fail("Go to the Pitch stage first");
        const t = state.teams[a.id];
        if (!t) fail("No such team");
        if (state.r1.current && state.r1.pitchRunning) stopPitch();
        state.r1.current = t.id;
        state.r1.pitchElapsed = 0;
        state.r1.pitchRunning = false;
        dirty = true;
        notice(`\u{1F3A4} Up next: ${t.name}`, "info", true);
        return "Selected";
      }
      case "pitchNext": {
        if (state.stage !== "r1-pitch") fail("Go to the Pitch stage first");
        if (state.r1.current && state.r1.pitchRunning) stopPitch();
        const nxt = state.r1.order.map((id) => state.teams[id]).find((t) => t && t.r1.pitchSec == null && t.id !== state.r1.current);
        if (!nxt) fail("Every team has pitched");
        state.r1.current = nxt.id;
        state.r1.pitchElapsed = 0;
        state.r1.pitchRunning = false;
        dirty = true;
        notice(`\u{1F3A4} Up next: ${nxt.name}`, "info", true);
        return `Next: ${nxt.name}`;
      }
      case "pitchStart":
        if (!state.r1.current) fail("Select a team first");
        state.r1.pitchElapsed = 0;
        state.r1.pitchRunning = true;
        state.paused = false;
        emitAll("pitchStart", { id: state.r1.current });
        dirty = true;
        return "Pitch timer started";
      case "pitchStop":
        if (!state.r1.pitchRunning) fail("Timer is not running");
        stopPitch();
        return "Pitch timer stopped";
      case "shuffleOrder":
        state.r1.order = shuffle(teams().map((t) => t.id));
        dirty = true;
        return "Order shuffled";
      case "clearPitch": {
        const t = state.teams[a.id];
        if (!t) fail("No such team");
        t.r1.pitchSec = null;
        dirty = true;
        return "Pitch time cleared";
      }
      // round 2
      case "command":
        if (state.stage !== "r2-build") fail("Round 2 build is not running");
        issueCommand(a.cmd);
        scheduleNextCommand();
        return "Command issued";
      case "tremor":
        if (state.stage !== "r2-build") fail("Round 2 build is not running");
        runTremor("TREMOR");
        return "Tremor triggered";
      case "stab": {
        const t = state.teams[a.id];
        if (!t) fail("No such team");
        if (a.value === null || a.value === "") t.r2.stabOverride = null;
        else {
          const v = Number(a.value);
          if (!(v >= 0 && v <= 15)) fail("Stability must be 0\u201315");
          t.r2.stabOverride = v;
        }
        dirty = true;
        return "Stability updated";
      }
      case "autoCmd":
        state.r2.nextCmdAt = a.on ? state.clock.elapsed + 5 : null;
        dirty = true;
        return a.on ? "Auto commands ON" : "Auto commands OFF";
      // round 3
      case "reinstate": {
        const t = state.teams[a.id];
        if (!t) fail("No such team");
        t.r3.dq = false;
        dirty = true;
        return "Team reinstated";
      }
      case "clearCooldown": {
        const t = state.teams[a.id];
        if (!t) fail("No such team");
        t.r3.cooldownUntil = 0;
        dirty = true;
        return "Cooldown cleared";
      }
      // settings
      case "config": {
        const v = a.config || {};
        const num = (k, lo, hi) => {
          if (v[k] !== void 0 && v[k] !== "") {
            const n = Number(v[k]);
            if (!Number.isFinite(n) || n < lo || n > hi) fail(`${k} must be ${lo}\u2013${hi}`);
            c[k] = n;
          }
        };
        if (v.eventName !== void 0) c.eventName = String(v.eventName).slice(0, 50) || DEFAULT_CONFIG.eventName;
        if (v.r1CasePool !== void 0 && ["school", "advanced", "all"].includes(v.r1CasePool)) c.r1CasePool = v.r1CasePool;
        num("r1PrepMin", 1, 60);
        num("r1PitchSec", 15, 600);
        num("r1GraceSec", 0, 120);
        num("r1OvertimePenalty", 0, 50);
        num("r2BuildMin", 1, 60);
        num("r2Budget", 100, 1e5);
        num("r2CmdMinSec", 30, 600);
        num("r2CmdMaxSec", 30, 900);
        num("r3Min", 1, 120);
        num("r3CooldownSec", 0, 300);
        num("r3HintAfterMin", 0, 60);
        num("r3OtherPoints", 0, 100);
        if (v.r3Points !== void 0) {
          const p = String(v.r3Points).split(",").map((x) => Number(x.trim())).filter((x) => Number.isFinite(x));
          if (p.length) c.r3Points = p;
        }
        if (v.r2FinalTremor !== void 0) c.r2FinalTremor = !!v.r2FinalTremor;
        if (v.showScoresToTeams !== void 0) c.showScoresToTeams = !!v.showScoresToTeams;
        if (c.r2CmdMaxSec < c.r2CmdMinSec) c.r2CmdMaxSec = c.r2CmdMinSec;
        dirty = true;
        emitAll("reload");
        return "Settings saved";
      }
      case "resetRound": {
        if (a.round === 1) {
          for (const t of teams()) t.r1 = teamR1();
          state.r1 = freshR1();
        }
        if (a.round === 2) {
          for (const t of teams()) t.r2 = teamR2(cfg().r2Budget);
          state.r2 = freshR2();
        }
        if (a.round === 3) {
          for (const t of teams()) t.r3 = teamR3();
          state.r3 = freshR3();
        }
        dirty = true;
        return `Round ${a.round} reset`;
      }
      case "reset": {
        const keepT = a.keepTeams ? teams() : [], keepJ = a.keepTeams ? state.judges : {};
        state = freshState(state.config, state.adminTokens);
        for (const t of keepT) {
          Object.assign(t, { r1: teamR1(), r2: teamR2(cfg().r2Budget), r3: teamR3() });
          state.teams[t.id] = t;
        }
        state.judges = keepJ;
        if (!a.keepTeams) kick((cl) => cl.data.teamId || cl.data.judgeId);
        dirty = true;
        save(true);
        emitAll("reload");
        return a.keepTeams ? "Event reset (teams kept)" : "Everything wiped";
      }
      default:
        fail("Unknown action");
    }
  }
  function stopPitch() {
    const t = state.teams[state.r1.current];
    state.r1.pitchRunning = false;
    if (t) t.r1.pitchSec = state.r1.pitchElapsed;
    emitAll("pitchStop", { id: state.r1.current, sec: state.r1.pitchElapsed });
    dirty = true;
  }
  function judgeScore(judgeId, { id, scores }) {
    const t = state.teams[id];
    if (!t) fail("No such team");
    const s = {};
    let total = 0;
    for (const r of RUBRIC) {
      const v = Number(scores?.[r.key]);
      if (!(v >= 0 && v <= 10)) fail(`${r.label}: score 0\u201310`);
      s[r.key] = v;
      total += v;
    }
    s.total = total;
    t.r1.scores[judgeId] = s;
    dirty = true;
    feed(`\u{1F9D1}\u200D\u2696\uFE0F ${judgeId === "admin" ? "Organiser" : state.judges[judgeId]?.name || "Judge"} scored ${t.name}: ${total}/50`, "info");
    return { ok: true, msg: `Saved ${total}/50 for ${t.name}` };
  }
  const isAdmin = (tok) => tok && state.adminTokens.includes(tok);
  const teamOf = (c) => {
    const t = c.data.teamId && state.teams[c.data.teamId];
    if (!t) fail("Not logged in");
    return t;
  };
  const handlers = {
    join(c, { code }) {
      const cc = String(code || "").trim().toUpperCase();
      const t = teams().find((x) => x.code === cc);
      if (t) return { ok: true, role: "team", token: t.token, name: t.name };
      const j = Object.values(state.judges).find((x) => x.code === cc);
      if (j) return { ok: true, role: "judge", token: j.token, name: j.name };
      fail("Invalid code. Ask the organiser for your team code.");
    },
    adminLogin(c, { password }) {
      if (String(password) !== String(adminPassword)) fail("Wrong password");
      const tok = uid(16);
      state.adminTokens.push(tok);
      if (state.adminTokens.length > 30) state.adminTokens.shift();
      dirty = true;
      save(true);
      return { ok: true, token: tok };
    },
    auth(c, { role, token }) {
      if (role === "team") {
        const t = teams().find((x) => x.token === token);
        if (!t) fail("Session expired");
        c.data = { cid: c.data.cid, role, teamId: t.id };
        c.rooms = /* @__PURE__ */ new Set(["teams", "team:" + t.id]);
        return { ok: true, name: t.name, pub: pubPayload(), me: teamPayload(t), materials: MATERIALS, gridW: GRID_W, braceCost: BRACE_COST, maxBraces: MAX_BRACES, qualities: QUALITIES };
      }
      if (role === "judge") {
        const j = Object.values(state.judges).find((x) => x.token === token);
        if (j) {
          c.data = { cid: c.data.cid, role, judgeId: j.id };
          c.rooms = /* @__PURE__ */ new Set(["judges"]);
          return { ok: true, name: j.name, pub: pubPayload(), judge: judgePayload(j) };
        }
        if (isAdmin(token)) {
          c.data = { cid: c.data.cid, role, judgeId: "admin" };
          c.rooms = /* @__PURE__ */ new Set(["judges"]);
          return { ok: true, name: "Organiser", pub: pubPayload(), judge: judgePayload({ id: "admin", name: "Organiser" }) };
        }
        fail("Session expired");
      }
      if (role === "admin" || role === "screen") {
        if (!isAdmin(token)) fail("Admin login required");
        c.data = { cid: c.data.cid, role };
        c.rooms = /* @__PURE__ */ new Set([role]);
        return { ok: true, pub: pubPayload(), admin: role === "admin" ? adminPayload() : void 0, towers: towersPayload(), board: scoreboard(), materials: MATERIALS, gridW: GRID_W, puzzles: puzzles_default.length, lanUrls: lanUrls() };
      }
      fail("Unknown role");
    },
    "r1:sheet"(c, { field, value }) {
      const t = teamOf(c);
      if (!["r1-draw", "r1-prep"].includes(state.stage)) fail("The solving sheet is locked now.");
      if (!SHEET_FIELDS.includes(field)) fail("Unknown field");
      t.r1.sheet[field] = field === "qualities" ? Array.isArray(value) ? value.filter((q) => QUALITIES.includes(q) || String(q).length < 30).slice(0, 10) : [] : String(value ?? "").slice(0, 800);
      dirty = true;
      emitRoom("team:" + t.id, "sheet", { field, value: t.r1.sheet[field], from: c.data.cid });
      return { ok: true };
    },
    "r1:rate"(c, { stars }) {
      const t = teamOf(c);
      if (state.stage !== "r1-pitch" || !state.r1.current) fail("No pitch is live");
      if (state.r1.current === t.id) fail("You can't rate your own pitch \u{1F609}");
      const s = Math.round(Number(stars));
      if (!(s >= 1 && s <= 5)) fail("1\u20135 stars");
      state.teams[state.r1.current].r1.peer[t.id] = s;
      dirty = true;
      return { ok: true, msg: `You gave ${s}\u2605` };
    },
    "r2:place"(c, d) {
      return r2Place(teamOf(c), d || {});
    },
    "r2:brace"(c) {
      return r2Brace(teamOf(c));
    },
    "r2:action"(c, d) {
      return r2Action(teamOf(c), d || {});
    },
    "r3:submit"(c, { answers }) {
      return r3Submit(teamOf(c), answers);
    },
    "r3:hint"(c) {
      return r3Hint(teamOf(c));
    },
    "judge:score"(c, d) {
      if (!c.data.judgeId && c.data.role !== "admin") fail("Judges only");
      return judgeScore(c.data.judgeId || "admin", d || {});
    },
    admin(c, a) {
      if (c.data.role !== "admin") fail("Admin login required");
      if (a.type === "score") return judgeScore("admin", a);
      const m = adminAction(a || {});
      pushAll();
      return { ok: true, msg: m };
    }
  };
  let cidSeq = 0;
  function message(c, e, d, ack) {
    let res;
    try {
      const h = handlers[e];
      if (!h) fail("Unknown request");
      res = h(c, d || {}) || { ok: true };
    } catch (err) {
      if (!(err instanceof GameError)) console.error(err);
      res = { ok: false, error: err instanceof GameError ? err.message : "Server error" };
    }
    if (ack) ack(res);
  }
  function pushAll() {
    const pub = pubPayload();
    emitAll("pub", pub);
    for (const t of teams()) emitRoom("team:" + t.id, "me", teamPayload(t));
    const board = scoreboard();
    emitRooms(["screen", "admin"], "board", board);
    if (cfg().showScoresToTeams) emitRoom("teams", "board", board.map(({ id, name, r1: a, r2: b, r3: cc, total, rank }) => ({ id, name, r1: a, r2: b, r3: cc, total, rank })));
    if (state.stage.startsWith("r2")) emitRooms(["screen", "admin"], "towers", towersPayload());
    emitRoom("admin", "admin", adminPayload());
    for (const cl of hub.clients()) if (cl.data.judgeId) {
      const j = cl.data.judgeId === "admin" ? { id: "admin", name: "Organiser" } : state.judges[cl.data.judgeId];
      if (j) emitOne(cl, "judge", judgePayload(j));
    }
  }
  function tick() {
    try {
      if (!state.paused) {
        if (TIMED[state.stage]) {
          state.clock.elapsed++;
          if (state.stage === "r2-build") r2Tick();
          dirty = true;
          if (state.clock.elapsed >= state.clock.duration) goto(AUTO_NEXT[state.stage]);
        }
        if (state.stage === "r1-pitch" && state.r1.pitchRunning) {
          state.r1.pitchElapsed++;
          dirty = true;
          if (state.r1.pitchElapsed === cfg().r1PitchSec) emitAll("pitchBuzz", {});
        }
      }
      pushAll();
      if (++tickNo % 5 === 0) save();
    } catch (e) {
      console.error("tick error", e);
    }
  }
  return {
    tick,
    message,
    save,
    connect(c) {
      c.data = c.data || {};
      c.data.cid = ++cidSeq;
      c.rooms = c.rooms || /* @__PURE__ */ new Set();
    },
    disconnect() {
    },
    get stage() {
      return state.stage;
    }
  };
}

// worker.js
var GameRoom = class {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.clients = /* @__PURE__ */ new Set();
    this.game = null;
    this.timer = null;
    this.ready = this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get("state");
      this.game = createGame({
        adminPassword: env.ADMIN_PASSWORD || "admin123",
        saved: saved || null,
        pauseOnLoad: false,
        hub: { clients: () => this.clients },
        persist: (json) => {
          this.ctx.storage.put("state", json).catch((e) => console.error("storage put failed", e));
        }
      });
    });
  }
  ensureTicking() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.game.tick();
      if (this.clients.size === 0 && !["r1-prep", "r1-pitch", "r2-build", "r3-live"].includes(this.game.stage)) {
        clearInterval(this.timer);
        this.timer = null;
        this.game.save(true);
      }
    }, 1e3);
  }
  async fetch(request) {
    await this.ready;
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, host: "cloudflare", stage: this.game.stage, clients: this.clients.size });
    }
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
    const pair = new WebSocketPair();
    const [browser, server] = Object.values(pair);
    server.accept();
    const c = {
      data: {},
      rooms: /* @__PURE__ */ new Set(),
      sendRaw: (s) => {
        try {
          server.send(s);
        } catch {
        }
      },
      close: () => {
        try {
          server.close(4e3, "kicked");
        } catch {
        }
        this.clients.delete(c);
      }
    };
    this.clients.add(c);
    this.game.connect(c);
    server.addEventListener("message", (ev) => {
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (m.e === "ping") return;
      this.game.message(c, m.e, m.d, m.id ? (res) => c.sendRaw(JSON.stringify({ ack: m.id, d: res })) : null);
    });
    const gone = () => {
      this.clients.delete(c);
      this.game.disconnect(c);
    };
    server.addEventListener("close", gone);
    server.addEventListener("error", gone);
    this.ensureTicking();
    return new Response(null, { status: 101, webSocket: browser });
  }
};

// .single-entry.js
var ROUTES = { "/": "/index.html", "/admin": "/admin.html", "/team": "/team.html", "/screen": "/screen.html", "/judge": "/judge.html" };
var single_entry_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws" || url.pathname === "/health") return env.GAME.get(env.GAME.idFromName("main")).fetch(request);
    const p = ROUTES[url.pathname.replace(/\/$/, "") || "/"] || url.pathname;
    const f = single_assets_default[p];
    if (!f) return new Response("Not found", { status: 404 });
    return new Response(f.body, { headers: { "content-type": f.type, "cache-control": "no-cache" } });
  }
};
export {
  GameRoom,
  single_entry_default as default
};

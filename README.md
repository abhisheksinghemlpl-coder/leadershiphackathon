# 🏆 The Leadership Hackathon: digital edition

Your three-round offline event as a live digital simulation. Teams play on phones or laptops, judges score on their phones, the organiser controls everything from one console, and a projector shows it all live.

| Round | What teams do | Score |
|---|---|---|
| **① Case Pitch** | Draw a caselet live → fill the 6-part Case Solving Sheet together (synced across devices) → pitch in 60 s while their decision and plan show on the big screen. Judges score 5 criteria; teams rate each other (People's Choice). | /50 |
| **② Tower Under Pressure** | Build a tower on a coin budget with real balance physics (overhangs topple). **Crisis commands** fire every 60–120 s and compliance is checked automatically. Tremors test stability. | /50 |
| **③ The Escape Room** | 10 locks in sequence: typing, dropdowns, MCQ, multi-select, ordering. Each lock reveals a vault letter. Lock 10 (Master Vault) allows **one attempt only**, and a wrong answer means disqualification. | /50 |

**Total: 150.** The overall leaderboard updates live.

---

## 1. Pages

| Page | Who | What |
|---|---|---|
| `/` | Teams & judges | Enter a 5-character code (teams) or a code starting with **J** (judges) |
| `/admin` | Organiser | Runs the event. Password `admin123` by default; change it (see below) |
| `/screen` | Projector | Open in the same browser where you logged into `/admin`, then press **Full screen** |
| `/judge` | Judges | Rubric scoring. The organiser can use it too via **Score as organiser** |

---

## 2. Host it

### A. Cloudflare Workers, single file (recommended)
Folder `cloudflare-single/` contains just **`index.js`** (the whole app) and **`wrangler.jsonc`**. Deploy exactly as you did Dalal Street:
1. Create a GitHub repo and upload both files.
2. In Cloudflare, go to **Workers & Pages → Create → Import a repository**, pick the repo, leave the deploy command as `npx wrangler deploy`, and click Deploy.
3. Open `https://<your-worker>.workers.dev/health`. It should show `"host":"cloudflare"`.
4. Set your password: Worker → **Settings → Variables and Secrets → Add → Secret** `ADMIN_PASSWORD`.

The worker name in `wrangler.jsonc` is `leadership-hackathon`. Change it if you like.

### B. Laptop on Wi-Fi or a hotspot
```
npm install
npm start            # or: ADMIN_PASSWORD=secret npm start
```
Teams open the "On the network" link printed in the terminal (same Wi-Fi or hotspot).

---

## 3. Run of show

Every timing is a setting (⚙ Settings). Set them to match your event deck before you start. Defaults:

| Stage | Default | Organiser does |
|---|---|---|
| Lobby | — | Add teams (Teams tab, one per line) and judges; hand out codes; open the big screen |
| **R1** Case draw | — | Click **Next**. Each team's caselet flips onto the big screen |
| **R1** Prep | 10 min | Teams fill the sheet. It locks automatically at time-up |
| **R1** Pitches | 60 s each | **Next team → Start timer**. A buzzer sounds at 60 s. Judges score on their phones. Overtime beyond the grace period (10 s) costs 5 points |
| **R2** Get ready | — | Rules and materials appear on every device |
| **R2** Build | 15 min | Commands auto-fire every 60–120 s. Use the 🌋 Tremor button for drama. At time-up the **final stability test** runs automatically |
| **R3** Get ready | — | Rules on every device |
| **R3** Escape room | 30 min | Watch the race on the big screen. Ends automatically when time is up or everyone has finished |
| Final | — | Podium and full leaderboard, with confetti |

The **Pause**, **+1 min** and **End timer now** buttons work in every timed stage. **📢 Announce** puts a message on every screen. **Show leaderboard** overlays the standings on the projector at any time.

---

## 4. Scoring rules (as you designed them)

**Round 1, Case Pitch (/50).** 5 criteria × 10: problem understanding, options and creativity, decision and reasoning, action plan feasibility, pitch delivery. The score is the average across all judges who scored, minus any overtime penalty. Peer ★ ratings decide a People's Choice award but don't change the score.

**Round 2, Tower (/50).**
- Height score = team height ÷ tallest tower × **20**
- Command score = **15** × (commands obeyed ÷ commands issued)
- Real height = height score × command score ÷ 15
- Stability = **0–15**, computed from how well balanced every block is (centre of mass vs. support edges, height of load), plus up to 3 for braces. **The moderator can override it** in the Tower tab.
- **Total = real height + command score + stability**

Crisis commands. Action commands need a button press; restriction commands mean "don't do X".

| Command | Window | Team must… |
|---|---|---|
| HANDS OFF! | 30 s | Not build or buy anything |
| SUPPLY CUT | 60 s | Not place any Pillars |
| WEIGHT LIMIT | 60 s | Place only Beams or Planks |
| CENTRE LINE | 50 s | Centre every block placed on the middle line |
| PLANT THE FLAG | 45 s | Press **Plant the flag** |
| SAFETY INSPECTION | 45 s | Press **Remove top block** |
| ROLL CALL | 25 s | Press **Acknowledge** |
| RELIEF FUND | 45 s | Press **Donate 50 coins** |
| REINFORCE | 50 s | Press **Install free brace** |

Restrictions aren't blocked: teams *can* disobey, they just lose marks, as in your offline version.

**Round 3, Escape Room (/50).** 1st team to open the Master Vault scores **50**, 2nd **40**, 3rd **30**, every other team escaping in time **20**. Anyone not finished, or disqualified, scores **0**. A wrong answer on locks 1–9 jams the lock briefly (longer for multiple-choice locks, so guessing doesn't pay). A hint unlocks after 4 min on the same lock. If a team is disqualified over a typo dispute, use **Reinstate** in the Escape Room tab.

---

## 5. 🔑 Escape Room answer key (organiser only, never sent to devices)

| # | Lock | Answer | Vault letter |
|---|---|---|---|
| 1 | Quote Cipher | "Be the change you wish to see in the world" + Gandhi | R |
| 2 | Acronym Decoder | Key Performance Indicator · Strengths Weaknesses Opportunities Threats · Diversity Equity Inclusion · Objectives and Key Results | I |
| 3 | Decode VUCA | Volatility · Uncertainty · Complexity · Ambiguity | O |
| 4 | Leadership Grid (People, Results) | Country Club 9,1 · Team Leader 9,9 · Impoverished 1,1 · Authority-Obedience 1,9 · Middle-of-the-Road 5,5 | S |
| 5 | Spot the Style | A Autocratic · B Democratic · C Situational · D Laissez-faire | A |
| 6 | Ethical Maze | **B**: reject and report | Y |
| 7 | Resource Allocation | **A + B + C** (3 events, exactly ₹25,000; no 4 events fit) | N |
| 8 | Crisis Communication | Disappointment → reason (rain) → empathy (rehearsed) → new date → call to action | V |
| 9 | Principal's Lockbox | **042** | I |
| 10 | Master Vault | **VISIONARY** (anagram of R I O S A Y N V I) | — |

Typed answers are forgiving: case, punctuation, "&" vs "and" and singular/plural all pass.

Puzzles 1–6 and 8–9 come from your kit. Three were adapted so they can be auto-checked: Resource Allocation got a "max events, full budget" rule; Crisis Communication became sentence ordering; the subjective Prioritisation and Trust Fall dilemmas were replaced by the Lockbox logic puzzle and the Master Vault.

---

## 6. Customise
- Caselets: `data/cases.js` (all 50 from your docs)
- Puzzles, answers and hints: `data/puzzles.js`
- Materials, costs and crisis commands: `data/tower.js`

After editing, rebuild the single file with `npm run build:single`.

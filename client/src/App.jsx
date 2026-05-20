import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";

/* ─── STYLES ────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0f1014;--surface:#17191e;--surface2:#1d2027;
  --line:#262930;--line2:#1e2026;
  --text:#e8eaf0;--text2:#8b909e;--text3:#454b5a;
  --accent:#7c6af7;--accent-bg:rgba(124,106,247,.1);--accent-dim:rgba(124,106,247,.18);
  --green:#34d399;--green-bg:rgba(52,211,153,.08);
  --red:#f87171;--red-bg:rgba(248,113,113,.08);
  --yellow:#fbbf24;--yellow-bg:rgba(251,191,36,.08);
  --mono:'DM Mono',monospace;--head:'Syne',sans-serif;
  --r:8px;
}
html,body{height:100%;background:var(--bg);color:var(--text)}
.app{min-height:100vh;display:flex;flex-direction:column;background:var(--bg)}

/* topbar */
.topbar{height:52px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid var(--line);background:var(--surface);position:sticky;top:0;z-index:200}
.logo{font-family:var(--head);font-weight:800;font-size:15px;letter-spacing:-.03em;color:var(--text)}
.logo span{color:var(--accent)}
.key-area{display:flex;align-items:center;gap:8px}
.key-badge{font-family:var(--mono);font-size:10px;padding:3px 9px;border-radius:20px;cursor:pointer;
  border:1px solid var(--line);color:var(--text2);background:var(--surface2);transition:border-color .15s}
.key-badge:hover{border-color:var(--text3)}
.dot{width:6px;height:6px;border-radius:50%;background:var(--text3);display:inline-block;margin-right:5px}
.dot.on{background:var(--green)}

/* key drawer */
.key-drawer{padding:12px 24px;background:var(--surface);border-bottom:1px solid var(--line);
  display:flex;align-items:center;gap:10px;animation:slideDown .15s ease-out}
.key-drawer input{flex:1;max-width:400px;background:var(--bg);border:1px solid var(--line);
  border-radius:6px;padding:8px 12px;font-family:var(--mono);font-size:12px;color:var(--text);outline:none;transition:border-color .15s}
.key-drawer input:focus{border-color:var(--accent)}
.key-drawer input::placeholder{color:var(--text3)}
.key-drawer label{font-family:var(--mono);font-size:11px;color:var(--text2);white-space:nowrap}
.key-save{background:var(--accent);color:#fff;border:none;border-radius:6px;padding:8px 16px;
  font-family:var(--head);font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s}
.key-save:hover{opacity:.85}

/* page switcher (top-level) */
.pages{display:flex;gap:6px;padding:8px 24px;background:var(--bg);border-bottom:1px solid var(--line)}
.pg{padding:8px 14px;font-family:var(--head);font-size:12px;font-weight:700;color:var(--text2);
  border:1px solid var(--line);background:var(--surface);border-radius:6px;cursor:pointer;transition:all .12s;
  display:flex;align-items:center;gap:6px}
.pg:hover{color:var(--text);border-color:var(--text3)}
.pg.active{background:var(--accent-bg);color:var(--accent);border-color:var(--accent-dim)}

/* nav tabs */
.nav{display:flex;gap:2px;padding:0 24px;background:var(--surface);border-bottom:1px solid var(--line)}
.ntab{padding:12px 16px;font-family:var(--head);font-size:12px;font-weight:700;color:var(--text2);
  border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;
  margin-bottom:-1px;transition:all .15s;display:flex;align-items:center;gap:6px}
.ntab:hover{color:var(--text)}
.ntab.active{color:var(--accent);border-bottom-color:var(--accent)}
.ntab-icon{font-size:13px}

/* ── LAUNCH PAGE ──────────────────────────── */
.launch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:20px}
.tcard{background:var(--surface);border:1.5px solid var(--line);border-radius:var(--r);padding:14px;cursor:pointer;
  transition:all .12s;display:flex;flex-direction:column;gap:8px}
.tcard:hover{border-color:var(--text3)}
.tcard.selected{border-color:var(--accent);background:var(--accent-bg)}
.tcard-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.tcard-title{font-family:var(--head);font-size:13px;font-weight:700;color:var(--text);line-height:1.3}
.tcard-id{font-family:var(--mono);font-size:10px;color:var(--text3);background:var(--bg);padding:2px 7px;border-radius:20px;flex-shrink:0}
.tcard-pitch{font-family:var(--mono);font-size:10px;color:var(--text2);line-height:1.4}
.tcard-stats{display:flex;gap:14px;margin-top:auto;padding-top:8px;border-top:1px solid var(--line)}
.tstat{display:flex;flex-direction:column;gap:1px}
.tstat-n{font-family:var(--head);font-size:18px;font-weight:800;color:var(--text)}
.tstat-l{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em}
.tcard.selected .tstat-n{color:var(--accent)}

.launch-form{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:14px;
  display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.form-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.form-row label{font-family:var(--mono);font-size:11px;color:var(--text2);min-width:90px}
.form-row input[type=number]{background:var(--bg);border:1px solid var(--line);border-radius:6px;
  padding:8px 10px;font-family:var(--mono);font-size:12px;color:var(--text);outline:none;width:120px;transition:border-color .15s}
.form-row input[type=number]:focus{border-color:var(--accent)}
.cb{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;color:var(--text2);cursor:pointer;user-select:none}
.cb input{accent-color:var(--accent)}

/* run panel */
.run-panel{background:var(--surface);border:1px solid var(--accent-dim);border-radius:var(--r);padding:14px;margin-bottom:14px}
.run-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;flex-wrap:wrap}
.run-title{font-family:var(--head);font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px}
.run-stage{font-family:var(--mono);font-size:11px;color:var(--accent);background:var(--accent-bg);
  padding:3px 9px;border-radius:20px;display:inline-flex;align-items:center;gap:5px}
.run-stage .pulse{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 1.2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.run-counters{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}
.rc{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:8px 10px}
.rc-n{font-family:var(--head);font-size:18px;font-weight:800;color:var(--text)}
.rc-l{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-top:1px}
.rc-bar{height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-top:8px}
.rc-bar > span{display:block;height:100%;background:var(--accent);transition:width .3s}
.run-meta{font-family:var(--mono);font-size:11px;color:var(--text2);display:flex;flex-wrap:wrap;gap:14px}
.cancel-btn{background:transparent;color:var(--red);border:1px solid rgba(248,113,113,.4);border-radius:6px;
  padding:6px 14px;font-family:var(--head);font-size:11px;font-weight:700;cursor:pointer;transition:all .12s}
.cancel-btn:hover{background:var(--red-bg)}
.cancel-btn:disabled{opacity:.4;cursor:not-allowed}

/* ── CALL LOG TAB ─────────────────────────── */
.cl-filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding:10px;
  background:var(--surface);border:1px solid var(--line);border-radius:var(--r)}
.cl-filters select, .cl-filters input{background:var(--bg);border:1px solid var(--line);border-radius:6px;
  padding:7px 10px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none;transition:border-color .15s}
.cl-filters select:focus, .cl-filters input:focus{border-color:var(--accent)}
.cl-filters input[type=date]{color-scheme:dark}
.cl-filters .clear-btn{background:transparent;color:var(--text2);border:1px solid var(--line);border-radius:6px;
  padding:6px 12px;font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .12s}
.cl-filters .clear-btn:hover{color:var(--text);border-color:var(--text3)}

.cl-row{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;
  transition:all .15s;border-left-width:3px}
.cl-row:hover{border-color:var(--line2)}
.cl-row.open{border-color:var(--accent-dim)}
.cl-row.tier-green{border-left-color:var(--green);background:linear-gradient(90deg,rgba(52,211,153,.06) 0%,var(--surface) 80%)}
.cl-row.tier-yellow{border-left-color:var(--yellow);background:linear-gradient(90deg,rgba(251,191,36,.05) 0%,var(--surface) 80%)}
.cl-row-head{padding:11px 14px;display:grid;align-items:center;gap:10px;cursor:pointer;user-select:none;
  grid-template-columns:46px 1fr 90px 70px 70px 80px 24px}
.cl-score{font-family:var(--head);font-size:13px;font-weight:800;text-align:center;
  padding:3px 0;border-radius:6px;background:var(--bg);border:1px solid var(--line);color:var(--text2)}
.cl-row.tier-green .cl-score{background:var(--green-bg);color:var(--green);border-color:rgba(52,211,153,.3)}
.cl-row.tier-yellow .cl-score{background:var(--yellow-bg);color:var(--yellow);border-color:rgba(251,191,36,.3)}
.cl-main{min-width:0}
.cl-store{font-family:var(--head);font-size:12px;font-weight:700;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}
.cl-note-icon{font-size:10px;color:var(--accent);flex-shrink:0;cursor:help}
.cl-summary{font-family:var(--mono);font-size:10px;color:var(--text2);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.cl-meta{font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:2px;display:flex;gap:10px;flex-wrap:wrap}

/* human notes block in detail panel */
.human-notes{background:rgba(124,106,247,.06);border:1px solid var(--accent-dim);border-radius:6px;
  padding:10px 12px;margin-bottom:12px}
.human-notes .hn-h{font-family:var(--head);font-size:11px;font-weight:700;color:var(--accent);margin-bottom:6px;
  text-transform:uppercase;letter-spacing:.04em}
.human-notes .hn-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px}
.human-notes .hn-k{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase}
.human-notes .hn-v{font-family:var(--mono);font-size:11px;color:var(--text)}

/* runs history table */
.runs-tbl{display:flex;flex-direction:column;gap:4px}
.run-row{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:10px 14px;
  display:grid;grid-template-columns:60px 1fr 90px 110px 110px 90px;gap:10px;align-items:center}
.run-id{font-family:var(--mono);font-size:11px;color:var(--text3)}
.run-topic{font-family:var(--head);font-size:12px;color:var(--text)}
.run-status-tag{font-family:var(--mono);font-size:10px;padding:2px 8px;border-radius:20px;text-align:center;display:inline-block}
.run-status-tag.running{background:var(--accent-bg);color:var(--accent)}
.run-status-tag.done{background:var(--green-bg);color:var(--green)}
.run-status-tag.cancelled{background:var(--yellow-bg);color:var(--yellow)}
.run-status-tag.error{background:var(--red-bg);color:var(--red)}
.run-status-tag.pending{background:rgba(255,255,255,.05);color:var(--text2)}
.run-cell-ts{font-family:var(--mono);font-size:10px;color:var(--text3)}

/* content */
.content{flex:1;padding:24px;max-width:900px;margin:0 auto;width:100%}

/* search / input row */
.input-row{display:flex;gap:8px;margin-bottom:16px}
.input-wrap{position:relative;flex:1}
.input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:13px;pointer-events:none}
.inp{width:100%;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:10px 12px 10px 36px;font-family:var(--mono);font-size:12px;color:var(--text);outline:none;transition:border-color .15s}
.inp:focus{border-color:var(--accent)}
.inp::placeholder{color:var(--text3)}
.inp.no-icon{padding-left:12px}
.go-btn{background:var(--accent);color:#fff;border:none;border-radius:var(--r);padding:10px 20px;
  font-family:var(--head);font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s;white-space:nowrap}
.go-btn:hover:not(:disabled){opacity:.85}
.go-btn:disabled{opacity:.35;cursor:not-allowed}

.hint{font-family:var(--mono);font-size:10px;color:var(--text3);margin:-10px 0 12px;padding-left:2px}

/* results table */
.r-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.r-title{font-family:var(--head);font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px}
.badge{background:var(--accent-bg);color:var(--accent);font-family:var(--mono);font-size:10px;
  padding:2px 8px;border-radius:20px}
.refresh-btn{font-family:var(--mono);font-size:11px;color:var(--text2);background:none;
  border:1px solid var(--line);border-radius:6px;padding:5px 10px;cursor:pointer;transition:border-color .15s}
.refresh-btn:hover{border-color:var(--text3)}

/* conv rows */
.conv-list{display:flex;flex-direction:column;gap:4px}
.conv-row{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;transition:border-color .15s}
.conv-row:hover{border-color:var(--line2)}
.conv-row.open{border-color:var(--accent-dim)}
.conv-row-head{padding:12px 16px;display:grid;align-items:center;gap:12px;cursor:pointer;user-select:none;
  grid-template-columns:1fr 140px 80px 80px 24px}
.cv-main{}
.cv-date{font-family:var(--head);font-size:12px;font-weight:600;color:var(--text);margin-bottom:2px}
.cv-sub{font-family:var(--mono);font-size:10px;color:var(--text2);display:flex;gap:10px;flex-wrap:wrap}
.cv-summary{font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:3px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px}
.cv-col{font-family:var(--mono);font-size:11px;color:var(--text2);text-align:right}
.cv-col small{display:block;font-size:9px;color:var(--text3)}
.chev{color:var(--text3);font-size:11px;transition:transform .2s;text-align:right}
.chev.open{transform:rotate(90deg)}

/* status tags */
.stag{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px;
  font-family:var(--mono);font-size:10px;font-weight:500}
.stag.ok{background:var(--green-bg);color:var(--green)}
.stag.bad{background:var(--red-bg);color:var(--red)}
.stag.mid{background:var(--yellow-bg);color:var(--yellow)}
.stag.dim{background:rgba(255,255,255,.04);color:var(--text3);border:1px solid var(--line)}

/* detail panel */
.detail-panel{border-top:1px solid var(--line);padding:16px;background:var(--surface2);
  animation:fd .15s ease-out}
@keyframes fd{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* dyn vars */
.dyn-vars{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.dvar{background:var(--accent-bg);border:1px solid var(--accent-dim);border-radius:6px;
  padding:4px 10px;font-family:var(--mono);font-size:11px;color:var(--accent)}
.dvar span{color:var(--text2);font-size:10px}

/* detail tabs */
.dtabs{display:flex;gap:2px;background:var(--bg);border:1px solid var(--line);border-radius:6px;
  padding:3px;width:fit-content;margin-bottom:12px}
.dtab{padding:5px 14px;font-family:var(--head);font-size:11px;font-weight:700;border-radius:4px;
  cursor:pointer;color:var(--text2);background:transparent;border:none;transition:all .12s}
.dtab.active{background:var(--accent-bg);color:var(--accent)}

/* transcript */
.transcript{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;padding-right:4px}
.transcript::-webkit-scrollbar{width:3px}
.transcript::-webkit-scrollbar-thumb{background:var(--line);border-radius:2px}
.bubble{max-width:76%;padding:9px 12px;border-radius:10px}
.bubble.user{align-self:flex-end;background:var(--accent-dim);color:var(--text);border-bottom-right-radius:3px}
.bubble.agent{align-self:flex-start;background:var(--surface);border:1px solid var(--line);color:var(--text);border-bottom-left-radius:3px}
.b-role{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
.bubble.user .b-role{color:rgba(124,106,247,.5)}
.b-text{font-size:13px;line-height:1.5}
.b-ts{font-family:var(--mono);font-size:9px;color:var(--text3);text-align:right;margin-top:3px}

/* audio */
.audio-block{background:var(--bg);border:1px solid var(--line);border-radius:var(--r);
  padding:14px 16px;display:flex;align-items:center;gap:12px}
.play-btn{width:36px;height:36px;background:var(--accent);color:#fff;border:none;border-radius:50%;
  font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:opacity .15s}
.play-btn:hover:not(:disabled){opacity:.8}
.play-btn:disabled{opacity:.3}
.progress{flex:1;height:4px;background:var(--line);border-radius:2px;cursor:pointer;position:relative}
.progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .1s linear}
.audio-t{font-family:var(--mono);font-size:11px;color:var(--text2);white-space:nowrap;min-width:68px;text-align:right}

/* meta grid */
.meta-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.mpair{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:9px 11px}
.mp-k{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
.mp-v{font-family:var(--mono);font-size:12px;color:var(--text);word-break:break-all}

/* states */
.loading{display:flex;flex-direction:column;align-items:center;gap:10px;padding:48px;
  font-family:var(--mono);font-size:12px;color:var(--text2)}
.spinner{width:20px;height:20px;border:2px solid var(--line);border-top-color:var(--accent);
  border-radius:50%;animation:spin .7s linear infinite}
.mini-spin{width:12px;height:12px;border:1.5px solid var(--line);border-top-color:var(--accent);
  border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.empty{text-align:center;padding:48px 24px;background:var(--surface);border:1px dashed var(--line);border-radius:var(--r)}
.empty-ico{font-size:28px;opacity:.2;margin-bottom:10px}
.empty-txt{font-family:var(--head);font-size:13px;font-weight:700;color:var(--text2)}
.empty-sub{font-family:var(--mono);font-size:11px;color:var(--text3);margin-top:4px}
.err-box{margin-top:12px;padding:10px 12px;background:var(--red-bg);border:1px solid rgba(248,113,113,.2);
  border-radius:6px;font-family:var(--mono);font-size:11px;color:var(--red)}

/* search highlight */
.hl{background:rgba(124,106,247,.3);border-radius:2px;padding:0 1px}

@media(max-width:640px){
  .content{padding:16px}
  .conv-row-head{grid-template-columns:1fr auto auto}
  .cv-col.hide{display:none}
  .meta-g{grid-template-columns:1fr 1fr}
  .input-row{flex-wrap:wrap}
}
`;

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const getAccessCode = () => new URLSearchParams(window.location.search).get("code") || "";
const apiFetch = (path, options = {}) => {
  const url = new URL(`/api${path}`, window.location.origin);
  url.searchParams.set("code", getAccessCode());
  return fetch(url, options);
};

/* ─── HELPERS ────────────────────────────────────────────────── */
const fmt = {
  dur: s => (!s && s !== 0) ? "—" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`,
  date: ts => !ts ? "—" : new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  dateShort: ts => !ts ? "—" : new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric" }),
  short: id => !id ? "—" : id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-5)}` : id,
};

function statusTag(s) {
  if (s === "success") return <span className="stag ok">✓ success</span>;
  if (s === "failure") return <span className="stag bad">✕ failed</span>;
  if (s === "done" || s === "processing") return <span className="stag dim">{s}</span>;
  return <span className="stag dim">{s || "—"}</span>;
}

function highlight(text, q) {
  if (!q || !text) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return <>{text.slice(0, i)}<mark className="hl">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

/* ─── AUDIO PLAYER ───────────────────────────────────────────── */
function AudioPlayer({ conversationId }) {
  const [el, setEl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const toggle = useCallback(async () => {
    if (el) { playing ? el.pause() : el.play(); setPlaying(p => !p); return; }
    setLoading(true);
    try {
      const r = await apiFetch(`/conversations/${conversationId}/audio`);
      if (!r.ok) throw new Error("Audio unavailable");
      const audio = new Audio(URL.createObjectURL(await r.blob()));
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.ontimeupdate = () => setProgress((audio.currentTime / audio.duration) * 100);
      audio.onended = () => setPlaying(false);
      audio.play();
      setEl(audio);
      setPlaying(true);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [el, playing, conversationId]);

  const seek = useCallback(e => {
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - r.left) / r.width) * el.duration;
  }, [el]);

  if (err) return <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", padding: "6px 0" }}>{err}</div>;

  return (
    <div className="audio-block">
      <button className="play-btn" onClick={toggle} disabled={loading}>
        {loading ? "…" : playing ? "⏸" : "▶"}
      </button>
      <div className="progress" onClick={seek}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="audio-t">{el ? fmt.dur(el.currentTime) : "0:00"} / {fmt.dur(duration)}</div>
    </div>
  );
}

/* ─── DETAIL PANEL ───────────────────────────────────────────── */
function DetailPanel({ convId, preloaded, audioEligible = true }) {
  const [tab, setTab] = useState("transcript");
  const [data, setData] = useState(preloaded || null);
  const [loading, setLoading] = useState(!preloaded);

  useEffect(() => {
    if (preloaded) return;
    (async () => {
      try {
        const r = await apiFetch(`/conversations/${convId}`);
        if (r.ok) setData(await r.json());
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [convId, preloaded]);

  const dynVars = data?.conversation_initiation_client_data?.dynamic_variables || {};
  const hasDynVars = Object.keys(dynVars).length > 0;
  const transcript = data?.transcript || [];
  const showAudioTab = audioEligible;

  return (
    <div className="detail-panel">
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>
          <span className="mini-spin" /> Loading…
        </div>
      )}

      {!loading && hasDynVars && (
        <div className="dyn-vars">
          {Object.entries(dynVars).map(([k, v]) => (
            <div className="dvar" key={k}>
              <span>{k}: </span>{String(v)}
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          <div className="dtabs">
            {["transcript", ...(showAudioTab ? ["audio"] : []), "info"].map(t => (
              <button key={t} className={`dtab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          {tab === "transcript" && (
            <div className="transcript">
              {!transcript.length
                ? <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: "16px 0" }}>No transcript available</div>
                : transcript.map((m, i) => (
                  <div key={i} className={`bubble ${m.role === "user" ? "user" : "agent"}`}>
                    <div className="b-role">{m.role === "user" ? "caller" : "agent"}</div>
                    <div className="b-text">{m.message}</div>
                    {m.time_in_call_secs != null && <div className="b-ts">{fmt.dur(m.time_in_call_secs)}</div>}
                  </div>
                ))
              }
            </div>
          )}

          {tab === "audio" && (
            data?.has_audio
              ? <AudioPlayer conversationId={convId} />
              : <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>No audio recorded for this call.</div>
          )}

          {tab === "info" && (
            <div className="meta-g">
              {[
                ["Duration", fmt.dur(data?.metadata?.call_duration_secs)],
                ["Started", fmt.date(data?.metadata?.start_time_unix_secs)],
                ["Status", data?.status || "—"],
                ["Messages", transcript.length || "—"],
                ["Phone / User", data?.user_id || "—"],
                ["Agent", fmt.short(data?.agent_id)],
                ["Conv ID", fmt.short(data?.conversation_id)],
                ["Direction", data?.metadata?.call?.direction || "—"],
                ["Has audio", data?.has_audio ? "yes" : "no"],
              ].map(([k, v]) => (
                <div className="mpair" key={k}>
                  <div className="mp-k">{k}</div>
                  <div className="mp-v">{v}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── CONV ROW ───────────────────────────────────────────────── */
function ConvRow({ conv, searchQ, preloaded }) {
  const [open, setOpen] = useState(false);
  const id = conv.conversation_id;

  return (
    <div className={`conv-row ${open ? "open" : ""}`}>
      <div className="conv-row-head" onClick={() => setOpen(o => !o)}>
        <div className="cv-main">
          <div className="cv-date">{fmt.date(conv.start_time_unix_secs)}</div>
          <div className="cv-sub">
            <span>{fmt.dur(conv.call_duration_secs)}</span>
            {conv.message_count != null && <span>{conv.message_count} msgs</span>}
            {conv.user_id && <span style={{ color: "var(--text3)" }}>{highlight(conv.user_id, searchQ)}</span>}
            {conv.agent_name && <span style={{ color: "var(--text3)" }}>{highlight(conv.agent_name, searchQ)}</span>}
          </div>
          {conv.call_summary_title && (
            <div className="cv-summary">{highlight(conv.call_summary_title, searchQ)}</div>
          )}
        </div>
        <div className="cv-col hide">
          {statusTag(conv.call_successful)}
        </div>
        <div className="cv-col" style={{ fontSize: 10, color: "var(--text3)" }}>
          {fmt.short(id)}
        </div>
        <div className="cv-col hide">
          {conv.main_language && <span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{conv.main_language}</span>}
        </div>
        <div className={`chev ${open ? "open" : ""}`}>›</div>
      </div>
      {open && <DetailPanel convId={id} preloaded={preloaded} />}
    </div>
  );
}

/* ─── TAB: RECENT ────────────────────────────────────────────── */
function RecentTab() {
  const [convs, setConvs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [detailCache, setDetailCache] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const params = new URLSearchParams({ page_size: "100" });
      if (agentFilter.trim()) params.append("agent_id", agentFilter.trim());
      const r = await apiFetch(`/conversations?${params}`);
      if (!r.ok) throw new Error(`Error ${r.status}${r.status === 401 ? " — invalid access code" : ""}`);
      const d = await r.json();
      setConvs(d.conversations || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [agentFilter]);

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!convs) return [];
    const q = search.trim().toLowerCase();
    if (!q) return convs;
    return convs.filter(c => {
      const base = [c.user_id, c.agent_name, c.call_summary_title, c.conversation_id, c.main_language]
        .filter(Boolean).join(" ").toLowerCase();
      if (base.includes(q)) return true;
      // also search loaded dynamic vars
      const cached = detailCache[c.conversation_id];
      if (cached) {
        const dvStr = JSON.stringify(cached.conversation_initiation_client_data?.dynamic_variables || {}).toLowerCase();
        if (dvStr.includes(q)) return true;
      }
      return false;
    });
  }, [convs, search, detailCache]);

  return (
    <div className="content">
      <div className="input-row">
        <div className="input-wrap" style={{ flex: 2 }}>
          <span className="input-icon">⌕</span>
          <input className="inp" placeholder="Search phone, name, summary, dynamic vars…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="input-wrap" style={{ flex: 1 }}>
          <span className="input-icon">#</span>
          <input className="inp" placeholder="Agent ID (optional)"
            value={agentFilter} onChange={e => setAgentFilter(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()} />
        </div>
        <button className="go-btn" onClick={load} disabled={loading}>
          {loading ? "…" : "↺ Reload"}
        </button>
      </div>

      {err && <div className="err-box">⚠ {err}</div>}

      {!err && convs !== null && (
        <>
          <div className="r-header">
            <div className="r-title">
              Recent calls
              {filtered.length > 0 && <span className="badge">{filtered.length}{search ? " matching" : ""}</span>}
            </div>
            {search && convs.length > 0 && (
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>
                Dynamic vars searched after expanding rows
              </span>
            )}
          </div>

          {loading && <div className="loading"><div className="spinner" /></div>}

          {!loading && filtered.length === 0 && (
            <div className="empty">
              <div className="empty-ico">○</div>
              <div className="empty-txt">{search ? "No matches" : "No calls yet"}</div>
              <div className="empty-sub">{search ? `Nothing found for "${search}"` : "Calls will appear here once made"}</div>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="conv-list">
              {filtered.map(c => (
                <ConvRow key={c.conversation_id} conv={c} searchQ={search}
                  preloaded={detailCache[c.conversation_id]} />
              ))}
            </div>
          )}
        </>
      )}

      {loading && convs === null && (
        <div className="loading"><div className="spinner" /><span>Loading last 100 calls…</span></div>
      )}
    </div>
  );
}

/* ─── TAB: BY PHONE ──────────────────────────────────────────── */
function PhoneTab() {
  const [phone, setPhone] = useState("");
  const [agentId, setAgentId] = useState("");
  const [convs, setConvs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const lookup = useCallback(async () => {
    if (!phone.trim()) return;
    setLoading(true); setErr(null); setConvs(null);
    try {
      const params = new URLSearchParams({ user_id: phone.trim(), page_size: "100" });
      if (agentId.trim()) params.append("agent_id", agentId.trim());
      const r = await apiFetch(`/conversations?${params}`);
      if (!r.ok) throw new Error(`Error ${r.status}${r.status === 401 ? " — invalid access code" : r.status === 404 ? " — agent not found" : ""}`);
      const d = await r.json();
      setConvs(d.conversations || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [phone, agentId]);

  return (
    <div className="content">
      <div className="input-row">
        <div className="input-wrap" style={{ flex: 2 }}>
          <span className="input-icon">☎</span>
          <input className="inp" placeholder="+1 555 000 0000"
            value={phone} onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookup()} />
        </div>
        <div className="input-wrap" style={{ flex: 1 }}>
          <span className="input-icon">#</span>
          <input className="inp" placeholder="Agent ID (optional)"
            value={agentId} onChange={e => setAgentId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookup()} />
        </div>
        <button className="go-btn" onClick={lookup} disabled={loading || !phone.trim()}>
          {loading ? "…" : "Look up →"}
        </button>
      </div>
      <div className="hint">Finds all calls to/from this number. Expand any row for transcript, audio & dynamic vars.</div>

      {err && <div className="err-box">⚠ {err}</div>}

      {loading && <div className="loading"><div className="spinner" /><span>Searching…</span></div>}

      {!loading && convs !== null && (
        <>
          <div className="r-header">
            <div className="r-title">
              Calls for {phone}
              {convs.length > 0 && <span className="badge">{convs.length}</span>}
            </div>
          </div>
          {convs.length === 0
            ? <div className="empty"><div className="empty-ico">📵</div><div className="empty-txt">No calls found</div><div className="empty-sub">No recordings for this number</div></div>
            : <div className="conv-list">{convs.map(c => <ConvRow key={c.conversation_id} conv={c} />)}</div>
          }
        </>
      )}
    </div>
  );
}

/* ─── TAB: BY CALL ID ────────────────────────────────────────── */
function CallIdTab() {
  const [convId, setConvId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const lookup = useCallback(async () => {
    if (!convId.trim()) return;
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await apiFetch(`/conversations/${convId.trim()}`);
      if (!r.ok) throw new Error(r.status === 404 ? "Conversation not found" : `Error ${r.status}`);
      setResult(await r.json());
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [convId]);

  const dynVars = result?.conversation_initiation_client_data?.dynamic_variables || {};

  return (
    <div className="content">
      <div className="input-row">
        <div className="input-wrap">
          <span className="input-icon">🔎</span>
          <input className="inp" placeholder="conversation_id  e.g. conv_abc123"
            value={convId} onChange={e => setConvId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookup()} />
        </div>
        <button className="go-btn" onClick={lookup} disabled={loading || !convId.trim()}>
          {loading ? "…" : "Look up →"}
        </button>
      </div>

      {err && <div className="err-box">⚠ {err}</div>}
      {loading && <div className="loading"><div className="spinner" /></div>}

      {!loading && result && (
        <>
          <div className="r-header">
            <div className="r-title">Recording — {fmt.date(result.metadata?.start_time_unix_secs)}</div>
          </div>
          <div className="conv-list">
            {Object.keys(dynVars).length > 0 && (
              <div className="dyn-vars" style={{ marginBottom: 12 }}>
                {Object.entries(dynVars).map(([k, v]) => (
                  <div className="dvar" key={k}><span>{k}: </span>{String(v)}</div>
                ))}
              </div>
            )}
            <ConvRow conv={{
              conversation_id: result.conversation_id,
              start_time_unix_secs: result.metadata?.start_time_unix_secs,
              call_duration_secs: result.metadata?.call_duration_secs,
              message_count: result.transcript?.length,
              call_successful: result.analysis?.call_successful,
              user_id: result.user_id,
              agent_name: result.agent_name,
              call_summary_title: result.analysis?.transcript_summary,
            }} preloaded={result} />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── HISTORY PAGE (existing tabs + Call log) ────────────────── */
function HistoryPage() {
  const [tab, setTab] = useState("recent");
  const tabs = [
    { id: "recent", label: "Recent calls", icon: "🕐" },
    { id: "log",    label: "Call log",     icon: "📋" },
    { id: "phone",  label: "By phone",     icon: "📞" },
    { id: "id",     label: "By call ID",   icon: "🔎" },
  ];
  return (
    <>
      <div className="nav">
        {tabs.map(t => (
          <button key={t.id} className={`ntab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="ntab-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      {tab === "recent" && <RecentTab />}
      {tab === "log"    && <CallLogTab />}
      {tab === "phone"  && <PhoneTab />}
      {tab === "id"     && <CallIdTab />}
    </>
  );
}

/* ─── live-update helper: subscribe to active run, fire onTick on call_end ── */
function useActiveRunCallEnd(onTick) {
  // Polls /runs?limit=1 every 15s. When an active run is found, opens an SSE
  // stream and calls onTick() each time a call_end event arrives. Stops the
  // stream when the run ends, then resumes polling. Cheap (1 req per 15s
  // when idle, 1 SSE stream when running).
  const esRef = useRef(null);
  const onTickRef = useRef(onTick);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer = null;
    let activeId = null;

    const closeStream = () => {
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
    };

    const subscribe = (runId) => {
      if (esRef.current || activeId === runId) return;
      activeId = runId;
      const url = new URL(`/api/manager/runs/${runId}/stream`, window.location.origin);
      url.searchParams.set("code", getAccessCode());
      const es = new EventSource(url);
      esRef.current = es;
      es.addEventListener("call_end", () => onTickRef.current && onTickRef.current());
      es.addEventListener("end", () => { closeStream(); activeId = null; });
      es.onerror = () => { /* let it auto-reconnect; on real death, /runs poll will re-detect */ };
    };

    const poll = async () => {
      if (cancelled) return;
      try {
        const r = await apiFetch("/manager/runs?limit=1");
        if (r.ok) {
          const d = await r.json();
          if (d.active_run_id && d.active_run_id !== activeId) {
            closeStream();
            subscribe(d.active_run_id);
          } else if (!d.active_run_id && activeId) {
            closeStream(); activeId = null;
          }
        }
      } catch (_) {}
      if (!cancelled) pollTimer = setTimeout(poll, 15000);
    };
    poll();

    return () => { cancelled = true; if (pollTimer) clearTimeout(pollTimer); closeStream(); };
  }, []);
}

/* ─── CALL LOG TAB ───────────────────────────────────────────── */
const OUTCOMES = ["conversation", "voicemail", "no_answer", "gatekeeper", "wrong_number", "disconnected", "failed"];
const INTERESTS = ["hot", "warm", "neutral", "cold", "rejected"];
const NEXT_ACTIONS = ["send_brochure", "callback", "follow_up_email", "close_deal", "no_action"];

function HumanNotes({ call }) {
  const has = call.human_caller || call.human_call_datetime || call.human_status || call.human_comment;
  if (!has) return null;
  return (
    <div className="human-notes">
      <div className="hn-h">Human notes (from sheet)</div>
      <div className="hn-grid">
        {call.human_caller && <div><div className="hn-k">Caller</div><div className="hn-v">{call.human_caller}</div></div>}
        {call.human_call_datetime && <div><div className="hn-k">When</div><div className="hn-v">{call.human_call_datetime}</div></div>}
        {call.human_status && <div><div className="hn-k">Status</div><div className="hn-v">{call.human_status}</div></div>}
        {call.human_comment && <div style={{ gridColumn: "1 / -1" }}><div className="hn-k">Comment</div><div className="hn-v">{call.human_comment}</div></div>}
      </div>
    </div>
  );
}

function CallLogRow({ call, topics }) {
  const [open, setOpen] = useState(false);
  const tier = call.tier;
  const startedAt = call.started_at ? new Date(call.started_at.endsWith("Z") ? call.started_at : call.started_at + "Z") : null;
  const dateStr = startedAt ? startedAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const topicName = topics?.find(t => t.id === call.topic_id)?.name || call.topic_name || `Topic ${call.topic_id}`;
  const hasHuman = !!(call.human_caller || call.human_call_datetime || call.human_status || call.human_comment);

  // For DetailPanel reuse: it expects a conversation_id and either a preloaded
  // ElevenLabs payload or it'll fetch one. We skip the fetch when audio
  // isn't eligible (older call → audio likely 404s). Transcript is also from
  // ElevenLabs, but we have call.transcript in the DB row as a fallback.
  const convId = call.elevenlabs_conversation_id;

  return (
    <div className={`cl-row ${open ? "open" : ""} ${tier ? `tier-${tier}` : ""}`}>
      <div className="cl-row-head" onClick={() => setOpen(o => !o)}>
        <div className="cl-score" title={tier ? `${tier} — high priority` : "low priority"}>{call.relevance_score}</div>
        <div className="cl-main">
          <div className="cl-store">
            {call.store_name}
            {hasHuman && <span className="cl-note-icon" title="Human notes from sheet">✎</span>}
          </div>
          {call.call_summary && <div className="cl-summary">{call.call_summary}</div>}
          <div className="cl-meta">
            <span>{dateStr}</span>
            {call.store_city && <span>{call.store_city}</span>}
            {call.spoke_with_name && <span>👤 {call.spoke_with_name}</span>}
            {call.duration_seconds != null && <span>{fmt.dur(call.duration_seconds)}</span>}
            {call.callback_requested ? <span style={{ color: "var(--yellow)" }}>📅 callback</span> : null}
            {call.email_requested ? <span style={{ color: "var(--accent)" }}>✉ email</span> : null}
          </div>
        </div>
        <div className="cv-col">
          {call.outcome && <span className={`stag ${call.outcome === "conversation" ? "ok" : call.outcome === "rejected" ? "bad" : "dim"}`}>{call.outcome}</span>}
        </div>
        <div className="cv-col" style={{ fontSize: 10 }}>
          {call.interest_level || "—"}
        </div>
        <div className="cv-col" style={{ fontSize: 10, color: "var(--text3)" }}>
          {topicName.split(" - ")[0]}
        </div>
        <div className="cv-col" style={{ fontSize: 9, color: "var(--text3)" }}>
          {call.audio_eligible ? "🔊" : ""}
        </div>
        <div className={`chev ${open ? "open" : ""}`}>›</div>
      </div>
      {open && (
        <div className="detail-panel">
          <HumanNotes call={call} />
          {convId
            ? <DetailPanel convId={convId} audioEligible={call.audio_eligible} />
            : <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>
                No ElevenLabs conversation ID for this call.
              </div>
          }
        </div>
      )}
    </div>
  );
}

function CallLogTab() {
  const [calls, setCalls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [topics, setTopics] = useState([]);

  // Filters
  const [topic, setTopic] = useState("");
  const [outcome, setOutcome] = useState("");
  const [interest, setInterest] = useState("");
  const [relevance, setRelevance] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [q, setQ] = useState("");
  const [hasCallback, setHasCallback] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [nextAction, setNextAction] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' | 'relevance' | 'duration'

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (topic) p.set("topic", topic);
    if (outcome) p.set("outcome", outcome);
    if (interest) p.set("interest", interest);
    if (relevance) p.set("relevance", relevance);
    if (since) p.set("since", since);
    if (until) p.set("until", until);
    if (q.trim()) p.set("q", q.trim());
    if (hasCallback) p.set("has_callback", "1");
    if (hasEmail) p.set("has_email", "1");
    if (nextAction) p.set("next_action", nextAction);
    return p;
  }, [topic, outcome, interest, relevance, since, until, q, hasCallback, hasEmail, nextAction]);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const r = await apiFetch(`/manager/calls?${buildParams()}`);
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`Error ${r.status}${r.status === 502 ? " — manager API not running" : ""}: ${text.slice(0, 120)}`);
      }
      const d = await r.json();
      setCalls(d.calls || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [buildParams]);

  const loadTopics = useCallback(async () => {
    try {
      const r = await apiFetch("/manager/topics");
      if (r.ok) {
        const d = await r.json();
        setTopics(d.topics || []);
      }
    } catch (_) {}
  }, []);

  useEffect(() => { loadTopics(); }, [loadTopics]);
  useEffect(() => { load(); }, [load]);

  // Live updates: refetch on each call_end while a run is active
  useActiveRunCallEnd(load);

  const sorted = useMemo(() => {
    if (!calls) return [];
    const arr = [...calls];
    if (sortBy === "relevance") {
      arr.sort((a, b) => (b.relevance_score - a.relevance_score) ||
        (new Date(b.started_at) - new Date(a.started_at)));
    } else if (sortBy === "duration") {
      arr.sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
    }
    // 'date' is server's default order, no resort needed
    return arr;
  }, [calls, sortBy]);

  const tierCounts = useMemo(() => {
    const c = { green: 0, yellow: 0 };
    (calls || []).forEach(x => { if (x.tier === "green") c.green++; else if (x.tier === "yellow") c.yellow++; });
    return c;
  }, [calls]);

  const clearFilters = () => {
    setTopic(""); setOutcome(""); setInterest(""); setRelevance("");
    setSince(""); setUntil(""); setQ("");
    setHasCallback(false); setHasEmail(false); setNextAction("");
  };

  return (
    <div className="content">
      <div className="cl-filters">
        <input placeholder="Search store, city, person, summary…" value={q}
          onChange={e => setQ(e.target.value)} style={{ flex: "1 1 220px" }} />

        <select value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">All topics</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.id}: {t.name.slice(0, 30)}</option>)}
        </select>

        <select value={outcome} onChange={e => setOutcome(e.target.value)}>
          <option value="">Any outcome</option>
          {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <select value={interest} onChange={e => setInterest(e.target.value)}>
          <option value="">Any interest</option>
          {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <select value={relevance} onChange={e => setRelevance(e.target.value)}>
          <option value="">All</option>
          <option value="any">Worth contacting</option>
          <option value="green">🟢 Green only</option>
          <option value="yellow">🟡 Yellow only</option>
        </select>

        <select value={nextAction} onChange={e => setNextAction(e.target.value)}>
          <option value="">Any next action</option>
          {NEXT_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <input type="date" value={since} onChange={e => setSince(e.target.value)} title="From" />
        <input type="date" value={until} onChange={e => setUntil(e.target.value)} title="To" />

        <label className="cb"><input type="checkbox" checked={hasCallback}
          onChange={e => setHasCallback(e.target.checked)} /> callback</label>
        <label className="cb"><input type="checkbox" checked={hasEmail}
          onChange={e => setHasEmail(e.target.checked)} /> email asked</label>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Sort: newest</option>
          <option value="relevance">Sort: relevance</option>
          <option value="duration">Sort: duration</option>
        </select>

        <button className="clear-btn" onClick={clearFilters}>Clear</button>
        <button className="clear-btn" onClick={load} disabled={loading}>{loading ? "…" : "↺"}</button>
      </div>

      {err && <div className="err-box">⚠ {err}</div>}

      {calls !== null && (
        <div className="r-header">
          <div className="r-title">
            Calls <span className="badge">{sorted.length}</span>
            {tierCounts.green > 0 && <span className="badge" style={{ background: "var(--green-bg)", color: "var(--green)" }}>🟢 {tierCounts.green}</span>}
            {tierCounts.yellow > 0 && <span className="badge" style={{ background: "var(--yellow-bg)", color: "var(--yellow)" }}>🟡 {tierCounts.yellow}</span>}
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>
            audio for last 100 only
          </span>
        </div>
      )}

      {loading && calls === null && (
        <div className="loading"><div className="spinner" /><span>Loading call log…</span></div>
      )}

      {!loading && sorted.length === 0 && calls !== null && (
        <div className="empty">
          <div className="empty-ico">○</div>
          <div className="empty-txt">No calls match</div>
          <div className="empty-sub">Try clearing filters</div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="conv-list">
          {sorted.map(c => <CallLogRow key={c.id} call={c} topics={topics} />)}
        </div>
      )}
    </div>
  );
}

/* ─── LAUNCH PAGE ─────────────────────────────────────────────── */
const STAGE_LABELS = {
  initializing: "Initializing",
  calling: "Calling",
  waiting_for_webhook: "Waiting for ElevenLabs",
  parsing: "Parsing transcript",
  syncing: "Syncing sheets",
  done: "Finished",
  cancelled: "Cancelled",
  error: "Error",
};
const isActiveStatus = s => s === "running" || s === "pending";

function TopicCard({ topic, selected, onSelect }) {
  return (
    <div className={`tcard ${selected ? "selected" : ""}`} onClick={() => onSelect(topic.id)}>
      <div className="tcard-head">
        <div className="tcard-title">{topic.name}</div>
        <div className="tcard-id">#{topic.id}</div>
      </div>
      {topic.pitch && <div className="tcard-pitch">{topic.pitch}</div>}
      <div className="tcard-stats">
        <div className="tstat">
          <div className="tstat-n">{topic.uncalled_count}</div>
          <div className="tstat-l">to call</div>
        </div>
        <div className="tstat">
          <div className="tstat-n">{topic.callbacks_due_count}</div>
          <div className="tstat-l">callbacks due</div>
        </div>
      </div>
    </div>
  );
}

function ActiveRunPanel({ run, onCancel, cancelling }) {
  const total = run.total_planned || run.max_calls || 0;
  const progress = total > 0 ? Math.min(100, (run.calls_made / total) * 100) : 0;
  const stageLabel = STAGE_LABELS[run.stage] || run.stage || "—";
  const isRunning = isActiveStatus(run.status);

  return (
    <div className="run-panel">
      <div className="run-head">
        <div className="run-title">
          Active run #{run.id}
          <span className="run-stage">
            {isRunning && <span className="pulse" />}
            {stageLabel}
          </span>
        </div>
        {isRunning && (
          <button className="cancel-btn" onClick={onCancel} disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel run"}
          </button>
        )}
      </div>

      <div className="run-counters">
        <div className="rc"><div className="rc-n">{run.calls_made}</div><div className="rc-l">made</div></div>
        <div className="rc"><div className="rc-n">{run.conversations}</div><div className="rc-l">conversations</div></div>
        <div className="rc"><div className="rc-n">{run.errors}</div><div className="rc-l">errors</div></div>
        <div className="rc"><div className="rc-n">{total || "—"}</div><div className="rc-l">planned</div></div>
      </div>

      {total > 0 && <div className="rc-bar"><span style={{ width: `${progress}%` }} /></div>}

      <div className="run-meta" style={{ marginTop: 10 }}>
        {run.current_store && <span>📞 {run.current_store}</span>}
        {run.last_outcome && <span>last: {run.last_outcome}</span>}
        {run.error_msg && <span style={{ color: "var(--red)" }}>⚠ {run.error_msg}</span>}
      </div>
    </div>
  );
}

function RunHistoryRow({ row }) {
  const fmtT = ts => !ts ? "—" : new Date(ts.endsWith("Z") ? ts : ts + "Z")
    .toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="run-row">
      <div className="run-id">#{row.id}</div>
      <div className="run-topic">
        Topic {row.topic_id ?? "—"}
        {row.include_callbacks ? <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginLeft: 8 }}>+ callbacks</span> : null}
      </div>
      <div><span className={`run-status-tag ${row.status}`}>{row.status}</span></div>
      <div className="run-cell-ts">{row.calls_made}/{row.total_planned || row.max_calls || "—"} calls</div>
      <div className="run-cell-ts">{fmtT(row.started_at)}</div>
      <div className="run-cell-ts">{row.finished_at ? fmtT(row.finished_at) : (isActiveStatus(row.status) ? "running…" : "—")}</div>
    </div>
  );
}

function LaunchPage() {
  const [topics, setTopics] = useState(null);
  const [topicsErr, setTopicsErr] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [maxCalls, setMaxCalls] = useState(10);
  const [includeCallbacks, setIncludeCallbacks] = useState(false);
  const [activeRun, setActiveRun] = useState(null);
  const [runs, setRuns] = useState([]);
  const [launching, setLaunching] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [launchErr, setLaunchErr] = useState(null);
  const eventSrcRef = useRef(null);

  const loadTopics = useCallback(async () => {
    setTopicsErr(null);
    try {
      const r = await apiFetch("/manager/topics");
      if (!r.ok) throw new Error(`Error ${r.status}${r.status === 502 ? " — manager API not running" : ""}`);
      const d = await r.json();
      setTopics(d.topics || []);
    } catch (e) { setTopicsErr(e.message); }
  }, []);

  const loadRuns = useCallback(async () => {
    try {
      const r = await apiFetch("/manager/runs?limit=20");
      if (!r.ok) return;
      const d = await r.json();
      setRuns(d.runs || []);
      // If there's an active run on the server, attach to it
      if (d.active_run_id && (!activeRun || activeRun.id !== d.active_run_id)) {
        const ar = (d.runs || []).find(x => x.id === d.active_run_id);
        if (ar) setActiveRun(ar);
      } else if (!d.active_run_id && activeRun && isActiveStatus(activeRun.status)) {
        // Server says no active — refresh the run row to get final state
        const r2 = await apiFetch(`/manager/runs/${activeRun.id}`);
        if (r2.ok) setActiveRun(await r2.json());
      }
    } catch (_) {}
  }, [activeRun]);

  useEffect(() => { loadTopics(); loadRuns(); }, []);

  // Open SSE stream when there's an active run
  useEffect(() => {
    if (!activeRun || !isActiveStatus(activeRun.status)) {
      if (eventSrcRef.current) { eventSrcRef.current.close(); eventSrcRef.current = null; }
      return;
    }
    if (eventSrcRef.current) return; // already streaming this run

    const url = new URL(`/api/manager/runs/${activeRun.id}/stream`, window.location.origin);
    url.searchParams.set("code", getAccessCode());
    const es = new EventSource(url);
    eventSrcRef.current = es;

    const handler = (e) => {
      try {
        const data = JSON.parse(e.data || "{}");
        if (data.snapshot) {
          setActiveRun(prev => prev ? { ...prev, ...data.snapshot } : prev);
        } else if (data.status) {
          setActiveRun(prev => prev ? { ...prev, ...data } : prev);
        }
      } catch (_) {}
    };
    es.addEventListener("snapshot", handler);
    es.addEventListener("session_start", handler);
    es.addEventListener("call_start", handler);
    es.addEventListener("waiting_for_webhook", handler);
    es.addEventListener("parsing", handler);
    es.addEventListener("call_end", handler);
    es.addEventListener("progress", handler);
    es.addEventListener("syncing", handler);
    es.addEventListener("session_end", handler);
    es.addEventListener("status_change", handler);
    es.addEventListener("end", () => {
      es.close();
      eventSrcRef.current = null;
      // Refresh runs list and topic counts when the run ends
      loadRuns();
      loadTopics();
    });
    es.onerror = () => { /* will auto-reconnect; ignore transient */ };

    return () => { es.close(); eventSrcRef.current = null; };
  }, [activeRun?.id, activeRun?.status, loadRuns, loadTopics]);

  const launch = useCallback(async () => {
    if (!selectedTopic) return;
    setLaunching(true); setLaunchErr(null);
    try {
      const r = await apiFetch("/manager/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: selectedTopic,
          max_calls: maxCalls,
          include_callbacks: includeCallbacks,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
      setActiveRun(d);
      loadRuns();
    } catch (e) { setLaunchErr(e.message); }
    finally { setLaunching(false); }
  }, [selectedTopic, maxCalls, includeCallbacks, loadRuns]);

  const cancel = useCallback(async () => {
    if (!activeRun) return;
    setCancelling(true);
    try {
      await apiFetch(`/manager/runs/${activeRun.id}/cancel`, { method: "POST" });
    } catch (_) {}
    finally { setCancelling(false); }
  }, [activeRun]);

  const selectedTopicObj = topics?.find(t => t.id === selectedTopic);
  const isRunActive = activeRun && isActiveStatus(activeRun.status);

  return (
    <div className="content">
      {topicsErr && <div className="err-box">⚠ {topicsErr}</div>}

      {!topics && !topicsErr && <div className="loading"><div className="spinner" /><span>Loading topics…</span></div>}

      {topics && (
        <>
          <div className="r-header">
            <div className="r-title">Pick a topic <span className="badge">{topics.length}</span></div>
            <button className="refresh-btn" onClick={() => { loadTopics(); loadRuns(); }}>↺ Refresh</button>
          </div>
          <div className="launch-grid">
            {topics.map(t => (
              <TopicCard key={t.id} topic={t} selected={selectedTopic === t.id} onSelect={setSelectedTopic} />
            ))}
          </div>

          {selectedTopicObj && (
            <div className="launch-form">
              <div className="form-row">
                <label>Max calls</label>
                <input type="number" min="1" max="500" value={maxCalls}
                  onChange={e => setMaxCalls(parseInt(e.target.value) || 1)} />
                <label className="cb">
                  <input type="checkbox" checked={includeCallbacks}
                    onChange={e => setIncludeCallbacks(e.target.checked)} />
                  Include due callbacks ({selectedTopicObj.callbacks_due_count})
                </label>
              </div>
              <div className="form-row">
                <button className="go-btn" onClick={launch} disabled={launching || isRunActive}>
                  {launching ? "Launching…" : isRunActive ? "Run already active" : `Start run → ${selectedTopicObj.name}`}
                </button>
              </div>
              {launchErr && <div className="err-box">⚠ {launchErr}</div>}
            </div>
          )}
        </>
      )}

      {activeRun && (
        <ActiveRunPanel run={activeRun} onCancel={cancel} cancelling={cancelling} />
      )}

      <div className="r-header" style={{ marginTop: 16 }}>
        <div className="r-title">Recent runs {runs.length > 0 && <span className="badge">{runs.length}</span>}</div>
      </div>
      {runs.length === 0
        ? <div className="empty"><div className="empty-ico">○</div><div className="empty-txt">No runs yet</div><div className="empty-sub">Launched runs will appear here</div></div>
        : <div className="runs-tbl">{runs.map(r => <RunHistoryRow key={r.id} row={r} />)}</div>}
    </div>
  );
}

/* ─── APP ────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("history");

  const pages = [
    { id: "history", label: "History", icon: "📋" },
    { id: "launch",  label: "Launch",  icon: "▶" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="topbar">
          <div className="logo">Call<span>Vault</span></div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>
            Protected link access
          </div>
        </div>

        <div className="pages">
          {pages.map(p => (
            <button key={p.id} className={`pg ${page === p.id ? "active" : ""}`} onClick={() => setPage(p.id)}>
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        {page === "history" && <HistoryPage />}
        {page === "launch"  && <LaunchPage />}
      </div>
    </>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

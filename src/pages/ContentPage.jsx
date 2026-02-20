import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/* ─── ADMIN EMAIL ─── */
const ADMIN_EMAIL = 'amitjoh@gmail.com';
function isAdmin(user) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/* ─── Google Fonts ─── */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&family=Share+Tech+Mono&display=swap';
function injectFonts() {
  if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_HREF;
    document.head.appendChild(l);
  }
}

/* ─── CSS ─── */
const CSS = `
:root {
  --eq-bg:#030a06; --eq-bg2:#060f09; --eq-bg3:#0a1a0f;
  --eq-border:rgba(0,255,140,.12); --eq-border2:rgba(0,255,140,.22);
  --eq-green:#00ff8c; --eq-cyan:#00e5ff; --eq-gold:#ffd166;
  --eq-orange:#ff7f51; --eq-red:#ff4d6d; --eq-white:#e8f4ed;
  --eq-muted:rgba(232,244,237,.35);
  --eq-mono:'Share Tech Mono',monospace;
  --eq-display:'Orbitron',monospace;
  --eq-body:'Rajdhani',sans-serif;
}
.eq-root { margin:0; padding:0; box-sizing:border-box; }
.eq-app {
  width:100vw; height:100vh; overflow:hidden;
  background:var(--eq-bg); color:var(--eq-white);
  font-family:var(--eq-body);
  display:flex; flex-direction:column; position:relative; z-index:1;
}
#eq-bgCanvas { position:fixed; inset:0; z-index:0; pointer-events:none; }
.eq-scanlines {
  position:fixed; inset:0; z-index:0; pointer-events:none;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);
}
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(0,255,140,.2); border-radius:4px; }
::-webkit-scrollbar-thumb:hover { background:rgba(0,255,140,.4); }

/* TOPBAR */
.eq-topbar {
  height:58px; display:flex; align-items:center; justify-content:space-between;
  padding:0 28px;
  background:rgba(3,10,6,.9);
  border-bottom:1px solid var(--eq-border2);
  backdrop-filter:blur(12px); flex-shrink:0; position:relative; z-index:10;
}
.eq-topbar-left { display:flex; align-items:center; gap:16px; }
.eq-logo-mark {
  width:32px; height:32px;
  background:linear-gradient(135deg,var(--eq-green),var(--eq-cyan));
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  display:flex; align-items:center; justify-content:center;
  animation:eqRotateGlow 6s ease-in-out infinite;
}
@keyframes eqRotateGlow {
  0%,100%{filter:drop-shadow(0 0 6px var(--eq-green))}
  50%{filter:drop-shadow(0 0 14px var(--eq-cyan))}
}
.eq-brand {
  font-family:var(--eq-display); font-size:18px; font-weight:700; letter-spacing:2px;
  background:linear-gradient(90deg,var(--eq-green),var(--eq-cyan));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.eq-brand span { opacity:.5; font-weight:400; }
.eq-topbar-center {
  position:absolute; left:50%; transform:translateX(-50%);
  font-family:var(--eq-mono); font-size:11px; letter-spacing:4px;
  color:rgba(0,255,140,.45); text-transform:uppercase;
}
.eq-topbar-right { display:flex; align-items:center; gap:20px; }
.eq-nav-pill {
  font-family:var(--eq-mono); font-size:10px; letter-spacing:2px;
  color:var(--eq-muted); cursor:pointer; padding:5px 12px; border-radius:2px;
  border:1px solid transparent; transition:.2s;
}
.eq-nav-pill:hover,.eq-nav-pill.active {
  color:var(--eq-green); border-color:var(--eq-border2);
  background:rgba(0,255,140,.06);
}
.eq-user-chip {
  display:flex; align-items:center; gap:8px; padding:5px 14px;
  background:rgba(0,255,140,.06); border:1px solid var(--eq-border2);
  border-radius:2px; cursor:pointer; position:relative;
}
.eq-avatar {
  width:22px; height:22px; border-radius:50%;
  background:linear-gradient(135deg,var(--eq-green),var(--eq-cyan));
  display:flex; align-items:center; justify-content:center;
  font-family:var(--eq-mono); font-size:10px; color:#000; font-weight:700;
}
.eq-user-name { font-family:var(--eq-mono); font-size:10px; color:var(--eq-green); letter-spacing:1px; }
.eq-admin-badge {
  font-family:var(--eq-mono); font-size:8px; letter-spacing:2px;
  padding:1px 6px; border-radius:1px;
  background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,127,81,.15));
  border:1px solid rgba(255,209,102,.4); color:var(--eq-gold);
  text-transform:uppercase;
}
.eq-signout-menu {
  position:absolute; top:calc(100% + 8px); right:0;
  background:#060f09; border:1px solid var(--eq-border2);
  border-radius:3px; min-width:160px; overflow:hidden;
  z-index:200; box-shadow:0 8px 24px rgba(0,0,0,.5);
  animation:eqFadeUp .15s ease;
}
@keyframes eqFadeUp { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
.eq-signout-item {
  padding:10px 16px; font-family:var(--eq-mono); font-size:10px;
  letter-spacing:2px; color:var(--eq-muted); cursor:pointer;
  border-bottom:1px solid var(--eq-border); transition:.15s;
}
.eq-signout-item:last-child { border-bottom:none; }
.eq-signout-item:hover { color:var(--eq-red); background:rgba(255,77,109,.05); }

/* HERO */
.eq-hero {
  padding:28px 28px 18px; text-align:center; position:relative; flex-shrink:0;
}
.eq-hero::after {
  content:''; position:absolute; bottom:0; left:10%; width:80%; height:1px;
  background:linear-gradient(90deg,transparent,var(--eq-border2),transparent);
}
.eq-hero-eyebrow {
  font-family:var(--eq-mono); font-size:10px; letter-spacing:6px;
  color:rgba(0,255,140,.5); text-transform:uppercase; margin-bottom:10px;
}
.eq-hero-title {
  font-family:var(--eq-display); font-size:36px; font-weight:900;
  letter-spacing:-1px; line-height:1;
  background:linear-gradient(135deg,var(--eq-green) 0%,var(--eq-cyan) 40%,var(--eq-white) 70%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  animation:eqTitlePulse 4s ease-in-out infinite;
}
@keyframes eqTitlePulse {
  0%,100%{filter:drop-shadow(0 0 8px rgba(0,255,140,.2))}
  50%{filter:drop-shadow(0 0 20px rgba(0,255,140,.4))}
}
.eq-hero-sub {
  margin-top:6px; font-size:13px; color:var(--eq-muted);
  letter-spacing:3px; font-weight:300; font-family:var(--eq-mono);
}

/* MAIN BODY */
.eq-main { flex:1; display:flex; gap:0; padding:18px 20px; overflow:hidden; min-height:0; }

/* LEFT PANEL */
.eq-left {
  width:360px; flex-shrink:0; display:flex; flex-direction:column;
  background:rgba(6,15,9,.7); border:1px solid var(--eq-border);
  border-radius:4px; overflow:hidden; margin-right:16px;
}
.eq-panel-hdr {
  padding:12px 16px; border-bottom:1px solid var(--eq-border);
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
}
.eq-panel-title {
  font-family:var(--eq-mono); font-size:10px; letter-spacing:4px;
  color:rgba(0,255,140,.6); text-transform:uppercase;
}
.eq-model-count { font-family:var(--eq-mono); font-size:10px; color:var(--eq-muted); letter-spacing:2px; }
.eq-search-bar { padding:10px 14px; border-bottom:1px solid var(--eq-border); flex-shrink:0; }
.eq-search {
  width:100%; background:rgba(0,255,140,.04); border:1px solid var(--eq-border);
  border-radius:2px; padding:7px 12px; color:var(--eq-white);
  font-family:var(--eq-mono); font-size:11px; letter-spacing:1px;
  outline:none; transition:.2s;
}
.eq-search::placeholder { color:var(--eq-muted); }
.eq-search:focus { border-color:var(--eq-border2); background:rgba(0,255,140,.07); }
.eq-model-list { flex:1; overflow-y:auto; padding:8px 0; }

/* CATEGORIES */
.eq-cat-hdr {
  padding:8px 16px; display:flex; align-items:center; gap:10px;
  cursor:pointer; user-select:none; transition:.15s;
}
.eq-cat-hdr:hover { background:rgba(0,255,140,.04); }
.eq-cat-icon {
  width:20px; height:20px; border-radius:2px;
  display:flex; align-items:center; justify-content:center;
  font-size:11px; flex-shrink:0;
}
.eq-cat-name { font-family:var(--eq-mono); font-size:10px; letter-spacing:2px; text-transform:uppercase; flex:1; }
.eq-cat-badge { font-family:var(--eq-mono); font-size:9px; letter-spacing:1px; padding:2px 7px; border-radius:10px; }
.eq-cat-chev { font-size:9px; color:var(--eq-muted); transition:.2s; display:inline-block; }
.eq-cat-chev.open { transform:rotate(90deg); }
.eq-cat-models { overflow:hidden; transition:max-height .3s ease; }

/* MODEL ITEMS */
.eq-model-item {
  padding:8px 16px 8px 46px; cursor:pointer; transition:.15s;
  border-left:2px solid transparent; display:flex; align-items:center; gap:10px;
}
.eq-model-item:hover { background:rgba(0,255,140,.05); border-left-color:rgba(0,255,140,.3); }
.eq-model-item.active { background:rgba(0,255,140,.09); border-left-color:var(--eq-green); }
.eq-model-name { font-family:var(--eq-body); font-size:13px; font-weight:500; color:var(--eq-white); flex:1; }
.eq-model-item:hover .eq-model-name,.eq-model-item.active .eq-model-name { color:var(--eq-green); }
.eq-model-tag {
  font-family:var(--eq-mono); font-size:8px; letter-spacing:1px; padding:2px 6px;
  border-radius:1px; background:rgba(255,255,255,.05); color:var(--eq-muted); flex-shrink:0;
}
.eq-model-item.active .eq-model-tag { background:rgba(0,255,140,.1); color:rgba(0,255,140,.6); }

/* RIGHT PANEL */
.eq-right {
  flex:1; display:flex; flex-direction:column;
  background:rgba(6,15,9,.7); border:1px solid var(--eq-border);
  border-radius:4px; overflow:hidden; min-width:0;
}
.eq-placeholder {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:16px; opacity:.4;
}
.eq-placeholder-icon { font-size:48px; opacity:.3; }
.eq-placeholder p { font-family:var(--eq-mono); font-size:11px; letter-spacing:4px; color:var(--eq-muted); text-transform:uppercase; }

/* DETAIL TOPBAR */
.eq-detail-topbar { border-bottom:1px solid var(--eq-border); flex-shrink:0; }
.eq-detail-row1 {
  padding:14px 22px 12px; display:flex; align-items:center; gap:14px;
  border-bottom:1px solid var(--eq-border);
}
.eq-detail-icon { width:38px; height:38px; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.eq-detail-name { font-family:var(--eq-display); font-size:18px; font-weight:700; letter-spacing:1px; line-height:1.1; }
.eq-detail-full { font-family:var(--eq-mono); font-size:10px; color:var(--eq-muted); letter-spacing:2px; margin-top:2px; }
.eq-chips { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.eq-dchip { font-family:var(--eq-mono); font-size:9px; letter-spacing:1.5px; padding:3px 10px; border-radius:1px; border:1px solid; text-transform:uppercase; }

/* TAB BAR */
.eq-tab-bar {
  display:flex; align-items:stretch; border-bottom:1px solid var(--eq-border);
  background:rgba(0,0,0,.25); flex-shrink:0; padding:0 22px;
  overflow-x:auto; scrollbar-width:none;
}
.eq-tab-bar::-webkit-scrollbar { display:none; }
.eq-tab-btn {
  display:flex; align-items:center; gap:8px; padding:11px 18px;
  font-family:var(--eq-mono); font-size:10px; letter-spacing:2px; text-transform:uppercase;
  color:var(--eq-muted); cursor:pointer; white-space:nowrap;
  border-bottom:2px solid transparent; transition:all .18s; margin-bottom:-1px;
}
.eq-tab-btn:hover { color:var(--eq-white); }
.eq-tab-btn.active { color:var(--eq-green); border-bottom-color:var(--eq-green); }
.eq-tab-dot { width:6px; height:6px; border-radius:50%; background:var(--eq-muted); flex-shrink:0; transition:.18s; }
.eq-tab-btn.active .eq-tab-dot { background:var(--eq-green); box-shadow:0 0 6px var(--eq-green); }
.eq-tab-badge {
  font-family:var(--eq-mono); font-size:8px; letter-spacing:1px; padding:1px 6px;
  border-radius:8px; background:rgba(255,255,255,.07); color:var(--eq-muted); transition:.18s;
}
.eq-tab-btn.active .eq-tab-badge { background:rgba(0,255,140,.15); color:var(--eq-green); }
.eq-tab-publish { margin-left:auto; }
.eq-tab-publish .eq-tab-dot { background:var(--eq-orange); }
.eq-tab-publish.active { color:var(--eq-orange); border-bottom-color:var(--eq-orange); }
.eq-tab-publish.active .eq-tab-dot { background:var(--eq-orange); box-shadow:0 0 6px var(--eq-orange); }

/* TAB PANES */
.eq-pane { display:none; flex:1; flex-direction:column; overflow:hidden; }
.eq-pane.active { display:flex; }

/* DETAIL BODY */
.eq-detail-body { flex:1; overflow-y:auto; padding:20px 22px; display:flex; flex-direction:column; gap:20px; }
.eq-overview { font-size:14px; line-height:1.75; color:rgba(232,244,237,.75); font-weight:400; letter-spacing:.3px; }
.eq-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.eq-stat-card { background:rgba(0,255,140,.03); border:1px solid var(--eq-border); border-radius:3px; padding:12px 14px; text-align:center; }
.eq-stat-val { font-family:var(--eq-display); font-size:18px; font-weight:700; line-height:1; }
.eq-stat-lbl { font-family:var(--eq-mono); font-size:9px; letter-spacing:2px; color:var(--eq-muted); margin-top:5px; text-transform:uppercase; }
.eq-section { background:rgba(0,0,0,.25); border:1px solid var(--eq-border); border-radius:3px; padding:16px 18px; }
.eq-sec-head {
  font-family:var(--eq-mono); font-size:9px; letter-spacing:4px; text-transform:uppercase;
  color:rgba(0,255,140,.5); margin-bottom:12px; display:flex; align-items:center; gap:8px;
}
.eq-sec-head::after { content:''; flex:1; height:1px; background:var(--eq-border); }
.eq-use-cases { display:flex; flex-wrap:wrap; gap:8px; }
.eq-use-chip {
  padding:5px 12px; border:1px solid var(--eq-border);
  font-family:var(--eq-mono); font-size:10px; letter-spacing:1px;
  color:var(--eq-muted); border-radius:2px; background:rgba(255,255,255,.02);
}
.eq-pros-cons { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.eq-pros h4,.eq-cons h4 { font-family:var(--eq-mono); font-size:9px; letter-spacing:3px; text-transform:uppercase; margin-bottom:8px; }
.eq-pros h4 { color:var(--eq-green); }
.eq-cons h4 { color:var(--eq-red); }
.eq-pros ul,.eq-cons ul { list-style:none; display:flex; flex-direction:column; gap:5px; }
.eq-pros li,.eq-cons li { font-size:12px; color:rgba(232,244,237,.65); padding-left:16px; position:relative; line-height:1.5; }
.eq-pros li::before { content:'✓'; position:absolute; left:0; color:var(--eq-green); font-size:10px; }
.eq-cons li::before { content:'✗'; position:absolute; left:0; color:var(--eq-red); font-size:10px; }
.eq-param-table { width:100%; border-collapse:collapse; }
.eq-param-table tr { border-bottom:1px solid rgba(0,255,140,.06); }
.eq-param-table tr:last-child { border-bottom:none; }
.eq-param-table td { padding:7px 10px; font-family:var(--eq-mono); font-size:11px; vertical-align:top; }
.eq-param-table td:first-child { color:var(--eq-green); width:38%; }
.eq-param-table td:last-child { color:var(--eq-muted); }
.eq-cplx-row { display:flex; align-items:center; gap:12px; margin-top:6px; }
.eq-cplx-lbl { font-family:var(--eq-mono); font-size:10px; color:var(--eq-muted); width:90px; letter-spacing:1px; }
.eq-cplx-bar { flex:1; height:5px; background:rgba(255,255,255,.06); border-radius:3px; overflow:hidden; }
.eq-cplx-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--eq-green),var(--eq-cyan)); transition:width .8s cubic-bezier(.4,0,.2,1); }
.eq-mini-chart { width:100%; height:100px; background:rgba(0,0,0,.2); border-radius:2px; overflow:hidden; }
.eq-mini-chart svg { width:100%; height:100%; }

/* FILE CARDS */
.eq-files-grid { padding:20px 22px; flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:12px; }
.eq-file-card {
  display:flex; align-items:center; gap:14px; padding:14px 16px;
  background:rgba(0,0,0,.25); border:1px solid var(--eq-border);
  border-radius:3px; transition:all .2s; position:relative; overflow:hidden;
}
.eq-file-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; }
.eq-file-card.nb-card::before { background:var(--eq-gold); }
.eq-file-card.csv-card::before { background:var(--eq-cyan); }
.eq-file-card:hover { border-color:var(--eq-border2); background:rgba(0,255,140,.03); transform:translateX(2px); }
.eq-file-icon { width:42px; height:42px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
.eq-file-info { flex:1; min-width:0; }
.eq-file-name { font-family:var(--eq-mono); font-size:12px; color:var(--eq-white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
.eq-file-meta { display:flex; gap:12px; align-items:center; font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); letter-spacing:1px; }
.eq-file-type { text-transform:uppercase; }
.eq-file-size { color:var(--eq-green); }
.eq-file-user { color:var(--eq-cyan); }
.eq-file-desc { font-size:11px; color:rgba(232,244,237,.5); margin-top:4px; font-family:var(--eq-body); line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.eq-file-actions { display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; }
.eq-fc-btn {
  padding:6px 14px; border-radius:2px; cursor:pointer;
  font-family:var(--eq-mono); font-size:9px; letter-spacing:2px;
  border:1px solid; transition:.15s; white-space:nowrap;
}
.eq-fc-dl { border-color:rgba(0,255,140,.25); color:var(--eq-green); background:rgba(0,255,140,.06); }
.eq-fc-dl:hover { background:rgba(0,255,140,.14); border-color:var(--eq-green); }
.eq-fc-view { border-color:rgba(0,229,255,.25); color:var(--eq-cyan); background:rgba(0,229,255,.06); }
.eq-fc-view:hover { background:rgba(0,229,255,.14); border-color:var(--eq-cyan); }
.eq-fc-del { border-color:rgba(255,77,109,.25); color:var(--eq-red); background:rgba(255,77,109,.04); }
.eq-fc-del:hover { background:rgba(255,77,109,.12); border-color:var(--eq-red); }

/* EMPTY STATE */
.eq-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:40px; }
.eq-empty-icon { font-size:40px; opacity:.25; }
.eq-empty-title { font-family:var(--eq-mono); font-size:11px; letter-spacing:4px; color:var(--eq-muted); text-transform:uppercase; }
.eq-empty-sub { font-family:var(--eq-mono); font-size:9px; letter-spacing:2px; color:rgba(232,244,237,.2); text-transform:uppercase; }

/* PUBLISH PANE */
.eq-publish-pane { padding:22px; flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:16px; }
.eq-pub-header {
  padding:14px 18px; background:rgba(255,127,81,.04);
  border:1px solid rgba(255,127,81,.2); border-radius:3px;
  display:flex; align-items:flex-start; gap:12px;
}
.eq-pub-icon { font-size:22px; }
.eq-pub-title { font-family:var(--eq-mono); font-size:11px; letter-spacing:2px; color:var(--eq-orange); text-transform:uppercase; margin-bottom:3px; }
.eq-pub-sub { font-size:12px; color:var(--eq-muted); font-family:var(--eq-body); }
.eq-pub-rule {
  padding:10px 14px; background:rgba(255,209,102,.04);
  border:1px solid rgba(255,209,102,.2); border-radius:3px;
  font-family:var(--eq-mono); font-size:10px; color:var(--eq-gold); letter-spacing:1px;
}
.eq-field { display:flex; flex-direction:column; gap:6px; }
.eq-field-lbl { font-family:var(--eq-mono); font-size:9px; letter-spacing:3px; color:rgba(0,255,140,.5); text-transform:uppercase; }
.eq-pub-input,.eq-pub-textarea {
  background:rgba(0,255,140,.03); border:1px solid var(--eq-border);
  border-radius:2px; padding:9px 12px; color:var(--eq-white);
  font-family:var(--eq-mono); font-size:11px; outline:none; transition:.2s; width:100%;
}
.eq-pub-input::placeholder,.eq-pub-textarea::placeholder { color:var(--eq-muted); }
.eq-pub-input:focus,.eq-pub-textarea:focus { border-color:var(--eq-border2); background:rgba(0,255,140,.06); }
.eq-pub-textarea { resize:vertical; min-height:70px; font-family:var(--eq-body); font-size:12px; }
.eq-dropzone {
  border:2px dashed rgba(255,127,81,.25); border-radius:4px;
  padding:28px; text-align:center; cursor:pointer; transition:.2s; position:relative;
}
.eq-dropzone.drag-over,.eq-dropzone:hover { border-color:var(--eq-orange); background:rgba(255,127,81,.04); }
.eq-dropzone input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
.eq-dz-icon { font-size:26px; margin-bottom:8px; opacity:.5; }
.eq-dz-title { font-family:var(--eq-mono); font-size:11px; color:var(--eq-orange); letter-spacing:2px; margin-bottom:4px; }
.eq-dz-sub { font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); letter-spacing:1px; }
.eq-staged-file {
  display:flex; align-items:center; gap:10px; padding:8px 12px;
  background:rgba(255,127,81,.04); border:1px solid rgba(255,127,81,.15);
  border-radius:2px;
}
.eq-sf-icon { font-size:15px; }
.eq-sf-info { flex:1; }
.eq-sf-name { font-family:var(--eq-mono); font-size:10px; color:var(--eq-white); }
.eq-sf-size { font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); }
.eq-sf-rm { color:var(--eq-muted); cursor:pointer; font-size:13px; transition:.15s; padding:2px 4px; }
.eq-sf-rm:hover { color:var(--eq-red); }
.eq-validation-error {
  padding:10px 14px; background:rgba(255,77,109,.06);
  border:1px solid rgba(255,77,109,.25); border-radius:2px;
  font-family:var(--eq-mono); font-size:10px; color:var(--eq-red); letter-spacing:1px;
}
.eq-btn-publish {
  padding:11px 28px; width:100%; text-transform:uppercase;
  background:linear-gradient(135deg,rgba(255,127,81,.2),rgba(255,77,109,.1));
  border:1px solid var(--eq-orange); color:var(--eq-orange);
  font-family:var(--eq-mono); font-size:11px; letter-spacing:3px;
  cursor:pointer; border-radius:2px; transition:.18s; position:relative; overflow:hidden;
}
.eq-btn-publish:hover:not(:disabled) { background:rgba(255,127,81,.25); box-shadow:0 0 16px rgba(255,127,81,.2); }
.eq-btn-publish:disabled { opacity:.35; cursor:not-allowed; }
.eq-pub-fill {
  position:absolute; top:0; left:0; height:100%;
  background:rgba(255,127,81,.2); pointer-events:none;
}

/* VIEWER MODAL */
.eq-viewer-overlay {
  position:fixed; inset:0; z-index:500;
  background:rgba(0,0,0,.9); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center;
  padding:24px;
}
.eq-viewer-box {
  width:100%; max-width:900px; max-height:90vh;
  background:#060f09; border:1px solid var(--eq-border2);
  border-radius:6px; display:flex; flex-direction:column;
  overflow:hidden;
}
.eq-viewer-top {
  padding:14px 20px; border-bottom:1px solid var(--eq-border);
  display:flex; align-items:center; justify-content:space-between;
  background:linear-gradient(135deg,rgba(0,255,140,.04),transparent); flex-shrink:0;
}
.eq-viewer-title { font-family:var(--eq-display); font-size:13px; font-weight:700; letter-spacing:1px; }
.eq-viewer-close {
  width:28px; height:28px; border-radius:2px;
  display:flex; align-items:center; justify-content:center;
  border:1px solid var(--eq-border); color:var(--eq-muted);
  cursor:pointer; font-size:16px; transition:.15s;
}
.eq-viewer-close:hover { border-color:var(--eq-red); color:var(--eq-red); }
.eq-viewer-body { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px; }

/* Notebook cell */
.eq-nb-cell { border:1px solid var(--eq-border); border-radius:3px; overflow:hidden; flex-shrink:0; }
.eq-nb-cell-type {
  padding:4px 12px; font-family:var(--eq-mono); font-size:8px; letter-spacing:2px;
  text-transform:uppercase; border-bottom:1px solid var(--eq-border);
}
.eq-nb-cell-type.code { background:rgba(0,255,140,.04); color:rgba(0,255,140,.6); }
.eq-nb-cell-type.markdown { background:rgba(0,229,255,.04); color:rgba(0,229,255,.6); }
.eq-nb-source {
  padding:12px 14px; font-family:var(--eq-mono); font-size:11px;
  color:#e8f4ed; white-space:pre-wrap; word-break:break-all; line-height:1.6;
  background:rgba(0,0,0,.2); overflow-x:auto; max-height:400px; overflow-y:auto;
  display:block; min-height:1.6em; margin:0;
}
.eq-nb-output {
  padding:8px 14px; font-family:var(--eq-mono); font-size:10px;
  color:rgba(232,244,237,.5); border-top:1px solid var(--eq-border);
  background:rgba(0,0,0,.3); white-space:pre-wrap; max-height:120px; overflow-y:auto;
}

/* CSV preview */
.eq-csv-table { width:100%; border-collapse:collapse; font-family:var(--eq-mono); font-size:11px; }
.eq-csv-table th { background:rgba(0,255,140,.06); color:var(--eq-green); padding:7px 10px; text-align:left; border-bottom:1px solid var(--eq-border); letter-spacing:1px; }
.eq-csv-table td { padding:6px 10px; color:rgba(232,244,237,.7); border-bottom:1px solid rgba(0,255,140,.04); }
.eq-csv-table tr:last-child td { border-bottom:none; }
.eq-csv-note { font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); letter-spacing:2px; margin-top:8px; text-align:center; }

/* TOAST */
.eq-toast {
  position:fixed; bottom:24px; right:24px; z-index:2000;
  background:#060f09; border-radius:4px; padding:12px 18px;
  display:flex; align-items:center; gap:12px;
  font-family:var(--eq-mono); font-size:11px; color:var(--eq-white);
  box-shadow:0 4px 24px rgba(0,0,0,.5);
  transform:translateY(60px); opacity:0; pointer-events:none;
  transition:all .3s cubic-bezier(.4,0,.2,1);
}
.eq-toast.eq-toast-show { transform:translateY(0); opacity:1; }
.eq-toast.success { border:1px solid var(--eq-green); }
.eq-toast.error   { border:1px solid var(--eq-red); }
.eq-toast-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.eq-toast.success .eq-toast-dot { background:var(--eq-green); box-shadow:0 0 8px var(--eq-green); }
.eq-toast.error   .eq-toast-dot { background:var(--eq-red); box-shadow:0 0 8px var(--eq-red); }

/* LOADING */
.eq-loading { display:flex; align-items:center; justify-content:center; padding:32px; gap:10px; font-family:var(--eq-mono); font-size:10px; color:var(--eq-muted); letter-spacing:3px; }
.eq-spinner { width:14px; height:14px; border:1px solid rgba(0,255,140,.2); border-top-color:var(--eq-green); border-radius:50%; animation:eqSpin .7s linear infinite; }
@keyframes eqSpin { to{transform:rotate(360deg)} }

/* Category color helpers */
.eq-classical .eq-cat-icon { background:rgba(0,229,255,.1); color:var(--eq-cyan); }
.eq-classical .eq-cat-name { color:var(--eq-cyan); }
.eq-classical .eq-cat-badge { background:rgba(0,229,255,.1); color:var(--eq-cyan); border:1px solid rgba(0,229,255,.2); }
.eq-ml .eq-cat-icon { background:rgba(0,255,140,.1); color:var(--eq-green); }
.eq-ml .eq-cat-name { color:var(--eq-green); }
.eq-ml .eq-cat-badge { background:rgba(0,255,140,.1); color:var(--eq-green); border:1px solid rgba(0,255,140,.2); }
.eq-dl .eq-cat-icon { background:rgba(255,209,102,.1); color:var(--eq-gold); }
.eq-dl .eq-cat-name { color:var(--eq-gold); }
.eq-dl .eq-cat-badge { background:rgba(255,209,102,.1); color:var(--eq-gold); border:1px solid rgba(255,209,102,.2); }
.eq-hybrid .eq-cat-icon { background:rgba(255,127,81,.1); color:var(--eq-orange); }
.eq-hybrid .eq-cat-name { color:var(--eq-orange); }
.eq-hybrid .eq-cat-badge { background:rgba(255,127,81,.1); color:var(--eq-orange); border:1px solid rgba(255,127,81,.2); }
.eq-bayes .eq-cat-icon { background:rgba(200,140,255,.1); color:#c88cff; }
.eq-bayes .eq-cat-name { color:#c88cff; }
.eq-bayes .eq-cat-badge { background:rgba(200,140,255,.1); color:#c88cff; border:1px solid rgba(200,140,255,.2); }
.eq-rl .eq-cat-icon { background:rgba(255,77,109,.1); color:var(--eq-red); }
.eq-rl .eq-cat-name { color:var(--eq-red); }
.eq-rl .eq-cat-badge { background:rgba(255,77,109,.1); color:var(--eq-red); border:1px solid rgba(255,77,109,.2); }
`;

/* ─── MODEL DATA (unchanged from HTML) ─── */
const CATEGORIES = [
  {
    id:'classical', label:'Classical Statistical', icon:'📐', short:'STAT',
    models:[
      { id:'arima', name:'ARIMA / SARIMA', tag:'CLASSIC', fullName:'AutoRegressive Integrated Moving Average', overview:'ARIMA is the bedrock of time series forecasting. It combines autoregression (AR), differencing for stationarity (I), and moving average (MA) components. SARIMA extends it with seasonal terms, making it extremely powerful for cyclic financial data like indices, commodity prices, and currency pairs. For NIFTY 50 and similar series, SARIMA remains the best baseline you can build against.', complexity:{implementation:3,computation:2,tuning:3,interpretability:5}, useFor:['Trend Forecasting','Mean Reversion','Seasonality Capture','Price Level Prediction','Volatility Baseline'], pros:['Highly interpretable coefficients','Strong statistical foundation — AIC/BIC/Ljung-Box','Works well on stationary financial returns','SARIMA handles quarterly/monthly seasonality','Well-understood confidence intervals'], cons:['Assumes linear structure — misses non-linearity','Requires manual order selection (p,d,q)','Struggles with structural breaks','Single-step forecast degrades quickly'], params:[['p (AR order)','Lag terms — typically 1–3 for daily data'],['d (Difference)','1 for prices, 0 for returns'],['q (MA order)','Error lag terms'],['P,D,Q,s','Seasonal counterparts; s=5 for weekly, 252 for annual'],['AIC/BIC','Use for automatic order selection']], metrics:{accuracy:'★★★☆☆',speed:'★★★★★',interpretability:'★★★★★',complexity:'LOW'}, color:'var(--eq-cyan)', bg:'rgba(0,229,255,.1)', tags:['UNIVARIATE','STATIONARY','LINEAR'] },
      { id:'garch', name:'GARCH', tag:'VOL', fullName:'Generalized AutoRegressive Conditional Heteroskedasticity', overview:"GARCH models the time-varying variance (volatility) of financial returns. Markets don't have constant volatility — calm periods are followed by turbulent ones (volatility clustering). GARCH(1,1) is the workhorse: it captures this clustering, making it essential for options pricing, VaR calculation, and risk management in Indian markets. EGARCH and GJR-GARCH add asymmetry for the leverage effect.", complexity:{implementation:3,computation:3,tuning:3,interpretability:4}, useFor:['Volatility Forecasting','Options Pricing','VaR / Risk Management','Portfolio Optimization','Regime Detection'], pros:['Captures volatility clustering perfectly','EGARCH handles leverage effect','Fast estimation via MLE','Widely used in regulatory frameworks','Excellent for options Greeks'], cons:['Models variance only, not price direction','Requires ARCH-LM test for applicability','Tail risk can be underestimated','Parameter instability in regime shifts'], params:[['ω (omega)','Long-run variance term'],['α (alpha)','Weight on past squared residuals'],['β (beta)','Weight on past variance'],['p, q','ARCH and GARCH lags'],['Distribution','Normal, t, GED for fat tails']], metrics:{accuracy:'★★★★☆',speed:'★★★★★',interpretability:'★★★★☆',complexity:'LOW-MED'}, color:'var(--eq-cyan)', bg:'rgba(0,229,255,.1)', tags:['VOLATILITY','UNIVARIATE','MLE'] },
      { id:'var', name:'VAR', tag:'MULTI', fullName:'Vector AutoRegression', overview:'VAR extends ARIMA to multiple time series, allowing each variable to be modeled as a linear function of its own past and the past of all other variables. Essential for cross-asset analysis — e.g., modeling NIFTY50, Bank Nifty, and INR/USD jointly to capture spillover effects. Granger causality tests reveal which series "causes" others, giving genuine predictive insight.', complexity:{implementation:3,computation:3,tuning:3,interpretability:4}, useFor:['Cross-Asset Relationships','Macro-Financial Linkages','Impulse Response Analysis','Granger Causality','Index Basket Modeling'], pros:["No need to distinguish endogenous/exogenous",'Granger causality testing built in','Impulse response functions for shock analysis','Structural VAR (SVAR) adds economic constraints'], cons:['Parameter explosion with many variables','Stationarity required for all series','Out-of-sample performance can degrade','Colinearity between assets causes issues'], params:[['p (lag order)','Number of lags; use AIC/BIC to select'],['Variables','Choose correlated assets or indices'],['Deterministic','Include trend, constant, or seasonal dummies'],['Restrictions','Impose via SVAR for economic identification']], metrics:{accuracy:'★★★☆☆',speed:'★★★★☆',interpretability:'★★★★☆',complexity:'MEDIUM'}, color:'var(--eq-cyan)', bg:'rgba(0,229,255,.1)', tags:['MULTIVARIATE','LINEAR','GRANGER'] },
    ]
  },
  {
    id:'ml', label:'Machine Learning', icon:'🌲', short:'ML',
    models:[
      { id:'xgb', name:'XGBoost / LightGBM', tag:'BOOST', fullName:'Gradient Boosted Decision Trees for Time Series', overview:'XGBoost and LightGBM are gradient boosted tree ensembles that dominate tabular ML competitions. For time series, you engineer lag features (Yt-1, Yt-5, rolling means/stds, RSI, MACD) and treat it as a supervised regression problem. Surprisingly powerful for Indian equity data — they capture non-linear patterns that ARIMA misses, and LightGBM is blazing fast for large feature sets.', complexity:{implementation:4,computation:3,tuning:4,interpretability:3}, useFor:['Return Prediction','Feature-Rich Forecasting','Multi-step Recursive Forecast','Technical Indicator Modeling','Intraday Pattern Recognition'], pros:['Handles non-linearity and interactions naturally','SHAP values for feature attribution','Built-in regularization (L1/L2)','Handles missing values natively','Very fast with LightGBM'], cons:['Requires careful feature engineering','No inherent temporal ordering — must encode','Overfitting risk without proper CV strategy','Struggles with extrapolation beyond training range'], params:[['n_estimators','100–1000; use early stopping'],['max_depth','3–7; lower = less overfitting'],['learning_rate','0.01–0.1'],['Lag window','Feature lags: 1,2,3,5,10,21,63 days'],['CV Strategy','Walk-forward validation, never random split']], metrics:{accuracy:'★★★★☆',speed:'★★★★☆',interpretability:'★★★☆☆',complexity:'MEDIUM'}, color:'var(--eq-green)', bg:'rgba(0,255,140,.1)', tags:['ENSEMBLE','NON-LINEAR','TABULAR'] },
      { id:'svr', name:'SVR', tag:'KERNEL', fullName:'Support Vector Regression', overview:'SVR finds a hyperplane in a high-dimensional feature space that best fits the data within an epsilon-insensitive tube. The kernel trick (RBF, polynomial) allows capturing non-linear patterns without explicit feature transformation. Best suited for smaller datasets (< 10K samples) with clear, repeating patterns. SVR is relatively robust to outliers compared to neural networks.', complexity:{implementation:3,computation:3,tuning:3,interpretability:2}, useFor:['Small Dataset Forecasting','Options Premium Estimation','Pattern Matching','Regime-Specific Models'], pros:['Robust to outliers via epsilon-insensitive loss','Kernel trick captures non-linearity','Good generalization on small data','Only support vectors matter — sparse solution'], cons:['Slow training on large datasets (O(n³))','Kernel and hyperparameter selection is tricky','Lacks probabilistic output','Feature scaling is mandatory'], params:[['C (regularization)','Trade-off between margin and error'],['ε (epsilon)','Width of insensitive tube'],['kernel','rbf for most cases; poly for cyclical'],['γ (gamma)','Kernel width; auto or scale recommended']], metrics:{accuracy:'★★★☆☆',speed:'★★★☆☆',interpretability:'★★☆☆☆',complexity:'MEDIUM'}, color:'var(--eq-green)', bg:'rgba(0,255,140,.1)', tags:['KERNEL','SMALL-DATA','REGRESSION'] },
      { id:'elastic', name:'ElasticNet / Ridge / Lasso', tag:'LINEAR', fullName:'Regularized Linear Regression for Time Series', overview:'Linear models with L1 (Lasso), L2 (Ridge), or combined (ElasticNet) regularization. Often overlooked but remarkably effective as baselines and for interpretable factor models. Lasso performs automatic feature selection — essential when you have hundreds of technical indicators. ElasticNet is preferred for correlated features (as financial indicators tend to be).', complexity:{implementation:2,computation:1,tuning:2,interpretability:5}, useFor:['Factor Model Construction','Feature Selection (Lasso)','Interpretable Baselines','Alpha Research','Multi-factor Models'], pros:['Extremely fast — fits in milliseconds','Coefficients are directly interpretable','Lasso gives automatic sparsity','Excellent for high-dimensional feature sets','Works as meta-learner in ensembles'], cons:['Inherently linear — misses complex patterns','Requires stationarity of features','Sensitive to multicollinearity (use ElasticNet)','Limited forecasting horizon'], params:[['α (alpha)','Regularization strength'],['l1_ratio','0=Ridge, 1=Lasso, 0.5=ElasticNet'],['Features','Lag returns, RSI, MAs, volume ratios'],['Normalization','StandardScaler mandatory']], metrics:{accuracy:'★★☆☆☆',speed:'★★★★★',interpretability:'★★★★★',complexity:'LOW'}, color:'var(--eq-green)', bg:'rgba(0,255,140,.1)', tags:['LINEAR','REGULARIZED','INTERPRETABLE'] },
    ]
  },
  {
    id:'dl', label:'Deep Learning', icon:'🧠', short:'DL',
    models:[
      { id:'lstm', name:'LSTM / GRU', tag:'RNN', fullName:'Long Short-Term Memory / Gated Recurrent Unit', overview:'LSTMs were purpose-built for sequential data. The gating mechanism (input, forget, output gates) allows them to selectively remember or forget information across hundreds of time steps — exactly what markets need for long-term dependency modeling. GRUs are a lighter, faster variant with similar performance. Stacked LSTMs with dropout are a strong baseline for multi-horizon NIFTY forecasting.', complexity:{implementation:4,computation:4,tuning:5,interpretability:1}, useFor:['Multi-step Price Forecasting','Sequence Pattern Recognition','Long-term Dependency Capture','Multivariate Time Series','Return Distribution Modeling'], pros:['Learns complex temporal dependencies','Handles variable-length sequences','Multi-step forecasting natively','GRU trains 30% faster than LSTM','Strong with multivariate input (OHLCV)'], cons:['Prone to overfitting on small financial datasets','Training is slow on CPU','Hyperparameter sensitivity is high','Hard to interpret (black box)','Vanishing gradient still possible at very long sequences'], params:[['units','64–256 per layer'],['layers','2–3 stacked layers'],['dropout','0.2–0.4 for recurrent dropout'],['sequence_length','20–60 trading days'],['batch_size','16–64; smaller = more regularization']], metrics:{accuracy:'★★★★☆',speed:'★★☆☆☆',interpretability:'★☆☆☆☆',complexity:'HIGH'}, color:'var(--eq-gold)', bg:'rgba(255,209,102,.1)', tags:['RECURRENT','SEQUENTIAL','DEEP'] },
      { id:'tcn', name:'Temporal CNN (TCN)', tag:'CONV', fullName:'Temporal Convolutional Network with Dilated Causal Convolutions', overview:'TCNs use dilated causal convolutions to capture long-range dependencies without the sequential bottleneck of RNNs. Dilation allows exponentially large receptive fields — a TCN with 8 layers and dilation 1,2,4,8,16,32,64,128 covers 255 time steps. Crucially, TCNs can be fully parallelized during training, making them 5–10× faster than LSTMs. Excellent for high-frequency and intraday data.', complexity:{implementation:4,computation:3,tuning:4,interpretability:1}, useFor:['High-Frequency Data','Intraday Pattern Capture','Long Lookback Forecasting','Parallel Training Pipelines','Feature Extraction Backbone'], pros:['Parallelizable — much faster training than LSTMs','Stable gradients — no vanishing gradient issue','Flexible receptive field via dilation','Causal padding ensures no data leakage','Can replace LSTM in most architectures'], cons:['Less intuitive than LSTMs for practitioners','Receptive field is fixed at design time','Requires careful dilation factor choice','Not as widely implemented as LSTM in libraries'], params:[['filters','32–128 per layer'],['kernel_size','3–7; smaller for fine-grained patterns'],['dilation_factor','Powers of 2: 1,2,4,8,16...'],['n_blocks','4–8 blocks'],['dropout','0.1–0.3 within residual blocks']], metrics:{accuracy:'★★★★☆',speed:'★★★★☆',interpretability:'★☆☆☆☆',complexity:'HIGH'}, color:'var(--eq-gold)', bg:'rgba(255,209,102,.1)', tags:['CONVOLUTIONAL','CAUSAL','PARALLEL'] },
      { id:'transformer', name:'Transformer / TFT', tag:'ATTN', fullName:'Temporal Fusion Transformer (Attention-based Forecasting)', overview:'The Temporal Fusion Transformer (TFT) by Google DeepMind is the current state of the art for multi-horizon probabilistic forecasting. It combines multi-head attention, gated residual networks, and variable selection networks to handle static metadata, known future inputs (like holidays, expiry dates), and historical covariates simultaneously. For NIFTY options expiry cycles and derivative rollover patterns, TFT is extremely powerful.', complexity:{implementation:5,computation:5,tuning:5,interpretability:3}, useFor:['Multi-Horizon Probabilistic Forecasting','Options Expiry Patterns','Multi-asset Joint Forecasting','Attention-based Feature Attribution','Production Forecasting Systems'], pros:['State-of-the-art benchmark performance','Interpretable attention weights','Handles mixed-type inputs (static + temporal)','Quantile forecasting out of the box','Variable importance via gating networks'], cons:['Computationally very demanding','Requires large datasets (5K+ samples)','Complex architecture — many hyperparameters','Slow to converge','Needs PyTorch Lightning or specialized libraries'], params:[['d_model','32–256 embedding dimension'],['n_heads','4–8 attention heads'],['hidden_size','16–128'],['attention_head_size','4'],['dropout','0.1–0.2'],['learning_rate','0.001–0.01 with scheduler']], metrics:{accuracy:'★★★★★',speed:'★☆☆☆☆',interpretability:'★★★☆☆',complexity:'VERY HIGH'}, color:'var(--eq-gold)', bg:'rgba(255,209,102,.1)', tags:['ATTENTION','SOTA','PROBABILISTIC'] },
      { id:'nbeats', name:'N-BEATS / N-HiTS', tag:'NEURAL', fullName:'Neural Basis Expansion Analysis for Time Series (Nixtla)', overview:"N-BEATS is a pure deep learning forecasting architecture that requires no feature engineering, no domain knowledge, and no time series preprocessing. It uses backward and forward residual links with basis expansion blocks to decompose the series into trend and seasonality components interpretably. N-HiTS extends this with hierarchical interpolation for better multi-horizon forecasting. Both are from Nixtla, available in their neuralforecast library.", complexity:{implementation:3,computation:3,tuning:3,interpretability:3}, useFor:['Zero-Feature-Engineering Forecasting','Trend + Seasonality Decomposition','Multivariate Index Forecasting','Ensemble Base Learner','Production Deployment'], pros:['No feature engineering required','Interpretable decomposition (N-BEATS-I)','Outperforms LSTM in many benchmarks','Clean API via Nixtla neuralforecast','N-HiTS is faster with better long-horizon perf'], cons:['Still requires sufficient training data','Less flexible for custom features','N-HiTS can miss sharp turning points','Interpretability is limited to trend/seasonality split'], params:[['stack_types','generic or interpretable (trend+seasonality)'],['n_blocks','Number of blocks per stack: 3–5'],['mlp_units','256–512'],['n_harmonics','For seasonality stack'],['input_size','Lookback window']], metrics:{accuracy:'★★★★☆',speed:'★★★☆☆',interpretability:'★★★☆☆',complexity:'MEDIUM-HIGH'}, color:'var(--eq-gold)', bg:'rgba(255,209,102,.1)', tags:['BASIS-EXPANSION','NO-FEATURE-ENG','NIXTLA'] },
    ]
  },
  {
    id:'hybrid', label:'Hybrid / Ensemble', icon:'⚡', short:'HYBRID',
    models:[
      { id:'arima_lstm', name:'ARIMA + LSTM', tag:'HYBRID', fullName:'Linear-Nonlinear Hybrid Architecture', overview:'The most practical hybrid in quantitative finance: ARIMA captures the linear, stationary structure of the series while LSTM models the residuals (non-linear remainder). The insight is that ARIMA residuals, while white noise statistically, still contain exploitable non-linear patterns — and LSTMs excel at finding these. This architecture consistently outperforms either model alone on equity price series.', complexity:{implementation:4,computation:4,tuning:4,interpretability:2}, useFor:['NIFTY Price Level Forecasting','Residual Pattern Exploitation','Production Alpha Signals','Benchmark-Beating Models','Linear + Non-linear Decomposition'], pros:['Best of both worlds — linear + non-linear','ARIMA residuals provide clean LSTM input','Statistically grounded pipeline','Commonly used in academic research','Can be extended to SARIMA + LSTM'], cons:['Two-stage training complexity','ARIMA errors can propagate to LSTM','More hyperparameters to tune','Requires careful stationarity analysis'], params:[['Stage 1','Fit ARIMA(p,d,q) → extract residuals'],['Stage 2','Train LSTM on residuals'],['Combination','ŷ = ARIMA_forecast + LSTM_residual_forecast'],['Residual window','Use 30–60 day LSTM lookback on residuals']], metrics:{accuracy:'★★★★★',speed:'★★★☆☆',interpretability:'★★☆☆☆',complexity:'HIGH'}, color:'var(--eq-orange)', bg:'rgba(255,127,81,.1)', tags:['LINEAR+DL','TWO-STAGE','RESEARCH'] },
      { id:'stacking', name:'Statistical + ML Stacking', tag:'STACK', fullName:'Multi-Model Stacking with Meta-Learner', overview:'Stacking combines multiple diverse base models (ARIMA, XGBoost, LSTM, SVR) whose predictions are fed as features to a meta-learner (typically Ridge or LightGBM). The meta-learner learns which base model to trust in which market regime. Walk-forward stacking is essential — the meta-learner must be trained on out-of-sample base model predictions only to avoid look-ahead bias.', complexity:{implementation:5,computation:4,tuning:4,interpretability:2}, useFor:['Competition-Grade Forecasting','Multi-Regime Markets','Robust Production Models','Alpha Signal Combination','Diverse Model Aggregation'], pros:['Consistently outperforms any single model','Model diversity reduces variance','Meta-learner learns regime-switching implicitly','Robust to individual model failure','Winner of M4/M5 forecasting competitions'], cons:['Training time multiplied by number of base models','Walk-forward stacking is complex to implement','Risk of overfitting meta-learner','Requires large enough test set for meta training'], params:[['Base models','ARIMA, XGBoost, LSTM, SVR at minimum'],['Meta-learner','Ridge or LightGBM'],['CV strategy','Nested walk-forward CV mandatory'],['Diversity','Ensure base models use different feature sets']], metrics:{accuracy:'★★★★★',speed:'★★☆☆☆',interpretability:'★☆☆☆☆',complexity:'VERY HIGH'}, color:'var(--eq-orange)', bg:'rgba(255,127,81,.1)', tags:['ENSEMBLE','META-LEARNER','MULTI-MODEL'] },
      { id:'prophet_ml', name:'Prophet + ML', tag:'DECOMP', fullName:'Facebook Prophet for Seasonality + ML for Residuals', overview:'Facebook Prophet decomposes the time series into trend, yearly/weekly seasonality, and holiday effects. The residuals from this decomposition — which represent the "unexplained" variance — are then modeled by XGBoost or LSTM. This is particularly valuable for Indian markets where there are strong Diwali/budget seasonality effects that Prophet can model, leaving a cleaner signal for ML models.', complexity:{implementation:3,computation:3,tuning:3,interpretability:4}, useFor:['Seasonal Market Decomposition','Holiday Effect Modeling (Diwali, Budget)','Trend Extraction + ML Residuals','Explainable Pipeline','Business-Level Forecasting'], pros:['Prophet handles irregular seasonality elegantly','Indian market holidays easily configurable','Interpretable trend + seasonality components','XGBoost residuals add non-linear power','Prophet is robust to missing data'], cons:['Prophet is not designed for financial returns','Over-smoothing of trend can lose signal','Two-stage training pipeline complexity','Less competitive on ultra-high-frequency data'], params:[['Prophet params','changepoint_prior_scale, seasonality_mode'],['Indian holidays','Add NSE holidays to Prophet holiday frame'],['Residual model','XGBoost with lag features on Prophet residuals'],['Output','Prophet_forecast + residual_forecast']], metrics:{accuracy:'★★★★☆',speed:'★★★☆☆',interpretability:'★★★★☆',complexity:'MEDIUM-HIGH'}, color:'var(--eq-orange)', bg:'rgba(255,127,81,.1)', tags:['DECOMPOSITION','HOLIDAY-AWARE','EXPLAINABLE'] },
    ]
  },
  {
    id:'bayes', label:'Probabilistic / Bayesian', icon:'🔮', short:'BAYES',
    models:[
      { id:'gp', name:'Gaussian Processes (GP)', tag:'PROB', fullName:'Gaussian Process Regression for Time Series', overview:"GPs define a prior over functions and update it using data to give a full posterior distribution over predictions. Every prediction comes with a calibrated uncertainty estimate. For options traders and risk managers, this uncertainty is gold — you get not just a point forecast but a distribution. GP with a Matérn kernel works beautifully for financial series with smooth but non-differentiable paths.", complexity:{implementation:4,computation:4,tuning:3,interpretability:3}, useFor:['Options Pricing with Uncertainty','Small Dataset High-Stakes Forecasting','Hyperparameter Optimization (Bayesian Opt)','Active Learning for Data Collection','Confidence-Interval Trading Signals'], pros:['Full uncertainty quantification — posterior distribution','Principled Bayesian framework','Works excellently on small data','Kernel choice encodes domain knowledge','Non-parametric — extremely flexible'], cons:['O(n³) computational complexity — slow for large data','Kernel selection can be arbitrary','Struggles with non-stationarity','Memory intensive (n×n covariance matrix)'], params:[['kernel','Matérn 5/2 for financial data; RBF for smooth series'],['noise','WhiteKernel for observation noise'],['optimizer','L-BFGS-B for hyperparameter optimization'],['normalization','Normalize target to zero mean, unit variance']], metrics:{accuracy:'★★★☆☆',speed:'★★☆☆☆',interpretability:'★★★★☆',complexity:'MEDIUM-HIGH'}, color:'#c88cff', bg:'rgba(200,140,255,.1)', tags:['PROBABILISTIC','UNCERTAINTY','BAYESIAN'] },
      { id:'bsts', name:'BSTS', tag:'STRUCT', fullName:'Bayesian Structural Time Series', overview:"BSTS decomposes a time series into local level, local trend, regression components, and seasonal effects within a state-space framework. All parameters have posterior distributions, giving calibrated uncertainty. Google uses BSTS for causal impact analysis — measuring the effect of policy changes or events (like RBI rate decisions) on market series. The R package CausalImpact is built on BSTS.", complexity:{implementation:4,computation:3,tuning:3,interpretability:5}, useFor:['Causal Impact Analysis (RBI Events, Budget)','Interpretable Decomposition with Uncertainty','Structural Break Detection','Intervention Analysis','Nowcasting with Mixed-Frequency Data'], pros:['Full interpretability with uncertainty bounds','Spike-and-slab prior for variable selection','Handles irregular time series naturally','Causal inference framework built in','Excellent for event-study analysis in Indian markets'], cons:['MCMC sampling is slow','R is primary language (rstan/CausalImpact)','Python options (orbit) less mature','Requires careful prior specification'], params:[['Local level','Random walk on mean'],['Local trend','Random walk on slope'],['Seasonal','Dummy seasonality or trigonometric'],['Regression','Spike-and-slab for predictor selection']], metrics:{accuracy:'★★★☆☆',speed:'★★☆☆☆',interpretability:'★★★★★',complexity:'MEDIUM'}, color:'#c88cff', bg:'rgba(200,140,255,.1)', tags:['STATE-SPACE','CAUSAL','INTERPRETABLE'] },
      { id:'deepar', name:'DeepAR', tag:'PROB-DL', fullName:"Amazon's Probabilistic Forecasting with Autoregressive RNNs", overview:"DeepAR is Amazon's production forecasting model — it trains a single LSTM across thousands of related time series simultaneously, learning global patterns. Crucially, it outputs full probability distributions (e.g., quantiles 10%, 50%, 90%) rather than point estimates. This makes it ideal for portfolio-level forecasting where you need distributions over hundreds of stocks simultaneously. Available via AWS Forecast and GluonTS.", complexity:{implementation:4,computation:4,tuning:4,interpretability:2}, useFor:['Portfolio-Level Probabilistic Forecasting','P10/P50/P90 Quantile Signals','Multi-Series Global Models','Risk-Adjusted Position Sizing','Production Forecasting at Scale'], pros:['Single model for entire portfolio of assets','Full predictive distribution output','Learns cross-series patterns','Available via AWS SageMaker out of the box','Handles cold-start for new securities'], cons:['Requires many related series for best performance','Complex training setup (GluonTS/MXNet)','Black box — minimal interpretability','Needs GPU for reasonable training time'], params:[['context_length','Lookback window: 30–120 periods'],['prediction_length','Forecast horizon'],['likelihood','Gaussian, Student-t, NegBinomial'],['num_layers','2–3 LSTM layers'],['num_cells','40–200']], metrics:{accuracy:'★★★★☆',speed:'★★☆☆☆',interpretability:'★☆☆☆☆',complexity:'HIGH'}, color:'#c88cff', bg:'rgba(200,140,255,.1)', tags:['GLOBAL-MODEL','QUANTILE','AWS'] },
    ]
  },
  {
    id:'rl', label:'Reinforcement Learning', icon:'🤖', short:'RL',
    models:[
      { id:'ppo_dqn', name:'RL Agents (PPO / DQN)', tag:'AGENT', fullName:'Proximal Policy Optimization & Deep Q-Network for Trading', overview:"RL agents learn trading policies by directly optimizing a reward function (Sharpe ratio, P&L) through market environment interaction. PPO is the gold standard for continuous action spaces (position sizing), while DQN suits discrete actions (buy/sell/hold). The key advantage: you never explicitly define the forecast — the agent learns when to act by itself. For NIFTY F&O trading, RL agents can optimize entry/exit timing directly.", complexity:{implementation:5,computation:5,tuning:5,interpretability:1}, useFor:['Direct Trading Policy Optimization','Dynamic Position Sizing','Multi-Asset Portfolio Management','Options Strategy Learning','High-Frequency Execution Optimization'], pros:['No forecasting required — directly optimizes P&L','Adapts to changing market dynamics','Can incorporate transaction costs in reward','PPO handles continuous action (position size)','End-to-end learning of strategy'], cons:['Extremely difficult to train stably','Reward shaping errors can create erratic policies','Requires massive simulation data','Overfitting to historical regimes is common','Interpretability is nearly zero'], params:[['Reward','Sharpe ratio or risk-adjusted P&L recommended'],['State','OHLCV + technical indicators + position info'],['Action space','Discrete (DQN) or continuous (PPO)'],['Env','OpenAI Gym-compatible market environment'],['Clipping (PPO)','ε=0.2; prevents too-large policy updates']], metrics:{accuracy:'★★★☆☆',speed:'★☆☆☆☆',interpretability:'★☆☆☆☆',complexity:'VERY HIGH'}, color:'var(--eq-red)', bg:'rgba(255,77,109,.1)', tags:['POLICY-GRADIENT','END-TO-END','ADVANCED'] },
      { id:'marl', name:'Multi-Agent RL', tag:'MARL', fullName:'Multi-Agent Reinforcement Learning for Market Simulation', overview:'MARL places multiple RL agents in the same market environment, forcing them to compete and adapt. This creates emergent market dynamics — bid-ask spread formation, momentum, mean-reversion — that single-agent RL misses. Researchers use MARL for market microstructure simulation (LOB dynamics), adversarial testing of strategies, and studying market impact. It is cutting-edge research-level work.', complexity:{implementation:5,computation:5,tuning:5,interpretability:1}, useFor:['Market Microstructure Simulation','Adversarial Strategy Testing','Limit Order Book Dynamics','Market Impact Modeling','Academic Research & Strategy Stress-Testing'], pros:['Models emergent market behavior realistically','Enables adversarial robustness testing of strategies','Captures market impact of large orders','Research frontier — competitive advantage if mastered','MARL papers win top AI/finance conferences'], cons:['Extreme computational requirements','Non-stationarity: each agent adapts to others','No convergence guarantees in competitive settings','Very limited practical deployment history','Requires specialized MARL frameworks (RLlib, MADDPG)'], params:[['N agents','2–100 agents depending on scenario'],['Agent type','Heterogeneous: market makers + momentum + arbitrageurs'],['Shared env','Limit order book simulator'],['MADDPG','Multi-agent DDPG with centralized critic'],['Observation','Each agent sees partial market state']], metrics:{accuracy:'★★☆☆☆',speed:'★☆☆☆☆',interpretability:'★☆☆☆☆',complexity:'EXTREME'}, color:'var(--eq-red)', bg:'rgba(255,77,109,.1)', tags:['MULTI-AGENT','SIMULATION','RESEARCH'] },
    ]
  },
];

const MODEL_MAP = {};
CATEGORIES.forEach(cat => cat.models.forEach(m => { MODEL_MAP[m.id] = { ...m, catId: cat.id }; }));

/* ─── HELPERS ─── */
function fmtBytes(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}
function fileIcon(name) {
  if (!name) return '📄';
  if (name.endsWith('.ipynb')) return '📓';
  if (name.endsWith('.csv')) return '📊';
  if (name.endsWith('.xlsx')) return '📗';
  if (name.endsWith('.parquet')) return '🗄️';
  return '📄';
}
function fileTypeLabel(name) {
  if (!name) return 'FILE';
  if (name.endsWith('.ipynb')) return 'NOTEBOOK';
  if (name.endsWith('.csv')) return 'DATASET';
  if (name.endsWith('.xlsx')) return 'SPREADSHEET';
  if (name.endsWith('.parquet')) return 'PARQUET';
  return 'FILE';
}
function fileBg(name) {
  if (!name) return 'rgba(255,255,255,.06)';
  if (name.endsWith('.ipynb')) return 'rgba(255,209,102,.12)';
  if (name.endsWith('.csv')) return 'rgba(0,229,255,.12)';
  if (name.endsWith('.xlsx')) return 'rgba(0,255,140,.12)';
  return 'rgba(255,255,255,.06)';
}
function fileCardClass(name) {
  if (!name) return 'other-card';
  if (name.endsWith('.ipynb')) return 'nb-card';
  if (['.csv', '.xlsx', '.parquet'].some(e => name.endsWith(e))) return 'csv-card';
  return 'other-card';
}
function isDataFile(name) {
  return ['.csv', '.xlsx', '.parquet'].some(e => name.endsWith(e));
}
function isNotebook(name) {
  return name.endsWith('.ipynb');
}

/* ─── MINI CHART ─── */
function MiniChart({ color }) {
  const svgRef = useRef(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const w = 500, h = 90, n = 50;
    const data = [];
    let v = h * 0.5;
    for (let i = 0; i < n; i++) {
      v = Math.max(8, Math.min(h - 8, v + (Math.random() - 0.48) * 8));
      data.push(v);
    }
    const mn = Math.min(...data), mx = Math.max(...data);
    const pts = data.map((d, i) => `${(i / (n - 1)) * w},${h - ((d - mn) / (mx - mn + 1)) * (h - 16) + 8}`);
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ');
    const areaD = pathD + ` L${w},${h} L0,${h}Z`;
    const id = 'mg' + Math.random().toString(36).slice(2);
    svg.innerHTML = `
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".25"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${areaD}" fill="url(#${id})" stroke="none"/>
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }, [color]);
  return (
    <div className="eq-mini-chart">
      <svg ref={svgRef} viewBox="0 0 500 90" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/* ─── PARTICLE CANVAS ─── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.3,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,140,${0.15 * (1 - d / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,140,.35)';
        ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas id="eq-bgCanvas" ref={ref} />;
}

/* ─── TOAST HOOK ─── */
function useToast() {
  const [toast, setToast] = useState({ msg: '', type: 'success', show: false });
  const timerRef = useRef(null);
  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, show: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);
  return { toast, showToast };
}

/* ─── FILE VIEWER MODAL ─── */
function FileViewer({ file, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) return;
    setLoading(true); setError('');
    // If we have a local dataUrl (community upload before Supabase), read directly
    if (file.dataUrl) {
      parseContent(file.dataUrl, file.name);
      return;
    }
    // Otherwise fetch from Supabase storage
    const bucketName = file.bucket || 'community-files';
    const storagePath = file.storage_path || file.storagePath;
    supabase.storage.from(bucketName).download(storagePath)
      .then(({ data, error: err }) => {
        if (err) throw err;
        const reader = new FileReader();
        reader.onload = e => parseContent(e.target.result, file.name);
        reader.readAsText(data);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [file]);

  function parseContent(rawOrUrl, name) {
    try {
      if (name.endsWith('.ipynb')) {
        // dataUrl case
        const text = rawOrUrl.startsWith('data:') ? atob(rawOrUrl.split(',')[1]) : rawOrUrl;
        const nb = JSON.parse(text);
        setContent({ type: 'notebook', cells: nb.cells || [] });
      } else if (name.endsWith('.csv')) {
        const text = rawOrUrl.startsWith('data:') ? atob(rawOrUrl.split(',')[1]) : rawOrUrl;
        const lines = text.trim().split('\n').slice(0, 51);
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1, 51).map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
        setContent({ type: 'csv', headers, rows, totalRows: text.trim().split('\n').length - 1 });
      } else {
        setContent({ type: 'unsupported' });
      }
    } catch (e) {
      setError('Could not parse file: ' + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="eq-viewer-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="eq-viewer-box">
        <div className="eq-viewer-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{fileIcon(file?.name)}</span>
            <div>
              <div className="eq-viewer-title">{file?.name}</div>
              <div style={{ fontFamily: 'var(--eq-mono)', fontSize: 9, color: 'var(--eq-muted)', letterSpacing: 2, marginTop: 2 }}>
                {fileTypeLabel(file?.name)} · VIEW ONLY · DOWNLOAD TO RUN
              </div>
            </div>
          </div>
          <div className="eq-viewer-close" onClick={onClose}>✕</div>
        </div>
        <div className="eq-viewer-body">
          {loading && <div className="eq-loading"><div className="eq-spinner" /><span>LOADING FILE...</span></div>}
          {error && <div style={{ fontFamily: 'var(--eq-mono)', fontSize: 11, color: 'var(--eq-red)', padding: 16 }}>⚠ {error}</div>}
          {content?.type === 'notebook' && content.cells.map((cell, i) => {
            const rawSrc = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
            const src = rawSrc == null ? '' : String(rawSrc);
            const outputs = cell.outputs?.map(o => {
              if (o.text) return Array.isArray(o.text) ? o.text.join('') : o.text;
              if (o.data?.['text/plain']) return Array.isArray(o.data['text/plain']) ? o.data['text/plain'].join('') : o.data['text/plain'];
              return '';
            }).filter(Boolean).join('\n') || '';
            return (
              <div key={i} className="eq-nb-cell">
                <div className={`eq-nb-cell-type ${cell.cell_type === 'code' ? 'code' : 'markdown'}`}>
                  {cell.cell_type === 'code' ? `In [${cell.execution_count ?? i + 1}]` : 'MARKDOWN'}
                </div>
                <pre className="eq-nb-source">{src || ' '}</pre>
                {outputs && <div className="eq-nb-output">{outputs}</div>}
              </div>
            );
          })}
          {content?.type === 'csv' && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="eq-csv-table">
                  <thead>
                    <tr>{content.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {content.rows.map((row, i) => (
                      <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="eq-csv-note">
                // Showing first 50 rows of {content.totalRows} · Download to view full dataset
              </div>
            </>
          )}
          {content?.type === 'unsupported' && (
            <div className="eq-empty">
              <div className="eq-empty-icon">📄</div>
              <div className="eq-empty-title">Preview not available</div>
              <div className="eq-empty-sub">Download the file to view it</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── FILE CARD ─── */
function FileCard({ file, showUser, onDownload, onView, onDelete, admin }) {
  return (
    <div className={`eq-file-card ${fileCardClass(file.name)}`}>
      <div className="eq-file-icon" style={{ background: fileBg(file.name) }}>{fileIcon(file.name)}</div>
      <div className="eq-file-info">
        <div className="eq-file-name">{file.name}</div>
        <div className="eq-file-meta">
          <span className="eq-file-type">{file.type}</span>
          <span className="eq-file-size">{fmtBytes(file.size)}</span>
          {showUser && file.uploaded_by_name && <span className="eq-file-user">@{file.uploaded_by_name}</span>}
          {file.created_at && <span>{new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
        </div>
        {file.description && <div className="eq-file-desc">{file.description}</div>}
      </div>
      <div className="eq-file-actions">
        <button className="eq-fc-btn eq-fc-view" onClick={() => onView(file)}>👁 VIEW</button>
        <button className="eq-fc-btn eq-fc-dl" onClick={() => onDownload(file)}>↓ DOWNLOAD</button>
        {admin && <button className="eq-fc-btn eq-fc-del" onClick={() => onDelete(file)}>✕ DELETE</button>}
      </div>
    </div>
  );
}

/* ─── FILES TAB (Live or Community) ─── */
function FilesTab({ modelId, bucket, showUser, admin, refresh, showToast }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('model_files')
      .select('*')
      .eq('model_id', modelId)
      .eq('bucket', bucket)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) showToast('Failed to load files: ' + error.message, 'error');
        else setFiles(data || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [modelId, bucket, refresh]);

  async function handleDownload(file) {
    const { data, error } = await supabase.storage.from(file.bucket).download(file.storage_path);
    if (error) { showToast('Download failed: ' + error.message, 'error'); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
    showToast(`↓ Downloading "${file.name}"`);
  }

  async function handleDelete(file) {
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    const { error: storErr } = await supabase.storage.from(file.bucket).remove([file.storage_path]);
    if (storErr) { showToast('Storage delete failed: ' + storErr.message, 'error'); return; }
    const { error: dbErr } = await supabase.from('model_files').delete().eq('id', file.id);
    if (dbErr) { showToast('DB delete failed: ' + dbErr.message, 'error'); return; }
    setFiles(f => f.filter(x => x.id !== file.id));
    showToast('File deleted');
  }

  if (loading) return <div className="eq-loading"><div className="eq-spinner" /><span>LOADING...</span></div>;
  if (!files.length) return (
    <div className="eq-empty">
      <div className="eq-empty-icon">{showUser ? '🌐' : '📂'}</div>
      <div className="eq-empty-title">{showUser ? 'No community files yet' : 'No files published yet'}</div>
      <div className="eq-empty-sub">{showUser ? "Other users haven't uploaded examples for this model" : 'Admin has not published files for this model yet'}</div>
    </div>
  );
  return (
    <>
      <div className="eq-files-grid">
        {files.map(f => (
          <FileCard key={f.id} file={f} showUser={showUser} admin={admin}
            onDownload={handleDownload} onView={setViewer} onDelete={handleDelete} />
        ))}
      </div>
      {viewer && <FileViewer file={viewer} onClose={() => setViewer(null)} />}
    </>
  );
}

/* ─── PUBLISH TAB ─── */
function PublishTab({ modelId, user, admin, onPublished, showToast }) {
  const [files, setFiles] = useState([]);
  const [desc, setDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationError, setValidationError] = useState('');
  const dropRef = useRef(null);

  const bucket = admin ? 'live-files' : 'community-files';

  function addFiles(newFiles) {
    setValidationError('');
    const allowed = ['.ipynb', '.csv', '.xlsx', '.parquet'];
    const valid = Array.from(newFiles).filter(f => allowed.some(ext => f.name.endsWith(ext)));
    setFiles(prev => {
      const existing = [...prev];
      valid.forEach(f => { if (!existing.find(p => p.name === f.name)) existing.push(f); });
      return existing;
    });
  }

  function removeFile(i) {
    setFiles(f => f.filter((_, idx) => idx !== i));
    setValidationError('');
  }

  function validate() {
    const hasNb = files.some(f => isNotebook(f.name));
    const hasData = files.some(f => isDataFile(f.name));
    if (!files.length) { setValidationError('Please add at least one file.'); return false; }
    if (hasNb && !hasData) {
      setValidationError('⚠ A Jupyter notebook (.ipynb) must be uploaded together with at least one data file (.csv / .xlsx / .parquet). Please add the dataset that the notebook uses.');
      return false;
    }
    return true;
  }

  async function handlePublish() {
    if (!validate()) return;
    setUploading(true); setProgress(5);

    const now = new Date().toISOString();
    const uploaderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'anonymous';
    const total = files.length;
    let done = 0;

    try {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const storagePath = `${modelId}/${Date.now()}_${file.name}`;
        const { error: uploadErr } = await supabase.storage.from(bucket).upload(storagePath, file, { upsert: false });
        if (uploadErr) throw uploadErr;

        const { error: dbErr } = await supabase.from('model_files').insert({
          model_id: modelId,
          bucket: bucket,
          storage_path: storagePath,
          name: file.name,
          size: file.size,
          type: fileTypeLabel(file.name),
          description: desc,
          uploaded_by: user?.id,
          uploaded_by_name: uploaderName,
          created_at: now,
        });
        if (dbErr) throw dbErr;

        done++;
        setProgress(Math.round((done / total) * 90));
      }

      setProgress(100);
      setTimeout(() => {
        setFiles([]); setDesc(''); setProgress(0); setUploading(false);
        showToast(`✓ ${done} file(s) published to ${admin ? 'Live Examples' : 'Community Examples'}!`);
        onPublished();
      }, 400);
    } catch (err) {
      setUploading(false); setProgress(0);
      showToast('Upload failed: ' + err.message, 'error');
    }
  }

  return (
    <div className="eq-publish-pane">
      <div className="eq-pub-header">
        <div className="eq-pub-icon">📤</div>
        <div>
          <div className="eq-pub-title">{admin ? 'Publish Live Example (Admin)' : 'Publish Your Work'}</div>
          <div className="eq-pub-sub">
            {admin
              ? 'Files you upload here appear in the Live Examples tab — visible to all users.'
              : 'Share your Jupyter notebook & dataset. It will appear in Community Examples for all users.'}
          </div>
        </div>
      </div>

      <div className="eq-pub-rule">
        ⚠ Rule: Jupyter notebook (.ipynb) files must be uploaded together with at least one data file (.csv / .xlsx / .parquet)
      </div>

      <div className="eq-field">
        <div className="eq-field-lbl">Description</div>
        <textarea className="eq-pub-textarea" placeholder="Briefly describe your notebook — approach, dataset, key results..." value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      <div className="eq-field">
        <div className="eq-field-lbl">Files to Publish</div>
        <div
          ref={dropRef}
          className="eq-dropzone"
          onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add('drag-over'); }}
          onDragLeave={() => dropRef.current?.classList.remove('drag-over')}
          onDrop={e => { e.preventDefault(); dropRef.current?.classList.remove('drag-over'); addFiles(e.dataTransfer.files); }}
        >
          <input type="file" multiple accept=".ipynb,.csv,.xlsx,.parquet" onChange={e => addFiles(e.target.files)} />
          <div className="eq-dz-icon">📂</div>
          <div className="eq-dz-title">DROP FILES OR CLICK TO BROWSE</div>
          <div className="eq-dz-sub">.ipynb · .csv · .xlsx · .parquet</div>
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map((f, i) => (
            <div key={i} className="eq-staged-file">
              <span className="eq-sf-icon">{fileIcon(f.name)}</span>
              <div className="eq-sf-info">
                <div className="eq-sf-name">{f.name}</div>
                <div className="eq-sf-size">{fmtBytes(f.size)}</div>
              </div>
              <span className="eq-sf-rm" onClick={() => removeFile(i)}>✕</span>
            </div>
          ))}
        </div>
      )}

      {validationError && <div className="eq-validation-error">{validationError}</div>}

      <button
        className="eq-btn-publish"
        disabled={uploading || !files.length}
        onClick={handlePublish}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <div className="eq-pub-fill" style={{ width: progress + '%', transition: 'width .1s linear' }} />
        <span style={{ position: 'relative', zIndex: 1 }}>
          {uploading ? `⬆ UPLOADING... ${progress}%` : '⬆ PUBLISH FILES'}
        </span>
      </button>
    </div>
  );
}

/* ─── MODEL DETAIL ─── */
function ModelDetail({ modelId, user, admin, showToast }) {
  const m = MODEL_MAP[modelId];
  const [activeTab, setActiveTab] = useState('details');
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [communityCount, setCommunityCount] = useState(0);

  useEffect(() => {
    setActiveTab('details');
    // Load counts
    Promise.all([
      supabase.from('model_files').select('id', { count: 'exact', head: true }).eq('model_id', modelId).eq('bucket', 'live-files'),
      supabase.from('model_files').select('id', { count: 'exact', head: true }).eq('model_id', modelId).eq('bucket', 'community-files'),
    ]).then(([live, community]) => {
      setLiveCount(live.count || 0);
      setCommunityCount(community.count || 0);
    });
  }, [modelId, refreshKey]);

  if (!m) return null;
  const cat = CATEGORIES.find(c => c.id === m.catId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Detail topbar */}
      <div className="eq-detail-topbar">
        <div className="eq-detail-row1">
          <div className="eq-detail-icon" style={{ background: m.bg, fontSize: 22 }}>{cat?.icon || '📊'}</div>
          <div style={{ flex: 1 }}>
            <div className="eq-detail-name" style={{ color: m.color }}>{m.name}</div>
            <div className="eq-detail-full">{m.fullName}</div>
          </div>
          <div className="eq-chips">
            {m.tags.map(t => <div key={t} className="eq-dchip" style={{ color: m.color, borderColor: m.color + '40' }}>{t}</div>)}
            <div className="eq-dchip" style={{ color: 'var(--eq-muted)', borderColor: 'rgba(255,255,255,.1)' }}>{m.metrics.complexity}</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="eq-tab-bar">
        {[
          { id: 'details', label: 'DETAILS' },
          { id: 'live', label: 'LIVE EXAMPLES', count: liveCount },
          { id: 'community', label: 'COMMUNITY', count: communityCount },
        ].map(tab => (
          <div key={tab.id} className={`eq-tab-btn${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="eq-tab-dot" />
            {tab.label}
            {tab.count !== undefined && <span className="eq-tab-badge">{tab.count}</span>}
          </div>
        ))}
        <div className={`eq-tab-btn eq-tab-publish${activeTab === 'publish' ? ' active' : ''}`} onClick={() => setActiveTab('publish')}>
          <span className="eq-tab-dot" />
          {admin ? 'PUBLISH (ADMIN)' : 'PUBLISH FILES'}
        </div>
      </div>

      {/* Details pane */}
      <div className={`eq-pane${activeTab === 'details' ? ' active' : ''}`}>
        <div className="eq-detail-body">
          <div className="eq-overview">{m.overview}</div>
          <div className="eq-stats-row">
            {[['ACCURACY', m.metrics.accuracy, m.color], ['SPEED', m.metrics.speed, 'var(--eq-cyan)'], ['INTERPRET.', m.metrics.interpretability, 'var(--eq-gold)'], ['COMPLEXITY', m.metrics.complexity, 'var(--eq-orange)']].map(([l, v, c]) => (
              <div key={l} className="eq-stat-card">
                <div className="eq-stat-val" style={{ color: c }}>{v}</div>
                <div className="eq-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
          <div className="eq-section">
            <div className="eq-sec-head">Complexity Profile</div>
            {Object.entries(m.complexity).map(([k, v]) => (
              <div key={k} className="eq-cplx-row">
                <div className="eq-cplx-lbl">{k.toUpperCase()}</div>
                <div className="eq-cplx-bar"><div className="eq-cplx-fill" style={{ width: (v / 5 * 100) + '%', background: `linear-gradient(90deg,${m.color},var(--eq-cyan))` }} /></div>
                <div style={{ fontFamily: 'var(--eq-mono)', fontSize: 10, color: 'var(--eq-muted)', width: 20, textAlign: 'right' }}>{v}/5</div>
              </div>
            ))}
          </div>
          <div className="eq-section">
            <div className="eq-sec-head">Use Cases for NIFTY / Indian Markets</div>
            <div className="eq-use-cases">{m.useFor.map(u => <div key={u} className="eq-use-chip">{u}</div>)}</div>
          </div>
          <div className="eq-section">
            <div className="eq-sec-head">Strengths &amp; Limitations</div>
            <div className="eq-pros-cons">
              <div className="eq-pros"><h4>Strengths</h4><ul>{m.pros.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
              <div className="eq-cons"><h4>Limitations</h4><ul>{m.cons.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
            </div>
          </div>
          <div className="eq-section">
            <div className="eq-sec-head">Key Parameters</div>
            <table className="eq-param-table">
              <tbody>{m.params.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="eq-section">
            <div className="eq-sec-head">Illustrative Forecast Pattern</div>
            <MiniChart color={m.color} />
          </div>
        </div>
      </div>

      {/* Live examples pane */}
      <div className={`eq-pane${activeTab === 'live' ? ' active' : ''}`}>
        <FilesTab modelId={modelId} bucket="live-files" showUser={false} admin={admin} refresh={refreshKey} showToast={showToast} />
      </div>

      {/* Community pane */}
      <div className={`eq-pane${activeTab === 'community' ? ' active' : ''}`}>
        <FilesTab modelId={modelId} bucket="community-files" showUser admin={admin} refresh={refreshKey} showToast={showToast} />
      </div>

      {/* Publish pane */}
      <div className={`eq-pane${activeTab === 'publish' ? ' active' : ''}`}>
        <PublishTab
          modelId={modelId}
          user={user}
          admin={admin}
          showToast={showToast}
          onPublished={() => setRefreshKey(k => k + 1)}
        />
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function ContentPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const admin = isAdmin(user);

  const [search, setSearch] = useState('');
  const [openCats, setOpenCats] = useState(new Set(CATEGORIES.map(c => c.id)));
  const [selectedModel, setSelectedModel] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { toast, showToast } = useToast();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'USER';
  const userInitial = userName[0].toUpperCase();

  useEffect(() => {
    injectFonts();
    // Inject CSS
    if (!document.getElementById('eq-styles')) {
      const style = document.createElement('style');
      style.id = 'eq-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    return () => {
      // Don't remove CSS on unmount — it may flicker on navigate
    };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const close = () => setShowUserMenu(false);
    document.addEventListener('click', close, { once: true });
    return () => document.removeEventListener('click', close);
  }, [showUserMenu]);

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  // Filter models
  const filteredCats = CATEGORIES.map(cat => ({
    ...cat,
    models: search
      ? cat.models.filter(m =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.fullName.toLowerCase().includes(search.toLowerCase()) ||
          m.overview.toLowerCase().includes(search.toLowerCase())
        )
      : cat.models,
  })).filter(cat => cat.models.length > 0);

  const totalVisible = filteredCats.reduce((sum, cat) => sum + cat.models.length, 0);

  function toggleCat(id) {
    setOpenCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <>
      <ParticleCanvas />
      <div className="eq-scanlines" />

      <div className="eq-app">
        {/* TOPBAR */}
        <header className="eq-topbar">
          <div className="eq-topbar-left">
            <div className="eq-logo-mark" />
            <div className="eq-brand">ETERNAL<span>QUANTS</span></div>
          </div>
          <div className="eq-topbar-center">// Quantitative Research Terminal</div>
          <div className="eq-topbar-right">
            {['MODELS', 'BACKTESTER', 'REPORTS', 'SIGNALS'].map(pill => (
              <div key={pill} className={`eq-nav-pill${pill === 'MODELS' ? ' active' : ''}`}>{pill}</div>
            ))}
            <div className="eq-user-chip" onClick={e => { e.stopPropagation(); setShowUserMenu(v => !v); }}>
              <div className="eq-avatar">{userInitial}</div>
              <span className="eq-user-name">{userName.toUpperCase()}</span>
              {admin && <span className="eq-admin-badge">ADMIN</span>}
              {showUserMenu && (
                <div className="eq-signout-menu">
                  <div className="eq-signout-item" style={{ color: 'var(--eq-muted)', cursor: 'default', fontSize: 9 }}>
                    {user?.email}
                  </div>
                  <div className="eq-signout-item" onClick={handleSignOut}>SIGN OUT</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* HERO */}
        <div className="eq-hero">
          <div className="eq-hero-eyebrow">// Welcome Back, {userName} · Session Active</div>
          <div className="eq-hero-title">EternalQuants</div>
          <div className="eq-hero-sub">Select a quantitative model to explore its architecture, parameters &amp; community files</div>
        </div>

        {/* MAIN */}
        <div className="eq-main">
          {/* LEFT PANEL */}
          <div className="eq-left">
            <div className="eq-panel-hdr">
              <div className="eq-panel-title">Model Library</div>
              <div className="eq-model-count">{totalVisible} MODELS</div>
            </div>
            <div className="eq-search-bar">
              <input
                className="eq-search"
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="eq-model-list">
              {filteredCats.map(cat => (
                <div key={cat.id} className={`eq-${cat.id}`}>
                  <div className="eq-cat-hdr" onClick={() => toggleCat(cat.id)}>
                    <div className="eq-cat-icon">{cat.icon}</div>
                    <div className="eq-cat-name">{cat.label}</div>
                    <div className="eq-cat-badge">{cat.short}</div>
                    <span className={`eq-cat-chev${openCats.has(cat.id) ? ' open' : ''}`}>›</span>
                  </div>
                  <div className="eq-cat-models" style={{ maxHeight: openCats.has(cat.id) ? 500 : 0 }}>
                    {cat.models.map(m => (
                      <div
                        key={m.id}
                        className={`eq-model-item${selectedModel === m.id ? ' active' : ''}`}
                        onClick={() => setSelectedModel(m.id)}
                      >
                        <div className="eq-model-name">{m.name}</div>
                        <div className="eq-model-tag">{m.tag}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="eq-right">
            {!selectedModel ? (
              <div className="eq-placeholder">
                <div className="eq-placeholder-icon">⟨/⟩</div>
                <p>Select a model to view details</p>
                <p style={{ fontSize: 9, marginTop: -8, opacity: 0.6, letterSpacing: 3 }}>← BROWSE THE LIBRARY</p>
              </div>
            ) : (
              <ModelDetail
                key={selectedModel}
                modelId={selectedModel}
                user={user}
                admin={admin}
                showToast={showToast}
              />
            )}
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`eq-toast ${toast.type} ${toast.show ? 'eq-toast-show' : ''}`}>
        <div className="eq-toast-dot" />
        <span>{toast.msg}</span>
      </div>
    </>
  );
}

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
  width:38px; height:38px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
  animation:eqRotateGlow 6s ease-in-out infinite;
}
@keyframes eqRotateGlow {
  0%,100%{filter:drop-shadow(0 0 6px var(--eq-green))}
  50%{filter:drop-shadow(0 0 14px var(--eq-cyan))}
}
.eq-brand {
  font-family:var(--eq-display); font-size:17px; font-weight:700; letter-spacing:1px;
  background:linear-gradient(90deg,var(--eq-green),var(--eq-cyan));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; white-space:nowrap;
}
/* Feedback button */
.eq-feedback-btn {
  font-family:var(--eq-mono); font-size:10px; letter-spacing:1px; white-space:nowrap;
  color:var(--eq-cyan); cursor:pointer; padding:5px 14px; border-radius:2px;
  border:1px solid rgba(0,229,255,.3); transition:.2s; background:rgba(0,229,255,.05);
}
.eq-feedback-btn:hover { background:rgba(0,229,255,.12); border-color:var(--eq-cyan); box-shadow:0 0 10px rgba(0,229,255,.15); }
/* Feedback modal */
.eq-fb-overlay {
  position:fixed; inset:0; z-index:600; background:rgba(0,0,0,.88); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center; padding:24px;
}
.eq-fb-box {
  width:100%; max-width:500px; background:#060f09; border:1px solid rgba(0,229,255,.25);
  border-radius:6px; overflow:hidden;
}
.eq-fb-top {
  padding:16px 22px; border-bottom:1px solid rgba(0,229,255,.12);
  background:linear-gradient(135deg,rgba(0,229,255,.05),transparent);
  display:flex; align-items:center; justify-content:space-between;
}
.eq-fb-title { font-family:var(--eq-display); font-size:12px; font-weight:700; letter-spacing:2px; color:var(--eq-cyan); }
.eq-fb-close { width:26px; height:26px; border-radius:2px; display:flex; align-items:center; justify-content:center; border:1px solid var(--eq-border); color:var(--eq-muted); cursor:pointer; font-size:14px; transition:.15s; }
.eq-fb-close:hover { border-color:var(--eq-red); color:var(--eq-red); }
.eq-fb-body { padding:20px 22px; display:flex; flex-direction:column; gap:14px; }
.eq-fb-label { font-family:var(--eq-mono); font-size:9px; letter-spacing:2px; color:var(--eq-muted); text-transform:uppercase; margin-bottom:5px; }
.eq-fb-types { display:flex; gap:8px; flex-wrap:wrap; }
.eq-fb-type {
  font-family:var(--eq-mono); font-size:9px; letter-spacing:1px; padding:5px 12px;
  border-radius:2px; cursor:pointer; border:1px solid var(--eq-border); color:var(--eq-muted);
  background:transparent; transition:.15s;
}
.eq-fb-type.active { border-color:var(--eq-cyan); color:var(--eq-cyan); background:rgba(0,229,255,.08); }
.eq-fb-textarea {
  width:100%; height:130px; background:rgba(0,0,0,.3); border:1px solid var(--eq-border2);
  border-radius:3px; padding:12px 14px; font-family:var(--eq-body); font-size:14px;
  color:var(--eq-white); resize:none; outline:none; transition:.15s;
}
.eq-fb-textarea:focus { border-color:rgba(0,229,255,.4); }
.eq-fb-textarea::placeholder { color:var(--eq-muted); }
.eq-fb-footer { display:flex; justify-content:flex-end; gap:10px; padding-top:4px; }
.eq-fb-cancel { padding:8px 18px; background:transparent; border:1px solid var(--eq-border); color:var(--eq-muted); font-family:var(--eq-mono); font-size:10px; letter-spacing:2px; cursor:pointer; border-radius:2px; transition:.15s; }
.eq-fb-cancel:hover { border-color:var(--eq-red); color:var(--eq-red); }
.eq-fb-submit { padding:8px 22px; background:rgba(0,229,255,.1); border:1px solid var(--eq-cyan); color:var(--eq-cyan); font-family:var(--eq-mono); font-size:10px; letter-spacing:2px; cursor:pointer; border-radius:2px; transition:.15s; }
.eq-fb-submit:hover:not(:disabled) { background:rgba(0,229,255,.2); box-shadow:0 0 12px rgba(0,229,255,.15); }
.eq-fb-submit:disabled { opacity:.35; cursor:not-allowed; }

/* ADMIN INBOX */
.eq-inbox-btn {
  font-family:var(--eq-mono); font-size:10px; letter-spacing:1px; white-space:nowrap;
  color:var(--eq-gold); cursor:pointer; padding:5px 12px; border-radius:2px;
  border:1px solid rgba(255,209,102,.3); transition:.2s; background:rgba(255,209,102,.05);
  display:flex; align-items:center; gap:6px;
}
.eq-inbox-btn:hover { background:rgba(255,209,102,.12); border-color:var(--eq-gold); }
.eq-inbox-badge {
  background:var(--eq-gold); color:#000; border-radius:8px;
  font-size:8px; font-weight:700; padding:1px 5px; min-width:14px; text-align:center;
}
.eq-inbox-overlay {
  position:fixed; inset:0; z-index:600; background:rgba(0,0,0,.85); backdrop-filter:blur(8px);
  display:flex; align-items:stretch; justify-content:flex-end;
}
.eq-inbox-panel {
  width:100%; max-width:680px; background:#060f09; border-left:1px solid rgba(255,209,102,.2);
  display:flex; flex-direction:column; overflow:hidden;
  animation:eqSlideIn .22s ease;
}
@keyframes eqSlideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
.eq-inbox-top {
  padding:16px 22px; border-bottom:1px solid rgba(255,209,102,.12);
  background:linear-gradient(135deg,rgba(255,209,102,.05),transparent);
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
}
.eq-inbox-title { font-family:var(--eq-display); font-size:13px; font-weight:700; letter-spacing:2px; color:var(--eq-gold); }
.eq-inbox-close { width:28px; height:28px; border-radius:2px; display:flex; align-items:center; justify-content:center; border:1px solid var(--eq-border); color:var(--eq-muted); cursor:pointer; font-size:14px; transition:.15s; }
.eq-inbox-close:hover { border-color:var(--eq-red); color:var(--eq-red); }
.eq-inbox-filters { padding:10px 22px; border-bottom:1px solid var(--eq-border); display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; align-items:center; }
.eq-inbox-filter {
  font-family:var(--eq-mono); font-size:9px; letter-spacing:1px; padding:4px 10px;
  border-radius:2px; cursor:pointer; border:1px solid var(--eq-border); color:var(--eq-muted);
  background:transparent; transition:.15s;
}
.eq-inbox-filter.active { border-color:var(--eq-gold); color:var(--eq-gold); background:rgba(255,209,102,.08); }
.eq-inbox-count { font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); letter-spacing:1px; margin-left:auto; }
.eq-inbox-list { flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:10px; }
.eq-inbox-card {
  background:rgba(0,0,0,.3); border:1px solid var(--eq-border); border-radius:4px;
  overflow:hidden; transition:.15s; cursor:pointer;
}
.eq-inbox-card:hover { border-color:rgba(255,209,102,.25); }
.eq-inbox-card.expanded { border-color:rgba(255,209,102,.35); }
.eq-inbox-card-top { padding:12px 14px; display:flex; align-items:flex-start; gap:12px; }
.eq-inbox-type-badge {
  font-family:var(--eq-mono); font-size:8px; letter-spacing:1px; padding:2px 7px;
  border-radius:1px; flex-shrink:0; text-transform:uppercase; border:1px solid;
}
.eq-inbox-type-feedback { border-color:rgba(0,229,255,.3); color:var(--eq-cyan); background:rgba(0,229,255,.06); }
.eq-inbox-type-suggestion { border-color:rgba(0,255,140,.3); color:var(--eq-green); background:rgba(0,255,140,.06); }
.eq-inbox-type-bug_report { border-color:rgba(255,77,109,.3); color:var(--eq-red); background:rgba(255,77,109,.06); }
.eq-inbox-type-question { border-color:rgba(255,209,102,.3); color:var(--eq-gold); background:rgba(255,209,102,.06); }
.eq-inbox-type-other { border-color:var(--eq-border); color:var(--eq-muted); background:rgba(255,255,255,.03); }
.eq-inbox-meta { flex:1; min-width:0; }
.eq-inbox-user { font-family:var(--eq-mono); font-size:11px; color:var(--eq-white); margin-bottom:2px; }
.eq-inbox-email { font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); letter-spacing:.5px; }
.eq-inbox-time { font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); letter-spacing:.5px; flex-shrink:0; }
.eq-inbox-msg { padding:0 14px 12px; font-size:13px; line-height:1.65; color:rgba(232,244,237,.75); font-family:var(--eq-body); }
.eq-inbox-status-row { padding:8px 14px; border-top:1px solid var(--eq-border); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.eq-inbox-status-btn {
  font-family:var(--eq-mono); font-size:8px; letter-spacing:1px; padding:3px 10px;
  border-radius:1px; cursor:pointer; border:1px solid var(--eq-border); color:var(--eq-muted);
  background:transparent; transition:.15s;
}
.eq-inbox-status-btn:hover { border-color:var(--eq-gold); color:var(--eq-gold); }
.eq-inbox-status-btn.active { border-color:var(--eq-gold); color:var(--eq-gold); background:rgba(255,209,102,.1); }
.eq-inbox-status-new { border-color:rgba(0,229,255,.3); color:var(--eq-cyan); }
.eq-inbox-status-reviewed { border-color:rgba(0,255,140,.3); color:var(--eq-green); }
.eq-inbox-status-done { border-color:rgba(255,255,255,.2); color:var(--eq-muted); }
.eq-inbox-reply-area { padding:0 14px 12px; display:flex; flex-direction:column; gap:8px; }
.eq-inbox-reply-input {
  width:100%; background:rgba(0,0,0,.3); border:1px solid var(--eq-border);
  border-radius:2px; padding:9px 12px; font-family:var(--eq-body); font-size:12px;
  color:var(--eq-white); resize:none; outline:none; transition:.15s; height:72px;
}
.eq-inbox-reply-input:focus { border-color:rgba(255,209,102,.35); }
.eq-inbox-reply-input::placeholder { color:var(--eq-muted); }
.eq-inbox-reply-footer { display:flex; justify-content:flex-end; gap:8px; }
.eq-inbox-reply-btn {
  padding:6px 16px; background:rgba(255,209,102,.1); border:1px solid var(--eq-gold);
  color:var(--eq-gold); font-family:var(--eq-mono); font-size:9px; letter-spacing:2px;
  cursor:pointer; border-radius:2px; transition:.15s;
}
.eq-inbox-reply-btn:hover:not(:disabled) { background:rgba(255,209,102,.2); }
.eq-inbox-reply-btn:disabled { opacity:.35; cursor:not-allowed; }
.eq-inbox-admin-reply { padding:8px 14px 12px; margin:0 14px 10px; background:rgba(255,209,102,.04); border:1px solid rgba(255,209,102,.15); border-radius:2px; }
.eq-inbox-admin-reply-lbl { font-family:var(--eq-mono); font-size:8px; letter-spacing:2px; color:var(--eq-gold); margin-bottom:5px; }
.eq-inbox-admin-reply-txt { font-size:12px; color:rgba(232,244,237,.7); font-family:var(--eq-body); line-height:1.6; }
.eq-inbox-empty { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:10px; opacity:.4; }
.eq-inbox-empty-icon { font-size:36px; }
.eq-inbox-empty-txt { font-family:var(--eq-mono); font-size:10px; letter-spacing:3px; color:var(--eq-muted); }

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

/* GUIDE DOCUMENTS */
.eq-guides-wrap { display:flex; flex-direction:column; flex:1; overflow:hidden; }
.eq-guides-list { flex:1; overflow-y:auto; padding:16px 22px; display:flex; flex-direction:column; gap:10px; }
.eq-guide-admin-bar { padding:10px 22px; border-bottom:1px solid var(--eq-border); display:flex; align-items:center; gap:12px; flex-shrink:0; background:rgba(255,127,81,.02); }
.eq-guide-pub-toggle { font-family:var(--eq-mono); font-size:9px; letter-spacing:2px; padding:6px 16px; border-radius:2px; cursor:pointer; border:1px solid rgba(255,127,81,.35); color:var(--eq-orange); background:rgba(255,127,81,.06); transition:.15s; }
.eq-guide-pub-toggle:hover { background:rgba(255,127,81,.14); border-color:var(--eq-orange); }
.eq-guide-card { display:flex; align-items:center; gap:14px; padding:14px 16px; background:rgba(0,0,0,.25); border:1px solid var(--eq-border); border-radius:3px; transition:.2s; position:relative; overflow:hidden; }
.eq-guide-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:var(--eq-cyan); }
.eq-guide-card.guide-hidden::before { background:var(--eq-orange); }
.eq-guide-card:hover { border-color:var(--eq-border2); background:rgba(0,229,255,.03); transform:translateX(2px); }
.eq-guide-card-icon { width:42px; height:42px; border-radius:4px; background:rgba(0,229,255,.08); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
.eq-guide-card-info { flex:1; min-width:0; }
.eq-guide-card-title { font-family:var(--eq-mono); font-size:12px; color:var(--eq-white); margin-bottom:3px; }
.eq-guide-card-desc { font-size:11px; color:rgba(232,244,237,.5); font-family:var(--eq-body); line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.eq-guide-card-meta { display:flex; gap:8px; align-items:center; font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); letter-spacing:.5px; margin-top:4px; flex-wrap:wrap; }
.eq-guide-card-author { color:var(--eq-cyan); }
.eq-guide-card-actions { display:flex; gap:8px; flex-shrink:0; }
.eq-guide-hidden-badge { font-family:var(--eq-mono); font-size:7px; letter-spacing:1px; padding:2px 6px; border-radius:1px; border:1px solid rgba(255,127,81,.3); color:var(--eq-orange); background:rgba(255,127,81,.06); text-transform:uppercase; }
/* Publish Guide Form */
.eq-pub-guide-form { margin:0 22px 14px; background:rgba(0,0,0,.3); border:1px solid rgba(255,127,81,.2); border-radius:4px; padding:18px; display:flex; flex-direction:column; gap:11px; flex-shrink:0; }
.eq-pub-guide-hdr { font-family:var(--eq-mono); font-size:9px; letter-spacing:3px; color:var(--eq-orange); text-transform:uppercase; }
.eq-pub-guide-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.eq-pub-guide-input { background:rgba(0,255,140,.03); border:1px solid var(--eq-border); border-radius:2px; padding:8px 12px; color:var(--eq-white); font-family:var(--eq-mono); font-size:11px; outline:none; transition:.2s; width:100%; }
.eq-pub-guide-input:focus { border-color:rgba(255,127,81,.4); }
.eq-pub-guide-input::placeholder { color:var(--eq-muted); }
.eq-pub-guide-sublabel { font-family:var(--eq-mono); font-size:8px; letter-spacing:2px; color:var(--eq-muted); margin-bottom:5px; }
.eq-pub-guide-textarea { background:rgba(0,0,0,.3); border:1px solid var(--eq-border); border-radius:2px; padding:10px 12px; color:var(--eq-white); font-family:var(--eq-mono); font-size:10px; outline:none; transition:.2s; width:100%; resize:vertical; min-height:130px; line-height:1.5; }
.eq-pub-guide-textarea:focus { border-color:rgba(255,127,81,.4); }
.eq-pub-guide-textarea::placeholder { color:var(--eq-muted); }
.eq-pub-guide-footer { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.eq-pub-guide-file-btn { padding:7px 14px; background:transparent; border:1px solid var(--eq-border); color:var(--eq-muted); font-family:var(--eq-mono); font-size:9px; letter-spacing:1px; cursor:pointer; border-radius:2px; transition:.15s; }
.eq-pub-guide-file-btn:hover { border-color:rgba(255,127,81,.4); color:var(--eq-orange); }
.eq-pub-guide-char { font-family:var(--eq-mono); font-size:9px; color:var(--eq-muted); margin-left:auto; }
.eq-pub-guide-submit { padding:7px 20px; background:rgba(255,127,81,.1); border:1px solid var(--eq-orange); color:var(--eq-orange); font-family:var(--eq-mono); font-size:10px; letter-spacing:2px; cursor:pointer; border-radius:2px; transition:.15s; }
.eq-pub-guide-submit:hover:not(:disabled) { background:rgba(255,127,81,.2); }
.eq-pub-guide-submit:disabled { opacity:.35; cursor:not-allowed; }
`;

/* ─── ARIMA GUIDE (kept as dead code — DB-driven system replaces this) ─── */
const ARIMA_GUIDE = [
  {
    num: '01', title: 'What is ARIMA?',
    blocks: [
      { type: 'p', text: 'ARIMA stands for AutoRegressive Integrated Moving Average. It is the foundational statistical model for time series forecasting. Three components work together: AR captures how past values predict the future; I handles non-stationarity by differencing the series; MA models the dependency on past forecast errors.' },
      { type: 'formula', text: 'ARIMA(p, d, q)\n\nAR(p):  Yt = c + φ₁Yt₋₁ + φ₂Yt₋₂ + ... + φₚYt₋ₚ + εt\nMA(q):  Yt = c + εt + θ₁εt₋₁ + θ₂εt₋₂ + ... + θqεt₋q\n\nCombined after d differences:\nΔᵈYt = c + φ₁ΔᵈYt₋₁ + ... + φₚΔᵈYt₋ₚ + εt + θ₁εt₋₁ + ... + θqεt₋q' },
      { type: 'table', head: ['Component', 'Parameter', 'Role'], rows: [
        ['AutoRegressive', 'p', 'Number of lagged value terms — captures momentum / mean reversion'],
        ['Integrated', 'd', 'Number of differences to achieve stationarity (0 for returns, 1 for prices)'],
        ['Moving Average', 'q', 'Number of lagged forecast error terms — corrects for recent shocks'],
        ['Seasonal', 'P, D, Q, s', 'Seasonal counterparts for SARIMA — s=5 weekly, s=252 annual'],
      ]},
      { type: 'callout', variant: 'c-cyan', text: 'SARIMA(p,d,q)(P,D,Q)s extends ARIMA with seasonal AR, differencing, and MA terms. For weekly patterns use s=5, monthly s=21, annual s=252 trading days. Extremely powerful for cyclic financial instruments like NIFTY index or commodity futures.' },
    ]
  },
  {
    num: '02', title: 'The Unit Root Problem',
    blocks: [
      { type: 'p', text: 'Financial price series are almost always non-stationary — they have a "unit root", meaning the mean and variance drift over time without bound. ARIMA requires stationarity. Applying it directly to raw prices is one of the most common and damaging mistakes in quantitative finance.' },
      { type: 'callout', variant: 'c-red', text: '⚠ Warning: Fitting ARIMA on raw prices gives misleadingly high R² (often 0.99+) and near-perfect in-sample fit. This is spurious regression. The model is simply predicting "tomorrow ≈ today" — a naive random walk in disguise, not genuine predictive power.' },
      { type: 'table', head: ['Test', 'Null Hypothesis', 'Decision Rule', 'NIFTY 50 Result'], rows: [
        ['ADF (Augmented Dickey-Fuller)', 'Series has unit root (non-stationary)', 'Reject H₀ if p < 0.05 → stationary', 'Raw Close: p=0.92 ✗ | Log-diff returns: p<0.001 ✓'],
        ['KPSS (Kwiatkowski-Phillips-Schmidt-Shin)', 'Series is stationary', 'Fail to reject H₀ if p > 0.05 → stationary', 'Raw Close: p=0.01 ✗ | Log-diff returns: p=0.10 ✓'],
      ]},
      { type: 'callout', variant: 'c-gold', text: '💡 Always run BOTH ADF and KPSS. ADF tests for presence of unit root; KPSS tests for stationarity. When ADF fails to reject AND KPSS rejects — you have strong bilateral evidence of non-stationarity. Agreement from both tests after transformation is the gold standard before fitting ARIMA.' },
    ]
  },
  {
    num: '03', title: 'Pre-Processing Pipeline',
    blocks: [
      { type: 'p', text: 'Three approaches exist for making a price series suitable for ARIMA. The notebook tested all three on NIFTY 50 data using ADF and KPSS diagnostics — only the third is statistically sound and practically useful for trading.' },
      { type: 'table', head: ['Approach', 'Transformation', 'Stationarity', 'Verdict'], rows: [
        ['Raw price levels', 'None — use Close as-is', '✗ Unit root present', '✗ Never use — spurious regression, R²≈0.99 meaningless'],
        ['First difference', 'ΔPt = Pt − Pt₋₁', '✓ Usually stationary', '○ Acceptable — scale-dependent, not unit-free'],
        ['Log + first difference', 'rt = ln(Pt/Pt₋₁)', '✓ Stationary + symmetric', '✓ Best practice — models log-returns directly'],
      ]},
      { type: 'callout', variant: 'c-green', text: '✓ Best Practice: Work with log-returns: rt = ln(Pt) − ln(Pt₋₁). This removes scale effects, symmetrises return distributions, converts multiplicative price dynamics into additive return dynamics, and produces values comparable across instruments and time periods.' },
      { type: 'steps', items: [
        { title: 'Step 1 — Load Adjusted Price Data', desc: 'Fetch OHLCV data via yfinance, NSEpy, or Zerodha API. Always use adjusted Close prices to account for corporate actions (splits, bonuses, dividends).' },
        { title: 'Step 2 — Compute Log Returns', desc: 'rt = np.log(df["Close"]).diff().dropna() — this is your ARIMA target variable. Never fit ARIMA directly on prices or simple percentage returns.' },
        { title: 'Step 3 — Run Stationarity Tests', desc: 'Apply both ADF and KPSS. Both must confirm stationarity (ADF p<0.05 and KPSS p>0.05). If not, apply one more round of differencing (d=2, rare for log-returns).' },
        { title: 'Step 4 — Inspect ACF / PACF Plots', desc: 'Partial ACF (PACF) cuts off sharply at lag p → AR order. ACF cuts off at lag q → MA order. Gradual decay in both suggests ARMA. Use these to guide auto_arima search bounds.' },
        { title: 'Step 5 — Train / Hold-out Split', desc: 'Reserve last 20–30 trading days as unseen hold-out. Never use random splits — temporal ordering is sacred. Walk-forward validation is mandatory for production models.' },
      ]},
    ]
  },
  {
    num: '04', title: 'Model Training & Order Selection',
    blocks: [
      { type: 'p', text: 'ARIMA(p,d,q) order selection is the most critical step. Auto-ARIMA searches the parameter space using information criteria — AIC for best predictive accuracy, BIC for most parsimonious model. When working with pre-differenced log-returns, always set d=0 (differencing was done externally).' },
      { type: 'formula', text: 'Information Criteria for Model Selection:\n\nAIC = 2k − 2·ln(L̂)\nBIC = k·ln(n) − 2·ln(L̂)\n\nk = number of parameters | L̂ = maximized likelihood | n = sample size\n\nLower AIC/BIC = better model fit. Negative values are common with log-return series.' },
      { type: 'table', head: ['Result', 'Value', 'Interpretation'], rows: [
        ['Best Model', 'ARIMA(3,0,0)', 'Auto-selected by pmdarima on NIFTY 50 log-returns (2020–2025)'],
        ['AIC Score', '−7554.217', 'Excellent fit; negative AIC common with log-return series (small scale)'],
        ['p = 3', '3 AR lags', 'Last 3 trading days of returns predict today — captures short-term momentum'],
        ['d = 0', 'No extra differencing', 'Log-returns are already stationary; d=1 was applied as the log-diff transformation'],
        ['q = 0', 'No MA terms', 'Residuals show no significant MA structure at this order specification'],
      ]},
      { type: 'callout', variant: 'c-cyan', text: 'Python: from pmdarima import auto_arima | model = auto_arima(log_returns, start_p=0, max_p=5, start_q=0, max_q=5, d=0, information_criterion="aic", stepwise=True, seasonal=False) | For seasonal: set seasonal=True, m=5 (weekly) or m=21 (monthly).' },
    ]
  },
  {
    num: '05', title: 'Post-Training Diagnostics',
    blocks: [
      { type: 'p', text: 'A well-specified ARIMA model should produce residuals that are white noise — uncorrelated, zero mean, and ideally normally distributed. Four diagnostic tests must be run before trusting a model for trading signals.' },
      { type: 'table', head: ['Test', 'What it Checks', 'Pass Condition', 'NIFTY 50 Result'], rows: [
        ['Ljung-Box Q-test', 'Residual autocorrelation at lags 1–20', 'p > 0.05 — no autocorrelation remaining', '⚠ p=0.000 — autocorrelation remains → GARCH extension needed'],
        ['Jarque-Bera test', 'Normality of residuals (skewness + kurtosis)', 'p > 0.05 — residuals are normal', '⚠ p<0.001 — fat tails present (universal for equity returns)'],
        ['ARCH-LM test', 'Volatility clustering in squared residuals', 'p > 0.05 — no ARCH effects', 'ARCH effects confirmed → GARCH(1,1) required to model variance'],
        ['ACF of residuals', 'Visual check — lags within 95% CI bands', 'All autocorrelations within ±1.96/√n bands', 'Mostly within bounds; a few extreme lags breach boundary'],
      ]},
      { type: 'callout', variant: 'c-gold', text: '💡 The Ljung-Box failure on NIFTY 50 is not a model failure — it is a diagnostic insight. It reveals that residual variance is time-varying (volatility clustering). This is the exact trigger to extend to ARIMA-GARCH: ARIMA models the conditional mean; GARCH models the conditional variance.' },
      { type: 'callout', variant: 'c-red', text: '⚠ Fat tails are universal in equity return distributions. Never assume normality for NSE index data. Use Student-t or skewed-t distribution in downstream risk models. Directional accuracy and MAPE are more reliable trading metrics than RMSE for fat-tailed return series.' },
    ]
  },
  {
    num: '06', title: 'Forecasting & Trading Insights',
    blocks: [
      { type: 'p', text: 'ARIMA forecasts are made in log-return space and must be reconstructed back to price levels for execution. One-step-ahead forecasting is significantly more reliable than multi-step — accuracy degrades with horizon. For trading, directional accuracy (up vs down) often matters more than absolute error magnitude.' },
      { type: 'formula', text: 'Price Reconstruction from Log-Return Forecast:\n\nStep 1:  r̂t = ARIMA one-step-ahead forecast (log-return)\nStep 2:  P̂t = Pt₋₁ × e^(r̂t)\n\nMulti-step compounding:\nP̂t+k = Pt × exp( r̂t+1 + r̂t+2 + ... + r̂t+k )' },
      { type: 'result', items: [
        { val: 'ARIMA(3,0,0)', lbl: 'Best model (Auto-AIC)' },
        { val: '100%', lbl: 'Directional accuracy' },
        { val: '1.18%', lbl: 'MAPE — 30-day hold-out' },
        { val: '−7554', lbl: 'AIC score' },
      ]},
      { type: 'callout', variant: 'c-green', text: '✓ NIFTY 50 live result (Jan–Feb 2026 hold-out, 30 trading days): ARIMA(3,0,0) on log-returns achieved 100% directional accuracy with MAPE of 1.18%. This sets the baseline — any more complex model must beat this before claiming additional value.' },
      { type: 'table', head: ['Next Step', 'When to Add It', 'What It Adds'], rows: [
        ['ARIMA-GARCH', 'Ljung-Box fails / ARCH-LM confirms volatility clustering', 'Time-varying variance → calibrated risk estimates and position sizing'],
        ['SARIMA', 'ACF shows clear seasonal spike at lag s', 'Seasonal return patterns for cyclical instruments'],
        ['ARIMA + LSTM', 'ARIMA residuals show non-linear structure in ACF', 'Non-linear residual capture — consistently raises accuracy by 10–20%'],
        ['VAR', 'Multiple correlated instruments (NIFTY + Bank Nifty + USD/INR)', 'Cross-asset spillover modeling and Granger causality testing'],
      ]},
    ]
  },
];

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

/* ─── NOTEBOOK → NEW WINDOW ─── */
function openNotebookInNewWindow(nb, filename) {
  const cells = nb.cells || nb.worksheets?.[0]?.cells || [];
  function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function inlineFmt(t) {
    t = esc(t);
    t = t.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');
    t = t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g,'<em>$1</em>');
    t = t.replace(/__(.+?)__/g,'<strong>$1</strong>');
    t = t.replace(/_([^_]+)_/g,'<em>$1</em>');
    t = t.replace(/`([^`]+)`/g,'<code>$1</code>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>');
    return t;
  }
  function mdToHtml(text) {
    if (!text) return '';
    const lines = text.split('\n');
    const out = []; let inList=false, inCode=false, codeLang='', codeLines=[];
    for (const line of lines) {
      const fence = line.match(/^```(\w*)/);
      if (fence || (line.startsWith('```') && inCode)) {
        if (inCode) {
          out.push(`<pre class="md-code"><code>${codeLines.join('\n').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`);
          codeLines=[]; inCode=false;
        } else { if(inList){out.push('</ul>');inList=false;} codeLang=fence?.[1]||''; inCode=true; }
        continue;
      }
      if (inCode) { codeLines.push(line); continue; }
      const isList = /^[-*+] /.test(line);
      if (!isList && inList) { out.push('</ul>'); inList=false; }
      const hm = line.match(/^(#{1,6}) (.+)/);
      if (hm) { out.push(`<h${hm[1].length}>${inlineFmt(hm[2])}</h${hm[1].length}>`); }
      else if (/^[-*]{3,}$/.test(line.trim())) { out.push('<hr>'); }
      else if (isList) { if(!inList){out.push('<ul>');inList=true;} out.push('<li>'+inlineFmt(line.replace(/^[-*+] /,''))+'</li>'); }
      else if (line.trim()==='') { if(inList){out.push('</ul>');inList=false;} out.push(''); }
      else { out.push('<p>'+inlineFmt(line)+'</p>'); }
    }
    if (inList) out.push('</ul>');
    if (inCode) out.push(`<pre class="md-code"><code>${codeLines.join('\n').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`);
    return out.join('\n');
  }
  function renderOutputs(outputs) {
    if (!outputs?.length) return '';
    return outputs.map(o => {
      if (o.output_type === 'display_data' || o.output_type === 'execute_result') {
        if (o.data?.['image/png']) {
          const b64 = Array.isArray(o.data['image/png']) ? o.data['image/png'].join('') : o.data['image/png'];
          return `<div class="nb-out nb-img"><img src="data:image/png;base64,${b64}" alt="output"></div>`;
        }
        if (o.data?.['image/jpeg']) {
          const b64 = Array.isArray(o.data['image/jpeg']) ? o.data['image/jpeg'].join('') : o.data['image/jpeg'];
          return `<div class="nb-out nb-img"><img src="data:image/jpeg;base64,${b64}" alt="output"></div>`;
        }
        if (o.data?.['image/svg+xml']) {
          const svg = Array.isArray(o.data['image/svg+xml']) ? o.data['image/svg+xml'].join('') : o.data['image/svg+xml'];
          return `<div class="nb-out nb-img">${svg}</div>`;
        }
        if (o.data?.['text/html']) {
          const h = Array.isArray(o.data['text/html']) ? o.data['text/html'].join('') : o.data['text/html'];
          return `<div class="nb-out nb-html">${h}</div>`;
        }
        if (o.data?.['text/plain']) {
          const t = Array.isArray(o.data['text/plain']) ? o.data['text/plain'].join('') : o.data['text/plain'];
          return `<div class="nb-out nb-text"><pre>${esc(t)}</pre></div>`;
        }
      }
      if (o.output_type === 'stream') {
        const t = Array.isArray(o.text) ? o.text.join('') : (o.text||'');
        return `<div class="nb-out ${o.name==='stderr'?'nb-stderr':'nb-stream'}"><pre>${esc(t)}</pre></div>`;
      }
      if (o.output_type === 'error') {
        const tb = (o.traceback||[]).join('\n').replace(/\x1b\[[0-9;]*m/g,'');
        return `<div class="nb-out nb-error"><pre>${esc(tb)}</pre></div>`;
      }
      return '';
    }).join('');
  }
  let cellsHtml = '';
  cells.forEach((cell, i) => {
    const src = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
    if (cell.cell_type === 'markdown') {
      cellsHtml += `<div class="nb-cell nb-md"><div class="nb-md-body">${mdToHtml(src)}</div></div>`;
    } else if (cell.cell_type === 'code') {
      const ec = cell.execution_count != null ? cell.execution_count : i+1;
      const outs = renderOutputs(cell.outputs);
      cellsHtml += `<div class="nb-cell nb-code"><div class="nb-code-hdr"><span class="nb-in">In [${ec}]:</span></div><div class="nb-code-body"><pre><code>${esc(src)}</code></pre></div>${outs?`<div class="nb-outs">${outs}</div>`:''}</div>`;
    } else if (cell.cell_type === 'raw') {
      cellsHtml += `<div class="nb-cell nb-raw"><pre>${esc(src)}</pre></div>`;
    }
  });
  const kernel = nb.metadata?.kernelspec?.display_name || nb.metadata?.language_info?.name || 'Python';
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(filename)} — EternalQuants</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Rajdhani:wght@400;500;600&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#030a06;color:#e8f4ed;font-family:'Rajdhani',sans-serif;font-size:15px;line-height:1.65;}
a{color:#00e5ff;}
#nb-hdr{background:rgba(6,15,9,.97);border-bottom:1px solid rgba(0,255,140,.2);padding:13px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;gap:16px;flex-wrap:wrap;}
#nb-logo{font-family:'Orbitron',monospace;font-size:14px;font-weight:700;letter-spacing:2px;background:linear-gradient(90deg,#00ff8c,#00e5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;}
#nb-fname{font-family:'Share Tech Mono',monospace;font-size:12px;color:rgba(0,255,140,.75);letter-spacing:1px;}
#nb-meta{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(232,244,237,.35);letter-spacing:1px;white-space:nowrap;}
#nb-wrap{max-width:980px;margin:28px auto;padding:0 20px 80px;}
.nb-cell{margin-bottom:14px;border-radius:5px;overflow:hidden;}
.nb-md{background:rgba(255,255,255,.018);border:1px solid rgba(0,255,140,.07);padding:18px 24px;}
.nb-md-body h1{font-family:'Orbitron',monospace;font-size:19px;color:#00ff8c;margin:10px 0 8px;letter-spacing:1px;}
.nb-md-body h2{font-family:'Orbitron',monospace;font-size:16px;color:#00e5ff;margin:10px 0 7px;}
.nb-md-body h3{font-size:15px;font-weight:600;color:#ffd166;margin:10px 0 6px;}
.nb-md-body h4,.nb-md-body h5,.nb-md-body h6{font-size:14px;font-weight:600;color:rgba(232,244,237,.8);margin:8px 0 5px;}
.nb-md-body p{margin-bottom:8px;color:rgba(232,244,237,.85);}
.nb-md-body ul{margin:6px 0 8px 20px;}
.nb-md-body li{margin-bottom:3px;color:rgba(232,244,237,.8);}
.nb-md-body strong{color:#fff;font-weight:600;}
.nb-md-body em{color:#ffd166;font-style:italic;}
.nb-md-body code{background:rgba(0,255,140,.1);color:#00ff8c;padding:1px 5px;border-radius:3px;font-family:'Share Tech Mono',monospace;font-size:12px;}
.nb-md-body pre.md-code{background:rgba(0,0,0,.4);border:1px solid rgba(0,255,140,.1);padding:14px;border-radius:4px;overflow-x:auto;margin:10px 0;}
.nb-md-body pre.md-code code{background:none;color:#e8f4ed;padding:0;font-size:13px;line-height:1.6;}
.nb-md-body hr{border:none;border-top:1px solid rgba(0,255,140,.15);margin:14px 0;}
.nb-md-body a{color:#00e5ff;}
.nb-md-body table{border-collapse:collapse;width:100%;margin:10px 0;font-size:13px;}
.nb-md-body th{background:rgba(0,255,140,.06);color:#00ff8c;padding:8px 12px;text-align:left;border-bottom:1px solid rgba(0,255,140,.15);}
.nb-md-body td{padding:7px 12px;border-bottom:1px solid rgba(0,255,140,.05);color:rgba(232,244,237,.75);}
.nb-code{background:rgba(0,0,0,.28);border:1px solid rgba(0,255,140,.1);}
.nb-code-hdr{display:flex;align-items:center;padding:7px 16px;background:rgba(0,255,140,.04);border-bottom:1px solid rgba(0,255,140,.08);}
.nb-in{font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(0,255,140,.6);letter-spacing:1px;}
.nb-code-body{padding:14px 18px;}
.nb-code-body pre{font-family:'Share Tech Mono',monospace;font-size:13px;color:#e8f4ed;white-space:pre;overflow-x:auto;line-height:1.6;}
.nb-code-body code{font-family:inherit;font-size:inherit;}
.nb-outs{}
.nb-out{padding:10px 18px;border-top:1px solid rgba(0,255,140,.06);}
.nb-img{text-align:center;background:rgba(0,0,0,.15);padding:16px;}
.nb-img img{max-width:100%;height:auto;border-radius:4px;}
.nb-img svg{max-width:100%;height:auto;}
.nb-text pre,.nb-stream pre{font-family:'Share Tech Mono',monospace;font-size:12px;color:rgba(232,244,237,.7);white-space:pre-wrap;word-break:break-word;line-height:1.5;}
.nb-stderr pre{color:#ff7f51;}
.nb-error pre{color:#ff4d6d;font-family:'Share Tech Mono',monospace;font-size:11px;white-space:pre-wrap;word-break:break-word;}
.nb-html{overflow-x:auto;color:rgba(232,244,237,.85);font-size:13px;}
.nb-html table{border-collapse:collapse;font-size:12px;width:100%;}
.nb-html th{background:rgba(0,255,140,.06);color:#00ff8c;padding:6px 10px;border:1px solid rgba(0,255,140,.12);}
.nb-html td{padding:5px 10px;border:1px solid rgba(0,255,140,.05);color:rgba(232,244,237,.75);}
.nb-raw{background:rgba(0,0,0,.15);border:1px solid rgba(255,255,255,.05);padding:14px 18px;}
.nb-raw pre{font-family:'Share Tech Mono',monospace;font-size:12px;color:rgba(232,244,237,.5);white-space:pre-wrap;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:rgba(0,255,140,.2);border-radius:4px;}
</style></head><body>
<div id="nb-hdr">
  <div id="nb-logo">⊙ EternalQuants</div>
  <div id="nb-fname">📓 ${esc(filename)}</div>
  <div id="nb-meta">KERNEL: ${esc(kernel)} &nbsp;·&nbsp; ${cells.length} CELLS &nbsp;·&nbsp; VIEW ONLY</div>
</div>
<div id="nb-wrap">${cellsHtml}</div>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/* ─── GUIDE → NEW WINDOW ─── */
function openGuideInNewWindow(htmlContent, title) {
  function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // If content is already a full HTML document, open as-is
  const trimmed = (htmlContent || '').trim();
  let finalHtml;
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    finalHtml = htmlContent;
  } else {
    // Wrap body content with EQ dark-themed template
    finalHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — EternalQuants</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Rajdhani:wght@400;500;600&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#030a06;color:#e8f4ed;font-family:'Rajdhani',sans-serif;font-size:15px;line-height:1.7;}
a{color:#00e5ff;}
#gd-hdr{background:rgba(6,15,9,.97);border-bottom:1px solid rgba(0,255,140,.2);padding:13px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;gap:16px;}
#gd-logo{font-family:'Orbitron',monospace;font-size:14px;font-weight:700;letter-spacing:2px;background:linear-gradient(90deg,#00ff8c,#00e5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
#gd-title{font-family:'Share Tech Mono',monospace;font-size:12px;color:rgba(0,255,140,.75);letter-spacing:1px;}
#gd-meta{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(232,244,237,.35);}
#gd-wrap{max-width:900px;margin:32px auto;padding:0 24px 80px;}
h1{font-family:'Orbitron',monospace;font-size:20px;color:#00ff8c;margin:24px 0 12px;letter-spacing:1px;}
h2{font-family:'Orbitron',monospace;font-size:16px;color:#00e5ff;margin:20px 0 10px;}
h3{font-size:15px;font-weight:600;color:#ffd166;margin:16px 0 8px;}
h4,h5,h6{font-size:14px;font-weight:600;color:rgba(232,244,237,.85);margin:12px 0 6px;}
p{margin-bottom:10px;color:rgba(232,244,237,.85);}
ul,ol{margin:8px 0 12px 22px;}
li{margin-bottom:4px;color:rgba(232,244,237,.8);}
strong{color:#fff;font-weight:600;}
em{color:#ffd166;font-style:italic;}
code{background:rgba(0,255,140,.1);color:#00ff8c;padding:2px 6px;border-radius:3px;font-family:'Share Tech Mono',monospace;font-size:12px;}
pre{background:rgba(0,0,0,.4);border:1px solid rgba(0,255,140,.12);padding:16px;border-radius:4px;overflow-x:auto;margin:12px 0;}
pre code{background:none;color:#e8f4ed;padding:0;font-size:13px;line-height:1.6;}
hr{border:none;border-top:1px solid rgba(0,255,140,.15);margin:20px 0;}
blockquote{border-left:3px solid rgba(0,229,255,.4);padding:10px 18px;margin:12px 0;background:rgba(0,229,255,.04);color:rgba(232,244,237,.8);}
table{border-collapse:collapse;width:100%;margin:14px 0;font-size:13px;}
th{background:rgba(0,255,140,.07);color:#00ff8c;padding:9px 14px;text-align:left;border-bottom:1px solid rgba(0,255,140,.18);font-family:'Rajdhani',sans-serif;font-weight:600;letter-spacing:.5px;}
td{padding:8px 14px;border-bottom:1px solid rgba(0,255,140,.06);color:rgba(232,244,237,.78);}
tr:hover td{background:rgba(0,255,140,.025);}
img{max-width:100%;height:auto;border-radius:4px;margin:8px 0;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:rgba(0,255,140,.2);border-radius:4px;}
</style></head><body>
<div id="gd-hdr">
  <div id="gd-logo">⊙ EternalQuants</div>
  <div id="gd-title">📄 ${esc(title)}</div>
  <div id="gd-meta">GUIDE &nbsp;·&nbsp; VIEW ONLY</div>
</div>
<div id="gd-wrap">${htmlContent}</div>
</body></html>`;
  }
  const blob = new Blob([finalHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
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

/* ─── ADMIN INBOX ─── */
const STATUS_LABELS = { new: 'NEW', reviewed: 'REVIEWED', done: 'DONE' };
const TYPE_FILTERS = ['all', 'feedback', 'suggestion', 'bug_report', 'question', 'other'];

function AdminInbox({ onClose, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [replies, setReplies] = useState({});
  const [saving, setSaving] = useState({});
  const [unread, setUnread] = useState(0);

  useEffect(() => { loadFeedback(); }, []);

  async function loadFeedback() {
    setLoading(true);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setItems(data || []);
      setUnread((data || []).filter(d => d.status === 'new').length);
    }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setSaving(s => ({ ...s, [id]: true }));
    await supabase.from('feedback').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setSaving(s => ({ ...s, [id]: false }));
  }

  async function saveReply(id) {
    const reply = replies[id]?.trim();
    if (!reply) return;
    setSaving(s => ({ ...s, [id + '_reply']: true }));
    const { error } = await supabase.from('feedback')
      .update({ admin_reply: reply, status: 'reviewed', updated_at: new Date().toISOString() })
      .eq('id', id);
    setSaving(s => ({ ...s, [id + '_reply']: false }));
    if (error) { showToast('Failed to save reply', 'error'); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, admin_reply: reply, status: 'reviewed' } : i));
    setReplies(r => ({ ...r, [id]: '' }));
    showToast('Reply saved ✓', 'success');
  }

  function fmtDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div className="eq-inbox-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="eq-inbox-panel">
        {/* Header */}
        <div className="eq-inbox-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="eq-inbox-title">✦ USER INBOX</div>
            {unread > 0 && <span className="eq-inbox-badge">{unread} NEW</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={loadFeedback} style={{ fontFamily: 'var(--eq-mono)', fontSize: 9, letterSpacing: 1, color: 'var(--eq-muted)', background: 'transparent', border: '1px solid var(--eq-border)', borderRadius: 2, padding: '4px 10px', cursor: 'pointer' }}>↺ REFRESH</button>
            <div className="eq-inbox-close" onClick={onClose}>✕</div>
          </div>
        </div>

        {/* Filters */}
        <div className="eq-inbox-filters">
          {TYPE_FILTERS.map(f => (
            <button key={f} className={`eq-inbox-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'ALL' : f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <span className="eq-inbox-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* List */}
        <div className="eq-inbox-list">
          {loading ? (
            <div className="eq-loading"><div className="eq-spinner" /><span>LOADING MESSAGES...</span></div>
          ) : filtered.length === 0 ? (
            <div className="eq-inbox-empty">
              <div className="eq-inbox-empty-icon">📭</div>
              <div className="eq-inbox-empty-txt">NO MESSAGES YET</div>
            </div>
          ) : filtered.map(item => {
            const isOpen = expandedId === item.id;
            return (
              <div key={item.id} className={`eq-inbox-card${isOpen ? ' expanded' : ''}`}>
                {/* Card top — click to expand */}
                <div className="eq-inbox-card-top" onClick={() => {
                  setExpandedId(isOpen ? null : item.id);
                  if (item.status === 'new' && !isOpen) updateStatus(item.id, 'reviewed');
                }}>
                  <div className={`eq-inbox-type-badge eq-inbox-type-${item.type || 'other'}`}>
                    {(item.type || 'other').replace('_', ' ')}
                  </div>
                  <div className="eq-inbox-meta">
                    <div className="eq-inbox-user">{item.user_name || 'Anonymous'}</div>
                    <div className="eq-inbox-email">{item.user_email || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div className="eq-inbox-time">{fmtDate(item.created_at)}</div>
                    <span className={`eq-inbox-type-badge eq-inbox-status-${item.status || 'new'}`} style={{ fontSize: 7 }}>
                      {STATUS_LABELS[item.status] || 'NEW'}
                    </span>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <>
                    <div className="eq-inbox-msg">{item.message}</div>

                    {/* Existing admin reply */}
                    {item.admin_reply && (
                      <div className="eq-inbox-admin-reply">
                        <div className="eq-inbox-admin-reply-lbl">YOUR REPLY</div>
                        <div className="eq-inbox-admin-reply-txt">{item.admin_reply}</div>
                      </div>
                    )}

                    {/* Status buttons */}
                    <div className="eq-inbox-status-row">
                      <span style={{ fontFamily: 'var(--eq-mono)', fontSize: 9, color: 'var(--eq-muted)', letterSpacing: 1, marginRight: 4 }}>STATUS:</span>
                      {Object.entries(STATUS_LABELS).map(([s, lbl]) => (
                        <button key={s} className={`eq-inbox-status-btn${item.status === s ? ' active' : ''}`}
                          disabled={saving[item.id]}
                          onClick={e => { e.stopPropagation(); updateStatus(item.id, s); }}>
                          {lbl}
                        </button>
                      ))}
                    </div>

                    {/* Reply area */}
                    <div className="eq-inbox-reply-area">
                      <textarea
                        className="eq-inbox-reply-input"
                        placeholder="Type a reply note (saved internally for reference)..."
                        value={replies[item.id] || ''}
                        onChange={e => setReplies(r => ({ ...r, [item.id]: e.target.value }))}
                      />
                      <div className="eq-inbox-reply-footer">
                        <button className="eq-inbox-reply-btn"
                          disabled={!replies[item.id]?.trim() || saving[item.id + '_reply']}
                          onClick={() => saveReply(item.id)}>
                          {saving[item.id + '_reply'] ? 'SAVING...' : 'SAVE REPLY →'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── FEEDBACK MODAL ─── */
// SQL to create feedback table (run once in Supabase SQL Editor):
// create table feedback (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id), user_email text, user_name text, type text default 'feedback', message text not null, created_at timestamptz default now());
// alter table feedback enable row level security;
// create policy "Users can submit" on feedback for insert to authenticated with check (true);
// create policy "Admin can read" on feedback for select to authenticated using (auth.email() = 'amitjoh@gmail.com');
const FB_TYPES = ['Feedback', 'Suggestion', 'Bug Report', 'Question', 'Other'];
function FeedbackModal({ user, onClose, showToast }) {
  const [type, setType] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    setSubmitting(true);
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous';
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id,
      user_email: user?.email,
      user_name: userName,
      type: type.toLowerCase().replace(' ', '_'),
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) { showToast('Could not submit — ' + error.message, 'error'); return; }
    setDone(true);
    setTimeout(onClose, 2200);
  }

  return (
    <div className="eq-fb-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="eq-fb-box">
        <div className="eq-fb-top">
          <div className="eq-fb-title">✦ TALK TO ETERNALQUANTS TEAM</div>
          <div className="eq-fb-close" onClick={onClose}>✕</div>
        </div>
        <div className="eq-fb-body">
          {done ? (
            <div style={{ textAlign:'center', padding:'28px 0' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>✦</div>
              <div style={{ fontFamily:'var(--eq-display)', fontSize:13, color:'var(--eq-green)', letterSpacing:2 }}>MESSAGE SENT</div>
              <div style={{ fontFamily:'var(--eq-mono)', fontSize:10, color:'var(--eq-muted)', marginTop:8, letterSpacing:1 }}>Thank you — we'll review it shortly.</div>
            </div>
          ) : (
            <>
              <div>
                <div className="eq-fb-label">Type</div>
                <div className="eq-fb-types">
                  {FB_TYPES.map(t => (
                    <button key={t} className={`eq-fb-type${type===t?' active':''}`} onClick={() => setType(t)}>{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="eq-fb-label">Your Message</div>
                <textarea
                  className="eq-fb-textarea"
                  placeholder="Share your thoughts, ideas, or issues..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <div className="eq-fb-footer">
                <button className="eq-fb-cancel" onClick={onClose}>CANCEL</button>
                <button className="eq-fb-submit" disabled={!message.trim() || submitting} onClick={handleSubmit}>
                  {submitting ? 'SENDING...' : 'SEND →'}
                </button>
              </div>
            </>
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

  async function handleView(file) {
    if (!file.name.endsWith('.ipynb')) { setViewer(file); return; }
    // Notebooks open as full HTML in a new tab
    const { data, error } = await supabase.storage.from(file.bucket || 'community-files').download(file.storage_path || file.storagePath);
    if (error) { showToast('Could not load notebook: ' + error.message, 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      try { openNotebookInNewWindow(JSON.parse(e.target.result), file.name); }
      catch (err) { showToast('Failed to parse notebook: ' + err.message, 'error'); }
    };
    reader.readAsText(data);
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
            onDownload={handleDownload} onView={handleView} onDelete={handleDelete} />
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

/* ─── PUBLISH GUIDE FORM (admin) ─── */
function PublishGuideForm({ modelId, admin, showToast, onPublished }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [author, setAuthor] = useState('EternalQuants Team');
  const [htmlContent, setHtmlContent] = useState('');
  const [saving, setSaving] = useState(false);

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      showToast('Only .html files are supported', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setHtmlContent(ev.target.result || '');
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (!title.trim() || !htmlContent.trim()) {
      showToast('Title and HTML content are required', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('model_guides').insert({
      model_id: modelId,
      title: title.trim(),
      description: desc.trim() || null,
      html_content: htmlContent,
      author_name: author.trim() || 'EternalQuants Team',
      is_active: true,
    });
    setSaving(false);
    if (error) { showToast('Error: ' + error.message, 'error'); return; }
    showToast('Guide published!', 'success');
    setTitle(''); setDesc(''); setHtmlContent(''); setAuthor('EternalQuants Team');
    onPublished?.();
  }

  if (!admin) return null;

  return (
    <div className="eq-pub-guide-form">
      <div className="eq-pub-guide-hdr">📋 PUBLISH NEW GUIDE</div>
      <div className="eq-pub-guide-grid">
        <div>
          <label className="eq-pub-guide-sublabel">TITLE *</label>
          <input className="eq-pub-guide-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Guide 1: NIFTY 50 ARIMA Analysis" maxLength={120} />
        </div>
        <div>
          <label className="eq-pub-guide-sublabel">AUTHOR</label>
          <input className="eq-pub-guide-input" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" maxLength={80} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="eq-pub-guide-sublabel">SHORT DESCRIPTION</label>
          <input className="eq-pub-guide-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief summary shown on the card" maxLength={200} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="eq-pub-guide-sublabel">HTML CONTENT *</label>
          <textarea
            className="eq-pub-guide-textarea"
            value={htmlContent}
            onChange={e => setHtmlContent(e.target.value)}
            placeholder="Paste full HTML content here, or upload an .html file below..."
            rows={8}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <label className="eq-pub-guide-file-btn">
              📁 UPLOAD .HTML FILE
              <input type="file" accept=".html,.htm" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
            {htmlContent && <span className="eq-pub-guide-char">{htmlContent.length.toLocaleString()} chars loaded</span>}
          </div>
        </div>
      </div>
      <div className="eq-pub-guide-footer">
        <button className="eq-pub-guide-submit" onClick={handleSubmit} disabled={saving || !title.trim() || !htmlContent.trim()}>
          {saving ? 'PUBLISHING...' : '✦ PUBLISH GUIDE'}
        </button>
      </div>
    </div>
  );
}

/* ─── GUIDES TAB (all models, DB-driven) ─── */
function GuidesTab({ modelId, admin, showToast }) {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    supabase.from('model_guides')
      .select('id, title, description, html_content, author_name, created_at, is_active')
      .eq('model_id', modelId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) { showToast('Failed to load guides: ' + error.message, 'error'); }
        setGuides(data || []);
        setLoading(false);
      });
  }, [modelId, refreshKey]);

  async function toggleActive(guide) {
    const { error } = await supabase.from('model_guides').update({ is_active: !guide.is_active }).eq('id', guide.id);
    if (error) { showToast('Error: ' + error.message, 'error'); return; }
    setGuides(prev => prev.map(g => g.id === guide.id ? { ...g, is_active: !g.is_active } : g));
    showToast(guide.is_active ? 'Guide hidden' : 'Guide visible', 'success');
  }

  async function deleteGuide(guide) {
    if (!window.confirm(`Delete guide "${guide.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('model_guides').delete().eq('id', guide.id);
    if (error) { showToast('Error: ' + error.message, 'error'); return; }
    setGuides(prev => prev.filter(g => g.id !== guide.id));
    showToast('Guide deleted', 'success');
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const visibleGuides = admin ? guides : guides.filter(g => g.is_active);

  return (
    <div className="eq-guides-wrap">
      {admin && (
        <div className="eq-guide-admin-bar">
          <button className="eq-guide-pub-toggle" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ CLOSE FORM' : '+ PUBLISH GUIDE'}
          </button>
          <span style={{ fontFamily: 'var(--eq-mono)', fontSize: 10, color: 'var(--eq-muted)' }}>
            {guides.length} guide{guides.length !== 1 ? 's' : ''} total
          </span>
        </div>
      )}
      {showForm && (
        <PublishGuideForm
          modelId={modelId}
          admin={admin}
          showToast={showToast}
          onPublished={() => { setRefreshKey(k => k + 1); setShowForm(false); }}
        />
      )}
      <div className="eq-guides-list">
        {loading && <div style={{ color: 'var(--eq-muted)', fontFamily: 'var(--eq-mono)', fontSize: 11, padding: 8 }}>LOADING GUIDES...</div>}
        {!loading && visibleGuides.length === 0 && (
          <div style={{ color: 'var(--eq-muted)', fontFamily: 'var(--eq-mono)', fontSize: 11, padding: 8 }}>
            {admin ? 'No guides published yet. Use "+ PUBLISH GUIDE" above to add one.' : 'No guides available for this model yet.'}
          </div>
        )}
        {visibleGuides.map((guide, idx) => (
          <div key={guide.id} className={`eq-guide-card${!guide.is_active ? ' guide-hidden' : ''}`}>
            <div className="eq-guide-card-icon">📄</div>
            <div className="eq-guide-card-info">
              <div className="eq-guide-card-title">
                Guide {idx + 1}: {guide.title}
                {!guide.is_active && <span className="eq-guide-hidden-badge">HIDDEN</span>}
              </div>
              {guide.description && <div className="eq-guide-card-desc">{guide.description}</div>}
              <div className="eq-guide-card-meta">
                <span className="eq-guide-card-author">by {guide.author_name || 'EternalQuants Team'}</span>
                <span>·</span>
                <span>{formatDate(guide.created_at)}</span>
              </div>
            </div>
            <div className="eq-guide-card-actions">
              <button
                style={{ padding: '5px 14px', background: 'rgba(0,229,255,.08)', border: '1px solid rgba(0,229,255,.3)', color: 'var(--eq-cyan)', fontFamily: 'var(--eq-mono)', fontSize: 10, cursor: 'pointer', borderRadius: 2, letterSpacing: 1 }}
                onClick={() => openGuideInNewWindow(guide.html_content, guide.title)}
              >
                ▶ OPEN
              </button>
              {admin && (
                <>
                  <button
                    style={{ padding: '5px 10px', background: guide.is_active ? 'rgba(255,127,81,.08)' : 'rgba(0,255,140,.08)', border: `1px solid ${guide.is_active ? 'rgba(255,127,81,.3)' : 'rgba(0,255,140,.3)'}`, color: guide.is_active ? 'var(--eq-orange)' : 'var(--eq-green)', fontFamily: 'var(--eq-mono)', fontSize: 10, cursor: 'pointer', borderRadius: 2, letterSpacing: 1 }}
                    onClick={() => toggleActive(guide)}
                  >
                    {guide.is_active ? '⊘ HIDE' : '◎ SHOW'}
                  </button>
                  <button
                    style={{ padding: '5px 10px', background: 'rgba(255,77,109,.08)', border: '1px solid rgba(255,77,109,.3)', color: 'var(--eq-red)', fontFamily: 'var(--eq-mono)', fontSize: 10, cursor: 'pointer', borderRadius: 2, letterSpacing: 1 }}
                    onClick={() => deleteGuide(guide)}
                  >
                    ✕ DEL
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
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
          { id: 'guide', label: 'GUIDE' },
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

      {/* Guide pane */}
      <div className={`eq-pane${activeTab === 'guide' ? ' active' : ''}`}>
        <GuidesTab modelId={modelId} admin={admin} showToast={showToast} />
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [inboxUnread, setInboxUnread] = useState(0);

  // Load unread count for admin badge
  useEffect(() => {
    if (!admin) return;
    supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new')
      .then(({ count }) => setInboxUnread(count || 0));
  }, [admin]);
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
            <div className="eq-logo-mark">
              <svg viewBox="0 0 38 38" width="38" height="38" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff8c"/>
                    <stop offset="100%" stopColor="#00e5ff"/>
                  </linearGradient>
                </defs>
                {/* Outer ring */}
                <circle cx="19" cy="19" r="16" fill="none" stroke="url(#cg)" strokeWidth="1.6"/>
                {/* Inner ring */}
                <circle cx="19" cy="19" r="5" fill="none" stroke="url(#cg)" strokeWidth="1.4"/>
                {/* Center dot */}
                <circle cx="19" cy="19" r="2" fill="url(#cg)"/>
                {/* 8 spokes: outer ends at r=14.5, inner ends at r=5.8 */}
                <line x1="19" y1="3" x2="19" y2="13.2" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="29.25" y1="8.75" x2="23.1" y2="14.9" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="35" y1="19" x2="24.8" y2="19" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="29.25" y1="29.25" x2="23.1" y2="23.1" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="19" y1="35" x2="19" y2="24.8" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="8.75" y1="29.25" x2="14.9" y2="23.1" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="3" y1="19" x2="13.2" y2="19" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="8.75" y1="8.75" x2="14.9" y2="14.9" stroke="url(#cg)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="eq-brand">EternalQuants</div>
          </div>
          <div className="eq-topbar-center">// Quantitative Research Terminal</div>
          <div className="eq-topbar-right">
            {['MODELS', 'BACKTESTER', 'REPORTS', 'SIGNALS'].map(pill => (
              <div key={pill} className={`eq-nav-pill${pill === 'MODELS' ? ' active' : ''}`}>{pill}</div>
            ))}
            <button className="eq-feedback-btn" onClick={() => setShowFeedback(true)}>✦ TALK TO US</button>
            {admin && (
              <button className="eq-inbox-btn" onClick={() => { setShowInbox(true); setInboxUnread(0); }}>
                ✉ INBOX
                {inboxUnread > 0 && <span className="eq-inbox-badge">{inboxUnread}</span>}
              </button>
            )}
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

      {/* FEEDBACK MODAL */}
      {showFeedback && (
        <FeedbackModal
          user={user}
          onClose={() => setShowFeedback(false)}
          showToast={showToast}
        />
      )}

      {/* ADMIN INBOX */}
      {showInbox && admin && (
        <AdminInbox
          onClose={() => setShowInbox(false)}
          showToast={showToast}
        />
      )}
    </>
  );
}

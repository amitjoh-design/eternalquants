import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Google Fonts injected once ─── */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&family=Share+Tech+Mono&display=swap';

function injectFonts() {
  if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = FONT_HREF;
    document.head.appendChild(l);
  }
}

/* ─── Chart constants ─── */
const TRAIN_END = 60, TEST_END = 90, FUTURE_N = 20, TOTAL_X = 110;
const W = 600, H = 460, PAD = { t: 32, r: 22, b: 50, l: 56 };
const CW = W - PAD.l - PAD.r, CH = H - PAD.t - PAD.b;

function genSeries(n, start, vol, drift) {
  const d = [start];
  for (let i = 1; i < n; i++)
    d.push(Math.max(d[i - 1] + (Math.random() - 0.48) * vol + drift, start * 0.5));
  return d;
}

function ns(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const animRef = useRef(null);

  /* ── Particle background ── */
  useEffect(() => {
    injectFonts();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 1400; canvas.height = 700;
    const NODES = 70;
    const nodes = Array.from({ length: NODES }, () => ({
      x: Math.random() * 1400, y: Math.random() * 700,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));
    let rafBg;
    function drawBg() {
      ctx.clearRect(0, 0, 1400, 700);
      for (let i = 0; i < NODES; i++)
        for (let j = i + 1; j < NODES; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,180,${0.22 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,180,.5)'; ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > 1400) n.vx *= -1;
        if (n.y < 0 || n.y > 700) n.vy *= -1;
      });
      rafBg = requestAnimationFrame(drawBg);
    }
    drawBg();
    return () => cancelAnimationFrame(rafBg);
  }, []);

  /* ── SVG Chart ── */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const realSeries = genSeries(90, 22500, 120, 3);

    const predictedTest = realSeries.slice(TRAIN_END).map((v, i) => {
      const noise = (Math.random() - 0.5) * 8;
      const lag = i < 1 ? 0 : (realSeries[TRAIN_END + i] - realSeries[TRAIN_END + i - 1]) * 0.3;
      return v + noise - lag * 0.5;
    });

    const lastReal = realSeries[89];
    const futureForecast = [];
    let fv = lastReal;
    for (let i = 0; i < FUTURE_N; i++) { fv += 0.5 + (Math.random() - 0.46) * 6; futureForecast.push(fv); }

    const testConf = predictedTest.map((v, i) => ({ upper: v + 7 + i * 0.3, lower: v - 7 - i * 0.3 }));
    const futureConf = futureForecast.map((v, i) => ({ upper: v + 9 + i * 0.55, lower: v - 9 - i * 0.55 }));

    const allV = [...realSeries, ...predictedTest, ...futureForecast, ...testConf.map(c => c.upper), ...futureConf.map(c => c.upper)];
    const mn = Math.min(...allV) - 14, mx = Math.max(...allV) + 14;

    const sx = i => PAD.l + (i / (TOTAL_X - 1)) * CW;
    const sy = v => PAD.t + (1 - (v - mn) / (mx - mn)) * CH;

    /* defs */
    const defs = ns('defs');
    const clip = ns('clipPath', { id: 'cc' });
    clip.appendChild(ns('rect', { x: PAD.l, y: PAD.t, width: CW, height: CH }));
    defs.appendChild(clip);
    function mkGrad(id, col, o1, o2) {
      const g = ns('linearGradient', { id, x1: '0', y1: '0', x2: '0', y2: '1' });
      g.appendChild(ns('stop', { offset: '0%', 'stop-color': col, 'stop-opacity': o1 }));
      g.appendChild(ns('stop', { offset: '100%', 'stop-color': col, 'stop-opacity': o2 }));
      defs.appendChild(g);
    }
    mkGrad('gTrain', '#7a8fa8', '.12', '0');
    mkGrad('gPred', '#4d9de0', '.18', '0');
    mkGrad('gFore', '#ff4d6d', '.2', '0');
    svg.appendChild(defs);

    /* zone backgrounds */
    function zoneRect(x1, x2, col) {
      svg.appendChild(ns('rect', { x: sx(x1), y: PAD.t, width: sx(x2) - sx(x1), height: CH, fill: col, 'clip-path': 'url(#cc)' }));
    }
    zoneRect(0, TRAIN_END - 1, 'rgba(122,143,168,.025)');
    zoneRect(TRAIN_END, TEST_END - 1, 'rgba(0,255,140,.018)');
    zoneRect(TEST_END, TOTAL_X - 1, 'rgba(255,77,109,.022)');

    /* chart title */
    const chartTitle = ns('text', { x: PAD.l + CW / 2, y: PAD.t - 14, 'text-anchor': 'middle', fill: 'rgba(200,220,255,.6)', 'font-size': '12', 'font-family': 'Share Tech Mono', 'letter-spacing': '3' });
    chartTitle.textContent = 'NIFTY 50 PRICE LEVEL · ARIMA FORECAST'; svg.appendChild(chartTitle);

    /* grid */
    for (let i = 0; i <= 5; i++) {
      const y = PAD.t + (i / 5) * CH;
      svg.appendChild(ns('line', { x1: PAD.l, y1: y, x2: PAD.l + CW, y2: y, stroke: 'rgba(0,255,180,.09)', 'stroke-width': '1' }));
      const lbl = ns('text', { x: PAD.l - 7, y: y + 4, 'text-anchor': 'end', fill: 'rgba(255,255,255,.35)', 'font-size': '11', 'font-family': 'Share Tech Mono' });
      lbl.textContent = Math.round(mx - (i / 5) * (mx - mn)); svg.appendChild(lbl);
    }
    for (let i = 0; i <= 5; i++)
      svg.appendChild(ns('line', { x1: PAD.l + (i / 5) * CW, y1: PAD.t, x2: PAD.l + (i / 5) * CW, y2: PAD.t + CH, stroke: 'rgba(0,255,180,.05)', 'stroke-width': '1' }));

    /* axis labels */
    const xlbl = ns('text', { x: PAD.l + CW / 2, y: H - 6, 'text-anchor': 'middle', fill: 'rgba(255,255,255,.3)', 'font-size': '11', 'font-family': 'Share Tech Mono' });
    xlbl.textContent = 'TIME (TRADING SESSIONS)'; svg.appendChild(xlbl);
    const ylbl = ns('text', { x: 13, y: PAD.t + CH / 2, 'text-anchor': 'middle', fill: 'rgba(255,255,255,.3)', 'font-size': '11', 'font-family': 'Share Tech Mono', transform: `rotate(-90,13,${PAD.t + CH / 2})` });
    ylbl.textContent = 'PRICE LEVEL'; svg.appendChild(ylbl);

    /* dividers */
    function divLine(xi, col, label, side = 'right') {
      const x = sx(xi);
      svg.appendChild(ns('line', { x1: x, y1: PAD.t, x2: x, y2: PAD.t + CH, stroke: col, 'stroke-width': '1.5', 'stroke-dasharray': '5 4', 'clip-path': 'url(#cc)' }));
      const t = ns('text', { x: side === 'right' ? x + 4 : x - 4, y: PAD.t + 24, 'text-anchor': side === 'right' ? 'start' : 'end', fill: col, 'font-size': '11', 'font-family': 'Share Tech Mono' });
      t.textContent = label; svg.appendChild(t);
    }
    divLine(TRAIN_END, 'rgba(0,255,140,.45)', '▶ HOLD-OUT');
    divLine(TEST_END, 'rgba(255,77,109,.65)', '▶ FORECAST');

    /* zone header labels */
    function zoneLabel(x1i, x2i, txt, col) {
      const xm = (sx(x1i) + sx(x2i)) / 2;
      svg.appendChild(ns('rect', { x: xm - 36, y: PAD.t + 4, width: 72, height: 17, rx: '2', fill: col, 'fill-opacity': '.1' }));
      const t = ns('text', { x: xm, y: PAD.t + 16, 'text-anchor': 'middle', fill: col, 'font-size': '11', 'font-family': 'Share Tech Mono', 'letter-spacing': '1' });
      t.textContent = txt; svg.appendChild(t);
    }
    zoneLabel(0, TRAIN_END - 1, 'TRAINING', '#8a9bb0');
    zoneLabel(TRAIN_END, TEST_END - 1, 'HOLD-OUT', '#00ff8c');
    zoneLabel(TEST_END, TOTAL_X - 1, 'FORECAST', '#ff4d6d');

    /* animated paths */
    const trainArea = ns('path', { 'clip-path': 'url(#cc)', fill: 'url(#gTrain)', stroke: 'none' }); svg.appendChild(trainArea);
    const predConfEl = ns('path', { 'clip-path': 'url(#cc)', fill: 'rgba(77,157,224,.12)', stroke: 'none' }); svg.appendChild(predConfEl);
    const foreConfEl = ns('path', { 'clip-path': 'url(#cc)', fill: 'rgba(255,77,109,.09)', stroke: 'none' }); svg.appendChild(foreConfEl);
    const predAreaEl = ns('path', { 'clip-path': 'url(#cc)', fill: 'url(#gPred)', stroke: 'none' }); svg.appendChild(predAreaEl);
    const foreAreaEl = ns('path', { 'clip-path': 'url(#cc)', fill: 'url(#gFore)', stroke: 'none' }); svg.appendChild(foreAreaEl);

    const trainLine = ns('path', { 'clip-path': 'url(#cc)', fill: 'none', stroke: '#8a9bb0', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); svg.appendChild(trainLine);
    const testActLine = ns('path', { 'clip-path': 'url(#cc)', fill: 'none', stroke: '#00ff8c', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); svg.appendChild(testActLine);
    const predLineEl = ns('path', { 'clip-path': 'url(#cc)', fill: 'none', stroke: '#4d9de0', 'stroke-width': '2.2', 'stroke-dasharray': '8 4', 'stroke-linecap': 'round' }); svg.appendChild(predLineEl);
    const foreLineEl = ns('path', { 'clip-path': 'url(#cc)', fill: 'none', stroke: '#ff4d6d', 'stroke-width': '2.2', 'stroke-dasharray': '7 4', 'stroke-linecap': 'round' }); svg.appendChild(foreLineEl);
    const foreUpper = ns('path', { 'clip-path': 'url(#cc)', fill: 'none', stroke: 'rgba(77,157,224,.45)', 'stroke-width': '.9', 'stroke-dasharray': '3 4' }); svg.appendChild(foreUpper);
    const foreLower = ns('path', { 'clip-path': 'url(#cc)', fill: 'none', stroke: 'rgba(77,157,224,.45)', 'stroke-width': '.9', 'stroke-dasharray': '3 4' }); svg.appendChild(foreLower);

    /* MA10 on train */
    const ma10pts = realSeries.slice(0, TRAIN_END)
      .map((_, i, a) => { if (i < 9) return null; return { i, v: a.slice(i - 9, i + 1).reduce((s, x) => s + x, 0) / 10 }; })
      .filter(Boolean);
    const maEl = ns('path', { 'clip-path': 'url(#cc)', fill: 'none', stroke: 'rgba(0,212,255,.55)', 'stroke-width': '1.2', d: ma10pts.map(({ i, v }, k) => `${k === 0 ? 'M' : 'L'}${sx(i)},${sy(v)}`).join(' ') });
    svg.appendChild(maEl);
    const maLbl = ns('text', { x: sx(TRAIN_END - 1) - 5, y: sy(ma10pts[ma10pts.length - 1].v) - 7, 'text-anchor': 'end', fill: 'rgba(0,212,255,.65)', 'font-size': '11', 'font-family': 'Share Tech Mono' });
    maLbl.textContent = 'MA10'; svg.appendChild(maLbl);

    /* live dot + ring */
    const liveDot = ns('circle', { r: '5', fill: '#ff4d6d', stroke: '#000', 'stroke-width': '1.5', filter: 'drop-shadow(0 0 5px #ff4d6d)' }); svg.appendChild(liveDot);
    const liveRing = ns('circle', { r: '5', fill: 'none', stroke: '#ff4d6d', 'stroke-width': '1.2' }); svg.appendChild(liveRing);

    function buildPath(data, offset) { return data.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(offset + i)},${sy(v)}`).join(' '); }
    function buildArea(data, offset) { if (data.length < 2) return ''; const p = buildPath(data, offset); return p + `L${sx(offset + data.length - 1)},${PAD.t + CH} L${sx(offset)},${PAD.t + CH}Z`; }
    function buildBand(conf, offset) { if (conf.length < 2) return ''; const up = conf.map(({ upper }, i) => `${i === 0 ? 'M' : 'L'}${sx(offset + i)},${sy(upper)}`).join(' '); const lo = conf.map(({ lower }, i, a) => `L${sx(offset + a.length - 1 - i)},${sy(conf[a.length - 1 - i].lower)}`).join(' '); return up + lo + 'Z'; }
    function moveDot(xi, yi) { liveDot.setAttribute('cx', xi); liveDot.setAttribute('cy', yi); liveRing.setAttribute('cx', xi); liveRing.setAttribute('cy', yi); }

    let prog = 0;
    const FRAMES = 200;
    let rafChart;
    function tick() {
      prog = Math.min(prog + 1, FRAMES);
      const t = prog / FRAMES;
      const tT = Math.min(t / 0.38, 1);
      const tEnd = Math.max(1, Math.round(tT * TRAIN_END));
      trainLine.setAttribute('d', buildPath(realSeries.slice(0, tEnd), 0));
      trainArea.setAttribute('d', buildArea(realSeries.slice(0, tEnd), 0));
      moveDot(sx(tEnd - 1), sy(realSeries[tEnd - 1]));

      if (t > 0.38) {
        const p2T = Math.min((t - 0.38) / 0.37, 1);
        const teEnd = Math.max(1, Math.round(p2T * (TEST_END - TRAIN_END)));
        testActLine.setAttribute('d', buildPath(realSeries.slice(TRAIN_END, TRAIN_END + teEnd), TRAIN_END));
        predLineEl.setAttribute('d', buildPath(predictedTest.slice(0, teEnd), TRAIN_END));
        predAreaEl.setAttribute('d', buildArea(predictedTest.slice(0, teEnd), TRAIN_END));
        predConfEl.setAttribute('d', buildBand(testConf.slice(0, teEnd), TRAIN_END));
        moveDot(sx(TRAIN_END + teEnd - 1), sy(realSeries[TRAIN_END + teEnd - 1]));
      }
      if (t > 0.75) {
        const p3T = Math.min((t - 0.75) / 0.25, 1);
        const feEnd = Math.max(1, Math.round(p3T * FUTURE_N));
        const fData = futureForecast.slice(0, feEnd);
        const fc = futureConf.slice(0, feEnd);
        foreLineEl.setAttribute('d', buildPath(fData, TEST_END));
        foreAreaEl.setAttribute('d', buildArea(fData, TEST_END));
        foreConfEl.setAttribute('d', buildBand(fc, TEST_END));
        if (fc.length > 0) {
          foreUpper.setAttribute('d', fc.map(({ upper }, i) => `${i === 0 ? 'M' : 'L'}${sx(TEST_END + i)},${sy(upper)}`).join(' '));
          foreLower.setAttribute('d', fc.map(({ lower }, i) => `${i === 0 ? 'M' : 'L'}${sx(TEST_END + i)},${sy(lower)}`).join(' '));
        }
        moveDot(sx(TEST_END + feEnd - 1), sy(fData[feEnd - 1]));
      }
      if (prog < FRAMES) rafChart = requestAnimationFrame(tick);
    }
    tick();

    let rR = 5, rO = 1, rafPulse;
    function pulseRing() {
      rR += 0.35; rO -= 0.022;
      if (rO <= 0) { rR = 5; rO = 1; }
      liveRing.setAttribute('r', rR);
      liveRing.setAttribute('opacity', rO);
      rafPulse = requestAnimationFrame(pulseRing);
    }
    pulseRing();

    return () => {
      cancelAnimationFrame(rafChart);
      cancelAnimationFrame(rafPulse);
    };
  }, []);

  /* ── Styles (mirroring the original HTML exactly) ── */
  const S = {
    page: {
      background: '#000',
      width: '100vw',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Rajdhani', sans-serif",
    },
    gridOverlay: {
      position: 'absolute', inset: 0, zIndex: 0,
      backgroundImage: 'linear-gradient(rgba(0,255,180,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,180,.04) 1px,transparent 1px)',
      backgroundSize: '40px 40px',
      animation: 'gridShift 20s linear infinite',
    },
    scanline: {
      position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
      background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px)',
    },
    hscan: {
      position: 'absolute', width: '100%', height: '2px',
      background: 'linear-gradient(90deg,transparent,rgba(0,255,180,.35),transparent)',
      animation: 'hscan 8s ease-in-out infinite', zIndex: 3, pointerEvents: 'none',
    },
    orb1: { position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, width: 400, height: 400, background: 'rgba(0,255,180,.06)', top: -100, left: -100 },
    orb2: { position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, width: 300, height: 300, background: 'rgba(0,212,255,.05)', top: '50%', right: -50, transform: 'translateY(-50%)' },
    orb3: { position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, width: 250, height: 250, background: 'rgba(255,107,53,.04)', bottom: -80, left: '40%' },
    bracket: (pos) => {
      const base = { position: 'absolute', width: 60, height: 60, zIndex: 10 };
      const borders = {
        tl: { top: 20, left: 20, borderTop: '2px solid #00ffb4', borderLeft: '2px solid #00ffb4' },
        tr: { top: 20, right: 20, borderTop: '2px solid #00ffb4', borderRight: '2px solid #00ffb4' },
        bl: { bottom: 20, left: 20, borderBottom: '2px solid #00ffb4', borderLeft: '2px solid #00ffb4' },
        br: { bottom: 20, right: 20, borderBottom: '2px solid #00ffb4', borderRight: '2px solid #00ffb4' },
      };
      return { ...base, ...borders[pos] };
    },
    scene: {
      position: 'absolute', inset: 0, zIndex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '40px 80px',
    },
    chartPanel: { position: 'relative', width: 600, height: 460, flexShrink: 0 },
    legendRow: { position: 'absolute', top: -28, left: 50, display: 'flex', gap: 12, zIndex: 10 },
    leg: (type) => {
      const colors = {
        train:  { color: '#8a9bb0', background: 'rgba(138,155,176,.07)', border: '1px solid rgba(138,155,176,.2)' },
        actual: { color: '#00ff8c', background: 'rgba(0,255,140,.06)', border: '1px solid rgba(0,255,140,.2)' },
        pred:   { color: '#4d9de0', background: 'rgba(77,157,224,.07)', border: '1px solid rgba(77,157,224,.25)' },
        fore:   { color: '#ff4d6d', background: 'rgba(255,77,109,.07)', border: '1px solid rgba(255,77,109,.25)' },
      };
      return { display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Share Tech Mono',monospace", fontSize: 12, letterSpacing: 1, padding: '4px 12px', borderRadius: 2, backdropFilter: 'blur(4px)', ...colors[type] };
    },
    dot: (col) => ({ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: col }),
    pill: (type) => {
      const variants = {
        p1: { top: -6, right: -10, color: '#4d9de0', borderColor: 'rgba(77,157,224,.3)', animationDelay: '0s' },
        p2: { bottom: 60, left: -14, color: '#8a9bb0', borderColor: 'rgba(138,155,176,.3)', animationDelay: '1.2s' },
        p3: { bottom: -12, right: 20, color: '#ff4d6d', borderColor: 'rgba(255,77,109,.25)', animationDelay: '2.1s' },
      };
      return { position: 'absolute', background: 'rgba(0,10,5,.8)', border: '1px solid', padding: '6px 14px', fontFamily: "'Share Tech Mono',monospace", fontSize: 12, borderRadius: 2, whiteSpace: 'nowrap', animation: 'pillBlink 3s ease-in-out infinite', backdropFilter: 'blur(6px)', zIndex: 10, ...variants[type] };
    },
    centerText: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 28px', position: 'relative', zIndex: 5 },
    overline: { fontFamily: "'Share Tech Mono',monospace", color: '#00ffb4', fontSize: 13, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 18, opacity: 0.85, animation: 'fadeUp 1s ease .2s both' },
    h1: { fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 44, lineHeight: 1.1, letterSpacing: -1, animation: 'fadeUp 1s ease .4s both', margin: 0 },
    sub: { marginTop: 16, fontSize: 16, color: 'rgba(255,255,255,.45)', letterSpacing: 2, fontWeight: 400, animation: 'fadeUp 1s ease .6s both' },
    pipeline: { display: 'flex', alignItems: 'center', marginTop: 26, animation: 'fadeUp 1s ease .75s both' },
    pipeStep: (type) => {
      const variants = {
        train: { color: '#8a9bb0', borderColor: 'rgba(138,155,176,.4)', background: 'rgba(138,155,176,.06)' },
        test:  { color: '#00ff8c', borderColor: 'rgba(0,255,140,.3)', background: 'rgba(0,255,140,.05)' },
        pred:  { color: '#4d9de0', borderColor: 'rgba(77,157,224,.35)', background: 'rgba(77,157,224,.06)' },
        fore:  { color: '#ff4d6d', borderColor: 'rgba(255,77,109,.4)', background: 'rgba(255,77,109,.06)' },
      };
      return { padding: '9px 14px', fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: '1.5px', textAlign: 'center', border: '1px solid', lineHeight: 1.7, ...variants[type] };
    },
    pipeArrow: { color: 'rgba(255,255,255,.3)', fontFamily: "'Share Tech Mono',monospace", fontSize: 16, padding: '0 5px' },
    badgeRow: { display: 'flex', gap: 10, marginTop: 22, animation: 'fadeUp 1s ease .9s both' },
    badge: { padding: '6px 16px', border: '1px solid rgba(0,255,180,.25)', color: 'rgba(0,255,180,.75)', fontFamily: "'Share Tech Mono',monospace", fontSize: 12, letterSpacing: 2, background: 'rgba(0,255,180,.04)', position: 'relative', overflow: 'hidden' },
    cta: { marginTop: 28, padding: '15px 50px', background: 'linear-gradient(135deg,#00ffb4 0%,#00d4ff 100%)', color: '#000', fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 14, letterSpacing: 3, border: 'none', cursor: 'pointer', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', animation: 'fadeUp 1s ease 1.1s both', textTransform: 'uppercase' },
    rightPanel: { width: 245, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 11 },
    formulaBox: (delay = '.5s') => ({ background: 'rgba(0,10,5,.65)', border: '1px solid rgba(0,255,180,.15)', padding: '13px 15px', fontFamily: "'Share Tech Mono',monospace", fontSize: 13, color: 'rgba(0,255,180,.75)', lineHeight: 2.0, backdropFilter: 'blur(8px)', position: 'relative', overflow: 'hidden', animation: `fadeLeft 1s ease ${delay} both` }),
    fLabel: { fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', marginBottom: 5, display: 'block' },
    tickerStrip: { display: 'flex', flexDirection: 'column', gap: 6, animation: 'fadeLeft 1s ease .7s both' },
    tickRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,10,5,.5)', border: '1px solid rgba(255,255,255,.06)', fontFamily: "'Share Tech Mono',monospace", fontSize: 12 },
  };

  return (
    <>
      {/* Keyframe injections */}
      <style>{`
        @keyframes gridShift { 0%{background-position:0 0} 100%{background-position:40px 40px} }
        @keyframes pillBlink { 0%,100%{opacity:.65} 50%{opacity:1} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes hscan    { 0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes sweep    { 0%,100%{left:-100%} 50%{left:100%} }
        .badge-sweep::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(0,255,180,.1),transparent); animation:sweep 3s ease-in-out infinite; }
        .badge-sweep:nth-child(2)::before{animation-delay:1s}
        .badge-sweep:nth-child(3)::before{animation-delay:2s}
        .formula-bar::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:linear-gradient(180deg,#00ffb4,#00d4ff,#ff6b35); }
      `}</style>

      <div style={S.page}>
        <canvas ref={canvasRef} id="bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
        <div style={S.gridOverlay} />
        <div style={S.scanline} />
        <div style={S.hscan} />
        <div style={S.orb1} /><div style={S.orb2} /><div style={S.orb3} />
        <div style={S.bracket('tl')} /><div style={S.bracket('tr')} />
        <div style={S.bracket('bl')} /><div style={S.bracket('br')} />

        <div style={S.scene}>

          {/* LEFT: Chart */}
          <div style={S.chartPanel}>
            <div style={S.legendRow}>
              <div style={S.leg('train')}>  <div style={S.dot('#8a9bb0')} /> TRAINING </div>
              <div style={S.leg('actual')}> <div style={S.dot('#00ff8c')} /> ACTUAL CLOSE </div>
              <div style={S.leg('pred')}>   <div style={S.dot('#4d9de0')} /> RECONSTRUCTED </div>
              <div style={S.leg('fore')}>   <div style={S.dot('#ff4d6d')} /> FWD FORECAST </div>
            </div>
            <div style={S.pill('p1')}>RMSE: 138 · MAE: 97 · R²: 0.96</div>
            <div style={S.pill('p2')}>ARIMA(2,1,2) · AIC: 2847.4</div>
            <div style={S.pill('p3')}>95% CI · HORIZON: +20 SESSIONS</div>
            <svg ref={svgRef} viewBox="0 0 600 460" style={{ width: '100%', height: '100%', overflow: 'visible' }} />
          </div>

          {/* CENTER: Text */}
          <div style={S.centerText}>
            <div style={S.overline}>// Capital Markets · Algo Edition</div>
            <h1 style={S.h1}>
              <span style={{ color: '#fff' }}>Learn</span><br />
              <span style={{ color: '#00ffb4', textShadow: '0 0 30px rgba(0,255,180,.7),0 0 60px rgba(0,255,180,.3)' }}>Quantitative</span><br />
              <span style={{ color: '#fff' }}>Analysis</span><br />
              <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 27 }}>of</span>&nbsp;
              <span style={{ color: '#ff6b35', textShadow: '0 0 25px rgba(255,107,53,.6)' }}>Time</span>&nbsp;
              <span style={{ color: '#fff' }}>Series</span>
            </h1>
            <div style={S.sub}>ARIMA · GARCH · Fourier · ML Hybrids</div>
            <div style={S.pipeline}>
              <div style={S.pipeStep('train')}>TRAIN<br />DATA</div>
              <div style={S.pipeArrow}>›</div>
              <div style={S.pipeStep('test')}>HOLD-OUT<br />ACTUAL</div>
              <div style={S.pipeArrow}>›</div>
              <div style={S.pipeStep('pred')}>RECON-<br />STRUCT</div>
              <div style={S.pipeArrow}>›</div>
              <div style={S.pipeStep('fore')}>FORWARD<br />FORECAST</div>
            </div>
            <div style={S.badgeRow}>
              <div className="badge-sweep" style={S.badge}>NIFTY 50</div>
              <div className="badge-sweep" style={S.badge}>FUTURES</div>
              <div className="badge-sweep" style={S.badge}>OPTIONS</div>
            </div>
            <button style={S.cta} onClick={() => navigate('/auth')}>
              Start Learning →
            </button>
          </div>

          {/* RIGHT: Formulas + Tickers */}
          <div style={S.rightPanel}>
            <div className="formula-bar" style={S.formulaBox('.5s')}>
              <span style={S.fLabel}>ARIMA Model</span>
              <span style={{ color: '#fff' }}>Φ(B)(1−B)ᵈXₜ</span><br />
              <span style={{ color: '#00d4ff' }}>= Θ(B)εₜ</span><br />
              <span style={{ color: '#ffd700' }}>Train → Fit → Predict</span>
            </div>
            <div className="formula-bar" style={S.formulaBox('.6s')}>
              <span style={S.fLabel}>Error Metrics</span>
              <span style={{ color: '#ffd700' }}>RMSE = √(Σ(ŷ−y)²/n)</span><br />
              <span style={{ color: '#00d4ff' }}>MAE  = Σ|ŷ−y|/n</span><br />
              <span style={{ color: '#ff6b35' }}>MAPE = Σ|err/y|/n</span>
            </div>
            <div className="formula-bar" style={S.formulaBox('.8s')}>
              <span style={S.fLabel}>GARCH(1,1)</span>
              <span style={{ color: '#00d4ff' }}>σ²ₜ = ω + α·ε²ₜ₋₁</span><br />
              <span style={{ color: '#ff6b35' }}>    + β·σ²ₜ₋₁</span>
            </div>
            <div style={S.tickerStrip}>
              <div style={S.tickRow}>
                <span style={{ color: 'rgba(255,255,255,.8)' }}>NIFTY</span>
                <span style={{ color: '#00ffb4' }}>22,147</span>
                <span style={{ color: '#00ffb4' }}>▲ 1.2%</span>
              </div>
              <div style={S.tickRow}>
                <span style={{ color: 'rgba(255,255,255,.8)' }}>BANKNIFTY</span>
                <span style={{ color: '#00ffb4' }}>47,830</span>
                <span style={{ color: '#ff4466' }}>▼ 0.4%</span>
              </div>
              <div style={S.tickRow}>
                <span style={{ color: 'rgba(255,255,255,.8)' }}>SENSEX</span>
                <span style={{ color: '#00ffb4' }}>73,209</span>
                <span style={{ color: '#00ffb4' }}>▲ 0.8%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

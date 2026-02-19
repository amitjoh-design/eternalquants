"use client";

import Link from "next/link";

import { useEffect, useRef } from "react";

export default function Hero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<SVGSVGElement>(null);

    // --------------------------------------------------------------------------
    // 1) PARTICLE BACKGROUND EFFECT
    // --------------------------------------------------------------------------
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let nodes: any[] = [];
        const NODES_COUNT = 70;

        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        // Initialize nodes
        nodes = Array.from({ length: NODES_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.5 + 0.5,
        }));

        const drawBg = () => {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < NODES_COUNT; i++) {
                for (let j = i + 1; j < NODES_COUNT; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
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
            }

            // Draw nodes and update positions
            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0,255,180,0.5)";
                ctx.fill();

                n.x += n.vx;
                n.y += n.vy;

                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            });

            animationFrameId = requestAnimationFrame(drawBg);
        };

        drawBg();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // --------------------------------------------------------------------------
    // 2) CHART ANIMATION EFFECT
    // --------------------------------------------------------------------------
    useEffect(() => {
        const svg = chartRef.current;
        if (!svg) return;

        // --- Helper Functions ---
        const ns = (tag: string, a: Record<string, string> = {}) => {
            const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
            Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
            return e;
        };

        const W = 600;
        const H = 460;
        const PAD = { t: 32, r: 22, b: 50, l: 56 };
        const CW = W - PAD.l - PAD.r;
        const CH = H - PAD.t - PAD.b;
        const TRAIN_END = 60;
        const TEST_END = 90;
        const FUTURE_N = 20;
        const TOTAL_X = 110;

        // --- Data Generation ---
        function genSeries(n: number, start: number, vol: number, drift: number) {
            const d = [start];
            for (let i = 1; i < n; i++)
                d.push(
                    Math.max(d[i - 1] + (Math.random() - 0.48) * vol + drift, start * 0.5)
                );
            return d;
        }
        const realSeries = genSeries(90, 200, 7, 0.15);

        // Predicted: close to actual with ARIMA-like smooth lag
        const predictedTest = realSeries.slice(TRAIN_END).map((v, i) => {
            const noise = (Math.random() - 0.5) * 8;
            const lag =
                i < 1
                    ? 0
                    : (realSeries[TRAIN_END + i] - realSeries[TRAIN_END + i - 1]) * 0.3;
            return v + noise - lag * 0.5;
        });

        const lastReal = realSeries[89];
        const futureForecast: number[] = [];
        let fv = lastReal;
        for (let i = 0; i < FUTURE_N; i++) {
            fv += 0.5 + (Math.random() - 0.46) * 6;
            futureForecast.push(fv);
        }

        // Confidence bands
        const testConf = predictedTest.map((v, i) => ({
            upper: v + 7 + i * 0.3,
            lower: v - 7 - i * 0.3,
        }));
        const futureConf = futureForecast.map((v, i) => ({
            upper: v + 9 + i * 0.55,
            lower: v - 9 - i * 0.55,
        }));

        const allV = [
            ...realSeries,
            ...predictedTest,
            ...futureForecast,
            ...testConf.map((c) => c.upper),
            ...futureConf.map((c) => c.upper),
        ];
        const mn = Math.min(...allV) - 14;
        const mx = Math.max(...allV) + 14;

        const sx = (i: number) => PAD.l + (i / (TOTAL_X - 1)) * CW;
        const sy = (v: number) => PAD.t + (1 - (v - mn) / (mx - mn)) * CH;

        // --- Build SVG Structure ---
        svg!.innerHTML = ""; // Clear previous render

        // Defs
        const defs = ns("defs");
        const clip = ns("clipPath", { id: "cc" });
        clip.appendChild(ns("rect", { x: String(PAD.l), y: String(PAD.t), width: String(CW), height: String(CH) }));
        defs.appendChild(clip);

        function mkGrad(id: string, col: string, o1: string, o2: string) {
            const g = ns("linearGradient", {
                id,
                x1: "0",
                y1: "0",
                x2: "0",
                y2: "1",
            });
            g.appendChild(
                ns("stop", { offset: "0%", "stop-color": col, "stop-opacity": o1 })
            );
            g.appendChild(
                ns("stop", { offset: "100%", "stop-color": col, "stop-opacity": o2 })
            );
            defs.appendChild(g);
        }
        mkGrad("gTrain", "#00ffb4", ".2", "0");
        mkGrad("gPred", "#ffd700", ".18", "0");
        mkGrad("gFore", "#ff6b35", ".2", "0");
        svg!.appendChild(defs);

        // Zone backgrounds
        function zoneRect(x1: number, x2: number, col: string) {
            svg!.appendChild(
                ns("rect", {
                    x: String(sx(x1)),
                    y: String(PAD.t),
                    width: String(sx(x2) - sx(x1)),
                    height: String(CH),
                    fill: col,
                    "clip-path": "url(#cc)",
                })
            );
        }
        zoneRect(0, TRAIN_END - 1, "rgba(0,255,180,.025)");
        zoneRect(TRAIN_END, TEST_END - 1, "rgba(255,215,0,.018)");
        zoneRect(TEST_END, TOTAL_X - 1, "rgba(255,107,53,.022)");

        // Grid
        for (let i = 0; i <= 5; i++) {
            const y = PAD.t + (i / 5) * CH;
            svg!.appendChild(
                ns("line", {
                    x1: String(PAD.l),
                    y1: String(y),
                    x2: String(PAD.l + CW),
                    y2: String(y),
                    stroke: "rgba(0,255,180,.09)",
                    "stroke-width": "1",
                })
            );
            const lbl = ns("text", {
                x: String(PAD.l - 7),
                y: String(y + 4),
                "text-anchor": "end",
                fill: "rgba(255,255,255,.3)",
                "font-size": "10",
                "font-family": "var(--font-share-tech-mono)",
            });
            lbl.textContent = String(Math.round(mx - (i / 5) * (mx - mn)));
            svg!.appendChild(lbl);
        }
        for (let i = 0; i <= 5; i++)
            svg!.appendChild(
                ns("line", {
                    x1: String(PAD.l + (i / 5) * CW),
                    y1: String(PAD.t),
                    x2: String(PAD.l + (i / 5) * CW),
                    y2: String(PAD.t + CH),
                    stroke: "rgba(0,255,180,.05)",
                    "stroke-width": "1",
                })
            );

        // Axis labels
        const xlbl = ns("text", {
            x: String(PAD.l + CW / 2),
            y: String(H - 8),
            "text-anchor": "middle",
            fill: "rgba(255,255,255,.25)",
            "font-size": "10",
            "font-family": "var(--font-share-tech-mono)",
        });
        xlbl.textContent = "TIME (SESSIONS)";
        svg!.appendChild(xlbl);
        const ylbl = ns("text", {
            x: "13",
            y: String(PAD.t + CH / 2),
            "text-anchor": "middle",
            fill: "rgba(255,255,255,.25)",
            "font-size": "10",
            "font-family": "var(--font-share-tech-mono)",
            transform: `rotate(-90,13,${PAD.t + CH / 2})`,
        });
        ylbl.textContent = "PRICE";
        svg!.appendChild(ylbl);

        // Zone dividers
        function divLine(xi: number, col: string, label: string, side = "right") {
            const x = sx(xi);
            svg!.appendChild(
                ns("line", {
                    x1: String(x),
                    y1: String(PAD.t),
                    x2: String(x),
                    y2: String(PAD.t + CH),
                    stroke: col,
                    "stroke-width": "1.5",
                    "stroke-dasharray": "5 4",
                    "clip-path": "url(#cc)",
                })
            );
            const t = ns("text", {
                x: String(side === "right" ? x + 4 : x - 4),
                y: String(PAD.t + 24),
                "text-anchor": side === "right" ? "start" : "end",
                fill: col,
                "font-size": "9",
                "font-family": "var(--font-share-tech-mono)",
            });
            t.textContent = label;
            svg!.appendChild(t);
        }
        divLine(TRAIN_END, "rgba(200,220,255,.4)", "▶ TEST");
        divLine(TEST_END, "rgba(255,107,53,.6)", "▶ FORECAST");

        // Zone header labels
        function zoneLabel(x1i: number, x2i: number, txt: string, col: string) {
            const xm = (sx(x1i) + sx(x2i)) / 2;
            svg!.appendChild(
                ns("rect", {
                    x: String(xm - 30),
                    y: String(PAD.t + 5),
                    width: "60",
                    height: "15",
                    rx: "2",
                    fill: col,
                    "fill-opacity": ".1",
                })
            );
            const t = ns("text", {
                x: String(xm),
                y: String(PAD.t + 15),
                "text-anchor": "middle",
                fill: col,
                "font-size": "9",
                "font-family": "var(--font-share-tech-mono)",
                "letter-spacing": "1",
            });
            t.textContent = txt;
            svg!.appendChild(t);
        }
        zoneLabel(0, TRAIN_END - 1, "TRAIN", "#00ffb4");
        zoneLabel(TRAIN_END, TEST_END - 1, "TEST", "#c8dcff");
        zoneLabel(TEST_END, TOTAL_X - 1, "FORECAST", "#ff6b35");

        // Elements for animation
        const trainArea = ns("path", {
            "clip-path": "url(#cc)",
            fill: "url(#gTrain)",
            stroke: "none",
        });
        svg!.appendChild(trainArea);
        const predConfEl = ns("path", {
            "clip-path": "url(#cc)",
            fill: "rgba(255,215,0,.08)",
            stroke: "none",
        });
        svg!.appendChild(predConfEl);
        const foreConfEl = ns("path", {
            "clip-path": "url(#cc)",
            fill: "rgba(255,107,53,.09)",
            stroke: "none",
        });
        svg!.appendChild(foreConfEl);
        const predAreaEl = ns("path", {
            "clip-path": "url(#cc)",
            fill: "url(#gPred)",
            stroke: "none",
        });
        svg!.appendChild(predAreaEl);
        const foreAreaEl = ns("path", {
            "clip-path": "url(#cc)",
            fill: "url(#gFore)",
            stroke: "none",
        });
        svg!.appendChild(foreAreaEl);

        const trainLine = ns("path", {
            "clip-path": "url(#cc)",
            fill: "none",
            stroke: "#00ffb4",
            "stroke-width": "2.3",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
        });
        svg!.appendChild(trainLine);
        const testActLine = ns("path", {
            "clip-path": "url(#cc)",
            fill: "none",
            stroke: "rgba(200,220,255,.9)",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
        });
        svg!.appendChild(testActLine);
        const predLineEl = ns("path", {
            "clip-path": "url(#cc)",
            fill: "none",
            stroke: "#ffd700",
            "stroke-width": "2.2",
            "stroke-linecap": "round",
        });
        svg!.appendChild(predLineEl);
        const foreLineEl = ns("path", {
            "clip-path": "url(#cc)",
            fill: "none",
            stroke: "#ff6b35",
            "stroke-width": "2",
            "stroke-dasharray": "7 4",
            "stroke-linecap": "round",
        });
        svg!.appendChild(foreLineEl);
        const foreUpper = ns("path", {
            "clip-path": "url(#cc)",
            fill: "none",
            stroke: "rgba(255,107,53,.35)",
            "stroke-width": ".9",
            "stroke-dasharray": "3 4",
        });
        svg!.appendChild(foreUpper);
        const foreLower = ns("path", {
            "clip-path": "url(#cc)",
            fill: "none",
            stroke: "rgba(255,107,53,.35)",
            "stroke-width": ".9",
            "stroke-dasharray": "3 4",
        });
        svg!.appendChild(foreLower);

        // MA on train
        const ma10pts = realSeries
            .slice(0, TRAIN_END)
            .map((_, i, a) => {
                if (i < 9) return null;
                return {
                    i,
                    v: a.slice(i - 9, i + 1).reduce((s, x) => s + x, 0) / 10,
                };
            })
            .filter(Boolean) as { i: number; v: number }[];

        const maEl = ns("path", {
            "clip-path": "url(#cc)",
            fill: "none",
            stroke: "rgba(0,212,255,.55)",
            "stroke-width": "1.2",
            d: ma10pts
                .map(({ i, v }, k) => `${k === 0 ? "M" : "L"}${sx(i)},${sy(v)}`)
                .join(" "),
        });
        svg!.appendChild(maEl);

        // Live dot & ring
        const liveDot = ns("circle", {
            r: "5",
            fill: "#ff6b35",
            stroke: "#000",
            "stroke-width": "1.5",
            filter: "drop-shadow(0 0 5px #ff6b35)",
        });
        svg!.appendChild(liveDot);
        const liveRing = ns("circle", {
            r: "5",
            fill: "none",
            stroke: "#ff6b35",
            "stroke-width": "1.2",
        });
        svg!.appendChild(liveRing);

        // Helper build functions
        function buildPath(data: number[], offset: number) {
            return data
                .map((v, i) => `${i === 0 ? "M" : "L"}${sx(offset + i)},${sy(v)}`)
                .join(" ");
        }
        function buildArea(data: number[], offset: number) {
            if (data.length < 2) return "";
            const p = buildPath(data, offset);
            return (
                p +
                `L${sx(offset + data.length - 1)},${PAD.t + CH} L${sx(offset)},${PAD.t + CH
                }Z`
            );
        }
        function buildBand(conf: { upper: number; lower: number }[], offset: number) {
            if (conf.length < 2) return "";
            const up = conf
                .map(
                    ({ upper }, i) =>
                        `${i === 0 ? "M" : "L"}${sx(offset + i)},${sy(upper)}`
                )
                .join(" ");
            const lo = conf
                .map(
                    ({ lower }, i, a) =>
                        `L${sx(offset + a.length - 1 - i)},${sy(
                            conf[a.length - 1 - i].lower
                        )}`
                )
                .join(" ");
            return up + lo + "Z";
        }
        function moveDot(xi: number, yi: number) {
            liveDot.setAttribute("cx", String(xi));
            liveDot.setAttribute("cy", String(yi));
            liveRing.setAttribute("cx", String(xi));
            liveRing.setAttribute("cy", String(yi));
        }

        // --- Animation Loop ---
        let prog = 0;
        const FRAMES = 200;
        let animFrame: number;

        function tick() {
            prog = Math.min(prog + 1, FRAMES);
            const t = prog / FRAMES;

            // Phase 1: TRAIN
            const tT = Math.min(t / 0.38, 1);
            const tEnd = Math.max(1, Math.round(tT * TRAIN_END));
            trainLine.setAttribute("d", buildPath(realSeries.slice(0, tEnd), 0));
            trainArea.setAttribute("d", buildArea(realSeries.slice(0, tEnd), 0));
            moveDot(sx(tEnd - 1), sy(realSeries[tEnd - 1]));

            // Phase 2: TEST
            if (t > 0.38) {
                const p2T = Math.min((t - 0.38) / 0.37, 1);
                const teEnd = Math.max(1, Math.round(p2T * (TEST_END - TRAIN_END)));
                testActLine.setAttribute(
                    "d",
                    buildPath(realSeries.slice(TRAIN_END, TRAIN_END + teEnd), TRAIN_END)
                );
                predLineEl.setAttribute(
                    "d",
                    buildPath(predictedTest.slice(0, teEnd), TRAIN_END)
                );
                predAreaEl.setAttribute(
                    "d",
                    buildArea(predictedTest.slice(0, teEnd), TRAIN_END)
                );
                predConfEl.setAttribute(
                    "d",
                    buildBand(testConf.slice(0, teEnd), TRAIN_END)
                );
                moveDot(
                    sx(TRAIN_END + teEnd - 1),
                    sy(realSeries[TRAIN_END + teEnd - 1])
                );
            }

            // Phase 3: FUTURE
            if (t > 0.75) {
                const p3T = Math.min((t - 0.75) / 0.25, 1);
                const feEnd = Math.max(1, Math.round(p3T * FUTURE_N));
                const fData = futureForecast.slice(0, feEnd);
                const fc = futureConf.slice(0, feEnd);
                foreLineEl.setAttribute("d", buildPath(fData, TEST_END));
                foreAreaEl.setAttribute("d", buildArea(fData, TEST_END));
                foreConfEl.setAttribute("d", buildBand(fc, TEST_END));
                if (fc.length > 0) {
                    foreUpper.setAttribute(
                        "d",
                        fc
                            .map(
                                ({ upper }, i) =>
                                    `${i === 0 ? "M" : "L"}${sx(TEST_END + i)},${sy(upper)}`
                            )
                            .join(" ")
                    );
                    foreLower.setAttribute(
                        "d",
                        fc
                            .map(
                                ({ lower }, i) =>
                                    `${i === 0 ? "M" : "L"}${sx(TEST_END + i)},${sy(lower)}`
                            )
                            .join(" ")
                    );
                }
                moveDot(sx(TEST_END + feEnd - 1), sy(fData[feEnd - 1]));
            }

            if (prog < FRAMES) {
                animFrame = requestAnimationFrame(tick);
            }
        }
        tick();

        // Pulse ring animation
        let rR = 5,
            rO = 1;
        let pulseFrame: number;
        function pulseRingFn() {
            rR += 0.35;
            rO -= 0.022;
            if (rO <= 0) {
                rR = 5;
                rO = 1;
            }
            liveRing.setAttribute("r", String(rR));
            liveRing.setAttribute("opacity", String(rO));
            pulseFrame = requestAnimationFrame(pulseRingFn);
        }
        pulseRingFn();

        return () => {
            cancelAnimationFrame(animFrame);
            cancelAnimationFrame(pulseFrame);
        };
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-white font-[family-name:var(--font-rajdhani)]">
            <style jsx global>{`
        @keyframes gridShift {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes pillBlink {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes sweep {
          0%, 100% { left: -100%; }
          50% { left: 100%; }
        }
        @keyframes hscan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

            {/* Background Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,255,180,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,180,.04) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                    animation: 'gridShift 20s linear infinite'
                }}
            />

            {/* Scanline */}
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.06) 2px, rgba(0,0,0,.06) 4px)'
                }}
            />

            {/* Horizontal Scan */}
            <div
                className="absolute w-full h-[2px] z-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg,transparent,rgba(0,255,180,.35),transparent)',
                    animation: 'hscan 8s ease-in-out infinite'
                }}
            />

            {/* Orbs */}
            <div className="absolute rounded-full blur-[80px] z-0 w-[400px] h-[400px] bg-[rgba(0,255,180,.06)] -top-[100px] -left-[100px]" />
            <div className="absolute rounded-full blur-[80px] z-0 w-[300px] h-[300px] bg-[rgba(0,212,255,.05)] top-1/2 -right-[50px] -translate-y-1/2" />
            <div className="absolute rounded-full blur-[80px] z-0 w-[250px] h-[250px] bg-[rgba(255,107,53,.04)] -bottom-[80px] left-[40%]" />

            {/* Brackets */}
            <div className="absolute w-[60px] h-[60px] z-20 top-5 left-5 border-t-2 border-l-2 border-[#00ffb4]" />
            <div className="absolute w-[60px] h-[60px] z-20 top-5 right-5 border-t-2 border-r-2 border-[#00ffb4]" />
            <div className="absolute w-[60px] h-[60px] z-20 bottom-5 left-5 border-b-2 border-l-2 border-[#00ffb4]" />
            <div className="absolute w-[60px] h-[60px] z-20 bottom-5 right-5 border-b-2 border-r-2 border-[#00ffb4]" />

            {/* Main Scene */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full h-full px-8 lg:px-20 py-10">

                {/* LEFT: Chart */}
                <div className="relative w-full lg:w-[600px] h-[460px] shrink-0 mb-10 lg:mb-0 hidden md:block">
                    <div className="absolute -top-7 left-12 flex gap-3 z-10">
                        <Legend color="#00ffb4" bg="rgba(0,255,180,.07)" border="rgba(0,255,180,.2)" label="TRAIN" />
                        <Legend color="#c8dcff" bg="rgba(200,220,255,.06)" border="rgba(200,220,255,.15)" label="TEST ACTUAL" />
                        <Legend color="#ffd700" bg="rgba(255,215,0,.07)" border="rgba(255,215,0,.25)" label="PREDICTED" />
                        <Legend color="#ff6b35" bg="rgba(255,107,53,.07)" border="rgba(255,107,53,.25)" label="FUTURE FORECAST" />
                    </div>

                    <div
                        className="absolute -top-1.5 -right-2.5 px-3 py-1 bg-[rgba(0,10,5,.75)] border border-[rgba(0,255,180,.25)] rounded-[2px] text-[#ffd700] text-[10px] font-mono z-10 backdrop-blur-sm shadow-[0_0_10px_rgba(255,215,0,0.1)]"
                        style={{ animation: 'pillBlink 3s ease-in-out infinite', borderColor: 'rgba(255,215,0,.3)' }}
                    >
                        RMSE: 3.42 · MAE: 2.18 · R²: 0.94
                    </div>
                    <div
                        className="absolute bottom-16 -left-3.5 px-3 py-1 bg-[rgba(0,10,5,.75)] border border-[rgba(0,255,180,.25)] rounded-[2px] text-[#ff6b35] text-[10px] font-mono z-10 backdrop-blur-sm shadow-[0_0_10px_rgba(255,107,53,0.1)]"
                        style={{ animation: 'pillBlink 3s ease-in-out infinite 1.2s', borderColor: 'rgba(255,107,53,.3)' }}
                    >
                        ARIMA(2,1,2) · AIC: 1842.3
                    </div>
                    <div
                        className="absolute -bottom-3 right-5 px-3 py-1 bg-[rgba(0,10,5,.75)] border border-[rgba(0,255,180,.25)] rounded-[2px] text-[#00ffb4] text-[10px] font-mono z-10 backdrop-blur-sm"
                        style={{ animation: 'pillBlink 3s ease-in-out infinite 2.1s' }}
                    >
                        95% CI · HORIZON: +20 SESSIONS
                    </div>

                    <svg ref={chartRef} viewBox="0 0 600 460" className="w-full h-full overflow-visible" />
                </div>

                {/* CENTER: Text */}
                <div className="flex-1 flex flex-col items-center text-center px-7 z-10">
                    <div className="font-[family-name:var(--font-share-tech-mono)] text-[#00ffb4] text-[11px] tracking-[6px] uppercase mb-4 opacity-80 animate-[fadeUp_1s_ease_0.2s_both]">
            // Capital Markets · Algo Edition
                    </div>
                    <h1 className="font-[family-name:var(--font-orbitron)] font-black text-4xl lg:text-[39px] leading-[1.1] tracking-tighter animate-[fadeUp_1s_ease_0.4s_both]">
                        <span className="text-white">Learn</span><br />
                        <span className="text-[#00ffb4] drop-shadow-[0_0_30px_rgba(0,255,180,.7)]">Quantitative</span><br />
                        <span className="text-white">Analysis</span><br />
                        <span className="text-[rgba(255,255,255,.35)] text-[27px]">of</span>&nbsp;
                        <span className="text-[#ff6b35] drop-shadow-[0_0_25px_rgba(255,107,53,.6)]">Time</span>&nbsp;
                        <span className="text-white">Series</span>
                    </h1>
                    <div className="mt-3.5 text-sm text-[rgba(255,255,255,.4)] tracking-[2px] font-light animate-[fadeUp_1s_ease_0.6s_both]">
                        ARIMA · GARCH · Fourier · ML Hybrids
                    </div>

                    <div className="flex items-center mt-7 animate-[fadeUp_1s_ease_0.75s_both]">
                        <PipelineStep label="TRAIN DATA" type="train" />
                        <span className="mx-1 text-[rgba(255,255,255,.3)] font-mono text-base">›</span>
                        <PipelineStep label="TEST ACTUAL" type="test" />
                        <span className="mx-1 text-[rgba(255,255,255,.3)] font-mono text-base">›</span>
                        <PipelineStep label="MODEL PREDICT" type="pred" />
                        <span className="mx-1 text-[rgba(255,255,255,.3)] font-mono text-base">›</span>
                        <PipelineStep label="FUTURE FORECAST" type="fore" />
                    </div>

                    <div className="flex gap-2.5 mt-6 animate-[fadeUp_1s_ease_0.9s_both]">
                        <Badge label="NIFTY 50" delay="0s" />
                        <Badge label="FUTURES" delay="1s" />
                        <Badge label="OPTIONS" delay="2s" />
                    </div>

                    <Link href="/auth/login">
                        <button className="mt-7 px-11 py-3 bg-gradient-to-br from-[#00ffb4] to-[#00d4ff] text-black font-[family-name:var(--font-orbitron)] font-bold text-xs tracking-[3px] uppercase border-none cursor-pointer clip-path-cta animate-[fadeUp_1s_ease_1.1s_both] hover:scale-105 transition-transform" style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                            Start Learning →
                        </button>
                    </Link>
                </div>

                {/* RIGHT: Formulas */}
                <div className="w-[245px] shrink-0 flex flex-col gap-3 hidden xl:flex">
                    <FormulaBox label="ARIMA Model" delay="0.5s">
                        <span className="text-white">Φ(B)(1−B)ᵈXₜ</span><br />
                        <span className="text-[#00d4ff]">= Θ(B)εₜ</span><br />
                        <span className="text-[#ffd700]">Train → Fit → Predict</span>
                    </FormulaBox>

                    <FormulaBox label="Error Metrics" delay="0.6s">
                        <span className="text-[#ffd700]">RMSE = √(Σ(ŷ−y)²/n)</span><br />
                        <span className="text-[#00d4ff]">MAE  = Σ|ŷ−y|/n</span><br />
                        <span className="text-[#ff6b35]">MAPE = Σ|err/y|/n</span>
                    </FormulaBox>

                    <FormulaBox label="GARCH(1,1)" delay="0.8s">
                        <span className="text-[#00d4ff]">σ²ₜ = ω + α·ε²ₜ₋₁</span><br />
                        <span className="text-[#ff6b35]">    + β·σ²ₜ₋₁</span>
                    </FormulaBox>

                    <div className="flex flex-col gap-1.5 animate-[fadeLeft_1s_ease_0.7s_both]">
                        <TickerRow sym="NIFTY" val="22,147" chg="▲ 1.2%" up />
                        <TickerRow sym="BANKNIFTY" val="47,830" chg="▼ 0.4%" />
                        <TickerRow sym="SENSEX" val="73,209" chg="▲ 0.8%" up />
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- Subcomponents ---

function Legend({ color, bg, border, label }: { color: string; bg: string; border: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5 font-[family-name:var(--font-share-tech-mono)] text-[10px] tracking-wider px-2.5 py-1 rounded-[2px] backdrop-blur-[4px]" style={{ color, background: bg, border: `1px solid ${border}` }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color.replace('rgba', 'rgb').replace(/[^,]+(?=\))/, '1').replace('0.07', '1') }}></div>
            {label}
        </div>
    );
}

function PipelineStep({ label, type }: { label: string; type: 'train' | 'test' | 'pred' | 'fore' }) {
    const styles = {
        train: { color: '#00ffb4', borderColor: 'rgba(0,255,180,.4)', background: 'rgba(0,255,180,.06)' },
        test: { color: '#c8dcff', borderColor: 'rgba(200,220,255,.2)', background: 'rgba(200,220,255,.04)' },
        pred: { color: '#ffd700', borderColor: 'rgba(255,215,0,.35)', background: 'rgba(255,215,0,.06)' },
        fore: { color: '#ff6b35', borderColor: 'rgba(255,107,53,.4)', background: 'rgba(255,107,53,.06)' }
    };
    const s = styles[type];
    return (
        <div className="px-3 py-2 font-[family-name:var(--font-share-tech-mono)] text-[9px] tracking-[1.5px] text-center border leading-relaxed rounded-[2px]" style={s}>
            {label.split(' ').map((l, i) => <div key={i}>{l}</div>)}
        </div>
    );
}

function Badge({ label, delay }: { label: string, delay: string }) {
    return (
        <div className="relative px-3.5 py-1.5 border border-[rgba(0,255,180,.25)] text-[rgba(0,255,180,.7)] font-[family-name:var(--font-share-tech-mono)] text-[10px] tracking-[2px] bg-[rgba(0,255,180,.04)] overflow-hidden">
            {label}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-[rgba(0,255,180,.1)] to-transparent animate-[sweep_3s_ease-in-out_infinite]" style={{ animationDelay: delay }} />
        </div>
    );
}

function FormulaBox({ label, delay, children }: { label: string; delay: string; children: React.ReactNode }) {
    return (
        <div className="relative bg-[rgba(0,10,5,.65)] border border-[rgba(0,255,180,.15)] px-3.5 py-3 font-[family-name:var(--font-share-tech-mono)] text-[11px] leading-[1.9] backdrop-blur-md overflow-hidden animate-[fadeLeft_1s_ease_0.5s_both]" style={{ animationDelay: delay }}>
            <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#00ffb4] via-[#00d4ff] to-[#ff6b35]" />
            <div className="text-[9px] tracking-[3px] text-[rgba(255,255,255,.3)] uppercase mb-1">{label}</div>
            {children}
        </div>
    );
}

function TickerRow({ sym, val, chg, up }: { sym: string; val: string; chg: string; up?: boolean }) {
    return (
        <div className="flex justify-between items-center px-2.5 py-1.5 bg-[rgba(0,10,5,.5)] border border-[rgba(255,255,255,.06)] font-[family-name:var(--font-share-tech-mono)] text-[10px]">
            <span className="text-[rgba(255,255,255,.8)]">{sym}</span>
            <span className="text-[#00ffb4]">{val}</span>
            <span className={up ? "text-[#00ffb4]" : "text-[#ff4466]"}>{chg}</span>
        </div>
    );
}

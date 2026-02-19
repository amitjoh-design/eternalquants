"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, Model, Category } from "../data/dashboard-data";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface DashboardProps {
    user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>("classical"); // Default expanded
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // --- Logout Handler ---
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Refresh to trigger auth check in page.tsx
    };

    // --- Search Logic ---
    const filteredCategories = CATEGORIES.map(cat => ({
        ...cat,
        models: cat.models.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.models.length > 0);

    // --- Canvas Animation ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const PNODES = 55;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const initParticles = () => {
            particles = Array.from({ length: PNODES }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                r: Math.random() * 1.2 + 0.3
            }));
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Updated color styles to match theme variables
            const strokeStyle = (opacity: number) => `rgba(0, 255, 140, ${opacity})`;
            const fillStyle = 'rgba(0, 255, 140, 0.35)';

            for (let i = 0; i < PNODES; i++) {
                for (let j = i + 1; j < PNODES; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = strokeStyle(0.15 * (1 - d / 130));
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            particles.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = fillStyle;
                ctx.fill();

                n.x += n.vx;
                n.y += n.vy;

                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resize();
        initParticles();
        animate();

        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // --- Render Helpers ---
    const complexityBar = (val: number, color: string) => {
        return (
            <div className="flex items-center gap-3 mt-1.5">
                <div className="w-[90px] font-mono text-[10px] text-white/35 tracking-widest uppercase">
                    {/* Width handled by parent mapping */}
                </div>
                <div className="flex-1 h-[5px] bg-white/5 rounded-sm overflow-hidden">
                    <div
                        className="h-full rounded-sm transition-[width] duration-700 ease-out"
                        style={{ width: `${val * 20}%`, background: `linear-gradient(90deg, #00ff8c, #00e5ff)` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-screen bg-[#030a06] text-[#e8f4ed] font-rajdhani overflow-hidden selection:bg-[#00ff8c]/30">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
                
                .font-orbitron { font-family: 'Orbitron', monospace; }
                .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
                .font-share { font-family: 'Share Tech Mono', monospace; }
                
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,255,140,0.2); border-radius: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(0,255,140,0.4); }
            `}</style>

            {/* Background Canvas */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* Scanlines Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)]" />

            <div className="relative z-10 flex flex-col h-full w-full">
                {/* --- TOPBAR --- */}
                <header className="h-[58px] flex items-center justify-between px-7 bg-[#030a06]/90 border-b border-[#00ff8c]/20 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#00ff8c] to-[#00e5ff] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] animate-[spin_6s_ease-in-out_infinite] shadow-[0_0_6px_#00ff8c]"></div>
                        <div className="font-orbitron text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ff8c] to-[#00e5ff]">
                            ETERNAL<span className="opacity-50 font-normal">QUANTS</span>
                        </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 font-share text-[11px] tracking-[4px] text-[#00ff8c]/45 uppercase hidden md:block">
                        // Quantitative Research Terminal
                    </div>
                    <div className="flex items-center gap-5">
                        {['MODELS', 'BACKTESTER', 'REPORTS', 'SIGNALS'].map(item => (
                            <div key={item}
                                className={`font-share text-[10px] tracking-[2px] cursor-pointer transition-colors px-3 py-1.5 rounded-sm border border-transparent hover:text-[#00ff8c] hover:border-[#00ff8c]/20 hover:bg-[#00ff8c]/5 ${item === 'MODELS' ? 'text-[#00ff8c] border-[#00ff8c]/20 bg-[#00ff8c]/5' : 'text-[#e8f4ed]/35'}`}
                            >
                                {item}
                            </div>
                        ))}
                        <div className="flex items-center gap-2 px-3.5 py-1 bg-[#00ff8c]/5 border border-[#00ff8c]/20 rounded-sm cursor-pointer ml-2 hover:bg-[#00ff8c]/10" onClick={handleLogout}>
                            <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#00ff8c] to-[#00e5ff] flex items-center justify-center font-share text-[10px] text-black font-bold">
                                {user?.email?.[0].toUpperCase() || "U"}
                            </div>
                            <span className="font-share text-[10px] text-[#00ff8c] tracking-widest">{user?.user_metadata?.full_name?.toUpperCase() || (user?.email?.split('@')[0].toUpperCase()) || "USER"}</span>
                        </div>
                    </div>
                </header>

                {/* --- HEADER --- */}
                <div className="p-7 pb-4 text-center relative shrink-0">
                    <div className="absolute bottom-0 left-[10%] w-[80%] h-px bg-gradient-to-r from-transparent via-[#00ff8c]/20 to-transparent" />
                    <div className="font-share text-[10px] tracking-[6px] text-[#00ff8c]/50 uppercase mb-2.5">
                        // Welcome Back, {user?.user_metadata?.full_name || "Quant"} · Session Active
                    </div>
                    <div className="font-orbitron text-4xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#00ff8c] via-[#00e5ff] to-[#e8f4ed] [filter:drop-shadow(0_0_8px_rgba(0,255,140,0.2))]">
                        EternalQuants
                    </div>
                    <div className="mt-1.5 text-[13px] text-[#e8f4ed]/35 tracking-[3px] font-light font-share">
                        Select a quantitative model to explore its architecture, parameters & properties
                    </div>
                </div>

                {/* --- MAIN BODY --- */}
                <div className="flex-1 flex overflow-hidden p-5 pt-4 gap-4">

                    {/* LEFT PANEL */}
                    <div className="w-[360px] shrink-0 flex flex-col bg-[#060f09]/70 border border-[#00ff8c]/12 rounded-sm backdrop-blur-sm overflow-hidden">
                        <div className="p-3 px-4 border-b border-[#00ff8c]/12 flex items-center justify-between shrink-0">
                            <div className="font-share text-[10px] tracking-[4px] text-[#00ff8c]/60 uppercase">Model Library</div>
                            <div className="font-share text-[10px] text-[#e8f4ed]/35 tracking-[2px]">
                                {CATEGORIES.reduce((acc, cat) => acc + cat.models.length, 0)} MODELS
                            </div>
                        </div>
                        <div className="p-2.5 px-3.5 border-b border-[#00ff8c]/12 shrink-0">
                            <input
                                type="text"
                                placeholder="Search models..."
                                className="w-full bg-[#00ff8c]/5 border border-[#00ff8c]/12 rounded-[2px] p-1.5 px-3 text-[#e8f4ed] font-share text-[11px] tracking-wide outline-none focus:border-[#00ff8c]/20 focus:bg-[#00ff8c]/10 placeholder:text-[#e8f4ed]/35"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
                            {filteredCategories.map(cat => (
                                <div key={cat.id} className="mb-0.5">
                                    <div
                                        className={`px-4 py-2 flex items-center gap-2.5 cursor-pointer select-none hover:bg-[#00ff8c]/5 transition-colors ${expandedCategory === cat.id ? 'bg-[#00ff8c]/5' : ''}`}
                                        onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                    >
                                        <div
                                            className="w-5 h-5 rounded-[2px] flex items-center justify-center text-[11px] shrink-0"
                                            style={{ backgroundColor: `${cat.models[0].bg}`, color: cat.models[0].color }}
                                        >
                                            {cat.icon}
                                        </div>
                                        <div className="font-share text-[10px] tracking-[2px] uppercase flex-1" style={{ color: cat.models[0].color }}>
                                            {cat.label}
                                        </div>
                                        <div className="font-share text-[9px] tracking-wide px-1.5 py-0.5 rounded-lg border"
                                            style={{
                                                backgroundColor: cat.models[0].bg,
                                                color: cat.models[0].color,
                                                borderColor: `${cat.models[0].color}33`
                                            }}
                                        >
                                            {cat.short}
                                        </div>
                                        <div className={`text-[9px] text-[#e8f4ed]/35 transition-transform ${expandedCategory === cat.id ? 'rotate-90' : ''}`}>▶</div>
                                    </div>

                                    <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expandedCategory === cat.id || searchQuery ? 'max-h-[800px]' : 'max-h-0'}`}>
                                        {cat.models.map(model => (
                                            <div
                                                key={model.id}
                                                className={`pl-11 pr-4 py-2 flex items-center gap-2.5 cursor-pointer transition-all border-l-2
                                                    ${selectedModel?.id === model.id ? 'bg-[#00ff8c]/10 border-l-[#00ff8c]' : 'border-l-transparent hover:bg-[#00ff8c]/5 hover:border-l-[#00ff8c]/30'}
                                                `}
                                                onClick={() => setSelectedModel(model)}
                                            >
                                                <div className={`font-rajdhani text-[13px] font-medium flex-1 transition-colors ${selectedModel?.id === model.id ? 'text-[#00ff8c]' : 'text-[#e8f4ed] group-hover:text-[#00ff8c]'}`}>
                                                    {model.name}
                                                </div>
                                                <div className={`font-share text-[8px] tracking-wide px-1.5 py-0.5 rounded-[1px] shrink-0 ${selectedModel?.id === model.id ? 'bg-[#00ff8c]/10 text-[#00ff8c]/60' : 'bg-white/5 text-[#e8f4ed]/35'}`}>
                                                    {model.tag}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL - DETAIL VIEW */}
                    <div className="flex-1 flex flex-col bg-[#060f09]/70 border border-[#00ff8c]/12 rounded-sm backdrop-blur-sm overflow-hidden min-w-0">
                        {!selectedModel ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-40">
                                <div className="text-5xl opacity-30 animate-pulse">⟨/⟩</div>
                                <p className="font-share text-[11px] tracking-[4px] text-[#e8f4ed]/35 uppercase">Select a model to view details</p>
                                <p className="font-share text-[9px] -mt-2 opacity-60 tracking-[3px] text-[#00ff8c]/50">← BROWSE THE LIBRARY</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                                {/* Detail Topbar */}
                                <div className="p-3.5 px-6 border-b border-[#00ff8c]/12 flex items-center gap-3.5 shrink-0 bg-[#00ff8c]/5">
                                    <div
                                        className="w-[38px] h-[38px] rounded-[3px] flex items-center justify-center text-lg shrink-0"
                                        style={{ backgroundColor: selectedModel.bg, color: selectedModel.color }}
                                    >
                                        {/* Icon lookup from categories - simplifying here */}
                                        {CATEGORIES.find(c => c.models.includes(selectedModel))?.icon || '⚡'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-orbitron text-lg font-bold tracking-wide leading-none text-[#e8f4ed]">
                                            {selectedModel.name}
                                        </div>
                                        <div className="font-share text-[10px] text-[#e8f4ed]/50 tracking-[2px] mt-0.5 uppercase">
                                            {selectedModel.fullName}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {selectedModel.tags.map(tag => (
                                            <div key={tag} className="font-share text-[9px] tracking-[1.5px] px-2.5 py-0.5 rounded-[1px] border border-[#e8f4ed]/20 text-[#e8f4ed]/60 uppercase">
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Detail Body */}
                                <div className="flex-1 overflow-y-auto scrollbar-thin p-5 px-6 flex flex-col gap-5">

                                    {/* Overview Text */}
                                    <div className="text-[14px] leading-relaxed text-[#e8f4ed]/75 font-normal tracking-wide">
                                        {selectedModel.overview}
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-2.5">
                                        {Object.entries(selectedModel.metrics).map(([key, val]) => (
                                            <div key={key} className="bg-[#00ff8c]/5 border border-[#00ff8c]/12 rounded-[3px] p-3 text-center transition-colors hover:border-[#00ff8c]/30">
                                                <div className="font-orbitron text-lg font-bold leading-none text-[#e8f4ed]">{val}</div>
                                                <div className="font-share text-[9px] tracking-[2px] text-[#e8f4ed]/35 mt-1.5 uppercase">{key}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Complexity Analysis */}
                                        <div className="bg-black/25 border border-[#00ff8c]/12 rounded-[3px] p-4">
                                            <div className="font-share text-[9px] tracking-[4px] uppercase text-[#00ff8c]/50 mb-3 flex items-center gap-2">
                                                /// Complexity Analysis <div className="flex-1 h-px bg-[#00ff8c]/12" />
                                            </div>
                                            {Object.entries(selectedModel.complexity).map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-3 mt-1.5">
                                                    <div className="w-[90px] font-share text-[10px] text-[#e8f4ed]/35 tracking-widest uppercase text-right mr-2">
                                                        {key}
                                                    </div>
                                                    <div className="flex-1 h-[5px] bg-white/5 rounded-sm overflow-hidden">
                                                        <div
                                                            className="h-full rounded-sm transition-[width] duration-700 ease-out"
                                                            style={{ width: `${val * 20}%`, background: `linear-gradient(90deg, #00ff8c, #00e5ff)` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Use Cases */}
                                        <div className="bg-black/25 border border-[#00ff8c]/12 rounded-[3px] p-4">
                                            <div className="font-share text-[9px] tracking-[4px] uppercase text-[#00ff8c]/50 mb-3 flex items-center gap-2">
                                                /// Ideal Applications <div className="flex-1 h-px bg-[#00ff8c]/12" />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedModel.useFor.map((use, i) => (
                                                    <div key={i} className="px-3 py-1 border border-[#00ff8c]/12 font-share text-[10px] tracking-wide text-[#e8f4ed]/50 rounded-[2px] bg-white/5 hover:border-[#00ff8c]/30 hover:text-[#e8f4ed] transition-colors cursor-default">
                                                        {use}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parameters Table */}
                                    <div className="bg-black/25 border border-[#00ff8c]/12 rounded-[3px] p-4">
                                        <div className="font-share text-[9px] tracking-[4px] uppercase text-[#00ff8c]/50 mb-3 flex items-center gap-2">
                                            /// Key Parameters <div className="flex-1 h-px bg-[#00ff8c]/12" />
                                        </div>
                                        <table className="w-full border-collapse">
                                            <tbody>
                                                {selectedModel.params.map(([pName, pDesc], i) => (
                                                    <tr key={i} className="border-b border-[#00ff8c]/5 last:border-0 hover:bg-[#00ff8c]/5">
                                                        <td className="py-2 px-2 font-share text-[11px] text-[#00ff8c] w-[35%] align-top">{pName}</td>
                                                        <td className="py-2 px-2 font-share text-[11px] text-[#e8f4ed]/60 align-top">{pDesc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pros & Cons */}
                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="p-4 bg-black/25 border border-[#00ff8c]/12 rounded-[3px]">
                                            <h4 className="font-share text-[9px] tracking-[3px] uppercase text-[#00ff8c] mb-2.5">Advantages</h4>
                                            <ul className="flex flex-col gap-1.5">
                                                {selectedModel.pros.map((pro, i) => (
                                                    <li key={i} className="text-[12px] text-[#e8f4ed]/65 pl-4 relative leading-relaxed">
                                                        <span className="absolute left-0 text-[#00ff8c] text-[10px]">✓</span>
                                                        {pro}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-black/25 border border-[#00ff8c]/12 rounded-[3px]">
                                            <h4 className="font-share text-[9px] tracking-[3px] uppercase text-[#ff4d6d] mb-2.5">Limitations</h4>
                                            <ul className="flex flex-col gap-1.5">
                                                {selectedModel.cons.map((con, i) => (
                                                    <li key={i} className="text-[12px] text-[#e8f4ed]/65 pl-4 relative leading-relaxed">
                                                        <span className="absolute left-0 text-[#ff4d6d] text-[10px]">✗</span>
                                                        {con}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

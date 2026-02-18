import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 text-white">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80 z-0"></div>

            {/* Decorative Blobs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mb-6 drop-shadow-lg">
                    EternalQuants
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto font-light">
                    Master the art of quantitative finance with cutting-edge analytics and strategies.
                </p>

                <button
                    onClick={() => navigate('/learn')}
                    className="btn-primary group flex items-center gap-2 mx-auto"
                >
                    <span>Learn Quants</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>

            <footer className="absolute bottom-6 text-slate-500 text-sm">
                © {new Date().getFullYear()} EternalQuants. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;

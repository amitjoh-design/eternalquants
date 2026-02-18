import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ContentPage = () => {
    const [activeTopic, setActiveTopic] = useState('ARIMA');

    // Placeholder content for ARIMA since we couldn't read the PDF
    const arimaContent = (
        <div className="space-y-6 animate-fadeIn">
            <div className="card">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6 border-b border-slate-700 pb-4">ARIMA Models</h2>

                <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-white mt-8 mb-4">Introduction to ARIMA</h3>
                    <p>
                        ARIMA, short for <strong>AutoRegressive Integrated Moving Average</strong>, is a class of models that explains a given time series based on its own past values, that is, its own lags and the lagged forecast errors, so that equation can be used to forecast future values.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 my-8">
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <div className="text-blue-400 font-bold text-lg mb-2">AR (AutoRegressive)</div>
                            <p className="text-sm">A model that uses the dependent relationship between an observation and some number of lagged observations.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <div className="text-cyan-400 font-bold text-lg mb-2">I (Integrated)</div>
                            <p className="text-sm">The use of differencing of raw observations (e.g. subtracting an observation from an observation at the previous time step) in order to make the time series stationary.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <div className="text-teal-400 font-bold text-lg mb-2">MA (Moving Average)</div>
                            <p className="text-sm">A model that uses the dependency between an observation and a residual error from a moving average model applied to lagged observations.</p>
                        </div>
                    </div>

                    <p>
                        Non-seasonal ARIMA models are generally denoted ARIMA(p,d,q) where parameters p, d, and q are non-negative integers:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-slate-300">
                        <li><strong>p</strong> is the order (number of time lags) of the autoregressive model,</li>
                        <li><strong>d</strong> is the degree of differencing (the number of times the data have had past values subtracted), and</li>
                        <li><strong>q</strong> is the order of the moving-average model.</li>
                    </ul>
                </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-xl flex items-start gap-4">
                <div className="text-3xl">💡</div>
                <div>
                    <h4 className="font-bold text-blue-300 mb-2">Pro Tip</h4>
                    <p className="text-sm mb-0">
                        Before applying ARIMA, always check for stationarity using tests like the Augmented Dickey-Fuller (ADF) test. If the series involves seasonality, consider using SARIMA (Seasonal ARIMA) instead.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 hover:opacity-80 transition-opacity">
                        EternalQuants
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">Documentation</a>
                        <a href="#" className="hover:text-white transition-colors">Courses</a>
                        <a href="#" className="hover:text-white transition-colors">Community</a>
                    </nav>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
                {/* Sidebar */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <div className="sticky top-24 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-800">
                            <h3 className="font-bold text-slate-200 uppercase text-xs tracking-wider">Topics</h3>
                        </div>
                        <nav className="flex flex-col p-2 space-y-1">
                            <button
                                onClick={() => setActiveTopic('ARIMA')}
                                className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTopic === 'ARIMA'
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                            >
                                ARIMA Models
                            </button>
                            <button className="text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors">
                                GARCH Models
                            </button>
                            <button className="text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors">
                                Monte Carlo Sim
                            </button>
                            <button className="text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors">
                                Mean Reversion
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {activeTopic === 'ARIMA' && arimaContent}
                </main>
            </div>
        </div>
    );
};

export default ContentPage;

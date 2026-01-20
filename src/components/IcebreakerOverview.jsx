import React, { useState } from 'react';
import { Ship, X, ChevronRight, AlertTriangle } from 'lucide-react';

const IcebreakerOverview = () => {
    const [isOpen, setIsOpen] = useState(false);

    const data = [
        { name: 'Russia', count: 57, code: 'ru', alliance: 'Russia' },
        { name: 'Canada', count: 18, code: 'ca', alliance: 'NATO' },
        { name: 'Finland', count: 10, code: 'fi', alliance: 'NATO' },
        { name: 'Denmark', count: 7, code: 'dk', alliance: 'NATO' },
        { name: 'United States', count: 5, code: 'us', alliance: 'NATO' },
        { name: 'Sweden', count: 5, code: 'se', alliance: 'NATO' },
        { name: 'Norway', count: 2, code: 'no', alliance: 'NATO' },
    ];

    const russiaTotal = 57;
    const natoTotal = 47;

    return (
        <div className="absolute top-32 left-6 z-30 pointer-events-auto">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="glass-panel p-4 hover:bg-white/10 transition-all duration-300 group shadow-lg flex items-center gap-3 border border-blue-500/30"
                >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/50 group-hover:scale-110 transition-transform">
                        <Ship className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Maritime Intel</div>
                        <div className="text-sm font-bold text-white uppercase tracking-wider">Icebreaker Fleet</div>
                    </div>
                </button>
            )}

            {/* Detailed Panel */}
            {isOpen && (
                <div className="glass-panel w-80 overflow-hidden shadow-2xl animate-fade-in border border-blue-500/30">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-blue-500/10">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Ship className="w-5 h-5" />
                            <h3 className="font-bold tracking-tight text-white uppercase text-sm">Arctic Icebreaker Count</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Summary Comparison */}
                    <div className="p-4 grid grid-cols-2 gap-4 border-b border-white/5 bg-slate-900/40">
                        <div className="text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Russia</div>
                            <div className="text-3xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{russiaTotal}</div>
                        </div>
                        <div className="text-center border-l border-white/10">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">NATO Total</div>
                            <div className="text-3xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">{natoTotal}</div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {data.map((country, idx) => (
                            <div
                                key={country.name}
                                className={`flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0`}
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={`https://flagcdn.com/${country.code}.svg`}
                                        alt={country.name}
                                        className="w-6 h-4 rounded-sm shadow-sm"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-slate-200">{country.name}</div>
                                        <div className={`text-[9px] font-bold uppercase tracking-wider ${country.alliance === 'Russia' ? 'text-red-400' : 'text-blue-400'}`}>
                                            {country.alliance}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-lg font-bold text-white">{country.count}</div>
                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Warning */}
                    <div className="p-3 bg-red-500/5 text-center flex items-center justify-center gap-2 border-t border-white/5">
                        <AlertTriangle className="w-3 h-3 text-red-500/60" />
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest">Strategic Imbalance Detected</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IcebreakerOverview;

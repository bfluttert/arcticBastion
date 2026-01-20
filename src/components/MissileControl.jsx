import React, { useState } from 'react';
import { Target, ShieldAlert, X, Zap, Swords, Power, RefreshCw } from 'lucide-react';
import { LAUNCH_SITES } from '../services/MissileSimulator';

const MissileControl = ({ onLaunch, onClear, activeTrajectories }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [selectedSources, setSelectedSources] = useState([]);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [direction, setDirection] = useState('RUSSIA_TO_NATO');

    const sourcesData = direction === 'RUSSIA_TO_NATO' ? LAUNCH_SITES.RUSSIA : LAUNCH_SITES.NATO;
    const targetsData = direction === 'RUSSIA_TO_NATO' ? LAUNCH_SITES.NATO : LAUNCH_SITES.RUSSIA;

    const handleToggle = () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        if (!newState) {
            onClear();
            setSelectedSources([]);
            setSelectedTargets([]);
        }
    };

    const toggleSelection = (item, list, setList) => {
        if (list.find(i => i.name === item.name)) {
            setList(list.filter(i => i.name !== item.name));
        } else {
            setList([...list, item]);
        }
    };

    const handleLaunch = () => {
        if (selectedSources.length > 0 && selectedTargets.length > 0 && isEnabled) {
            onLaunch(selectedSources, selectedTargets);
            // Optional: reset selections after launch, or keep them for further refinement
            // setSelectedSources([]);
            // setSelectedTargets([]);
        }
    };

    const switchDirection = () => {
        setSelectedSources([]);
        setSelectedTargets([]);
        setDirection(direction === 'RUSSIA_TO_NATO' ? 'NATO_TO_RUSSIA' : 'RUSSIA_TO_NATO');
    };

    return (
        <div className="absolute top-52 left-6 z-30 pointer-events-auto">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`glass-panel p-4 hover:bg-white/10 transition-all duration-300 group shadow-lg flex items-center gap-3 border ${isEnabled ? 'border-red-500/50 bg-red-500/10' : 'border-slate-500/30'}`}
                >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${isEnabled ? 'bg-red-500/20 border-red-400/50 animate-pulse' : 'bg-slate-500/10 border-slate-500/50'}`}>
                        <Target className={`w-6 h-6 ${isEnabled ? 'text-red-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-left">
                        <div className={`text-[10px] font-bold tracking-widest uppercase ${isEnabled ? 'text-red-400' : 'text-slate-500'}`}>Strategic Command</div>
                        <div className="text-sm font-bold text-white uppercase tracking-wider">Missile Simulation</div>
                    </div>
                </button>
            )}

            {/* Detailed Control Panel */}
            {isOpen && (
                <div className="glass-panel w-[400px] overflow-hidden shadow-2xl animate-fade-in border border-red-500/30">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-red-500/10">
                        <div className="flex items-center gap-2 text-red-500">
                            <ShieldAlert className="w-5 h-5" />
                            <h3 className="font-bold tracking-tight text-white uppercase text-sm">Strike Simulator</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToggle}
                                className={`p-1 w-10 rounded-full transition-all border ${isEnabled ? 'bg-red-500 border-red-400 justify-end' : 'bg-slate-800 border-slate-700 justify-start'} flex items-center`}
                            >
                                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {!isEnabled ? (
                        <div className="p-8 text-center space-y-4">
                            <Power className="w-12 h-12 text-slate-600 mx-auto" />
                            <div>
                                <h4 className="text-slate-200 font-bold uppercase text-xs">Simulator Offline</h4>
                                <p className="text-[11px] text-slate-500 mt-1">Enable the tracking link to initiate trajectory calculations.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {/* Direction Switcher */}
                            <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${direction === 'RUSSIA_TO_NATO' ? 'text-red-500' : 'text-blue-500'}`}>
                                    {direction === 'RUSSIA_TO_NATO' ? 'RU SOURCE' : 'NATO SOURCE'}
                                </span>
                                <button
                                    onClick={switchDirection}
                                    className="p-1 hover:bg-red-500/20 rounded-full transition-all hover:rotate-180"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                                </button>
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${direction === 'RUSSIA_TO_NATO' ? 'text-blue-500' : 'text-red-500'}`}>
                                    {direction === 'RUSSIA_TO_NATO' ? 'NATO TARGET' : 'RU TARGET'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Source Column */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 flex justify-between">
                                        Launch Sites
                                        <span className="text-red-400">{selectedSources.length}</span>
                                    </label>
                                    <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                        {sourcesData.map(s => {
                                            const isSelected = selectedSources.find(i => i.name === s.name);
                                            return (
                                                <button
                                                    key={s.name}
                                                    onClick={() => toggleSelection(s, selectedSources, setSelectedSources)}
                                                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all border ${isSelected ? 'bg-red-500/30 border-red-500/50 text-white font-bold' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 italic'}`}
                                                >
                                                    {s.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Target Column */}
                                <div className="space-y-2 border-l border-white/5 pl-4">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 flex justify-between">
                                        Primary Objectives
                                        <span className="text-blue-400">{selectedTargets.length}</span>
                                    </label>
                                    <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                        {targetsData.map(t => {
                                            const isSelected = selectedTargets.find(i => i.name === t.name);
                                            return (
                                                <button
                                                    key={t.name}
                                                    onClick={() => toggleSelection(t, selectedTargets, setSelectedTargets)}
                                                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all border ${isSelected ? 'bg-blue-500/30 border-blue-500/50 text-white font-bold' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 italic'}`}
                                                >
                                                    {t.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-white/10 flex gap-2">
                                <button
                                    onClick={() => { onClear(); setSelectedSources([]); setSelectedTargets([]); }}
                                    className="flex-1 p-2 rounded bg-white/5 hover:bg-white/10 text-slate-400 text-[11px] font-bold uppercase transition-colors"
                                >
                                    Wipe
                                </button>
                                <button
                                    disabled={selectedSources.length === 0 || selectedTargets.length === 0}
                                    onClick={handleLaunch}
                                    className={`flex-[2] p-2 rounded flex items-center justify-center gap-2 transition-all ${(selectedSources.length === 0 || selectedTargets.length === 0) ? 'bg-slate-800 text-slate-600 grayscale' : 'bg-red-600 hover:bg-red-500 text-white font-black shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse'}`}
                                >
                                    <Zap className="w-4 h-4 fill-current" />
                                    <span className="text-[11px] uppercase tracking-widest">Simulate Strike</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Status */}
                    <div className="p-3 bg-red-500/5 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Swords className="w-3 h-3 text-red-500/60" />
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest">Active Trajectories</span>
                        </div>
                        <span className="text-[10px] font-bold text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]">{activeTrajectories.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MissileControl;

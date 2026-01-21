import React, { useState } from 'react';
import { Layers, Anchor, Zap, Shield, Menu, Info, ChevronRight, ChevronLeft, Snowflake, Radio } from 'lucide-react';
import Map from './components/Map';
import IcebreakerOverview from './components/IcebreakerOverview';
import MissileControl from './components/MissileControl';
import MissileSimulator from './services/MissileSimulator';
import SeaIceModal from './components/SeaIceModal';
import { THEATRES } from './services/LayerManager';

function App() {
  const [activeTheatre, setActiveTheatre] = useState(THEATRES.RESOURCE);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [missileTrajectories, setMissileTrajectories] = useState([]);
  const [showSeaIceModal, setShowSeaIceModal] = useState(false);
  const [isAisEnabled, setIsAisEnabled] = useState(false);
  const [aisFilters, setAisFilters] = useState({
    watchlistOnly: true,
    arcticOnly: true  // 66°N and above
  });

  const handleMissileLaunch = (sources, targets) => {
    const newTrajectories = [];
    sources.forEach(s => {
      targets.forEach(t => {
        newTrajectories.push(MissileSimulator.createTrajectory(s.coords, t.coords));
      });
    });
    setMissileTrajectories(prev => [...prev, ...newTrajectories]);
  };

  const handleMissileClear = () => {
    setMissileTrajectories([]);
  };

  return (
    <div className="w-full h-screen bg-[var(--bg-space)] text-white overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      {/* Background Map */}
      <Map
        activeTheatre={activeTheatre}
        missileTrajectories={missileTrajectories}
        isAisEnabled={isAisEnabled}
        aisFilters={aisFilters}
      />

      {/* Top Bar - Header & Global Status */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none flex justify-between items-start">
        <div className="glass-panel pointer-events-auto p-4 flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">ARCTIC BASTION</h1>
            <p className="text-xs text-cyan-400/80 tracking-widest uppercase">Geospatial Intelligence Dashboard</p>
          </div>
        </div>

        {/* User/Settings (Removed as requested) */}
      </div>

      {/* Left Side - Maritime Controls */}
      {activeTheatre === THEATRES.MARITIME && (
        <div className="absolute left-6 top-52 z-20 pointer-events-auto flex flex-col gap-3">
          <button
            onClick={() => setShowSeaIceModal(true)}
            className="glass-panel flex items-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group"
          >
            <Snowflake className="w-4 h-4 group-hover:animate-pulse" />
            <span className="font-medium tracking-wide text-sm">VIEW ICE HISTORY</span>
          </button>

          {/* AIS Toggle Button */}
          <button
            onClick={() => setIsAisEnabled(!isAisEnabled)}
            className={`glass-panel flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 group ${isAisEnabled
              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
              : 'bg-slate-500/10 border border-slate-500/30 text-slate-400 hover:bg-slate-500/20'
              }`}
          >
            <Radio className={`w-4 h-4 ${isAisEnabled ? 'animate-pulse' : ''}`} />
            <span className="font-medium tracking-wide text-sm">
              {isAisEnabled ? 'AIS LIVE' : 'AIS OFF'}
            </span>
          </button>

          {/* AIS Filter Options (shown when AIS is enabled) */}
          {isAisEnabled && (
            <div className="glass-panel p-3 rounded-xl border border-green-500/20 space-y-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Filters</div>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aisFilters.watchlistOnly}
                  onChange={(e) => setAisFilters(prev => ({ ...prev, watchlistOnly: e.target.checked }))}
                  className="w-3 h-3 rounded border-slate-500 bg-slate-800 text-green-500 focus:ring-green-500"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">Watchlist Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aisFilters.arcticOnly}
                  onChange={(e) => setAisFilters(prev => ({ ...prev, arcticOnly: e.target.checked }))}
                  className="w-3 h-3 rounded border-slate-500 bg-slate-800 text-green-500 focus:ring-green-500"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">Arctic Only (≥66°N)</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Bottom Control Panel - Theatre Switcher */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
        <div className="glass-panel p-2 flex items-center gap-2">

          <button
            onClick={() => setActiveTheatre(THEATRES.RESOURCE)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${activeTheatre === THEATRES.RESOURCE
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.3)]'
              : 'hover:bg-white/5 text-slate-400'
              }`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium tracking-wide">RESOURCE</span>
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button
            onClick={() => setActiveTheatre(THEATRES.STRATEGIC)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${activeTheatre === THEATRES.STRATEGIC
              ? 'bg-red-500/20 border border-red-500 text-red-300 shadow-[0_0_15px_rgba(255,42,109,0.3)]'
              : 'hover:bg-white/5 text-slate-400'
              }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium tracking-wide">STRATEGIC</span>
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button
            onClick={() => setActiveTheatre(THEATRES.MARITIME)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${activeTheatre === THEATRES.MARITIME
              ? 'bg-blue-500/20 border border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'hover:bg-white/5 text-slate-400'
              }`}
          >
            <Anchor className="w-4 h-4" />
            <span className="font-medium tracking-wide">MARITIME</span>
          </button>
        </div>
      </div>

      {/* Side Information Panel (Dynamic based on Theatre) */}
      <div className={`absolute right-6 top-32 bottom-32 z-10 pointer-events-none flex flex-row items-start gap-4 transition-all duration-500 ${isPanelOpen ? 'w-80' : 'w-12'}`}>
        {/* Toggle Button Container */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`glass-panel p-3 hover:bg-white/10 transition-all duration-300 group shadow-xl border ${isPanelOpen ? 'border-white/10' : 'border-cyan-500/50 bg-cyan-500/10'}`}
            title={isPanelOpen ? "Close Panel" : "Open Panel"}
          >
            {isPanelOpen ? (
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Panel Content */}
        <div className={`glass-panel pointer-events-auto flex-1 h-full p-6 overflow-y-auto transition-all duration-500 transform ${isPanelOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
          <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            {activeTheatre.toUpperCase()} INTEL
          </h2>

          <div className="space-y-6">
            {activeTheatre === THEATRES.RESOURCE && (
              <>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Overview</h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    This layer monitors critical raw materials and mineral exploration across the Arctic. Mapping these resources is vital for industrial sovereignty and clean energy transitions.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Key Features</h3>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li><span className="text-slate-200 font-medium">Strategic Deposits:</span> Tracking locations like Tanbreez and Kvanefjeld.</li>
                    <li><span className="text-slate-200 font-medium">EEZ Boundaries:</span> Visualizing Exclusive Economic Zones to manage maritime resource rights.</li>
                  </ul>
                </div>
              </>
            )}

            {activeTheatre === THEATRES.STRATEGIC && (
              <>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Defense Doctrine</h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    Focused on the <span className="text-red-400 italic">"Arctic Bastion"</span> strategy. This layer monitors choke points and military deployments critical to northern security.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Operational Tracking</h3>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li><span className="text-slate-200 font-medium">GIUK & Bear Gaps:</span> Real-time monitoring of submarine and naval transit corridors.</li>
                    <li><span className="text-slate-200 font-medium">Military Bases:</span> Geospatial intelligence on northern hemisphere military assets.</li>
                  </ul>
                </div>

                {/* Military Base Legend */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Base Legend</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 p-1">
                        <img src="/icons/military-land.svg" alt="Land" className="w-full h-full opacity-80" />
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Land Forces</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 p-1">
                        <img src="/icons/military-air.svg" alt="Air" className="w-full h-full opacity-80" />
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Air Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 p-1">
                        <img src="/icons/military-sea.svg" alt="Sea" className="w-full h-full opacity-80" />
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Naval / Sea</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 p-1">
                        <img src="/icons/military-space.svg" alt="Space" className="w-full h-full opacity-80" />
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Space Ops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 p-1">
                        <img src="/icons/military-joint.svg" alt="Joint" className="w-full h-full opacity-80" />
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Joint Command</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTheatre === THEATRES.MARITIME && (
              <>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Maritime Awareness</h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    Comprehensive monitoring of Arctic shipping routes, ice conditions, and naval capabilities.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Active Monitoring</h3>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                    <li><span className="text-slate-200 font-medium">AIS Integration:</span> Live tracking of vessel movements through the Northern Sea Route.</li>
                    <li><span className="text-slate-200 font-medium">Icebreaker Overview:</span> Tracking the balance of power in ice-capable fleet distribution.</li>
                    <li><span className="text-slate-200 font-medium">Ice Cap Dynamics:</span> Visualizing the shifting ice extent and its impact on navigation.</li>
                  </ul>
                </div>

                {/* AIS Coverage Note */}
                <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="text-[9px] font-bold text-amber-400/80 uppercase tracking-wider mb-1">⚠ AIS Coverage</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    AIS stations are coastal-based with ~200km range. Vessels far offshore may not appear.
                  </p>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-white/10">
              <div className="p-3 rounded bg-cyan-500/5 border border-cyan-500/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">System Status</span>
                  <span className="text-[10px] text-green-400 font-bold">LINK ACTIVE</span>
                </div>
                <div className="text-[11px] text-slate-200 italic">Receiving live telemetry...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {activeTheatre === THEATRES.MARITIME && <IcebreakerOverview />}
      {activeTheatre === THEATRES.MARITIME && (
        <SeaIceModal isOpen={showSeaIceModal} onClose={() => setShowSeaIceModal(false)} />
      )}
      {activeTheatre === THEATRES.STRATEGIC && (
        <MissileControl
          onLaunch={handleMissileLaunch}
          onClear={handleMissileClear}
          activeTrajectories={missileTrajectories}
        />
      )}

      {/* Mouse Interaction Guide - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none">
        <div className="glass-panel px-3 py-1.5 border border-white/5 flex gap-4 items-center shadow-lg">
          {/* Pan Icon */}
          <div className="flex items-center gap-2 opacity-60 group">
            <div className="w-3 h-4.5 rounded-[3px] border border-white/40 flex p-[1px] relative">
              <div className="w-[4px] h-[6px] bg-cyan-400/60 rounded-tl-[1px] border-r border-b border-white/10" />
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[1px] h-[3px] bg-white/20" /> {/* Scroll wheel detail */}
            </div>
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Pan</span>
          </div>

          <div className="w-px h-3 bg-white/10" />

          {/* Rotate Icon */}
          <div className="flex items-center gap-2 opacity-90">
            <div className="w-3 h-4.5 rounded-[3px] border border-white/40 flex p-[1px] justify-end relative">
              <div className="w-[4px] h-[6px] bg-cyan-500 rounded-tr-[1px] border-l border-b border-white/10 shadow-[0_0_5px_rgba(0,243,255,0.3)]" />
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[1px] h-[3px] bg-white/20" />
            </div>
            <span className="text-[9px] uppercase font-black tracking-widest text-cyan-400/80">Rotate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

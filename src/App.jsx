import React, { useState } from 'react';
import { Layers, Anchor, Zap, Shield, Menu } from 'lucide-react';
import Map from './components/Map';
import { THEATRES } from './services/LayerManager';

function App() {
  const [activeTheatre, setActiveTheatre] = useState(THEATRES.RESOURCE);

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden relative selection:bg-cyan-500 selection:text-black">
      {/* Background Map */}
      <Map activeTheatre={activeTheatre} />

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

        {/* User/Settings (Placeholder) */}
        <div className="glass-panel pointer-events-auto p-3 hover:bg-white/10 transition-colors cursor-pointer">
          <Menu className="w-6 h-6 text-white/80" />
        </div>
      </div>

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
      <div className="absolute right-6 top-32 bottom-32 w-80 z-10 pointer-events-none flex flex-col gap-4">
        {/* Active Theatre readout */}
        <div className="glass-panel pointer-events-auto flex-1 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
            {activeTheatre.toUpperCase()} THEATRE
          </h2>

          <div className="space-y-4">
            {/* Placeholder Data */}
            <div className="p-3 rounded bg-white/5 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">STATUS</span>
                <span className="text-xs text-green-400 font-bold">ACTIVE</span>
              </div>
              <div className="text-sm text-slate-200">Monitoring Sector 4</div>
            </div>

            {activeTheatre === THEATRES.RESOURCE && (
              <div className="text-xs text-slate-400 leading-relaxed">
                Tracking verified mineral deposits and designated EEZ boundaries.
                <br /><br />
                Displaying: Tanbreez, Kvanefjeld.
              </div>
            )}

            {activeTheatre === THEATRES.STRATEGIC && (
              <div className="text-xs text-slate-400 leading-relaxed">
                Monitoring strategic assets and denial zones.
                <br /><br />
                Alert: GIUK Gap sensor activity nominal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

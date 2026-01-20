import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3Geo from 'd3-geo';

const SeaIceModal = ({ isOpen, onClose }) => {
    const [data, setData] = useState(null); // Sea Ice Data
    const [landData, setLandData] = useState(null); // Land Data
    const [shippingData, setShippingData] = useState(null); // Shipping Route Data

    const [year, setYear] = useState(2023);
    const [showWinter, setShowWinter] = useState(true);
    const [showSummer, setShowSummer] = useState(true);
    const [loading, setLoading] = useState(true);

    // Canvas/SVG Refs
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Fetch Data on mount if open
    useEffect(() => {
        if (isOpen) {
            setLoading(true);

            const fetchData = async () => {
                try {
                    // Parallel data fetching
                    const [iceRes, landRes, shippingRes] = await Promise.all([
                        fetch(`/data/sea_ice_history.json?t=${Date.now()}`),
                        fetch(`/data/world_land.json`),
                        // We could import shipping routes, but for consistency let's fetch since we might move it to public eventually. 
                        // Actually, importing is easier if file is in src. But to keep this pattern clean without mixed imports/fetches:
                        // I'll assume I imported it at the top level or fetch it if moved. 
                        // Since I didn't move it, I should IMPORT it at the top. 
                        // But wait, I can't change top level imports easily in this block. 
                        // Use dynamic import!
                        import('../data/shipping_routes.json')
                    ]);

                    const iceJson = await iceRes.json();
                    const landJson = await landRes.json();
                    const shippingJson = shippingRes.default || shippingRes; // Handle ESM/CommonJS

                    setData(iceJson);
                    setLandData(landJson);
                    setShippingData(shippingJson);
                } catch (err) {
                    console.error("Failed to load map data", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [isOpen]);

    // Filter Sea Ice Data
    const features = useMemo(() => {
        if (!data) return [];
        return data.features.filter(f => {
            const fYear = f.properties.year;
            const fMonth = f.properties.month;
            if (fYear !== year) return false;
            if (fMonth === 3 && showWinter) return true;
            if (fMonth === 9 && showSummer) return true;
            return false;
        });
    }, [data, year, showWinter, showSummer]);

    // D3 Projection Logic
    // North Pole Stereographic
    const projection = useMemo(() => {
        // Adjust scale based on dimensions to fit Arctic
        const scale = Math.min(dimensions.width, dimensions.height) * 1.5;

        return d3Geo.geoStereographic()
            .scale(1200) // Adjust zoom - was 1200
            .rotate([0, -90]) // Rotate to center North Pole
            .translate([dimensions.width / 2, dimensions.height / 2])
            .clipAngle(45); // Clip to show only the Arctic cap (approx down to 45 deg lat)
    }, [dimensions]);

    const pathGenerator = useMemo(() => {
        return d3Geo.geoPath().projection(projection);
    }, [projection]);

    // Graticules (Grid lines)
    const graticule = useMemo(() => {
        return d3Geo.geoGraticule()();
    }, []);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content */}
            <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">ARCTIC ICE HISTORY</h2>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Polar Stereographic Projection View</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content: Map + Controls */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Panel: Map */}
                    <div className="flex-1 bg-[#05080a] relative flex items-center justify-center" ref={el => {
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            if (rect.width !== dimensions.width || rect.height !== dimensions.height) {
                                setDimensions({ width: rect.width, height: rect.height });
                            }
                        }
                    }}>
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-cyan-400 animate-pulse">
                                Loading Historical Data...
                            </div>
                        )}

                        {!loading && (
                            <svg width={dimensions.width} height={dimensions.height} className="max-w-full max-h-full">
                                {/* Base Globe Circle */}
                                <circle
                                    cx={dimensions.width / 2}
                                    cy={dimensions.height / 2}
                                    r={projection.scale()}
                                    fill="#0b1121" // Darker than sea ice
                                    stroke="#1e293b"
                                />

                                {/* Graticule */}
                                <path
                                    d={pathGenerator(graticule)}
                                    fill="none"
                                    stroke="#1e293b"
                                    strokeWidth="0.5"
                                    opacity="0.3"
                                />

                                {/* Land Layer (Bottom) */}
                                <g>
                                    {landData && landData.features.map((feature, i) => (
                                        <path
                                            key={`land-${i}`}
                                            d={pathGenerator(feature)}
                                            fill="#1e293b" // Slate-800
                                            stroke="#334155" // Slate-700
                                            strokeWidth="0.5"
                                        />
                                    ))}
                                </g>

                                {/* Sea Ice Features (Middle) */}
                                <g>
                                    {features.map((feature, i) => {
                                        const isWinter = feature.properties.month === 3;
                                        return (
                                            <path
                                                key={`ice-${i}`}
                                                d={pathGenerator(feature)}
                                                fill={isWinter ? "#22d3ee" : "#ffffff"}
                                                fillOpacity={isWinter ? 0.15 : 0.5} // Slight transparency to see land if needed, but usually ice covers water.
                                                stroke={isWinter ? "#06b6d4" : "#e2e8f0"}
                                                strokeWidth={1}
                                            />
                                        );
                                    })}
                                </g>

                                {/* Shipping Routes (Top) */}
                                <g>
                                    {shippingData && shippingData.features.map((feature, i) => (
                                        <path
                                            key={`route-${i}`}
                                            d={pathGenerator(feature)}
                                            fill="none"
                                            stroke="#f59e0b" // Amber-500
                                            strokeWidth="2"
                                            strokeDasharray="4 2"
                                            opacity="0.8"
                                        >
                                            <title>{feature.properties.Name}</title>
                                        </path>
                                    ))}
                                </g>

                                {/* Labels/Annotations */}
                                <text x={dimensions.width / 2} y={dimensions.height - 20} textAnchor="middle" fill="#64748b" fontSize="12">
                                    EPSG:3995 (WGS 84 / Arctic Polar Stereographic)
                                </text>

                                {/* Legend for Routes */}
                                <g transform={`translate(20, ${dimensions.height - 40})`}>
                                    <line x1="0" y1="0" x2="20" y2="0" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                                    <text x="25" y="4" fill="#94a3b8" fontSize="10" fontWeight="bold">SHIPPING ROUTES</text>
                                </g>
                            </svg>
                        )}
                    </div>

                    {/* Right Panel: Controls */}
                    <div className="w-80 bg-slate-800/30 border-l border-slate-700 p-6 flex flex-col gap-8">

                        {/* Year Control */}
                        <div>
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 block">
                                Timeline Selection
                            </label>
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-4xl font-bold text-cyan-400 font-mono table-nums">
                                        {year}
                                    </span>
                                    <span className="text-xs text-slate-500 mb-1">DATA RANGE: 1979-2024</span>
                                </div>

                                <input
                                    type="range"
                                    min="1979"
                                    max="2024"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                                />
                                <div className="flex justify-between mt-2">
                                    <button onClick={() => setYear(y => Math.max(1979, y - 1))} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={() => setYear(y => Math.min(2024, y + 1))} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Layer Toggles */}
                        <div>
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 block">
                                Layer Visibility
                            </label>

                            <div className="space-y-3">
                                <div
                                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-3 ${showWinter ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-800 border-slate-700 opacity-60 hover:opacity-100'}`}
                                    onClick={() => setShowWinter(!showWinter)}
                                >
                                    <div className={`w-4 h-4 rounded-full border ${showWinter ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-600 border-slate-500'}`} />
                                    <div>
                                        <div className="font-bold text-slate-200">Winter Maximum</div>
                                        <div className="text-xs text-slate-400">March Extent</div>
                                    </div>
                                </div>

                                <div
                                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-3 ${showSummer ? 'bg-slate-700/50 border-white/30' : 'bg-slate-800 border-slate-700 opacity-60 hover:opacity-100'}`}
                                    onClick={() => setShowSummer(!showSummer)}
                                >
                                    <div className={`w-4 h-4 rounded-full border ${showSummer ? 'bg-white border-slate-200 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-slate-600 border-slate-500'}`} />
                                    <div>
                                        <div className="font-bold text-slate-200">Summer Minimum</div>
                                        <div className="text-xs text-slate-400">September Extent</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-auto bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-xs text-slate-400 leading-relaxed">
                            <strong className="text-slate-300 block mb-1">Projection Note:</strong>
                            This view uses a Polar Stereographic 2D projection to accurately visualize the ice cap continuity across the North Pole, eliminating the distortion present in Mercator or 3D Globe views.
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeaIceModal;

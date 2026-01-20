import React, { useState, useEffect } from 'react';

const SeaIceLayer = ({ map, isVisible }) => {
    const [year, setYear] = useState(2023);
    const [showWinter, setShowWinter] = useState(false);
    const [showSummer, setShowSummer] = useState(false);

    const SOURCE_ID = 'sea-ice-source';
    const LAYER_IDS = {
        WINTER: 'sea-ice-winter',
        SUMMER: 'sea-ice-summer',
        WINTER_LINE: 'sea-ice-winter-line',
        SUMMER_LINE: 'sea-ice-summer-line'
    };

    // Initialize & Sync
    useEffect(() => {
        if (!map) return;

        const init = async () => {
            // console.log('[SeaIceLayer] Syncing. Visible:', isVisible);

            if (isVisible) {
                // 1. Add Source
                if (!map.getSource(SOURCE_ID)) {
                    // console.log('[SeaIceLayer] Adding Source...');
                    map.addSource(SOURCE_ID, {
                        type: 'geojson',
                        data: '/data/sea_ice_history.json'
                    });
                }

                // 2. Wait for style
                if (!map.isStyleLoaded()) {
                    await new Promise(resolve => map.once('style.load', resolve));
                }

                // 3. Add Layers
                addLayersSafe();
            } else {
                removeLayers();
            }
        };

        init();

        return () => {
            if (!isVisible) removeLayers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, isVisible]);

    // Update Filters/Visibility
    useEffect(() => {
        if (!map || !isVisible || !map.getSource(SOURCE_ID)) return;

        // Helper to safe-set layout
        const setVis = (id, visible) => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
            }
        };

        // Helper to safe-set filter
        const setFilter = (id, month) => {
            if (map.getLayer(id)) {
                map.setFilter(id, ['all', ['==', ['get', 'year'], year], ['==', ['get', 'month'], month]]);
            }
        };

        setVis(LAYER_IDS.WINTER, showWinter);
        setFilter(LAYER_IDS.WINTER, 3);
        setFilter(LAYER_IDS.WINTER_LINE, 3);

        setVis(LAYER_IDS.SUMMER, showSummer);
        setFilter(LAYER_IDS.SUMMER, 9);
        setFilter(LAYER_IDS.SUMMER_LINE, 9);

        setVis(LAYER_IDS.WINTER_LINE, showWinter);
        setVis(LAYER_IDS.SUMMER_LINE, showSummer);

    }, [map, isVisible, year, showWinter, showSummer]);

    const addLayersSafe = () => {
        try {
            // Winter
            if (!map.getLayer(LAYER_IDS.WINTER)) {
                map.addLayer({
                    id: LAYER_IDS.WINTER,
                    type: 'fill',
                    source: SOURCE_ID,
                    filter: ['all', ['==', ['get', 'year'], year], ['==', ['get', 'month'], 3]],
                    paint: {
                        'fill-color': '#a5f3fc', // Cyan-200
                        'fill-opacity': 0.3
                    },
                    layout: { visibility: showWinter ? 'visible' : 'none' }
                });
            }

            // Winter Line
            if (!map.getLayer(LAYER_IDS.WINTER_LINE)) {
                map.addLayer({
                    id: LAYER_IDS.WINTER_LINE,
                    type: 'line',
                    source: SOURCE_ID,
                    filter: ['all', ['==', ['get', 'year'], year], ['==', ['get', 'month'], 3]],
                    paint: {
                        'line-color': '#22d3ee',
                        'line-width': 1
                    },
                    layout: { visibility: showWinter ? 'visible' : 'none' }
                });
            }

            // Summer
            if (!map.getLayer(LAYER_IDS.SUMMER)) {
                map.addLayer({
                    id: LAYER_IDS.SUMMER,
                    type: 'fill',
                    source: SOURCE_ID,
                    filter: ['all', ['==', ['get', 'year'], year], ['==', ['get', 'month'], 9]],
                    paint: {
                        'fill-color': '#ffffff', // White
                        'fill-opacity': 0.5
                    },
                    layout: { visibility: showSummer ? 'visible' : 'none' }
                });
            }
            // Summer Line
            if (!map.getLayer(LAYER_IDS.SUMMER_LINE)) {
                map.addLayer({
                    id: LAYER_IDS.SUMMER_LINE,
                    type: 'line',
                    source: SOURCE_ID,
                    filter: ['all', ['==', ['get', 'year'], year], ['==', ['get', 'month'], 9]],
                    paint: {
                        'line-color': '#e2e8f0', // Slate-200
                        'line-width': 1.5
                    },
                    layout: { visibility: showSummer ? 'visible' : 'none' }
                });
            }

        } catch (e) {
            console.error("[SeaIceLayer] Error adding layers:", e);
        }
    };

    const removeLayers = () => {
        if (!map) return;
        Object.values(LAYER_IDS).forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
        });
        if (map.getSource(SOURCE_ID)) {
            map.removeSource(SOURCE_ID);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="absolute bottom-24 left-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-lg border border-slate-700 shadow-xl w-80 text-white z-50">
            <h3 className="font-bold text-lg mb-2 text-cyan-400 border-b border-slate-700 pb-1">
                Sea Ice History
            </h3>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-slate-300">Year</label>
                        <span className="text-cyan-300 font-bold bg-slate-800 px-2 rounded font-mono">{year}</span>
                    </div>
                    <input
                        type="range"
                        min="1979"
                        max="2024"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                        <span>1979</span>
                        <span>2024</span>
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-700">
                    <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/50 p-2 rounded transition group">
                        <span className="text-sm text-slate-200 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-cyan-200 border border-cyan-400 opacity-60"></div>
                            Winter Maximum (Mar)
                        </span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={showWinter} onChange={(e) => setShowWinter(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                        </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer hover:bg-slate-800/50 p-2 rounded transition group">
                        <span className="text-sm text-slate-200 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-white border border-slate-200 opacity-60"></div>
                            Summer Minimum (Sep)
                        </span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={showSummer} onChange={(e) => setShowSummer(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-400"></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SeaIceLayer;

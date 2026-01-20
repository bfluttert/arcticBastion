import React, { useState, useEffect, useRef } from 'react';

const SeaIceLayer = ({ map, isVisible }) => {
    const [year, setYear] = useState(1979);
    const [showWinter2025, setShowWinter2025] = useState(false);
    const [showSummer2025, setShowSummer2025] = useState(false);
    const [isSliderActive, setIsSliderActive] = useState(true); // Default to on

    // Constants
    const LAYER_IDS = {
        WINTER: 'ice-winter-2025',
        SUMMER: 'ice-summer-2025',
        HISTORICAL: 'ice-historical'
    };

    const SOURCE_IDS = {
        WINTER: 'ice-winter-source',
        SUMMER: 'ice-summer-source',
        HISTORICAL: 'ice-historical-source'
    };

    // WMS Configuration
    const BASE_URL = "https://nsidc.org/api/mapservices/NSIDC/wms";
    const PARAMS = "bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=NSIDC:nsidc_0051_raster_n&styles=";

    // Helper to generate Tile URL
    const getTileUrl = (dateStr) => `${BASE_URL}?${PARAMS}&time=${dateStr}`;

    // Effect: Manage Layers when visibility or map availability changes
    useEffect(() => {
        if (!map) return;

        if (isVisible) {
            addLayers();
        } else {
            removeLayers();
        }

        return () => {
            // Cleanup on unmount or if visibility changes (handled by the else block above, but good practice)
            if (!isVisible) removeLayers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, isVisible]);

    // Effect: Update Historical Layer when Year Changes
    useEffect(() => {
        if (!map || !isVisible) return;
        updateHistoricalSource(year);
    }, [year, map, isVisible]);

    // Effect: Toggle Static Layers Visibility
    useEffect(() => {
        if (!map || !isVisible) return;

        if (map.getLayer(LAYER_IDS.WINTER)) {
            map.setLayoutProperty(LAYER_IDS.WINTER, 'visibility', showWinter2025 ? 'visible' : 'none');
        }
        if (map.getLayer(LAYER_IDS.SUMMER)) {
            map.setLayoutProperty(LAYER_IDS.SUMMER, 'visibility', showSummer2025 ? 'visible' : 'none');
        }
    }, [showWinter2025, showSummer2025, map, isVisible]);


    const addLayers = () => {
        // Ensure the style is loaded before adding sources
        if (!map.isStyleLoaded()) {
            console.warn('[SeaIceLayer] Style not loaded yet, deferring addLayers');
            map.once('style.load', addLayers);
            return;
        }

        console.log('[SeaIceLayer] Adding layers...');

        // 1. Winter 2025 Peak (March 15)
        if (!map.getSource(SOURCE_IDS.WINTER)) {
            const winterUrl = getTileUrl('2025-03-15');
            console.log('[SeaIceLayer] Adding Winter source with URL:', winterUrl);
            map.addSource(SOURCE_IDS.WINTER, {
                type: 'raster',
                tiles: [winterUrl],
                tileSize: 256
            });
            map.addLayer({
                id: LAYER_IDS.WINTER,
                type: 'raster',
                source: SOURCE_IDS.WINTER,
                paint: { 'raster-opacity': 0.6 },
                layout: { visibility: showWinter2025 ? 'visible' : 'none' }
            });
        }

        // 2. Summer 2025 Low (Sept 15)
        if (!map.getSource(SOURCE_IDS.SUMMER)) {
            const summerUrl = getTileUrl('2025-09-15');
            console.log('[SeaIceLayer] Adding Summer source with URL:', summerUrl);
            map.addSource(SOURCE_IDS.SUMMER, {
                type: 'raster',
                tiles: [summerUrl],
                tileSize: 256
            });
            map.addLayer({
                id: LAYER_IDS.SUMMER,
                type: 'raster',
                source: SOURCE_IDS.SUMMER,
                paint: { 'raster-opacity': 0.6 },
                layout: { visibility: showSummer2025 ? 'visible' : 'none' }
            });
        }

        // 3. Historical Slider
        if (!map.getSource(SOURCE_IDS.HISTORICAL)) {
            const historicalUrl = getTileUrl(`${year}-09-15`);
            console.log('[SeaIceLayer] Adding Historical source with URL:', historicalUrl);
            map.addSource(SOURCE_IDS.HISTORICAL, {
                type: 'raster',
                tiles: [historicalUrl],
                tileSize: 256
            });
            map.addLayer({
                id: LAYER_IDS.HISTORICAL,
                type: 'raster',
                source: SOURCE_IDS.HISTORICAL,
                paint: { 'raster-opacity': 0.6 },
                layout: { visibility: 'visible' }
            });
        }

        // Ensure Historical is on top of static layers
        if (map.getLayer(LAYER_IDS.HISTORICAL)) {
            map.moveLayer(LAYER_IDS.HISTORICAL);
        }

        console.log('[SeaIceLayer] Layers added successfully');
    };

    const removeLayers = () => {
        Object.values(LAYER_IDS).forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
        });
        Object.values(SOURCE_IDS).forEach(id => {
            if (map.getSource(id)) map.removeSource(id);
        });
    };

    const updateHistoricalSource = (newYear) => {
        const source = map.getSource(SOURCE_IDS.HISTORICAL);
        if (source) {
            // MapLibre raster source tile update hack/method
            // Standard way is to setData for GeoJSON, but for Raster tiles we need to update the tiles array.
            // However, the cleanest way to force a refresh without flickering can be tricky.
            // We will straightforwardly replace the tiles property which MapLibre respects for tile re-requests if the implementation allows internal update.
            // If not, we might need to remove/add source, but let's try the lighter path first or use the internal style mutation.

            // MapLibre's public API doesn't have setTiles for existing sources easily exposed in all versions. 
            // The standard robust way is to remove and re-add the source if we can't access internal 'tiles' property.
            // But to avoid flicker, we can try to add a new source then remove the old one.

            // OPTIMIZED APPROACH:
            // Since we need to update the WMS time parameter, the URL changes.
            // We can try to use proper style diffing by just calling map.getSource().tiles = [...] if supported, 
            // but usually we need to reload the source.

            // Let's use the remove/add approach for reliability first, as WMS logic is stateless.
            // To prevent flicker: Add "temp" layer -> wait -> remove old.
            // For simplicity in this iteration: Just Remove/Add.

            if (map.getLayer(LAYER_IDS.HISTORICAL)) map.removeLayer(LAYER_IDS.HISTORICAL);
            if (map.getSource(SOURCE_IDS.HISTORICAL)) map.removeSource(SOURCE_IDS.HISTORICAL);

            map.addSource(SOURCE_IDS.HISTORICAL, {
                type: 'raster',
                tiles: [getTileUrl(`${newYear}-09-15`)],
                tileSize: 256
            });
            map.addLayer({
                id: LAYER_IDS.HISTORICAL,
                type: 'raster',
                source: SOURCE_IDS.HISTORICAL,
                paint: { 'raster-opacity': 0.6 },
                layout: { visibility: 'visible' }
            });
        }
    };

    if (!isVisible) return null;

    return (
        <div className="absolute bottom-24 left-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-lg border border-slate-700 shadow-xl w-80 text-white z-50">
            <h3 className="font-bold text-lg mb-2 text-cyan-400 border-b border-slate-700 pb-1">
                Sea Ice Analytics
            </h3>

            <div className="space-y-3">
                {/* Year Slider */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-slate-300">Historical Extent</label>
                        <span className="text-cyan-300 font-bold bg-slate-800 px-2 rounded">{year}</span>
                    </div>
                    <input
                        type="range"
                        min="1979"
                        max="2025"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">Comparing September (Annual Low) trends</p>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-700">
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-slate-800/50 p-1 rounded transition">
                        <input
                            type="checkbox"
                            checked={showWinter2025}
                            onChange={(e) => setShowWinter2025(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-cyan-600 rounded bg-slate-700 border-slate-600 focus:ring-cyan-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-200">Show 2025 Winter Peak (Mar)</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-slate-800/50 p-1 rounded transition">
                        <input
                            type="checkbox"
                            checked={showSummer2025}
                            onChange={(e) => setShowSummer2025(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-orange-500 rounded bg-slate-700 border-slate-600 focus:ring-orange-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-200">Show 2025 Summer Low (Sep)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SeaIceLayer;

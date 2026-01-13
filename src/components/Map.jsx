import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import LayerManager, { LAYER_GROUPS, THEATRES } from '../services/LayerManager';

// Arctic Circle Data
import arcticCircleData from '../data/arctic_circle.json';

const Map = ({ activeTheatre }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const layerManager = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (map.current) return;

        // Check if container exists and has size
        if (mapContainer.current) {
            console.log('Map container size:', mapContainer.current.clientWidth, mapContainer.current.clientHeight);
        }

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            center: [0, 90], // Exact North Pole
            zoom: 0, // Closer zoom to center the pole visually
            pitch: 40, // 40 degrees is "somewhat 3D" but keeps the pole clearly central
            bearing: 0,
            maxPitch: 89, // Almost 90 degrees as requested
            maxBounds: null, // Allow free navigation
            renderWorldCopies: true,
            projection: { type: 'globe' },
            attributionControl: false
        });

        // Debug handlers
        map.current.on('error', (e) => console.error('MapLibre Error:', e));

        // Unified load handler
        map.current.on('load', async () => {
            console.log('MapLibre LOADED!');
            console.log('MapLibre Version:', maplibregl.version);

            // 1. Force Projection & View
            if (map.current.setProjection) {
                map.current.setProjection({ type: 'globe' });
            }

            // Force jump to North Pole
            map.current.jumpTo({
                center: [-30, 90],
                zoom: 0,
                pitch: 20
            });

            console.log('Current Projection:', map.current.getProjection?.());
            setIsLoaded(true);

            // 2. Add Atmosphere for 3D effect
            map.current.setFog({
                'range': [0.5, 10],
                'color': '#1c1a14', // Matches --bg-space
                'horizon-blend': 0.1
            });
        });

        // Dedicated handler for Layers - waits for style to be ready
        map.current.on('style.load', async () => {
            console.log("Style loaded - Initializing LayerManager...");

            // Arctic Circle Layer (Permanent)
            if (!map.current.getSource('arctic_circle')) {
                map.current.addSource('arctic_circle', {
                    type: 'geojson',
                    data: arcticCircleData
                });

                map.current.addLayer({
                    id: 'arctic_circle',
                    type: 'line',
                    source: 'arctic_circle',
                    paint: {
                        'line-color': '#b3e5fc', // Light blue/cyan
                        'line-width': 1.5,
                        'line-dasharray': [4, 2],
                        'line-opacity': 0.6
                    }
                });

                map.current.addLayer({
                    id: 'arctic_circle-label',
                    type: 'symbol',
                    source: 'arctic_circle',
                    layout: {
                        'symbol-placement': 'line',
                        'text-field': 'Arctic Circle',
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-size': 12,
                        'text-letter-spacing': 0.1,
                        'text-max-angle': 30
                    },
                    paint: {
                        'text-color': '#b3e5fc',
                        'text-opacity': 0.8,
                        'text-halo-color': '#000',
                        'text-halo-width': 1
                    }
                });
            }

            // Load Custom Icons
            const icons = [
                { id: 'land', url: '/icons/military-land.svg' },
                { id: 'air', url: '/icons/military-air.svg' },
                { id: 'sea', url: '/icons/military-sea.svg' },
                { id: 'space', url: '/icons/military-space.svg' },
                { id: 'joint', url: '/icons/military-joint.svg' }
            ];

            await Promise.all(icons.map(icon => {
                return new Promise((resolve, reject) => {
                    map.current.loadImage(icon.url, (error, image) => {
                        if (error) {
                            console.error(`Failed to load icon ${icon.id}:`, error);
                            resolve(); // Continue anyway
                        } else {
                            if (!map.current.hasImage(icon.id)) {
                                map.current.addImage(icon.id, image);
                            }
                            resolve();
                        }
                    });
                });
            }));

            // Prevent re-initialization if already done
            if (layerManager.current) return;

            // 3. Initialize LayerManager
            try {
                console.log("Initializing LayerManager...");
                layerManager.current = new LayerManager(map.current);
                console.log("LayerManager instance created", layerManager.current);

                await layerManager.current.init();
                console.log("LayerManager init() complete");

                // Add actual layers (styling)
                Object.values(LAYER_GROUPS).flat().forEach(layer => {
                    if (!map.current) return;
                    if (map.current.getLayer(layer.id)) return; // Skip if exists

                    if (layer.type === 'circle') {
                        map.current.addLayer({
                            id: layer.id,
                            type: 'circle',
                            source: layer.id,
                            paint: {
                                'circle-radius': 8,
                                'circle-color': layer.color,
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#fff',
                                'circle-opacity': 0.8
                            }
                        });

                        // Add Labels for Circles
                        map.current.addLayer({
                            id: `${layer.id}-label`,
                            type: 'symbol',
                            source: layer.id,
                            layout: {
                                'text-field': ['get', 'name'],
                                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                                'text-size': 10,
                                'text-offset': [0, 1.5],
                                'text-anchor': 'top'
                            },
                            paint: {
                                'text-color': '#fff',
                                'text-halo-color': '#000',
                                'text-halo-width': 2
                            }
                        });
                    } else if (layer.type === 'symbol' && layer.id === 'bases') {
                        // Special handling for multi-icon bases
                        map.current.addLayer({
                            id: layer.id,
                            type: 'symbol',
                            source: layer.id,
                            layout: {
                                'icon-image': ['get', 'domain_icon'],
                                'icon-size': 0.8,
                                'icon-allow-overlap': true,
                                'text-field': ['get', 'facility_name'],
                                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                                'text-size': 11,
                                'text-offset': [0, 2],
                                'text-anchor': 'top'
                            },
                            paint: {
                                'text-color': '#ff2a6d',
                                'text-halo-color': '#000',
                                'text-halo-width': 1
                            }
                        });
                    } else if (layer.type === 'symbol') {
                        map.current.addLayer({
                            id: layer.id,
                            type: 'circle',
                            source: layer.id,
                            paint: {
                                'circle-radius': 12,
                                'circle-color': layer.color,
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#fff',
                                'circle-opacity': 0.6
                            }
                        });
                        map.current.addLayer({
                            id: `${layer.id}-label`,
                            type: 'symbol',
                            source: layer.id,
                            layout: {
                                'text-field': ['get', 'name'],
                                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                                'text-size': 12,
                                'text-offset': [0, 1.5],
                                'text-anchor': 'top'
                            },
                            paint: {
                                'text-color': '#ff2a6d',
                                'text-halo-color': '#000',
                                'text-halo-width': 1
                            }
                        });
                    } else if (layer.type === 'line') {
                        map.current.addLayer({
                            id: layer.id,
                            type: 'line',
                            source: layer.id,
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': layer.color,
                                'line-width': 2,
                                'line-dasharray': [2, 2]
                            }
                        });
                    }
                });

                // Set initial state
                if (activeTheatre) {
                    layerManager.current.setTheatre(activeTheatre);
                }

                // Keep interactive handlers...
                const interactiveLayers = ['ais', 'bases', 'mines'];

                // Cursor pointers
                map.current.on('mouseenter', interactiveLayers, () => {
                    map.current.getCanvas().style.cursor = 'pointer';
                });
                map.current.on('mouseleave', interactiveLayers, () => {
                    map.current.getCanvas().style.cursor = '';
                });

                // Popups
                map.current.on('click', interactiveLayers, (e) => {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const props = e.features[0].properties;

                    // Unified popup fields
                    const name = props.facility_name || props.name || 'Unknown Facility';
                    const country = props.country || 'Unknown';
                    const domain = props.domain || props.type || 'Unknown';
                    const info = props.information || props.description || 'No additional data available.';
                    const material = props.material && props.material !== 'N/A' ? props.material : null;

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    const content = `
                        <div class="text-black p-2 min-w-[200px]">
                            <h3 class="font-bold text-lg border-b pb-1 mb-2">${name}</h3>
                            <div class="grid grid-cols-2 gap-x-2 text-sm">
                                <span class="text-slate-500">Country:</span>
                                <span class="font-medium">${country}</span>
                                <span class="text-slate-500">Domain:</span>
                                <span class="font-medium text-emerald-600">${domain}</span>
                            </div>
                            ${material ? `
                            <div class="mt-2 text-xs bg-slate-100 p-1 rounded">
                                <span class="font-bold block uppercase text-[10px] text-slate-500">Assets</span>
                                ${material}
                            </div>` : ''}
                            <p class="text-sm mt-3 border-t pt-2 border-slate-100">${info}</p>
                        </div>
                    `;

                    new maplibregl.Popup({
                        closeButton: true,
                        closeOnClick: true,
                        className: 'intel-popup'
                    })
                        .setLngLat(coordinates)
                        .setHTML(content)
                        .addTo(map.current);
                });

            } catch (err) {
                console.error("LayerManager init failed:", err);
            }
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // React to theatre changes
    useEffect(() => {
        if (isLoaded && layerManager.current) {
            layerManager.current.setTheatre(activeTheatre);
        }
    }, [activeTheatre, isLoaded]);

    return (
        <div className="w-full h-full relative" style={{ height: '100vh', width: '100%' }}>
            <div ref={mapContainer} className="absolute inset-0" style={{ height: '100%', width: '100%' }} />
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-50">
                    <div className="animate-pulse">Loading Arctic Intel...</div>
                </div>
            )}
        </div>
    );

};

export default Map;

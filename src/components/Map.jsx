import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import LayerManager, { LAYER_GROUPS, THEATRES } from '../services/LayerManager';

// Arctic Circle Data
import arcticCircleData from '../data/arctic_circle.json';

const Map = ({ activeTheatre, missileTrajectories = [] }) => {
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
            console.log('MapLibre Object:', maplibregl);
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
            if (map.current.setFog) {
                map.current.setFog({
                    'range': [0.5, 10],
                    'color': '#05080a', // Matches --bg-space
                    'horizon-blend': 0.1
                });
            } else {
                console.warn('MapLibre setFog not supported');
            }

            // Add 3D Terrain
            /*
            // Demo tiles might be unstable, keep disabled if 404s persist
             try {
                map.current.addSource('terrain', {
                    type: 'raster-dem',
                    url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
                    tileSize: 256
                });
                map.current.setTerrain({ source: 'terrain', exaggeration: 1.5 });
            } catch (err) {
                 console.warn("Terrain source failed", err);
            }
            */
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

            // Missile Trajectories Source
            if (!map.current.getSource('missile_trajectories')) {
                map.current.addSource('missile_trajectories', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                // The "Shadow" line (Flat on the surface)
                map.current.addLayer({
                    id: 'missile_shadow',
                    type: 'line',
                    source: 'missile_trajectories',
                    paint: {
                        'line-color': '#000',
                        'line-width': 1.5,
                        'line-opacity': 0.3,
                        'line-dasharray': [2, 2]
                    }
                });

                // The "Heat" under-glow
                map.current.addLayer({
                    id: 'missile_heat',
                    type: 'line',
                    source: 'missile_trajectories',
                    paint: {
                        'line-color': '#ff4400',
                        'line-width': 12,
                        'line-blur': 15,
                        'line-opacity': 0.6
                    }
                });

                // The primary projectile line (Brighter, simulate height)
                map.current.addLayer({
                    id: 'missile_line',
                    type: 'line',
                    source: 'missile_trajectories',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#ff0000',
                        'line-width': 5,
                        'line-blur': 0,
                        'line-opacity': 1,
                        'line-gradient': [
                            'interpolate',
                            ['linear'],
                            ['line-progress'],
                            0, 'rgba(255, 0, 0, 0.5)',
                            0.1, 'rgba(255, 80, 80, 1)',
                            0.5, 'rgba(255, 150, 150, 1)',
                            0.9, 'rgba(255, 80, 80, 1)',
                            1, 'rgba(255, 0, 0, 0.5)'
                        ]
                    }
                });

                // The Neon Core (Thin white highlight)
                map.current.addLayer({
                    id: 'missile_core',
                    type: 'line',
                    source: 'missile_trajectories',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#ffffff',
                        'line-width': 1.5,
                        'line-opacity': 0.8
                    }
                });

                // Add a source for the animated projectiles
                if (!map.current.getSource('missile_projectiles')) {
                    map.current.addSource('missile_projectiles', {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: [] }
                    });

                    map.current.addLayer({
                        id: 'missile_points',
                        type: 'circle',
                        source: 'missile_projectiles',
                        paint: {
                            'circle-radius': [
                                'interpolate', ['linear'], ['get', 'progress_sine'],
                                0, 2,
                                0.5, 6,
                                1, 2
                            ],
                            'circle-color': '#fff',
                            'circle-opacity': 0.8,
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#ffcc00',
                            'circle-blur': 0.5
                        }
                    });
                }
            }

            // Load Custom Icons
            const icons = [
                { id: 'land', url: '/icons/military-land.svg' },
                { id: 'air', url: '/icons/military-air.svg' },
                { id: 'sea', url: '/icons/military-sea.svg' },
                { id: 'space', url: '/icons/military-space.svg' },
                { id: 'joint', url: '/icons/military-joint.svg' }
            ];

            // Custom robust image loader
            const loadIcon = (id, url) => {
                return new Promise((resolve) => {
                    const img = new Image(32, 32);
                    img.onload = () => {
                        if (!map.current) return;
                        if (!map.current.hasImage(id)) {
                            map.current.addImage(id, img);
                            console.log(`Successfully loaded icon: ${id}`);
                        }
                        resolve(true);
                    };
                    img.onerror = (e) => {
                        console.error(`Failed to load icon image ${id}:`, e);
                        resolve(false);
                    };
                    img.crossOrigin = "Anonymous";
                    img.src = url;
                });
            };

            // Load all icons in parallel
            await Promise.all(icons.map(icon => loadIcon(icon.id, icon.url)));

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
                                'text-color': [
                                    'match',
                                    ['get', 'country'],
                                    'Russia', '#ff3333', // Darker Red for Russia
                                    '#3388ff'  // Darker Blue for others
                                ],
                                'text-halo-color': '#000',
                                'text-halo-width': 2
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

                        // Add Labels for Strategic Lines
                        map.current.addLayer({
                            id: `${layer.id}-label`,
                            type: 'symbol',
                            source: layer.id,
                            layout: {
                                'symbol-placement': 'line',
                                'text-field': ['get', 'name'],
                                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                                'text-size': 11,
                                'text-letter-spacing': 0.1,
                                'text-max-angle': 30,
                                'text-padding': 10
                            },
                            paint: {
                                'text-color': layer.color,
                                'text-opacity': 0.9,
                                'text-halo-color': '#000',
                                'text-halo-width': 1.5
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
                        <div class="text-slate-200 p-2 min-w-[200px]">
                            <h3 class="font-bold text-lg border-b border-slate-700 pb-1 mb-2 text-white">${name}</h3>
                            <div class="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
                                <span class="text-slate-400">Country:</span>
                                <span class="font-medium text-slate-100">${country}</span>
                                <span class="text-slate-400">Domain:</span>
                                <span class="font-medium text-neon-blue">${domain}</span>
                            </div>
                            ${material ? `
                            <div class="mt-3 text-xs bg-slate-800/50 border border-slate-700/50 p-2 rounded">
                                <span class="font-bold block uppercase text-[10px] text-slate-400 mb-1">Assets</span>
                                <span class="text-slate-200">${material}</span>
                            </div>` : ''}
                            <p class="text-sm mt-3 border-t border-slate-700 pt-2 text-slate-300 italic">${info}</p>
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

            // Ensure missile simulation layers are only visible in STRATEGIC theatre
            const missileLayerIds = ['missile_shadow', 'missile_heat', 'missile_line', 'missile_core', 'missile_points'];
            const visibility = activeTheatre === THEATRES.STRATEGIC ? 'visible' : 'none';

            missileLayerIds.forEach(id => {
                if (map.current.getLayer(id)) {
                    map.current.setLayoutProperty(id, 'visibility', visibility);
                }
            });
        }
    }, [activeTheatre, isLoaded]);

    // React to missile trajectories
    useEffect(() => {
        if (isLoaded && map.current && map.current.getSource('missile_trajectories')) {
            map.current.getSource('missile_trajectories').setData({
                type: 'FeatureCollection',
                features: missileTrajectories
            });

            // Start animation for projectiles
            if (missileTrajectories.length > 0) {
                let start = null;
                const duration = 5000; // 5 seconds for full flight

                const animate = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = (timestamp - start) / duration;

                    if (progress <= 1) {
                        const projectileFeatures = missileTrajectories.map(f => {
                            const coords = f.geometry.coordinates;
                            const index = Math.floor(Math.min(progress, 0.99) * coords.length);
                            const point = coords[index];

                            // Progress sine for scaling (0 at ends, 1 at middle)
                            const progress_sine = Math.sin(progress * Math.PI);

                            return {
                                type: 'Feature',
                                geometry: { type: 'Point', coordinates: point },
                                properties: { progress_sine }
                            };
                        });

                        if (map.current.getSource('missile_projectiles')) {
                            map.current.getSource('missile_projectiles').setData({
                                type: 'FeatureCollection',
                                features: projectileFeatures
                            });
                        }
                        requestAnimationFrame(animate);
                    } else {
                        // Reset or leave at targets? Let's clear projectiles when done
                        if (map.current.getSource('missile_projectiles')) {
                            map.current.getSource('missile_projectiles').setData({
                                type: 'FeatureCollection',
                                features: []
                            });
                        }
                    }
                };

                requestAnimationFrame(animate);
            }
        }
    }, [missileTrajectories, isLoaded]);

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

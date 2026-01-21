
/**
 * LayerManager Service
 * Handles the configuration and state of map layers (Resource, Strategic, Maritime).
 */
export const THEATRES = {
    RESOURCE: 'resource',
    STRATEGIC: 'strategic',
    MARITIME: 'maritime'
};

export const LAYER_GROUPS = {
    [THEATRES.RESOURCE]: [
        { id: 'mines', name: 'Strategic Mines', type: 'circle', color: '#ffd700' },
        { id: 'greenland_resources', name: 'Greenland Critical Minerals', type: 'circle', color: '#9d4edd' },
        { id: 'relief', name: 'Global Relief', type: 'hillshade' }
    ],
    [THEATRES.STRATEGIC]: [
        { id: 'bases', name: 'Military Bases', type: 'symbol', color: '#ff2a6d' },
        { id: 'giuk', name: 'GIUK Gap', type: 'line', color: '#3388ff' },
        { id: 'bastion', name: 'Bear Gap', type: 'line', color: '#ff3333' }
    ],
    [THEATRES.MARITIME]: [
        { id: 'ais', name: 'Live Shipping (AIS)', type: 'circle', color: '#00ff00' },
        { id: 'ice', name: 'Ice Extent', type: 'fill', color: '#ffffff' },
        { id: 'eez', name: 'EEZ Boundaries', type: 'line', color: '#4a7072ff' },
        { id: 'shipping_routes', name: 'Arctic Shipping Routes', type: 'line', color: '#ffaa00' }
    ]
};

class LayerManager {
    constructor(map) {
        this.map = map;
        this.activeLayers = new Set();
    }

    async init() {
        // Initialize empty sources for all defined layers
        Object.values(LAYER_GROUPS).flat().forEach(layer => {
            if (layer.type === 'hillshade') return; // Hillshade uses a shared source defined in Map.jsx
            if (!this.map.getSource(layer.id)) {
                this.map.addSource(layer.id, {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] } // Empty initial data
                });
                console.log(`Initialized empty source: ${layer.id}`);
            }
        });

        // Load static data
        try {
            const minesData = await import('../data/mines.json');
            this.updateSource('mines', minesData.default || minesData);

            // Load Greenland Resources
            const greenlandData = await import('../data/greenland_resources.json');
            this.updateSource('greenland_resources', greenlandData.default || greenlandData);

            // Load the new expanded military bases data
            const militaryBases = await import('../data/militarybases.json');
            const baseData = militaryBases.default || militaryBases;
            console.log(`Loaded ${baseData.length} military bases`);

            const baseGeoJSON = this.convertToGeoJSON(baseData);
            this.updateSource('bases', baseGeoJSON);
            console.log('Military bases source updated with features:', baseGeoJSON.features.length);

            const eezData = await import('../data/eez.json');
            this.updateSource('eez', eezData.default || eezData);

            const strategicData = await import('../data/strategic_lines.json');
            const data = strategicData.default || strategicData;

            // Extract GIUK and Bastion from the collection
            const giukFeature = data.features.find(f => f.properties.id === 'giuk');
            const bastionFeature = data.features.find(f => f.properties.id === 'bastion');

            if (giukFeature) {
                this.updateSource('giuk', { type: 'FeatureCollection', features: [giukFeature] });
            }
            if (bastionFeature) {
                this.updateSource('bastion', { type: 'FeatureCollection', features: [bastionFeature] });
            }

            // Load Arctic Shipping Routes (Northwest Passage, Northern Sea Route, Transpolar)
            const shippingData = await import('../data/shipping_routes.json');
            this.updateSource('shipping_routes', shippingData.default || shippingData);
            console.log('Shipping routes loaded');

        } catch (e) {
            console.error("Failed to load static layer data", e);
        }
    }

    /**
     * Converts raw JSON base data to GeoJSON FeatureCollection
     */
    convertToGeoJSON(data) {
        if (!data || !Array.isArray(data)) return { type: 'FeatureCollection', features: [] };

        const features = data.map(base => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [base.longitude, base.latitude]
            },
            properties: {
                ...base,
                // Map domains to icon categories
                domain_icon: this.normalizeDomain(base.domain)
            }
        }));

        return {
            type: 'FeatureCollection',
            features
        };
    }

    /**
     * Maps domain strings to specific icon names
     */
    /**
     * Maps domain strings to specific icon names
     */
    normalizeDomain(domain = '') {
        const d = String(domain).toLowerCase().trim();

        // Complex/Joint domains
        if (d.includes('/') || d.includes(',') || d === 'hybrid' || d.includes('joint')) return 'joint';

        // Specific domains
        if (d.includes('land')) return 'land';
        if (d.includes('air')) return 'air';
        if (d.includes('sea') || d.includes('naval') || d.includes('maritime')) return 'sea';
        if (d.includes('space')) return 'space';

        // Fallback
        console.warn(`Unmapped domain: "${domain}", falling back to joint`);
        return 'joint';
    }

    toggleLayer(layerId, visible) {
        if (visible) {
            this.map.setLayoutProperty(layerId, 'visibility', 'visible');
            this.activeLayers.add(layerId);
        } else {
            this.map.setLayoutProperty(layerId, 'visibility', 'none');
            this.activeLayers.delete(layerId);
        }
    }

    // Method to update data for a specific source
    updateSource(sourceId, geojsonData) {
        const source = this.map.getSource(sourceId);
        if (source) {
            source.setData(geojsonData);
        }
    }

    setTheatre(theatre) {
        // Hide all layers first (including label layers)
        Object.values(LAYER_GROUPS).flat().forEach(layer => {
            if (this.map.getLayer(layer.id)) {
                this.map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
            // Also hide any associated label layers
            const labelLayerId = `${layer.id}-label`;
            if (this.map.getLayer(labelLayerId)) {
                this.map.setLayoutProperty(labelLayerId, 'visibility', 'none');
            }
        });

        // Enable layers for the active theatre
        const theatreLayers = LAYER_GROUPS[theatre] || [];
        theatreLayers.forEach(layer => {
            if (this.map.getLayer(layer.id)) {
                this.map.setLayoutProperty(layer.id, 'visibility', 'visible');
            }
            // Also show any associated label layers
            const labelLayerId = `${layer.id}-label`;
            if (this.map.getLayer(labelLayerId)) {
                this.map.setLayoutProperty(labelLayerId, 'visibility', 'visible');
            }
        });
        // Note: AIS is now controlled via toggleAIS() method, not automatically by theatre switch
    }

    // Explicit AIS toggle control (independent of theatre)
    async toggleAIS(enabled, filters = {}) {
        if (enabled) {
            if (!this.aisTracker) {
                const module = await import('./AISTracker');
                const AISTracker = module.default;
                this.aisTracker = new AISTracker(this.map, 'ais');
            }
            // Update filters and start
            this.aisTracker.setFilters(filters);
            this.aisTracker.start();
            console.log('AIS Tracker: Started with filters', filters);
        } else {
            if (this.aisTracker) {
                this.aisTracker.stop();
                console.log('AIS Tracker: Stopped');
            }
        }
    }
}

export default LayerManager;

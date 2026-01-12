import vesselRegistry from '../data/vessels.json';

/**
 * AISTracker Service
 * Simulates real-time vessel positions for the Maritime Theatre.
 * In production, this would poll the API defined in .env
 */
export default class AISTracker {
    constructor(map, sourceId) {
        this.map = map;
        this.sourceId = sourceId;
        this.interval = null;
        this.ships = this.loadShipsFromRegistry();
    }

    loadShipsFromRegistry() {
        const ships = [];
        let idCounter = 0;

        vesselRegistry.vessel_registry.forEach(category => {
            category.vessels.forEach(vessel => {
                ships.push({
                    id: idCounter++,
                    // Random start positions along Polar Route (approximate lat/lons)
                    lat: 65 + Math.random() * 20,
                    lon: -180 + Math.random() * 360,
                    bearing: Math.random() * 360,
                    speed: 0.1 + Math.random() * 0.4, // Keep it slow for visualization
                    name: vessel.name,
                    type: vessel.role || vessel.class, // Fallback to class if role is missing
                    flag: vessel.flag,
                    category: category.category,
                    status: vessel.status
                });
            });
        });
        return ships;
    }

    start() {
        if (this.interval) return;

        // Update ship positions every second
        this.interval = setInterval(() => {
            this.updatePositions();
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    updatePositions() {
        // Simple movement logic
        this.ships = this.ships.map(ship => {
            let newLon = ship.lon + (Math.cos(ship.bearing * Math.PI / 180) * ship.speed);
            let newLat = ship.lat + (Math.sin(ship.bearing * Math.PI / 180) * ship.speed);

            // Bounce off "walls" (rough arctic bounds)
            if (newLat > 88 || newLat < 60) ship.bearing = (ship.bearing + 180) % 360;

            return {
                ...ship,
                lon: newLon,
                lat: newLat
            };
        });

        // Convert to GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: this.ships.map(ship => ({
                type: 'Feature',
                properties: {
                    id: ship.id,
                    name: ship.name,
                    type: ship.type,
                    speed: ship.speed,
                    flag: ship.flag,
                    category: ship.category,
                    status: ship.status
                },
                geometry: {
                    type: 'Point',
                    coordinates: [ship.lon, ship.lat]
                }
            }))
        };

        const source = this.map.getSource(this.sourceId);
        if (source) {
            source.setData(geojson);
        }
    }
}

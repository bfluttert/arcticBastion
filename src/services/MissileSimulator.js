/**
 * MissileSimulator Service
 * Handles Great Circle path calculations and target data for missile simulations.
 */

export const LAUNCH_SITES = {
    RUSSIA: [
        { name: 'Moscow', coords: [37.6173, 55.7558], country: 'Russia' },
        { name: 'Saint Petersburg', coords: [30.3351, 59.9343], country: 'Russia' },
        { name: 'Severomorsk', coords: [33.4167, 69.0667], country: 'Russia' },
        { name: 'Vladivostok', coords: [131.8867, 43.1150], country: 'Russia' },
        { name: 'Novosibirsk', coords: [82.9346, 55.0084], country: 'Russia' }
    ],
    NATO: [
        { name: 'Washington D.C.', coords: [-77.0369, 38.9072], country: 'USA' },
        { name: 'New York', coords: [-74.0060, 40.7128], country: 'USA' },
        { name: 'Ottawa', coords: [-75.6972, 45.4215], country: 'Canada' },
        { name: 'Toronto', coords: [-79.3832, 43.6532], country: 'Canada' },
        { name: 'London', coords: [-0.1278, 51.5074], country: 'UK' },
        { name: 'Paris', coords: [2.3522, 48.8566], country: 'France' },
        { name: 'Berlin', coords: [13.4050, 52.5200], country: 'Germany' },
        { name: 'Amsterdam', coords: [4.9041, 52.3676], country: 'Netherlands' },
        { name: 'Rotterdam', coords: [4.4777, 51.9225], country: 'Netherlands' },
        { name: 'Rome', coords: [12.4964, 41.9028], country: 'Italy' }
    ]
};

class MissileSimulator {
    /**
     * Calculates points along a Great Circle (Geodesic) path.
     * Uses the Haversine formula approach to find intermediate points.
     */
    static calculateGreatCircle(start, end, points = 100) {
        const coords = [];
        const startLat = (start[1] * Math.PI) / 180;
        const startLng = (start[0] * Math.PI) / 180;
        const endLat = (end[1] * Math.PI) / 180;
        const endLng = (end[0] * Math.PI) / 180;

        const d = 2 * Math.asin(Math.sqrt(
            Math.pow(Math.sin((startLat - endLat) / 2), 2) +
            Math.cos(startLat) * Math.cos(endLat) * Math.pow(Math.sin((startLng - endLng) / 2), 2)
        ));

        for (let i = 0; i <= points; i++) {
            const f = i / points;
            const A = Math.sin((1 - f) * d) / Math.sin(d);
            const B = Math.sin(f * d) / Math.sin(d);
            const x = A * Math.cos(startLat) * Math.cos(startLng) + B * Math.cos(endLat) * Math.cos(endLng);
            const y = A * Math.cos(startLat) * Math.sin(startLng) + B * Math.cos(endLat) * Math.sin(endLng);
            const z = A * Math.sin(startLat) + B * Math.sin(endLat);
            const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
            const lng = Math.atan2(y, x);
            coords.push([(lng * 180) / Math.PI, (lat * 180) / Math.PI]);
        }
        return coords;
    }

    /**
     * Generates a GeoJSON LineString with a simulated 3D arc effect.
     * In MapLibre, we can't do true 3D lines easily without custom layers,
     * so we animate the opacity or width along the path.
     */
    static createTrajectory(start, end) {
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: this.calculateGreatCircle(start, end)
            },
            properties: {
                timestamp: Date.now()
            }
        };
    }
}

export default MissileSimulator;

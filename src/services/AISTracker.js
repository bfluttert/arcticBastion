// Verified AIS Tracker with WebSocket
import vesselRegistry from '../data/vessels.json';

/**
 * AISTracker Service
 * Tracks real-time vessel positions from AISStream API.
 * Filters to only show vessels from vessels.json watchlist.
 */
export default class AISTracker {
    constructor(map, sourceId) {
        this.map = map;
        this.sourceId = sourceId;
        this.socket = null;
        this.ships = new Map(); // Store latest state by MMSI
        this.updateInterval = null;

        // Filter settings (can be updated via setFilters)
        this.filters = {
            watchlistOnly: true,
            arcticOnly: true  // 66°N and above
        };

        // Build MMSI watchlist from vessels.json
        this.watchlistMmsi = new Set();
        vesselRegistry.vessel_registry.forEach(category => {
            category.vessels.forEach(vessel => {
                if (vessel.mmsi && vessel.mmsi !== '0' && vessel.mmsi !== 'N/A') {
                    this.watchlistMmsi.add(vessel.mmsi);
                }
            });
        });
        console.log(`AIS Tracker: Watching ${this.watchlistMmsi.size} vessels from registry`);
    }

    setFilters(filters) {
        const oldFilters = { ...this.filters };
        this.filters = { ...this.filters, ...filters };
        console.log('AIS Tracker: Filters updated', this.filters);

        // If watchlist filter changed, re-filter existing ships
        if (oldFilters.watchlistOnly !== this.filters.watchlistOnly) {
            if (this.filters.watchlistOnly) {
                // Remove ships not in watchlist
                for (const [mmsi, ship] of this.ships.entries()) {
                    if (!this.watchlistMmsi.has(mmsi)) {
                        this.ships.delete(mmsi);
                    }
                }
            }
            // Re-render immediately
            this.render();
        }
    }

    start() {
        if (this.socket) return;

        const url = import.meta.env.VITE_AIS_STREAM_URL || import.meta.env.VITE_AIStreamURL; // Try both
        const token = import.meta.env.VITE_AIS_API_KEY;

        if (!url) {
            console.error("AIS Tracker: Missing VITE_AIS_STREAM_URL in .env");
            return;
        }

        console.log(`Connecting to AIS Stream: ${url}`);

        // Use local proxy in DEV mode to bypass CORS
        // In production, you'd need a backend proxy or if the API supports it, direct connection
        const isDev = import.meta.env.DEV;
        const connectionUrl = isDev
            ? `ws://${window.location.host}/ais-stream`
            : url;

        console.log(`Connecting to AIS Stream via: ${connectionUrl}`);

        try {
            this.socket = new WebSocket(connectionUrl);

            this.socket.onopen = () => {
                console.log("AIS WebSocket Connected. Sending subscription...");

                // Construct subscription message for aisstream.io
                // Use 66°N (Arctic Circle) as minimum latitude when arcticOnly is enabled
                const minLat = this.filters.arcticOnly ? 66 : 0;
                const subscription = {
                    APIKey: token,
                    BoundingBoxes: [
                        [
                            [minLat, -180], // Top-Left (min latitude)
                            [90, 180]       // Bottom-Right (max latitude = North Pole)
                        ]
                    ],
                    FilterMessageTypes: ["PositionReport", "ShipStaticData"] // Subscribe to both
                };
                console.log(`AIS: Subscribing with bounding box ${minLat}°N to 90°N`);

                this.socket.send(JSON.stringify(subscription));
            };

            this.socket.onmessage = async (event) => {
                try {
                    // In browser, data may arrive as Blob. Convert to text first.
                    const text = event.data instanceof Blob
                        ? await event.data.text()
                        : event.data;
                    const response = JSON.parse(text);
                    const msgType = response.MessageType;

                    if (msgType === "ShipStaticData") {
                        const report = response.Message.ShipStaticData;
                        const mmsi = report.UserID;

                        // Update static data cache
                        const existing = this.ships.get(mmsi) || {};
                        this.ships.set(mmsi, {
                            ...existing,
                            id: mmsi,
                            mmsi: mmsi,
                            name: report.Name,
                            type: report.Type,
                            callsign: report.CallSign,
                            imo: report.ImoNumber,
                            dimA: report.DimensionA,
                            dimB: report.DimensionB,
                            timestamp: Date.now()
                        });

                    } else if (msgType === "PositionReport") {
                        const report = response.Message.PositionReport;
                        const meta = response.MetaData;
                        const mmsi = String(report.UserID);

                        // Apply watchlist filter if enabled
                        if (this.filters.watchlistOnly && !this.watchlistMmsi.has(mmsi)) {
                            return; // Skip vessels not in watchlist
                        }

                        const existing = this.ships.get(mmsi) || {
                            id: mmsi,
                            mmsi: mmsi,
                            name: meta.ShipName || `Vessel ${mmsi}`, // Fallback to metadata name
                            type: 'Unknown'
                        };

                        this.ships.set(mmsi, {
                            ...existing,
                            lat: report.Latitude,
                            lon: report.Longitude,
                            speed: report.Sog,
                            heading: report.TrueHeading,
                            navStatus: report.NavigationalStatus,
                            flag_country: meta.flag_country, // Meta often has this
                            timestamp: Date.now()
                        });
                    }
                } catch (e) {
                    console.error("Error parsing AIS message", e);
                }
            };

            this.socket.onerror = (error) => {
                console.error("AIS WebSocket Error:", error);
            };

            this.socket.onclose = () => {
                console.log("AIS WebSocket Closed");
                this.socket = null;
            };

            // Start render loop
            this.updateInterval = setInterval(() => this.render(), 2000); // Update map every 2s

        } catch (err) {
            console.error("Failed to initialize WebSocket", err);
        }
    }

    handleMessage(data) {
        // Handle single object or array
        const items = Array.isArray(data) ? data : [data];

        items.forEach(msg => {
            if (msg.mmsi && msg.lat && msg.lon) {
                this.ships.set(msg.mmsi, {
                    id: msg.mmsi,
                    name: msg.name || `Vessel ${msg.mmsi}`,
                    type: msg.type || 'Unknown',
                    flag: msg.flag_country || 'Unknown',
                    lat: parseFloat(msg.lat),
                    lon: parseFloat(msg.lon),
                    speed: msg.speed,
                    heading: msg.heading,
                    timestamp: Date.now()
                });
            }
        });
    }

    render() {
        if (!this.map || !this.map.getSource(this.sourceId)) return;

        // Convert Map values to GeoJSON features
        const features = Array.from(this.ships.values()).map(ship => ({
            type: 'Feature',
            properties: {
                id: ship.id,
                name: ship.name,
                type: ship.type,
                flag: ship.flag,
                speed: ship.speed,
                heading: ship.heading
            },
            geometry: {
                type: 'Point',
                coordinates: [ship.lon, ship.lat]
            }
        }));

        const geojson = {
            type: 'FeatureCollection',
            features
        };

        const source = this.map.getSource(this.sourceId);
        if (source) {
            source.setData(geojson);
        }
    }

    stop() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        // Clear ships from memory and map
        this.ships.clear();
        if (this.map) {
            const source = this.map.getSource(this.sourceId);
            if (source) {
                source.setData({ type: 'FeatureCollection', features: [] });
            }
        }
    }
}

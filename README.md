# Arctic Bastion 🧊

An interactive geopolitical visualization platform for the Arctic region, built with React and MapLibre GL. Explore strategic military positions, resource extraction sites, shipping routes, and real-time maritime traffic in the Arctic.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![MapLibre](https://img.shields.io/badge/MapLibre_GL-5-green)

## Features

### 🗺️ Theatre-Based Visualization

Switch between three operational views:

| Theatre | Layers |
|---------|--------|
| **Resource** | Strategic mines, Greenland critical minerals, terrain relief |
| **Strategic** | Military bases (air/land/sea/space), GIUK Gap, Bear Gap |
| **Maritime** | Live AIS shipping, sea ice extent, EEZ boundaries, Arctic shipping routes |

### 🎯 Key Capabilities

- **Live AIS Tracking** - Real-time vessel positions via AISStream WebSocket API
- **Sea Ice Analysis** - Historical ice extent visualization with year selection
- **Military Base Mapping** - 50+ Arctic bases with domain-specific icons
- **Missile Simulator** - Trajectory modeling for strategic analysis
- **Icebreaker Overview** - Fleet status dashboard

## Tech Stack

- **Frontend**: React 19, Vite 7
- **Mapping**: MapLibre GL JS
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React, custom SVG military icons
- **Data**: GeoJSON, WMS/WMTS services

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/bfluttert/arcticBastion.git
cd arcticBastion

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your API keys (e.g., AISStream API key)

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
arcticBastion/
├── public/
│   ├── icons/           # Military domain icons (air, land, sea, space, joint)
│   └── data/            # Static assets
├── scripts/             # Utility scripts
│   ├── ais_stream.js    # AIS WebSocket testing
│   ├── validate_bases.js # Data validation
│   ├── download_sea_ice.py
│   └── process_sea_ice.py
├── src/
│   ├── components/
│   │   ├── Map.jsx         # Main MapLibre map component
│   │   ├── SeaIceLayer.jsx # Sea ice visualization
│   │   ├── SeaIceModal.jsx # Ice analysis controls
│   │   ├── IcebreakerOverview.jsx
│   │   └── MissileControl.jsx
│   ├── services/
│   │   ├── LayerManager.js  # Theatre & layer state management
│   │   ├── AISTracker.js    # Live vessel tracking
│   │   └── MissileSimulator.js
│   ├── data/               # GeoJSON datasets
│   │   ├── militarybases.json
│   │   ├── shipping_routes.json
│   │   ├── eez.json
│   │   ├── mines.json
│   │   └── greenland_resources.json
│   ├── App.jsx
│   └── main.jsx
├── .env.example
└── package.json
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_AIS_API_KEY` | AISStream.io API key for live vessel data |

## Data Sources

- **Military Bases**: Curated dataset of Arctic installations
- **EEZ Boundaries**: Marine Regions / Marineregions.org
- **Shipping Routes**: Northwest Passage, Northern Sea Route, Transpolar
- **Sea Ice**: NSIDC / Copernicus Marine Service
- **Terrain**: MapLibre terrain tiles

## Scripts

Utility scripts in the `scripts/` folder:

| Script | Purpose |
|--------|---------|
| `validate_bases.js` | Validate military bases JSON structure |
| `download_sea_ice.py` | Download NSIDC sea ice shapefiles |
| `process_sea_ice.py` | Convert shapefiles to web format |
| `ais_stream.js` | Test AIS WebSocket connection |

## License

MIT

## Contributing

Pull requests welcome! Please ensure code passes `npm run lint` before submitting.

import requests

# Try multiple Copernicus Marine endpoints
endpoints = [
    # Main WMTS capabilities
    "https://wmts.marine.copernicus.eu/teroWmts?SERVICE=WMTS&version=1.0.0&request=GetCapabilities",
    # OSI-SAF sea ice (alternative format)
    "https://wmts.marine.copernicus.eu/teroWmts/SEAICE_GLO_SEAICE_L4_NRT_OBSERVATIONS_011_001?SERVICE=WMTS&version=1.0.0&request=GetCapabilities",
    # Simple WMS check
    "https://nrt.cmems-du.eu/thredds/wms/SEAICE_GLO_SEAICE_L4_NRT_OBSERVATIONS_011_001?service=WMS&version=1.1.1&request=GetCapabilities",
]

for url in endpoints:
    print(f"\n--- Testing: {url[:80]}...")
    try:
        r = requests.get(url, timeout=10)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            if "Layer" in r.text or "TileMatrixSet" in r.text:
                print("Valid WMS/WMTS response detected!")
                # Save for inspection
                filename = f"test_response_{endpoints.index(url)}.xml"
                with open(filename, "w", encoding="utf-8") as f:
                    f.write(r.text)
                print(f"Saved to {filename}")
        else:
            print(f"Error response: {r.text[:200]}")
    except Exception as e:
        print(f"Exception: {e}")

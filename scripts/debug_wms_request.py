import requests
import sys

# A known valid tile URL from the debug page (Test 1)
url = "https://nsidc.org/api/mapservices/NSIDC/wms?bbox=-5009377.085697311,5009377.085697311,0,10018754.171394622&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=NSIDC:nsidc_0051_raster_n&styles=&time=2020-09-15"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

print(f"Attempting to fetch: {url}")
try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Response Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"Content-Length: {response.headers.get('Content-Length')}")
    
    if response.status_code == 200:
        if 'image' in response.headers.get('Content-Type', ''):
            print("Success! Received an image.")
            # Check if it's a valid PNG signature
            if response.content.startswith(b'\x89PNG'):
               print("Valid PNG signature detected.")
            else:
               print("WARNING: Content does not look like PNG header.")
               print(f"First 50 bytes: {response.content[:50]}")
        else:
            print("Received text/xml response:")
            print(response.text[:500])
    else:
        print("Request failed.")
        print(response.text[:500])

except Exception as e:
    print(f"EXCEPTION: {e}")

import requests

# Met.no OSISAF Northern Hemisphere Daily Ice Concentration
url = "https://thredds.met.no/thredds/wms/osisaf/met.no/ice/conc_nh_polstere-100_multi_latest.nc?service=WMS&version=1.3.0&request=GetCapabilities"

print(f"Fetching Capabilities from: {url}")
try:
    r = requests.get(url, timeout=10)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Success! Met.no is reachable.")
        # Print first few lines to find layer name
        print(r.text[:2000])
    else:
        print("Failed to reach Met.no")
except Exception as e:
    print(f"Error: {e}")

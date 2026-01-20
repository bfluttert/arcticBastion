import requests
from xml.etree import ElementTree

url = "https://nsidc.org/api/mapservices/NSIDC/wms?service=WMS&version=1.1.1&request=GetCapabilities"
print(f"Fetching {url}...")
try:
    r = requests.get(url, timeout=10)
    print(f"Status Code: {r.status_code}")
    
    if r.status_code == 200:
        root = ElementTree.fromstring(r.content)
        
        # Check SRS at root layer
        srs_list = [s.text for s in root.findall(".//SRS")]
        print(f"Total SRS found: {len(srs_list)}")
        
        # Check for 3857 or 900913 or 4326
        supported = []
        for s in srs_list:
            if s and ("3857" in s or "900913" in s or "4326" in s or "3413" in s):
                supported.append(s)
        
        print("Supported SRS of interest:", sorted(list(set(supported))))
        
        # Check Layer
        layers = root.findall(".//Layer")
        ice_layer = None
        for l in layers:
            name = l.find("Name")
            if name is not None and name.text == "NSIDC:nsidc_0051_raster_n":
                ice_layer = l
                break
        
        if ice_layer:
            print("Found Layer: NSIDC:nsidc_0051_raster_n")
            # Check SRS specifically for this layer if nested
            layer_srs = [s.text for s in ice_layer.findall("SRS")]
            print("Layer SRS:", sorted(list(set(layer_srs))))
        else:
            print("Layer NSIDC:nsidc_0051_raster_n NOT FOUND")

except Exception as e:
    print(f"Error: {e}")

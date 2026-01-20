import os
import requests
import time
from datetime import datetime

# Configuration
BASE_URL = "https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/shapefiles/shp_extent"
OUTPUT_DIR = os.path.join("data", "sea_ice", "raw")
YEAR_START = 1979
YEAR_END = datetime.now().year  # Current year

# Months to download: March (03) and September (09)
MONTHS = [
    {"num": "03", "name": "Mar"},
    {"num": "09", "name": "Sep"}
]

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def download_file(url, filepath):
    if os.path.exists(filepath):
        print(f"Skipping {filepath} (already exists)")
        return True
    
    print(f"Downloading {url}...")
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print("Done.")
            time.sleep(0.5) # Be nice to the server
            return True
        else:
            print(f"Failed to download: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    ensure_dir(OUTPUT_DIR)
    
    for year in range(YEAR_START, YEAR_END + 1):
        for month in MONTHS:
            # Construct URL
            # Example: .../09_Sep/extent_N_202309_polygon_v4.0.zip
            month_num = month["num"]
            month_name = month["name"]
            
            # v4.0 seems to be the current standard for the full record
            filename = f"extent_N_{year}{month_num}_polygon_v4.0.zip"
            url = f"{BASE_URL}/{month_num}_{month_name}/{filename}"
            
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            # Attempt download
            success = download_file(url, filepath)
            
            if not success:
                # Fallback check for v3.0 just in case, though v4.0 is expected
                filename_v3 = f"extent_N_{year}{month_num}_polygon_v3.0.zip"
                url_v3 = f"{BASE_URL}/{month_num}_{month_name}/{filename_v3}"
                # We won't try to download v3 automatically to avoid mess, but log it
                print(f"   -> Might try manual check for {url_v3}")

if __name__ == "__main__":
    main()

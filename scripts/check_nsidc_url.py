import requests

def check_url(year, month, month_name):
    base_url = "https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/shapefiles/shp_extent"
    # Try v4.0 pattern
    filename = f"extent_N_{year}{month}_polygon_v4.0.zip"
    url = f"{base_url}/{month}_{month_name}/{filename}"
    
    print(f"Checking {url}...")
    try:
        r = requests.head(url)
        if r.status_code == 200:
            print("Found (v4.0)!")
            return True
        else:
            print(f"Not found: {r.status_code}")
            # Try v3.0 just in case
            filename_v3 = f"extent_N_{year}{month}_polygon_v3.0.zip"
            url_v3 = f"{base_url}/{month}_{month_name}/{filename_v3}"
            print(f"Checking {url_v3}...")
            r3 = requests.head(url_v3)
            if r3.status_code == 200:
                print("Found (v3.0)!")
                return True
            else:
                print(f"Not found: {r3.status_code}")
                return False
    except Exception as e:
        print(f"Error: {e}")
        return False

# Check a recent one (2023 Sep)
check_url(2023, "09", "Sep")
# Check an old one (1980 Mar)
check_url(1980, "03", "Mar")

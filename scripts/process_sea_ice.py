import os
import glob
import pandas as pd
import geopandas as gpd
from shapely.geometry import shape, mapping

# Configuration
INPUT_DIR = os.path.join("data", "sea_ice", "raw")
OUTPUT_FILE = os.path.join("public", "data", "sea_ice_history.json")
TARGET_CRS = "EPSG:4326"
SIMPLIFY_TOLERANCE = 50000 # meters (Aggressive 50km simplification)
MIN_AREA_KM2 = 2500       # Filter out ice chunks smaller than typical counties

def process_files():
    print("Processing sea ice shapefiles...")
    
    zip_files = glob.glob(os.path.join(INPUT_DIR, "*.zip"))
    
    if not zip_files:
        print("No zip files found to process.")
        return

    all_features = []
    
    for zip_path in zip_files:
        try:
            filename = os.path.basename(zip_path)
            parts = filename.split('_')
            date_str = parts[2] # YYYYMM
            year = int(date_str[:4])
            month = int(date_str[4:6])
            
            print(f"p: {year}-{month}")
            
            # Read shapefile
            gdf = gpd.read_file(zip_path)
            
            # Reproject to projected CRS for accurate area/simplification
            if gdf.crs.is_geographic:
                gdf = gdf.to_crs("EPSG:3413")
            
            # Explode to single polygons (handle MultiPolygons)
            gdf = gdf.explode(index_parts=True)
            
            # Filter small islands (noise)
            # Area is in square meters (EPSG:3413)
            # 2500 km2 = 2,500,000,000 m2
            min_area_m2 = MIN_AREA_KM2 * 1_000_000
            gdf = gdf[gdf.geometry.area > min_area_m2]

            # Simplify geometry
            gdf.geometry = gdf.geometry.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)
            
            # Reproject to Web friendly Lat/Lon
            gdf = gdf.to_crs(TARGET_CRS)
            
            # Add metadata columns
            gdf["year"] = year
            gdf["month"] = month
            gdf["season"] = "winter" if month == 3 else "summer"
            
            columns_to_keep = ["year", "month", "season", "geometry"]
            gdf = gdf[columns_to_keep]
            
            all_features.append(gdf)
            
        except Exception as e:
            print(f"Error processing {zip_path}: {e}")

    if all_features:
        print("Merging all layers...")
        final_gdf = pd.concat(all_features, ignore_index=True)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        print(f"Saving to {OUTPUT_FILE}...")
        final_gdf.to_file(OUTPUT_FILE, driver="GeoJSON")
        print("Done.")
    else:
        print("No features extracted.")

if __name__ == "__main__":
    process_files()

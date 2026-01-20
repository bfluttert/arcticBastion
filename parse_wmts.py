import re

# Check the WMTS response for sea ice layers
with open('test_response_1.xml', 'r', encoding='utf-8') as f:
    content = f.read()

output = []

# Find all layer identifiers
layers = re.findall(r'<ows:Identifier>([^<]+)</ows:Identifier>', content)
output.append("=== Layers/Identifiers Found ===")
for layer in layers[:50]:
    if 'sic' in layer.lower() or 'ice' in layer.lower() or 'SEAICE' in layer:
        output.append(f"  ** {layer}")
    else:
        output.append(f"     {layer}")

# Find TileMatrixSet
tile_matrix_sets = re.findall(r'<TileMatrixSet>([^<]+)</TileMatrixSet>', content)
output.append("\n=== TileMatrixSets ===")
for tms in set(tile_matrix_sets):
    output.append(f"  {tms}")

# Find ResourceURL templates
templates = re.findall(r'<ResourceURL[^>]*template="([^"]+)"', content)
output.append("\n=== ResourceURL Templates (first 5) ===")
for t in templates[:5]:
    output.append(f"  {t}")

# Write output
with open('wmts_analysis.txt', 'w') as f:
    f.write('\n'.join(output))

print("Saved to wmts_analysis.txt")

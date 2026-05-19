# Working with Shapefiles and Boundaries in React Leaflet

## Converting Your SVG Path to GeoJSON

The SVG path you have contains pixel coordinates, not geographic coordinates. You need to convert it to GeoJSON format.

### Tools for Conversion:

**1. Shapefile to GeoJSON:**
- **mapshaper.org** (online, easiest)
  - Upload your `.shp` file (+ `.shx`, `.dbf`, `.prj` files)
  - Click "Export" → Choose "GeoJSON"
  - Download and save to your project

- **QGIS** (desktop app)
  - Open shapefile
  - Right-click layer → Export → Save Features As → GeoJSON

- **ogr2ogr** (command line)
  ```bash
  ogr2ogr -f GeoJSON output.geojson input.shp
  ```

**2. SVG to GeoJSON:**
If your SVG paths are georeferenced (have real coordinates), use:
- https://github.com/mapbox/togeojson
- Custom scripts to parse SVG path data

## Using GeoJSON in Your App

### Option 1: Import GeoJSON file directly
```typescript
import { GeoJSON } from 'react-leaflet'
import areasData from './data/areas.json'

<GeoJSON 
  data={areasData}
  style={{
    fillColor: "#bc955c",
    fillOpacity: 0.4,
    color: "#bc955c",
    weight: 3
  }}
/>
```

### Option 2: Load from public folder
1. Place your GeoJSON in `public/data/areas.geojson`
2. Fetch it:
```typescript
const [geoData, setGeoData] = useState(null)

useEffect(() => {
  fetch('/data/areas.geojson')
    .then(res => res.json())
    .then(data => setGeoData(data))
}, [])

{geoData && <GeoJSON data={geoData} />}
```

### Option 3: Define inline
```typescript
const areaData = {
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [-98.68, 20.29],  // [longitude, latitude]
      [-98.66, 20.29],
      [-98.66, 20.28],
      [-98.68, 20.28],
      [-98.68, 20.29]   // Close the polygon
    ]]
  }
}

<GeoJSON data={areaData} />
```

## GeoJSON Format

**Basic structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Area Name",
        "population": 10000,
        "color": "#FF5733"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-98.68, 20.29],
            [-98.66, 20.29],
            [-98.66, 20.28],
            [-98.68, 20.28],
            [-98.68, 20.29]
          ]
        ]
      }
    }
  ]
}
```

## Styling GeoJSON Layers

```typescript
<GeoJSON
  data={geoData}
  style={(feature) => ({
    fillColor: feature.properties.color || '#FF5733',
    fillOpacity: 0.3,
    color: '#bc955c',
    weight: 2
  })}
  onEachFeature={(feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(
        `<strong>${feature.properties.name}</strong><br/>
         Population: ${feature.properties.population}`
      )
    }
  }}
/>
```

## Finding Geographic Boundaries

**Official Sources:**
- **INEGI** (Mexico) - https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=889463807469
- **OpenStreetMap** - Download boundaries via Overpass API
- **Natural Earth Data** - https://www.naturalearthdata.com/
- **GADM** - https://gadm.org/ (Global administrative boundaries)

**For Mexican municipalities:**
```bash
# Example Overpass query for municipality boundaries
https://overpass-api.de/api/interpreter?data=[out:json];area[name="Hidalgo"];(relation(area)[admin_level=8];);out geom;
```

## Your SVG Path

The path you showed has these characteristics:
- `stroke="#bc955c"` - Golden/brown color
- `stroke-width="10"` - Thick border
- Pixel coordinates (needs georeferencing)

To use it, you need to:
1. Get the actual shapefile or GeoJSON for that area
2. Or manually trace the boundary using real coordinates
3. Or georeference the SVG if you know what area it represents

Would you like help setting up a specific Mexican municipality boundary?

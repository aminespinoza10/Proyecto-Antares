import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

function App() {
  // Map center position
  const center: [number, number] = [20.47634, -98.67460]
  const [geoJsonData, setGeoJsonData] = useState<any>(null)

  // Color mapping for each municipality
  const municipalityColors: { [key: string]: string } = {
    "Atotonilco el Grande": "#FF5733",      // Orange-red
    "Eloxochitlán": "#33FF57",              // Green
    "San Agustín Metzquititlán": "#3357FF", // Blue
    "Metztitlán": "#FF33F5",                // Magenta
    "Tulancingo de Bravo": "#FFD700"        // Gold
  }

  // Load GeoJSON file
  useEffect(() => {
    fetch('/data/hgomunicipal.geojson')
      .then(res => res.json())
      .then(data => {
        console.log('GeoJSON loaded:', data)
        setGeoJsonData(data)
      })
      .catch(err => console.error('Error loading GeoJSON:', err))
  }, [])
  
  const locations = [
    { 
      id: 1, 
      position: [20.28646, -98.66962] as [number, number], 
      title: "Location 1", 
      description: "Atotonilco El Grande", 
      color: "#FF5733",
      area: [
        [20.29, -98.68],
        [20.29, -98.66],
        [20.28, -98.66],
        [20.28, -98.68],
      ] as [number, number][]
    },
    { 
      id: 2, 
      position: [20.74466, -98.81117] as [number, number], 
      title: "Location 2", 
      description: "Eloxochitlán", 
      color: "#33FF57",
      area: [
        [20.75, -98.82],
        [20.75, -98.80],
        [20.74, -98.80],
        [20.74, -98.82],
      ] as [number, number][]
    },
    { 
      id: 3, 
      position: [20.53310, -98.63882] as [number, number], 
      title: "Location 3", 
      description: "San Agustín Metzquititlán", 
      color: "#3357FF",
      area: [
        [20.54, -98.65],
        [20.54, -98.63],
        [20.53, -98.63],
        [20.53, -98.65],
      ] as [number, number][]
    },
    { 
      id: 4, 
      position: [20.59517, -98.76329] as [number, number], 
      title: "Location 4", 
      description: "Meztitlan", 
      color: "#FF33F5",
      area: [
        [20.60, -98.77],
        [20.60, -98.75],
        [20.59, -98.75],
        [20.59, -98.77],
      ] as [number, number][]
    },
    { 
      id: 5, 
      position: [20.09325, -98.36189] as [number, number], 
      title: "Location 5", 
      description: "Antares", 
      color: "#FFD700",
      area: [
        [20.10, -98.37],
        [20.10, -98.35],
        [20.09, -98.35],
        [20.09, -98.37],
      ] as [number, number][]
    },
  ]

  return (
    <div className="fullscreen-map">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Municipal boundaries from GeoJSON */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={(feature) => {
              const municipalityName = feature?.properties?.NOMBRE || ''
              const color = municipalityColors[municipalityName] || '#bc955c'
              return {
                fillColor: color,
                fillOpacity: 0.2,
                color: color,
                weight: 2
              }
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const props = feature.properties
                const popupContent = `
                  <strong>${props.NOMGEO || props.name || 'Municipality'}</strong><br/>
                  ${props.CVE_MUN ? `CVE: ${props.CVE_MUN}<br/>` : ''}
                  ${props.CVE_ENT ? `State: ${props.CVE_ENT}` : ''}
                `
                layer.bindPopup(popupContent)
              }
            }}
          />
        )}

        {locations.map((location) => (
          <div key={location.id}>
            {/* Highlighted area */}
            <Polygon
              positions={location.area}
              pathOptions={{
                fillColor: location.color,
                fillOpacity: 0.3,
                color: location.color,
                weight: 2
              }}
            >
              <Popup>
                <strong>{location.title}</strong>
                <br />
                {location.description}
              </Popup>
            </Polygon>
            
            {/* Marker pin */}
            <CircleMarker 
              center={location.position}
              pathOptions={{ 
                fillColor: location.color, 
                color: location.color, 
                fillOpacity: 0.8,
                weight: 2
              }}
              radius={10}
            >
              <Popup>
                <strong>{location.title}</strong>
                <br />
                {location.description}
              </Popup>
            </CircleMarker>
          </div>
        ))}
      </MapContainer>
    </div>
  )
}

export default App

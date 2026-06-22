import { useState, useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

type Location = {
  id: number
  position: [number, number]
  title: string
  description: string
  color: string
  area: [number, number][]
}

function MapViewportController({ targetLocation }: { targetLocation: Location | null }) {
  const map = useMap()

  useEffect(() => {
    if (!targetLocation) {
      return
    }

    map.flyToBounds(L.latLngBounds(targetLocation.area), {
      padding: [40, 40],
      maxZoom: 12,
      duration: 0.8
    })
  }, [map, targetLocation])

  return null
}

function App() {
  // Map center position
  const center: [number, number] = [20.47634, -98.67460]
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<number | null>(null)
  const [showProfiles, setShowProfiles] = useState(true)
  const [showMunicipalities, setShowMunicipalities] = useState(true)
  const [showBottomPanel, setShowBottomPanel] = useState(false)
  const profileCards = [
    { id: 1, firstName: 'Miranda', lastName: 'Espinoza' },
    { id: 2, firstName: 'Aurora', lastName: 'Campos' },
    { id: 3, firstName: 'Aimé', lastName: 'Yañez' },
    { id: 4, firstName: 'Alejandro', lastName: 'Cerón' }
  ]
  const municipalityCards = [
    { id: 1, name: 'Eloxochitlán', locationId: 2 },
    { id: 2, name: 'San Agustín Metzquititlán', locationId: 3 },
    { id: 3, name: 'Meztitlan', locationId: 4 },
    { id: 4, name: 'Atotonilco El Grande', locationId: 1 }
  ]

  // Color mapping for each municipality
  const municipalityColors: { [key: string]: string } = {
    "Atotonilco el Grande": "#FF5733",      // Orange-red
    "Eloxochitlán": "#008504",              // Green
    "San Agustín Metzquititlán": "#3357FF", // Blue
    "Metztitlán": "#FF33F5",                // Magenta
    "Tulancingo de Bravo": "#6f00ff"        // Gold
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
  
  const locations: Location[] = [
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

  const selectedLocation =
    selectedMunicipalityId === null
      ? null
      : locations.find((location) => location.id === selectedMunicipalityId) ?? null

  return (
    <div className="fullscreen-map">
      <div className="logo-overlay">
        <div className="logo-badge">
          <img className="map-logo" src="/img/logo.svg" alt="" />
        </div>
        <button type="button" className="logo-action-button">
          introducción
        </button>
      </div>

      <div className={`profile-cards-overlay${showProfiles ? '' : ' is-collapsed'}`}>
        <button
          type="button"
          className="overlay-toggle"
          onClick={() => setShowProfiles((current) => !current)}
          aria-expanded={showProfiles}
        >
          <span>{showProfiles ? 'Esconder equipo' : 'Mostrar equipo'}</span>
          <span className={`overlay-toggle-icon${showProfiles ? ' is-open' : ''}`} aria-hidden="true">
            v
          </span>
        </button>

        <div className={`overlay-cards${showProfiles ? ' is-open' : ' is-hidden'}`} aria-hidden={!showProfiles}>
          {profileCards.map((profile) => (
            <article key={profile.id} className="profile-card">
              <div className="profile-avatar" aria-hidden="true">
                <span className="avatar-head" />
                <span className="avatar-body" />
              </div>
              <div className="profile-name">
                <span>{profile.firstName}</span>
                <span>{profile.lastName}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={`municipality-cards-overlay${showMunicipalities ? '' : ' is-collapsed'}`}>
        <button
          type="button"
          className="overlay-toggle overlay-toggle-right"
          onClick={() => setShowMunicipalities((current) => !current)}
          aria-expanded={showMunicipalities}
        >
          <span>{showMunicipalities ? 'Esconder municipios' : 'Mostrar municipios'}</span>
          <span className={`overlay-toggle-icon${showMunicipalities ? ' is-open' : ''}`} aria-hidden="true">
            v
          </span>
        </button>

        <div className={`overlay-cards${showMunicipalities ? ' is-open' : ' is-hidden'}`} aria-hidden={!showMunicipalities}>
          {municipalityCards.map((municipality) => (
            <button
              key={municipality.id}
              type="button"
              className={`municipality-card${selectedMunicipalityId === municipality.locationId ? ' is-active' : ''}`}
              onClick={() => setSelectedMunicipalityId(municipality.locationId)}
              tabIndex={showMunicipalities ? 0 : -1}
            >
              <span className="municipality-label">{municipality.name}</span>
            </button>
          ))}
        </div>
      </div>

      <MapContainer center={center} zoom={11} scrollWheelZoom={true}>
        <MapViewportController targetLocation={selectedLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
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


      </MapContainer>

      <section className={`bottom-map-panel${showBottomPanel ? ' is-open' : ' is-collapsed'}`}>
        <div className="bottom-map-panel-bar" aria-hidden="true" />

        <button
          type="button"
          className="bottom-map-panel-toggle"
          onClick={() => setShowBottomPanel((current) => !current)}
          aria-expanded={showBottomPanel}
          aria-label={showBottomPanel ? 'Ocultar panel inferior' : 'Mostrar panel inferior'}
        >
          <span className={`bottom-map-panel-icon${showBottomPanel ? ' is-open' : ''}`} aria-hidden="true">
            ▲
          </span>
        </button>

        <div className={`bottom-map-panel-content${showBottomPanel ? ' is-open' : ' is-hidden'}`} aria-hidden={!showBottomPanel}>
          <div className="bottom-map-panel-inner" />
        </div>
      </section>
    </div>
  )
}

export default App

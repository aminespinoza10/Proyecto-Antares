import { useState, useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
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

type MediaMarker = {
  id: string
  position: [number, number]
  title: string
  participant: string
  city: string
  popupText: string
  mediaType: string
  contentUrl: string
  markerColor: string
}

const markerColorClassMap: Record<string, string> = {
  red: 'marker-red',
  blue: 'marker-blue',
  green: 'marker-green',
  orange: 'marker-orange'
}

const markerIconCache: Record<string, L.Icon<L.IconOptions>> = {}

const leafletMarkerIconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString()
const leafletMarkerIconRetinaUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString()
const leafletMarkerShadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString()

function getMarkerIconByColor(markerColor: string) {
  const normalizedColor = markerColor.toLowerCase().trim()
  const markerClassName = markerColorClassMap[normalizedColor] ?? 'marker-blue'

  if (!markerIconCache[markerClassName]) {
    markerIconCache[markerClassName] = L.icon({
      iconUrl: leafletMarkerIconUrl,
      iconRetinaUrl: leafletMarkerIconRetinaUrl,
      shadowUrl: leafletMarkerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: markerClassName
    })
  }

  return markerIconCache[markerClassName]
}

function parseCsvRows(csvContent: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let index = 0; index < csvContent.length; index += 1) {
    const char = csvContent[index]
    const nextChar = csvContent[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentField)
      currentField = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }

      currentRow.push(currentField)
      currentField = ''

      if (currentRow.some((field) => field.trim().length > 0)) {
        rows.push(currentRow)
      }
      currentRow = []
      continue
    }

    currentField += char
  }

  currentRow.push(currentField)
  if (currentRow.some((field) => field.trim().length > 0)) {
    rows.push(currentRow)
  }

  return rows
}

function mapMediaCsvToMarkers(csvContent: string): MediaMarker[] {
  const rows = parseCsvRows(csvContent)

  if (rows.length < 2) {
    return []
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase())
  const dataRows = rows.slice(1)

  const headerIndex = {
    title: headers.indexOf('title'),
    participant: headers.indexOf('participant'),
    latitude: headers.indexOf('latitude'),
    longitude: headers.indexOf('longitude'),
    city: headers.indexOf('city'),
    mediaType: headers.indexOf('media_type'),
    contentUrl: headers.indexOf('content_url'),
    popupText: headers.indexOf('popup_text'),
    markerColor: headers.indexOf('marker_color')
  }

  if (headerIndex.latitude === -1 || headerIndex.longitude === -1) {
    return []
  }

  return dataRows
    .map((row, rowIndex) => {
      const latitudeValue = Number(row[headerIndex.latitude])
      const longitudeValue = Number(row[headerIndex.longitude])

      if (!Number.isFinite(latitudeValue) || !Number.isFinite(longitudeValue)) {
        return null
      }

      const markerColor = (row[headerIndex.markerColor] ?? 'blue').trim().toLowerCase() || 'blue'

      return {
        id: `${rowIndex}-${latitudeValue}-${longitudeValue}`,
        position: [latitudeValue, longitudeValue] as [number, number],
        title: (row[headerIndex.title] ?? '').trim(),
        participant: (row[headerIndex.participant] ?? '').trim(),
        city: (row[headerIndex.city] ?? '').trim(),
        popupText: (row[headerIndex.popupText] ?? '').trim(),
        mediaType: (row[headerIndex.mediaType] ?? '').trim().toLowerCase(),
        contentUrl: (row[headerIndex.contentUrl] ?? '').trim(),
        markerColor
      }
    })
    .filter((marker): marker is MediaMarker => marker !== null)
}

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function MapViewportController({
  targetLocation,
  defaultCenter,
  defaultZoom
}: {
  targetLocation: Location | null
  defaultCenter: [number, number]
  defaultZoom: number
}) {
  const map = useMap()

  useEffect(() => {
    if (targetLocation) {
      map.flyToBounds(L.latLngBounds(targetLocation.area), {
        padding: [40, 40],
        maxZoom: 12,
        duration: 0.8
      })
      return
    }

    map.flyTo(defaultCenter, defaultZoom, {
      duration: 0.8
    })
  }, [map, targetLocation, defaultCenter, defaultZoom])

  return null
}

function App() {
  const getAssetPath = (relativePath: string) => `${import.meta.env.BASE_URL}${relativePath.replace(/^\//, '')}`
  const introductionVideoUrl = 'https://www.youtube.com/embed/LVZVrz3t3sc'

  // Map center position
  const center: [number, number] = [20.47634, -98.67460]
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<number | null>(null)
  const [showProfiles, setShowProfiles] = useState(true)
  const [showMunicipalities, setShowMunicipalities] = useState(true)
  const [showBottomPanel, setShowBottomPanel] = useState(false)
  const [mediaMarkers, setMediaMarkers] = useState<MediaMarker[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)
  const profileCards = [
    { id: 1, firstName: 'Miranda', lastName: 'Espinoza', image: 'img/Miranda.png' },
    { id: 2, firstName: 'Aurora', lastName: 'Campos', image: 'img/Aurora.png' },
    { id: 3, firstName: 'Aimé', lastName: 'Yañez', image: 'img/Aime.png' },
    { id: 4, firstName: 'Alejandro', lastName: 'Cerón', image: 'img/Alejandro.png' }
  ]
  const municipalityCards = [
    { id: 1, name: 'Eloxochitlán', locationId: 2 },
    { id: 2, name: 'San Agustín Metzquititlán', locationId: 3 },
    { id: 3, name: 'Metzitlán', locationId: 4 },
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
    fetch(getAssetPath('data/hgomunicipal.geojson'))
      .then(res => res.json())
      .then(data => {
        console.log('GeoJSON loaded:', data)
        setGeoJsonData(data)
      })
      .catch(err => console.error('Error loading GeoJSON:', err))
  }, [])

  useEffect(() => {
    fetch(getAssetPath('data/media.csv'))
      .then((response) => response.text())
      .then((csvContent) => {
        const markers = mapMediaCsvToMarkers(csvContent)
        setMediaMarkers(markers)
      })
      .catch((error) => {
        console.error('Error loading media CSV:', error)
        setMediaMarkers([])
      })
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

  const filteredMediaMarkers = selectedParticipant
    ? mediaMarkers.filter((marker) => normalizeName(marker.participant) === selectedParticipant)
    : mediaMarkers

  return (
    <div className="fullscreen-map">
      <div className="logo-overlay">
        <div className="logo-badge">
          <img className="map-logo" src={getAssetPath('img/logo.svg')} alt="" />
        </div>
        <button
          type="button"
          className="logo-action-button"
          onClick={() => setShowBottomPanel(true)}
          aria-controls="bottom-introduction-panel"
          aria-expanded={showBottomPanel}
        >
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
            <button
              key={profile.id}
              type="button"
              className={`profile-card${selectedParticipant === normalizeName(profile.firstName) ? ' is-active' : ''}`}
              onClick={() => {
                const normalizedProfileName = normalizeName(profile.firstName)
                setSelectedParticipant((current) =>
                  current === normalizedProfileName ? null : normalizedProfileName
                )
              }}
              aria-pressed={selectedParticipant === normalizeName(profile.firstName)}
            >
              <div className="profile-avatar" aria-hidden="true">
                <img
                  className="profile-avatar-image"
                  src={getAssetPath(profile.image)}
                  alt={`${profile.firstName} ${profile.lastName}`}
                />
              </div>
              <div className="profile-name">
                <span>{profile.firstName}</span>
                <span>{profile.lastName}</span>
              </div>
            </button>
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
              onClick={() =>
                setSelectedMunicipalityId((current) =>
                  current === municipality.locationId ? null : municipality.locationId
                )
              }
              tabIndex={showMunicipalities ? 0 : -1}
            >
              <span className="municipality-label">{municipality.name}</span>
            </button>
          ))}
        </div>
      </div>

      <MapContainer center={center} zoom={11} scrollWheelZoom={true}>
        <MapViewportController targetLocation={selectedLocation} defaultCenter={center} defaultZoom={11} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredMediaMarkers.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={getMarkerIconByColor(marker.markerColor)}>
            <Popup>
              <div className="marker-popup">
                <strong className="marker-popup-title">{marker.title || marker.participant || 'Punto del recorrido'}</strong>
                <p className="marker-popup-text">{marker.popupText || marker.city || 'Sin descripción'}</p>

                {marker.mediaType === 'image' && marker.contentUrl && (
                  <img
                    className="marker-popup-media"
                    src={marker.contentUrl}
                    alt={marker.title || 'Imagen del recorrido'}
                    loading="lazy"
                  />
                )}

                {marker.mediaType === 'video' && marker.contentUrl && (
                  <video className="marker-popup-media" controls preload="metadata" playsInline>
                    <source src={marker.contentUrl} />
                    Tu navegador no soporta video HTML5.
                  </video>
                )}

                {marker.contentUrl && (
                  <a
                    className="marker-popup-link"
                    href={marker.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir archivo
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
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
                  <strong>${props.NOMBRE || props.NOMGEO || props.name || 'Municipality'}</strong><br/>
                  ${props.CVEGEO ? `CVEGEO: ${props.CVEGEO}<br/>` : ''}
                  ${props.NOM_ENT ? `Estado: ${props.NOM_ENT}<br/>` : ''}
                  ${props.CVE_MUN ? `CVE MUN: ${props.CVE_MUN}<br/>` : ''}
                  ${props.CVE_ENT ? `CVE ENT: ${props.CVE_ENT}` : ''}
                `
                layer.bindPopup(popupContent)
              }
            }}
          />
        )}


      </MapContainer>

      <section id="bottom-introduction-panel" className={`bottom-map-panel${showBottomPanel ? ' is-open' : ' is-collapsed'}`}>
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
          <div className="bottom-map-panel-inner">
            <section className="introduction-content" aria-label="Introduccion">
              <h2 className="introduction-title">¡Nuestro viaje por la Sierra Baja de Hidalgo!</h2>
              <div className="introduction-video-shell">
                <iframe
                  className="introduction-video"
                  src={introductionVideoUrl}
                  title="¡Nuestro viaje por la Sierra Baja de Hidalgo!"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App

# Proyecto Antares - React + TypeScript + Vite + Leaflet

Interactive mapping application for Proyecto Antares using React, TypeScript, Vite, and OpenStreetMap/Leaflet.

## Features

- 🗺️ Interactive OpenStreetMap integration
- 📍 Multiple location markers with custom colors
- 🏛️ GeoJSON support for displaying municipal boundaries
- ⚡ Fast development with Vite + HMR
- 🎯 TypeScript for type safety
- 📱 Fullscreen responsive map interface

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

4. **Preview production build:**
```bash
npm run preview
```

## Project Structure

```
proyecto-antares/
├── public/                      # Static assets
│   └── data/                    # GeoJSON and data files
│       └── hgomunicipal.geojson # Municipal boundaries
├── src/                         # Source code
│   ├── components/              # React components
│   ├── App.tsx                  # Main application component with map
│   ├── App.css                  # App component styles
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts           # Vite environment types
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── GEOJSON_GUIDE.md            # Guide for working with GeoJSON files
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Leaflet** - Interactive mapping library
- **React Leaflet** - React components for Leaflet
- **OpenStreetMap** - Map tile provider

## Adding Locations

Edit the `locations` array in `src/App.tsx` to add or modify map markers:

```typescript
{
  id: 1,
  position: [latitude, longitude],
  title: "Location Name",
  description: "Description",
  color: "#FF5733"
}
```

## Working with GeoJSON

Place GeoJSON files in `public/data/` and load them in the application. See `GEOJSON_GUIDE.md` for detailed instructions on converting shapefiles and using GeoJSON boundaries.

## Map Configuration

- **Center Position**: Modify the `center` variable in `App.tsx`
- **Zoom Level**: Adjust the `zoom` prop in `MapContainer`
- **Map Style**: Change colors, opacity, and styling in the component props

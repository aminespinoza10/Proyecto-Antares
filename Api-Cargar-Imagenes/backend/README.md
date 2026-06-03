# API Students - Backend

API REST para carga de imagenes construida en Go.

## Requisitos

- [Go](https://go.dev/dl/) 1.22.0 o superior
- Cuenta de [Azure Storage](https://portal.azure.com/) con acceso a Blob Storage

## Configuracion

1. Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

2. Completa las variables en el archivo `.env`:

| Variable | Descripcion |
|---|---|
| `AZURE_STORAGE_ACCOUNT` | Nombre de la cuenta de Azure Storage |
| `AZURE_STORAGE_KEY` | Clave de acceso a la cuenta |
| `AZURE_STORAGE_CONTAINER` | Nombre del contenedor para las imagenes |
| `AZURE_STORAGE_URL` | URL del servicio de Azure Blob Storage |
| `PORT` | Puerto del servidor (default: 8080) |
| `ENV` | Entorno de ejecucion (`development` o `production`) |

## Instalacion

```bash
go mod download
```

## Ejecucion

```bash
# Development
go run ./cmd/api

# Build
go build -o api ./cmd/api
./api
```

El servidor estara disponible en `http://localhost:8080`.

## Estructura del proyecto

```
backend/
├── cmd/api/          # Punto de entrada de la aplicacion
├── internal/
│   ├── config/       # Configuracion y variables de entorno
│   ├── handlers/     # Handlers HTTP
│   ├── models/       # Modelos de datos
│   ├── services/     # Logica de negocio
│   └── storage/      # Conexion con Azure Blob Storage
└── pkg/              # Paquetes reutilizables
```

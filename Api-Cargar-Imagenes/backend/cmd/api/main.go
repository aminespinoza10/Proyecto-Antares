package main

import (
	"fmt"
	"log"
	"net/http"

	"api-students/backend/internal/config"
	"api-students/backend/internal/handlers"
	"api-students/backend/internal/services"
	"api-students/backend/internal/storage"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg := config.Load()

	azureStorage, err := storage.NewAzureStorage(
		cfg.AzureStorageAccount,
		cfg.AzureStorageKey,
		cfg.AzureStorageContainer,
		cfg.AzureStorageURL,
	)
	if err != nil {
		log.Fatalf("Error al inicializar Azure Storage: %v", err)
	}

	uploadService := services.NewUploadService(azureStorage)
	uploadHandler := handlers.NewUploadHandler(uploadService)

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	r.Post("/upload-image", uploadHandler.UploadImage)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Servidor iniciado en el puerto %s (ENV: %s)", cfg.Port, cfg.Env)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

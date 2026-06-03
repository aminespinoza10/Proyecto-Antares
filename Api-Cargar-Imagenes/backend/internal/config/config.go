package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AzureStorageAccount   string
	AzureStorageKey       string
	AzureStorageContainer string
	AzureStorageURL       string
	Port                  string
	Env                   string
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		AzureStorageAccount:   os.Getenv("AZURE_STORAGE_ACCOUNT"),
		AzureStorageKey:       os.Getenv("AZURE_STORAGE_KEY"),
		AzureStorageContainer: os.Getenv("AZURE_STORAGE_CONTAINER"),
		AzureStorageURL:       os.Getenv("AZURE_STORAGE_URL"),
		Port:                  getEnv("PORT", "8080"),
		Env:                   getEnv("ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

package services

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"api-students/backend/internal/storage"

	"github.com/google/uuid"
)

type UploadService struct {
	storage *storage.AzureStorage
}

func NewUploadService(storage *storage.AzureStorage) *UploadService {
	return &UploadService{storage: storage}
}

func (s *UploadService) UploadImage(ctx context.Context, username string, file multipart.File, header *multipart.FileHeader) (string, error) {
	if err := validateImage(header); err != nil {
		return "", err
	}

	filename := generateFilename(username, header.Filename)

	url, err := s.storage.Upload(ctx, filename, file)
	if err != nil {
		return "", err
	}

	return url, nil
}

func validateImage(header *multipart.FileHeader) error {
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}

	contentType := header.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		return fmt.Errorf("tipo de archivo no permitido: %s. Solo se permiten JPEG, PNG, GIF y WebP", contentType)
	}

	maxSize := int64(5 * 1024 * 1024)
	if header.Size > maxSize {
		return fmt.Errorf("el archivo supera el tamaño máximo de 5MB")
	}

	return nil
}

func generateFilename(username, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	if ext == "" {
		ext = ".png"
	}

	safeUsername := strings.ReplaceAll(username, " ", "_")
	safeUsername = strings.ReplaceAll(safeUsername, "/", "_")
	safeUsername = strings.ReplaceAll(safeUsername, "\\", "_")

	return fmt.Sprintf("%s_%s%s", safeUsername, uuid.New().String()[:8], ext)
}

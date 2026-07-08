package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
)

type AzureStorage struct {
	client    *azblob.Client
	container string
	baseURL   string
}

func NewAzureStorage(account, key, container, baseURL string) (*AzureStorage, error) {
	connectionString := fmt.Sprintf("DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s;EndpointSuffix=core.windows.net", account, key)

	client, err := azblob.NewClientFromConnectionString(connectionString, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create Azure client: %w", err)
	}

	return &AzureStorage{
		client:    client,
		container: container,
		baseURL:   baseURL,
	}, nil
}

func (s *AzureStorage) Upload(ctx context.Context, filename string, data io.Reader) (string, error) {
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, data); err != nil {
		return "", fmt.Errorf("failed to read file data: %w", err)
	}

	_, err := s.client.UploadBuffer(ctx, s.container, filename, buf.Bytes(), nil)
	if err != nil {
		return "", fmt.Errorf("failed to upload to Azure: %w", err)
	}

	url := fmt.Sprintf("%s/%s/%s", s.baseURL, s.container, filename)
	return url, nil
}

package models

type UploadResponse struct {
	URL     string `json:"url"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

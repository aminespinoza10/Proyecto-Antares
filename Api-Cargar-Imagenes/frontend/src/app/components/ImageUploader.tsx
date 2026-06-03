import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

const API_URL = 'http://localhost:8080/upload-image';

export default function ImageUploader() {
  const [selectedName, setSelectedName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const names = [
    'Juan García',
    'María López',
    'Carlos Rodríguez',
    'Ana Martínez',
    'Pedro Sánchez',
    'Laura Fernández'
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Por favor selecciona una imagen');
      setShowErrorModal(true);
      return;
    }

    if (!selectedName) {
      setErrorMessage('Por favor selecciona un nombre de la lista');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', selectedName);
      formData.append('image', selectedFile);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar la imagen');
      }

      setUploadedUrl(data.url);
      setShowSuccessModal(true);
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al cargar la imagen');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Cargar Imagen
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Nombre
          </label>
          <Select.Root value={selectedName} onValueChange={setSelectedName}>
            <Select.Trigger className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <Select.Value placeholder="Elige un nombre..." />
              <Select.Icon>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <Select.Viewport className="p-1">
                  {names.map((name) => (
                    <Select.Item
                      key={name}
                      value={name}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 rounded focus:bg-blue-50 focus:outline-none transition-colors"
                    >
                      <Select.ItemText>{name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          {selectedName && (
            <p className="mt-2 text-sm text-green-600">
              Seleccionado: <strong>{selectedName}</strong>
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Imagen
          </label>
          <div className="relative">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all bg-gray-50 hover:bg-blue-50"
            >
              <Upload className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-gray-600">
                {selectedFile ? selectedFile.name : 'Haz clic para seleccionar'}
              </span>
            </label>
          </div>
          {selectedFile && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-green-700">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  const fileInput = document.getElementById('file-input') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || !selectedName || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando...
            </>
          ) : (
            'Cargar Imagen'
          )}
        </button>
      </div>

      <Dialog.Root open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-8 w-full max-w-md z-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Dialog.Title className="text-2xl font-bold text-gray-800 mb-2">
                ¡Carga Exitosa!
              </Dialog.Title>
              <Dialog.Description className="text-gray-600 mb-4">
                La imagen para <strong>{selectedName}</strong> se ha cargado correctamente.
              </Dialog.Description>
              {uploadedUrl && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">URL del archivo:</p>
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 break-all underline"
                  >
                    {uploadedUrl}
                  </a>
                </div>
              )}
              <Dialog.Close asChild>
                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all">
                  Aceptar
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={showErrorModal} onOpenChange={setShowErrorModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-8 w-full max-w-md z-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <Dialog.Title className="text-2xl font-bold text-gray-800 mb-2">
                Error al Cargar
              </Dialog.Title>
              <Dialog.Description className="text-gray-600 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700 font-medium">
                    {errorMessage}
                  </p>
                </div>
                Por favor, intenta nuevamente.
              </Dialog.Description>
              <Dialog.Close asChild>
                <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all">
                  Cerrar
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

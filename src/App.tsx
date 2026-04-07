import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, RefreshCw, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';

// API Base URL - points to backend server
const API_BASE = 'http://localhost:3001/api';

// Types
interface ProcessingStatus {
  stage: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Main App Component
export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [preset, setPreset] = useState<string>('general');
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  // Toast helper
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Process image with backend API
  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus({ stage: 'uploading', progress: 10, message: 'Uploading image...' });
    startTimeRef.current = Date.now();

    // Read file as base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Create FormData and send to backend
    const formData = new FormData();
    formData.append('image', file);
    formData.append('preset', preset);

    try {
      setProcessingStatus({ stage: 'uploading', progress: 30, message: 'Sending to AI model...' });

      // Send to backend for real enhancement
      const response = await axios.post(`${API_BASE}/enhance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const endTime = Date.now();
      setProcessingTime(Math.round((endTime - startTimeRef.current) / 1000));

      console.log('Enhancement response:', response.data);

      // Set the enhanced image URL from response
      if (response.data.success && response.data.enhanced) {
        setEnhancedImage(response.data.enhanced);
        setProcessingStatus({ stage: 'complete', progress: 100, message: 'Enhancement complete!' });
        addToast('success', 'Image enhanced successfully!');
      } else {
        throw new Error(response.data.error || 'Enhancement failed');
      }

    } catch (error: any) {
      console.error('Enhancement error:', error);
      setProcessingStatus({ stage: 'error', progress: 0, message: error.response?.data?.error || error.message || 'Failed to enhance image' });
      addToast('error', error.response?.data?.error || error.message || 'Failed to enhance image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processImage(file);
    }
  }, [preset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Reset everything
  const handleReset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setProcessingStatus(null);
    setProcessingTime(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download enhanced image
  const handleDownload = async () => {
    if (!enhancedImage) return;

    try {
      // If it's a URL, fetch and download
      if (enhancedImage.startsWith('http')) {
        const response = await axios.get(enhancedImage, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `enhanced-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        addToast('success', 'Image downloaded!');
      } else {
        // If it's base64, download directly
        const link = document.createElement('a');
        link.href = enhancedImage;
        link.download = `enhanced-${Date.now()}.png`;
        link.click();
        addToast('success', 'Image downloaded!');
      }
    } catch (error) {
      addToast('error', 'Failed to download image');
    }
  };

  // Handle file select
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
              toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            } text-white`}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <XCircle size={20} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Photo Enhance Pro</h1>
              <p className="text-xs text-gray-400">AI-Powered Image Enhancement</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Powered by FLUX Kontext</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Preset Selection */}
        {!originalImage && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Enhancement Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'general', label: 'General', desc: 'All-around enhancement' },
                { id: 'portrait', label: 'Portrait', desc: 'Face & skin enhancement' },
                { id: 'landscape', label: 'Landscape', desc: 'Nature & scenery' },
                { id: 'restore', label: 'Restore', desc: 'Old photo restoration' },
                { id: 'upscale', label: 'Upscale', desc: 'Resolution boost' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPreset(option.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    preset === option.id
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white ring-2 ring-purple-400'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-xs mt-1 ${preset === option.id ? 'text-purple-200' : 'text-gray-500'}`}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload Area */}
        {!originalImage && !isProcessing && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              isDragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} onChange={handleFileSelect} />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isDragActive ? 'bg-purple-500/20' : 'bg-gray-700/50'
              }`}>
                <Upload className={`${isDragActive ? 'text-purple-400' : 'text-gray-400'}`} size={40} />
              </div>
              <div>
                <p className="text-xl font-medium text-white">
                  {isDragActive ? 'Drop your image here' : 'Drag & drop your photo'}
                </p>
                <p className="text-gray-400 mt-2">
                  or <span className="text-purple-400">browse</span> to choose a file
                </p>
              </div>
              <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP up to 10MB</p>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center gap-6">
              {originalImage && (
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
                  <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="text-purple-400 animate-spin" size={24} />
                  <span className="text-white font-medium">{processingStatus?.message}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${processingStatus?.progress || 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Using <span className="text-purple-400">FLUX Kontext</span> AI model for enhancement...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {originalImage && !isProcessing && (
          <div className="space-y-6">
            {/* Before/After Display */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Enhancement Results</h2>
                {processingTime && (
                  <span className="text-sm text-gray-400">Processed in {processingTime}s</span>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Original</label>
                  <div className="relative rounded-xl overflow-hidden bg-gray-700 aspect-video">
                    {originalImage && (
                      <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
                
                {/* Enhanced */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Enhanced</label>
                  <div className="relative rounded-xl overflow-hidden bg-gray-700 aspect-video">
                    {enhancedImage ? (
                      <img
                        src={enhancedImage}
                        alt="Enhanced"
                        className="w-full h-full object-contain"
                        onError={() => {
                          console.error('Failed to load enhanced image');
                          addToast('error', 'Failed to load enhanced image');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="text-gray-500 animate-spin" size={32} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
              >
                <RefreshCw size={20} />
                Enhance Another
              </button>
              
              {enhancedImage && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/25"
                >
                  <Download size={20} />
                  Download Enhanced
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          Powered by{' '}
          <a href="https://replicate.com/flux-kontext-apps/restore-image" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
            FLUX Kontext restore-image
          </a>{' '}
          AI Model
        </div>
      </footer>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, CheckCheck } from 'lucide-react';

interface EmployeePhotoCaptureProps {
  onPhotosCapture: (photos: string[]) => void;
  minPhotos?: number;
}

const EmployeePhotoCapture: React.FC<EmployeePhotoCaptureProps> = ({
  onPhotosCapture,
  minPhotos = 20,
}) => {
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [flashAnimation, setFlashAnimation] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout>();

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: cameraFacingMode,
  };

  useEffect(() => {
    // Start automatic capture when camera is active
    if (isCameraActive && capturedPhotos.length < minPhotos) {
      captureIntervalRef.current = setInterval(() => {
        capturePhoto();
      }, 500); // Capture every 500ms
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isCameraActive, capturedPhotos.length]);

  const toggleFacingMode = () => {
    setCameraFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (webcamRef.current && capturedPhotos.length < minPhotos) {
      const photoSrc = webcamRef.current.getScreenshot();
      if (photoSrc) {
        setCapturedPhotos(prev => [...prev, photoSrc]);
        setFlashAnimation(true);
        setTimeout(() => setFlashAnimation(false), 500);

        if (capturedPhotos.length + 1 >= minPhotos) {
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
          }
          onPhotosCapture([...capturedPhotos, photoSrc]);
          setIsCameraActive(false);
        }
      }
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos(capturedPhotos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Photo Capture</h3>
        <p className="text-sm text-gray-500 mb-4">
          Automatically capturing {minPhotos} photos. Please look at the camera from different angles.
          Progress: {capturedPhotos.length}/{minPhotos}
        </p>

        {isCameraActive && (
          <div className="space-y-4">
            <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg border-2 border-primary-500 aspect-square">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
              />
              {flashAnimation && (
                <div className="absolute inset-0 bg-white opacity-70 animate-pulse-once"></div>
              )}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
                <button
                  onClick={toggleFacingMode}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <Camera className="h-6 w-6 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                {capturedPhotos.length} / {minPhotos} photos captured
              </p>
              <div className="h-2 bg-gray-200 rounded-full flex-1 mx-4">
                <div 
                  className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${(capturedPhotos.length / minPhotos) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {capturedPhotos.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Captured Photos</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {capturedPhotos.map((photo, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={photo}
                  alt={`Employee photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePhotoCapture;
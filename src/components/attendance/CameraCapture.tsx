import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { db } from '../../db/db';
import { v4 as uuidv4 } from 'uuid';
import { Employee, Attendance } from '../../types';
import { Camera, RefreshCw, UserCheck, Loader } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface CameraCaptureProps {
  selectedEmployee: Employee | null;
  attendanceType: 'IN' | 'OUT';
  onCapture: (attendance: Attendance) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  selectedEmployee,
  attendanceType,
  onCapture,
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [processing, setProcessing] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout>();

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode,
  };

  useEffect(() => {
    if (selectedEmployee) {
      // Start automatic capture after a short delay
      captureTimeoutRef.current = setTimeout(() => {
        captureAndSaveAttendance();
      }, 2000);
    }

    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, [selectedEmployee]);

  const toggleFacingMode = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  const captureAndSaveAttendance = async () => {
    if (!selectedEmployee || !webcamRef.current) return;
    
    setProcessing(true);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        const now = new Date();
        const attendanceRecord: Attendance = {
          id: uuidv4(),
          employeeId: selectedEmployee.id,
          type: attendanceType,
          timestamp: now.toISOString(),
          photoUrl: imageSrc,
          status: 'verified',
        };
        
        await db.attendance.add(attendanceRecord);
        onCapture(attendanceRecord);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
        {!selectedEmployee ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No Employee Selected</h3>
            <p className="text-sm text-gray-500 mt-1">
              Please select an employee to record attendance
            </p>
          </div>
        ) : (
          <div className="relative h-full">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
              <button
                onClick={toggleFacingMode}
                className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <Camera className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            {processing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <LoadingSpinner size="lg" color="white" text="Processing..." />
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-700">
          {selectedEmployee
            ? `${attendanceType === 'IN' ? 'Check In' : 'Check Out'}: ${selectedEmployee.name}`
            : 'Select an employee'}
        </p>
      </div>
    </div>
  );
};

export default CameraCapture;
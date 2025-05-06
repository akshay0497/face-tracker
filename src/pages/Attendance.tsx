import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, LogIn, LogOut } from 'lucide-react';
import { Employee, Attendance as AttendanceType } from '../types';
import PageHeader from '../components/common/PageHeader';
import CameraCapture from '../components/attendance/CameraCapture';
import EmployeeSelector from '../components/attendance/EmployeeSelector';
import AttendanceList from '../components/attendance/AttendanceList';

const Attendance: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceType, setAttendanceType] = useState<'IN' | 'OUT'>('IN');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleAttendanceTypeChange = (type: 'IN' | 'OUT') => {
    setAttendanceType(type);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };
  
  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };
  
  const handleAttendanceCapture = (attendance: AttendanceType) => {
    setShowSuccess(true);
    setSuccessMessage(`${attendance.type === 'IN' ? 'Check-in' : 'Check-out'} recorded successfully for ${selectedEmployee?.name}`);
    
    // Reset after a delay
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
      setSelectedEmployee(null);
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Manage employee attendance records and mark check-ins/check-outs"
      />
      
      {showSuccess && (
        <div className="bg-success-100 border-l-4 border-success-500 text-success-700 p-4 rounded-md animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-5 w-5 text-success-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Attendance Controls</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAttendanceTypeChange('IN')}
                    className={`flex-1 inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      attendanceType === 'IN'
                        ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Check In
                  </button>
                  
                  <button
                    onClick={() => handleAttendanceTypeChange('OUT')}
                    className={`flex-1 inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      attendanceType === 'OUT'
                        ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Check Out
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  View Records for Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={handleDateChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <EmployeeSelector
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
          />
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {attendanceType === 'IN' ? 'Check In' : 'Check Out'} Camera
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Take a photo to record attendance
              </p>
            </div>
            
            <div className="p-4">
              <CameraCapture
                selectedEmployee={selectedEmployee}
                attendanceType={attendanceType}
                onCapture={handleAttendanceCapture}
              />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {format(selectedDate, 'MMMM d, yyyy')} Records
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Attendance records for the selected date
              </p>
            </div>
            
            <div className="p-4">
              <AttendanceList
                date={selectedDate}
                employeeId={selectedEmployee?.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default Attendance;
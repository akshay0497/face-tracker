import React, { useState, useEffect } from 'react';
import { Mail, Phone, Edit, Trash2, User } from 'lucide-react';
import { db } from '../../db/db';
import { Employee, EmployeePhoto } from '../../types';
import StatusBadge from '../common/StatusBadge';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {
  const [photos, setPhotos] = useState<EmployeePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const employeePhotos = await db.employeePhotos
          .where('employeeId')
          .equals(employee.id)
          .toArray();
        
        setPhotos(employeePhotos);
        
        // Set primary photo
        const primary = employeePhotos.find(photo => photo.isPrimary);
        if (primary) {
          setPrimaryPhoto(primary.photoUrl);
        } else if (employeePhotos.length > 0) {
          setPrimaryPhoto(employeePhotos[0].photoUrl);
        }
      } catch (error) {
        console.error('Error fetching employee photos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhotos();
  }, [employee.id]);
  
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden">
      <div className="relative h-40">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="animate-pulse w-12 h-12 rounded-full bg-gray-200"></div>
          </div>
        ) : primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={`${employee.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <User className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <StatusBadge status={employee.status} />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{employee.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{employee.position}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex-none">
              <Mail className="h-4 w-4 mr-2" />
            </div>
            <span className="truncate">{employee.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex-none">
              <Phone className="h-4 w-4 mr-2" />
            </div>
            <span>{employee.phone}</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Edit
          </button>
          
          <button
            onClick={onDelete}
            className="inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-error-700 bg-white hover:bg-error-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </button>
        </div>
      </div>
      
      {photos.length > 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Additional Photos</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {photos.slice(0, 5).map((photo, index) => (
              <div key={index} className="w-12 h-12 flex-shrink-0">
                <img
                  src={photo.photoUrl}
                  alt={`${employee.name} photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
            {photos.length > 5 && (
              <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">+{photos.length - 5}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;
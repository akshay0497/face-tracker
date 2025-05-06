import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db';
import { Employee, EmployeePhoto, EmployeeFormData } from '../../types';
import EmployeePhotoCapture from './EmployeePhotoCapture';

interface EmployeeFormProps {
  onSuccess: () => void;
  initialData?: EmployeeFormData;
  isEditing?: boolean;
  employeeId?: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSuccess,
  initialData,
  isEditing = false,
  employeeId,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData || {
      name: '',
      department: '',
      position: '',
      employeeId: '',
      email: '',
      phone: '',
    }
  );
  
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(!isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    }
    
    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    // In create mode, photos are required
    if (!isEditing && capturedPhotos.length === 0 && !showCamera) {
      errors.photos = 'Employee photos are required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotosCapture = (photos: string[]) => {
    setCapturedPhotos(photos);
    setShowCamera(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && employeeId) {
        // Update existing employee
        await db.employees.update(employeeId, {
          name: formData.name,
          department: formData.department,
          position: formData.position,
          employeeId: formData.employeeId,
          email: formData.email,
          phone: formData.phone,
          updatedAt: new Date().toISOString(),
        });
        
        // If new photos were captured, add them
        if (capturedPhotos.length > 0) {
          const newPhotos: EmployeePhoto[] = capturedPhotos.map((photoUrl, index) => ({
            id: uuidv4(),
            employeeId,
            photoUrl,
            isPrimary: index === 0,
            createdAt: new Date().toISOString(),
          }));
          
          await db.employeePhotos.bulkAdd(newPhotos);
        }
      } else {
        // Create new employee
        const newEmployeeId = uuidv4();
        const newEmployee: Employee = {
          id: newEmployeeId,
          name: formData.name,
          department: formData.department,
          position: formData.position,
          employeeId: formData.employeeId,
          email: formData.email,
          phone: formData.phone,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        
        await db.employees.add(newEmployee);
        
        // Add all captured photos
        const newPhotos: EmployeePhoto[] = capturedPhotos.map((photoUrl, index) => ({
          id: uuidv4(),
          employeeId: newEmployeeId,
          photoUrl,
          isPrimary: index === 0,
          createdAt: new Date().toISOString(),
        }));
        
        await db.employeePhotos.bulkAdd(newPhotos);
      }
      
      setFormSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {formSubmitted ? (
        <div className="p-6 text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
            <CheckIcon className="h-6 w-6 text-success-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Employee {isEditing ? 'Updated' : 'Registered'} Successfully</h3>
          <p className="mt-2 text-sm text-gray-500">
            The employee information has been {isEditing ? 'updated' : 'saved'} successfully.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    formErrors.name ? 'border-error-500' : ''
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.name}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="employeeId"
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    formErrors.employeeId ? 'border-error-500' : ''
                  }`}
                />
                {formErrors.employeeId && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.employeeId}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="mt-1">
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    formErrors.department ? 'border-error-500' : ''
                  }`}
                >
                  <option value="">Select a department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Product">Product</option>
                  <option value="Operations">Operations</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.department}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="position"
                  id="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    formErrors.position ? 'border-error-500' : ''
                  }`}
                />
                {formErrors.position && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.position}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    formErrors.email ? 'border-error-500' : ''
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    formErrors.phone ? 'border-error-500' : ''
                  }`}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="sm:col-span-6">
              {showCamera ? (
                <EmployeePhotoCapture onPhotosCapture={handlePhotosCapture} />
              ) : (
                <div className="mt-1">
                  {capturedPhotos.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {capturedPhotos.slice(0, 10).map((photo, index) => (
                          <div key={index} className="aspect-square">
                            <img
                              src={photo}
                              alt={`Employee photo ${index + 1}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {capturedPhotos.length} photos captured
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Retake Photos
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Camera className="mr-2 h-5 w-5 text-gray-400" />
                        Capture Employee Photos
                      </button>
                      {formErrors.photos && (
                        <p className="mt-1 text-sm text-error-500">{formErrors.photos}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-5">
            <button
              type="button"
              onClick={onSuccess}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>{isEditing ? 'Update' : 'Register'} Employee</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default EmployeeForm;
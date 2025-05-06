import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import EmployeeForm from '../components/employee/EmployeeForm';

const RegisterEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccess = () => {
    if (isSubmitted) {
      navigate('/employees');
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Employee"
        subtitle="Add a new employee to the system with their details and photos"
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
          Back
        </button>
      </PageHeader>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Employee Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Fill in the details below to register a new employee. All fields are required.
          </p>
        </div>
        
        <EmployeeForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default RegisterEmployee;
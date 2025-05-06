import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Employee, EmployeeFormData } from '../types';
import PageHeader from '../components/common/PageHeader';
import EmployeeList from '../components/employee/EmployeeList';
import EmployeeForm from '../components/employee/EmployeeForm';
import DeleteEmployeeModal from '../components/employee/DeleteEmployeeModal';

const ViewEmployees: React.FC = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleAddEmployee = () => {
    navigate('/register');
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditMode(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
    // The actual delete happens in the modal component
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setSelectedEmployee(null);
  };

  const employeeFormData: EmployeeFormData | undefined = selectedEmployee
    ? {
        name: selectedEmployee.name,
        department: selectedEmployee.department,
        position: selectedEmployee.position,
        employeeId: selectedEmployee.employeeId,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Manage employee records and information"
      >
        <button
          onClick={handleAddEmployee}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Employee
        </button>
      </PageHeader>

      {isEditMode && selectedEmployee ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Employee</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Update employee information. You can modify their details below.
            </p>
          </div>
          
          <EmployeeForm
            onSuccess={handleEditCancel}
            initialData={employeeFormData}
            isEditing={true}
            employeeId={selectedEmployee.id}
          />
        </div>
      ) : (
        <EmployeeList
          onEdit={handleEditEmployee}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete confirmation modal */}
      {selectedEmployee && (
        <DeleteEmployeeModal
          employee={selectedEmployee}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default ViewEmployees;
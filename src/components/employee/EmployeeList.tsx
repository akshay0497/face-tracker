import React, { useState, useEffect } from 'react';
import { db } from '../../db/db';
import { Employee, PaginationOptions, SearchFilters } from '../../types';
import EmployeeCard from './EmployeeCard';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

interface EmployeeListProps {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit, onDelete }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 12,
    total: 0,
  });
  
  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });
  
  // Active department filter
  const [activeDepartment, setActiveDepartment] = useState<string>('All');
  const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Product', 'Operations', 'Customer Support'];
  
  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, filters, activeDepartment]);
  
  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Start with all employees
      let query = db.employees;
      
      // Apply department filter if not "All"
      if (activeDepartment !== 'All') {
        query = query.where('department').equals(activeDepartment);
      }
      
      // Get total count for pagination
      const total = await query.count();
      
      // Fetch the employees for the current page
      const offset = (pagination.page - 1) * pagination.limit;
      let result = await query.offset(offset).limit(pagination.limit).toArray();
      
      // Apply search filter if specified (client-side for simplicity)
      if (filters.query) {
        const searchQuery = filters.query.toLowerCase();
        result = result.filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchQuery) ||
            employee.email.toLowerCase().includes(searchQuery) ||
            employee.employeeId.toLowerCase().includes(searchQuery) ||
            employee.department.toLowerCase().includes(searchQuery) ||
            employee.position.toLowerCase().includes(searchQuery)
        );
      }
      
      setEmployees(result);
      setPagination({ ...pagination, total });
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (query: string) => {
    setFilters({ ...filters, query });
    // Reset to first page when searching
    setPagination({ ...pagination, page: 1 });
  };
  
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };
  
  const handleDepartmentChange = (department: string) => {
    setActiveDepartment(department);
    // Reset to first page when changing department
    setPagination({ ...pagination, page: 1 });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <SearchBar
          placeholder="Search employees..."
          onSearch={handleSearch}
          className="w-full md:w-64"
        />
        
        <div className="flex flex-wrap gap-2">
          {departments.map((department) => (
            <button
              key={department}
              onClick={() => handleDepartmentChange(department)}
              className={`px-3 py-1 text-sm rounded-full ${
                activeDepartment === department
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {department}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading employees..." />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-error-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.query
              ? `No results for "${filters.query}". Try a different search.`
              : activeDepartment !== 'All'
              ? `No employees in the ${activeDepartment} department.`
              : 'Get started by registering a new employee.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={() => onEdit(employee)}
              onDelete={() => onDelete(employee)}
            />
          ))}
        </div>
      )}
      
      {/* Pagination controls */}
      {!isLoading && employees.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default EmployeeList;
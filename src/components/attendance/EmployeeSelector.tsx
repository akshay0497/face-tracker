import React, { useState, useEffect } from 'react';
import { db } from '../../db/db';
import { Employee } from '../../types';
import { Search } from 'lucide-react';

interface EmployeeSelectorProps {
  onSelectEmployee: (employee: Employee) => void;
  selectedEmployee: Employee | null;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  onSelectEmployee,
  selectedEmployee,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const result = await db.employees
          .where('status')
          .equals('active')
          .toArray();
        setEmployees(result);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = searchQuery.trim() === ''
    ? employees
    : employees.filter(employee => {
        const query = searchQuery.toLowerCase();
        return (
          employee.name.toLowerCase().includes(query) ||
          employee.employeeId.toLowerCase().includes(query) ||
          employee.department.toLowerCase().includes(query)
        );
      });

  const determineAttendanceType = async (employee: Employee) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await db.attendance
      .where('employeeId')
      .equals(employee.id)
      .filter(record => {
        const recordDate = new Date(record.timestamp);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      })
      .toArray();

    const lastRecord = todayAttendance[todayAttendance.length - 1];
    return !lastRecord || lastRecord.type === 'OUT' ? 'IN' : 'OUT';
  };

  const handleEmployeeSelect = async (employee: Employee) => {
    const type = await determineAttendanceType(employee);
    onSelectEmployee(employee);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Select Employee</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select an employee to mark attendance
        </p>

        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 text-sm">No employees found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <li
                key={employee.id}
                onClick={() => handleEmployeeSelect(employee)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  selectedEmployee?.id === employee.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">
                      {employee.employeeId} • {employee.department}
                    </div>
                  </div>
                  {selectedEmployee?.id === employee.id && (
                    <div className="ml-auto">
                      <span className="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmployeeSelector;
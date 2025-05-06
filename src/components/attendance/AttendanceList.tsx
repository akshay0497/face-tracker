import React, { useState, useEffect } from 'react';
import { db } from '../../db/db';
import { format } from 'date-fns';
import { Attendance, Employee } from '../../types';
import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';
import { Calendar, ClockIcon } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface AttendanceListProps {
  date?: Date;
  employeeId?: string;
  limit?: number;
}

const AttendanceList: React.FC<AttendanceListProps> = ({
  date = new Date(),
  employeeId,
  limit = 10,
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [date, employeeId, currentPage, limit]);

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    
    try {
      // Create start and end date for the selected date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      // Query to filter by date
      let query = db.attendance
        .where('timestamp')
        .between(startDate.toISOString(), endDate.toISOString());
      
      // Add employee filter if specified
      if (employeeId) {
        query = query.and(record => record.employeeId === employeeId);
      }
      
      // Get total count for pagination
      const total = await query.count();
      setTotalPages(Math.ceil(total / limit));
      
      // Get paginated records
      const offset = (currentPage - 1) * limit;
      const records = await query
        .reverse() // Latest first
        .offset(offset)
        .limit(limit)
        .toArray();
      
      setAttendanceRecords(records);
      
      // Fetch employee details for all attendance records
      const employeeIds = [...new Set(records.map(record => record.employeeId))];
      
      if (employeeIds.length > 0) {
        const employeeData = await db.employees
          .where('id')
          .anyOf(employeeIds)
          .toArray();
        
        const employeeMap: Record<string, Employee> = {};
        employeeData.forEach(employee => {
          employeeMap[employee.id] = employee;
        });
        
        setEmployees(employeeMap);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" text="Loading attendance records..." />
      </div>
    );
  }

  if (attendanceRecords.length === 0) {
    return (
      <div className="py-8 text-center bg-gray-50 rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
        <p className="mt-1 text-sm text-gray-500">
          {employeeId
            ? 'No attendance records found for this employee on the selected date.'
            : 'No attendance records found for the selected date.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {attendanceRecords.map((record) => {
            const employee = employees[record.employeeId];
            
            return (
              <li key={record.id}>
                <div className="block hover:bg-gray-50">
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 flex-1 items-center">
                      <div className="flex-shrink-0">
                        {record.photoUrl ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={record.photoUrl}
                            alt=""
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {employee?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <p className="truncate text-sm font-medium text-gray-900">
                            {employee?.name || 'Unknown Employee'}
                          </p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            <ClockIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                            <span>{formatTime(record.timestamp)}</span>
                            <span className="ml-2 text-xs text-gray-400">
                              {formatDate(record.timestamp)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={record.type} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
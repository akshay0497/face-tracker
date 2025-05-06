import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { db } from '../db/db';
import { DashboardStats } from '../types';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/dashboard/StatsCard';
import AttendanceList from '../components/attendance/AttendanceList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Users, UserCheck, UserX, Clock, CalendarClock, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      
      try {
        // Get all employees
        const allEmployees = await db.employees.toArray();
        const activeEmployees = allEmployees.filter(emp => emp.status === 'active');
        
        // Get today's date boundaries
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Get today's attendance records
        const todayAttendance = await db.attendance
          .where('timestamp')
          .between(startOfDay.toISOString(), endOfDay.toISOString())
          .toArray();
        
        // Get unique employee IDs who checked in today
        const todayPresent = new Set();
        todayAttendance.forEach(record => {
          if (record.type === 'IN') {
            todayPresent.add(record.employeeId);
          }
        });
        
        // Calculate stats
        const stats: DashboardStats = {
          totalEmployees: allEmployees.length,
          activeEmployees: activeEmployees.length,
          todayPresent: todayPresent.size,
          todayAbsent: activeEmployees.length - todayPresent.size,
          lateArrivals: todayAttendance.filter(record => {
            if (record.type !== 'IN') return false;
            const recordTime = new Date(record.timestamp);
            return recordTime.getHours() >= 9 && recordTime.getMinutes() > 30;
          }).length,
          earlyDepartures: todayAttendance.filter(record => {
            if (record.type !== 'OUT') return false;
            const recordTime = new Date(record.timestamp);
            return recordTime.getHours() < 17;
          }).length,
          recentAttendance: todayAttendance.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ).slice(0, 10),
        };
        
        setStats(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')}`}
      >
        <div className="flex space-x-3">
          <Link
            to="/register"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Register Employee
          </Link>
          <Link
            to="/attendance"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Clock className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Mark Attendance
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          iconColor="text-primary-600"
          iconBg="bg-primary-100"
          footer="Active and inactive employees"
        />
        
        <StatsCard
          title="Present Today"
          value={stats.todayPresent}
          icon={UserCheck}
          iconColor="text-success-600" 
          iconBg="bg-success-100"
          change={
            stats.activeEmployees > 0
              ? {
                  value: Math.round((stats.todayPresent / stats.activeEmployees) * 100),
                  isPositive: true,
                }
              : undefined
          }
          footer={`${stats.todayPresent} of ${stats.activeEmployees} active employees`}
        />
        
        <StatsCard
          title="Absent Today"
          value={stats.todayAbsent}
          icon={UserX}
          iconColor="text-error-600"
          iconBg="bg-error-100"
          change={
            stats.activeEmployees > 0
              ? {
                  value: Math.round((stats.todayAbsent / stats.activeEmployees) * 100),
                  isPositive: false,
                }
              : undefined
          }
          footer={`${stats.todayAbsent} of ${stats.activeEmployees} active employees`}
        />
        
        <StatsCard
          title="Attendance Events"
          value={stats.recentAttendance.length}
          icon={CalendarClock}
          iconColor="text-secondary-600"
          iconBg="bg-secondary-100"
          footer="Total check-ins and check-outs today"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h2>
        <AttendanceList limit={8} />
      </div>
    </div>
  );
};

export default Dashboard;
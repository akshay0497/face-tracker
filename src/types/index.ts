// Employee related types
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  employeeId: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'terminated';
  createdAt: string;
  updatedAt?: string;
}

export interface EmployeePhoto {
  id: string;
  employeeId: string;
  photoUrl: string;
  isPrimary?: boolean;
  createdAt: string;
}

export interface EmployeeFormData {
  name: string;
  department: string;
  position: string;
  employeeId: string;
  email: string;
  phone: string;
}

// Attendance related types
export interface Attendance {
  id: string;
  employeeId: string;
  type: 'IN' | 'OUT';
  timestamp: string;
  photoUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

export interface AttendanceFormData {
  employeeId: string;
  type: 'IN' | 'OUT';
}

// Camera related types
export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
  width?: number;
  height?: number;
}

// Dashboard related types
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  todayPresent: number;
  todayAbsent: number;
  lateArrivals: number;
  earlyDepartures: number;
  recentAttendance: Attendance[];
}

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

// Search types
export interface SearchFilters {
  query: string;
  department?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
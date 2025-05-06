import Dexie, { Table } from 'dexie';
import { Employee, EmployeePhoto, Attendance } from '../types';

class EmployeeDatabase extends Dexie {
  employees!: Table<Employee, string>;
  employeePhotos!: Table<EmployeePhoto, string>;
  attendance!: Table<Attendance, string>;

  constructor() {
    super('EmployeeManagementSystem');
    
    this.version(1).stores({
      employees: 'id, name, department, position, email, phone, status, createdAt',
      employeePhotos: 'id, employeeId, photoUrl, createdAt',
      attendance: 'id, employeeId, type, timestamp, photoUrl, status'
    });
  }
}

export const db = new EmployeeDatabase();

// Seed data function (for development)
export const seedDatabase = async () => {
  const employeeCount = await db.employees.count();
  
  // Only seed if no employees exist
  if (employeeCount === 0) {
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        name: 'John Doe',
        department: 'Engineering',
        position: 'Software Engineer',
        employeeId: 'EMP001',
        email: 'john.doe@company.com',
        phone: '555-123-4567',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        department: 'Marketing',
        position: 'Marketing Manager',
        employeeId: 'EMP002',
        email: 'jane.smith@company.com',
        phone: '555-987-6543',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Michael Johnson',
        department: 'Human Resources',
        position: 'HR Specialist',
        employeeId: 'EMP003',
        email: 'michael.j@company.com',
        phone: '555-456-7890',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    // Add sample employee photos (just placeholders)
    const samplePhotos: EmployeePhoto[] = [
      {
        id: '1',
        employeeId: '1',
        photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        employeeId: '2',
        photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        employeeId: '3',
        photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ];

    // Add sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sampleAttendance: Attendance[] = [
      {
        id: '1',
        employeeId: '1',
        type: 'IN',
        timestamp: new Date(today.setHours(9, 0, 0)).toISOString(),
        photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        status: 'verified',
      },
      {
        id: '2',
        employeeId: '1',
        type: 'OUT',
        timestamp: new Date(today.setHours(17, 0, 0)).toISOString(),
        photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        status: 'verified',
      },
      {
        id: '3',
        employeeId: '2',
        type: 'IN',
        timestamp: new Date(today.setHours(8, 45, 0)).toISOString(),
        photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        status: 'verified',
      },
    ];

    // Add sample data to the database
    await db.employees.bulkAdd(sampleEmployees);
    await db.employeePhotos.bulkAdd(samplePhotos);
    await db.attendance.bulkAdd(sampleAttendance);
  }
};
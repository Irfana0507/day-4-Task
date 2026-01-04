
export enum RoomStatus {
  AVAILABLE = 'Available',
  FULL = 'Full'
}

export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending'
}

export enum PaymentMode {
  CASH = 'Cash',
  UPI = 'UPI',
  CARD = 'Card'
}

export enum ComplaintStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupiedBeds: number;
  status: RoomStatus;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: number;
  roomId: string;
  contactNumber: string;
  joiningDate: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  month: string;
  status: PaymentStatus;
}

export interface Complaint {
  id: string;
  studentId: string;
  roomId: string;
  complaintType: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  pendingComplaints: number;
  totalCollections: number;
}

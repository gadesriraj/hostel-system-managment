export type UserRole = 'student' | 'warden' | 'staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  enrollment_no: string;
  department: string;
  year_of_study: number;
  gender: string;
  emergency_contact: string;
  blood_group: string;
  room_id: string | null;
  hostel_name: string;
  room?: Room | null;
  roommates?: Array<{
    id: string;
    full_name: string;
    email: string;
    enrollment_no: string;
    department: string;
    year_of_study: number;
  }>;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  employee_id: string;
  specialization: string;
  phone: string;
  status: 'available' | 'busy' | 'off_duty';
  active_tasks_count?: number;
  resolved_tasks_count?: number;
}

export interface Room {
  id: string;
  room_number: string;
  hostel_name: string;
  block: string;
  floor: number;
  capacity: number;
  type: string;
  status: 'available' | 'partially_occupied' | 'full' | 'maintenance';
  amenities: string[];
  current_occupants?: number;
  occupants?: Array<{
    id: string;
    full_name: string;
    enrollment_no?: string;
    department?: string;
  }>;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  student_id: string;
  student_name: string;
  room_id: string;
  room_number: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  assigned_to: string | null;
  assigned_to_name: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visitor {
  id: string;
  student_id: string;
  student_name: string;
  room_number: string;
  visitor_name: string;
  phone_number: string;
  relationship: string;
  visit_date: string;
  entry_time: string;
  expected_exit_time: string;
  actual_exit_time: string | null;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Maintenance' | 'Rules & Regulations' | 'Events' | 'Emergency';
  priority: 'normal' | 'important' | 'urgent';
  target_audience: 'all' | 'students' | 'staff';
  published_by_name: string;
  is_published: boolean;
  created_at: string;
}

export interface MessFeedback {
  id: string;
  student_id: string;
  student_name: string;
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  rating: number;
  hygiene_rating: number;
  taste_rating: number;
  comments: string;
  date: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface RoomAnalytics {
  totalRooms: number;
  occupiedRooms: number;
  partiallyOccupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalCapacity: number;
  totalStudents: number;
  allocatedStudents: number;
  unallocatedStudents: number;
  occupancyPercentage: number;
  blockBreakdown: Array<{
    name: string;
    totalRooms: number;
    capacity: number;
    currentStudents: number;
    occupancyRate: number;
  }>;
}

export interface ComplaintAnalytics {
  totalComplaints: number;
  pendingComplaints: number;
  assignedComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  averageResolutionHours: number;
  byCategory: Array<{ category: string; count: number }>;
  priorityBreakdown: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface MaintenanceAnalytics {
  totalAssignedTasks: number;
  totalCompletedTasks: number;
  totalPendingTasks: number;
  averageResponseHours: number;
  staffTaskStats: Array<{
    staffId: string;
    staffName: string;
    specialization: string;
    tasksAssigned: number;
    tasksCompleted: number;
    tasksPending: number;
    efficiencyRate: number;
  }>;
}

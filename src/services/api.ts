import {
  User,
  StudentProfile,
  StaffProfile,
  Room,
  Complaint,
  Visitor,
  Notice,
  MessFeedback,
  NotificationItem,
  RoomAnalytics,
  ComplaintAnalytics,
  MaintenanceAnalytics,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('hostelsync_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch {
      // fallback to status text
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse<{
      token: string;
      user: User;
      studentProfile?: StudentProfile;
      staffProfile?: StaffProfile;
    }>(res);
  },

  async register(data: {
    full_name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    enrollment_no?: string;
    department?: string;
    year_of_study?: number;
    gender?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{
      token: string;
      user: User;
      studentProfile?: StudentProfile;
    }>(res);
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (e) {
      console.error(e);
    }
  },

  // Students
  async getStudents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/students`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getStudent(id: string): Promise<StudentProfile> {
    const res = await fetch(`${API_BASE}/students/${id}`, { headers: getHeaders() });
    return handleResponse<StudentProfile>(res);
  },

  async updateStudent(id: string, data: Partial<StudentProfile>): Promise<any> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Rooms
  async getRooms(params?: { block?: string; floor?: number; status?: string }): Promise<Room[]> {
    const search = new URLSearchParams();
    if (params?.block) search.append('block', params.block);
    if (params?.floor) search.append('floor', String(params.floor));
    if (params?.status) search.append('status', params.status);

    const url = `${API_BASE}/rooms${search.toString() ? `?${search.toString()}` : ''}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<Room[]>(res);
  },

  async createRoom(roomData: Partial<Room>): Promise<Room> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleResponse<Room>(res);
  },

  async updateRoom(id: string, roomData: Partial<Room>): Promise<Room> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleResponse<Room>(res);
  },

  async deleteRoom(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Allocations
  async allocateRoom(data: { student_id: string; room_id: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/allocations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deallocateRoom(studentId: string) {
    const res = await fetch(`${API_BASE}/allocations/${studentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Complaints
  async getComplaints(filters?: {
    student_id?: string;
    staff_id?: string;
    status?: string;
    category?: string;
    priority?: string;
  }): Promise<Complaint[]> {
    const search = new URLSearchParams();
    if (filters?.student_id) search.append('student_id', filters.student_id);
    if (filters?.staff_id) search.append('staff_id', filters.staff_id);
    if (filters?.status) search.append('status', filters.status);
    if (filters?.category) search.append('category', filters.category);
    if (filters?.priority) search.append('priority', filters.priority);

    const url = `${API_BASE}/complaints${search.toString() ? `?${search.toString()}` : ''}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<Complaint[]>(res);
  },

  async createComplaint(data: {
    student_id: string;
    category: string;
    title: string;
    description: string;
    priority: string;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Complaint>(res);
  },

  async updateComplaint(
    id: string,
    data: {
      status?: string;
      assigned_to?: string | null;
      resolution_notes?: string;
      priority?: string;
    }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Complaint>(res);
  },

  // Staff
  async getStaff(): Promise<StaffProfile[]> {
    const res = await fetch(`${API_BASE}/staff`, { headers: getHeaders() });
    return handleResponse<StaffProfile[]>(res);
  },

  // Visitors
  async getVisitors(filters?: { student_id?: string; status?: string }): Promise<Visitor[]> {
    const search = new URLSearchParams();
    if (filters?.student_id) search.append('student_id', filters.student_id);
    if (filters?.status) search.append('status', filters.status);

    const url = `${API_BASE}/visitors${search.toString() ? `?${search.toString()}` : ''}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<Visitor[]>(res);
  },

  async registerVisitor(data: {
    student_id: string;
    visitor_name: string;
    phone_number: string;
    relationship: string;
    visit_date: string;
    entry_time: string;
    expected_exit_time: string;
    purpose?: string;
  }): Promise<Visitor> {
    const res = await fetch(`${API_BASE}/visitors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Visitor>(res);
  },

  async updateVisitorStatus(
    id: string,
    data: {
      status?: string;
      rejection_reason?: string;
      approved_by?: string;
      actual_exit_time?: string;
    }
  ): Promise<Visitor> {
    const res = await fetch(`${API_BASE}/visitors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Visitor>(res);
  },

  // Notices
  async getNotices(): Promise<Notice[]> {
    const res = await fetch(`${API_BASE}/notices`, { headers: getHeaders() });
    return handleResponse<Notice[]>(res);
  },

  async createNotice(data: {
    title: string;
    content: string;
    category?: string;
    priority?: string;
    target_audience?: string;
    published_by_name?: string;
  }): Promise<Notice> {
    const res = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Notice>(res);
  },

  async deleteNotice(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/notices/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Mess Feedback
  async getFeedback(): Promise<MessFeedback[]> {
    const res = await fetch(`${API_BASE}/feedback`, { headers: getHeaders() });
    return handleResponse<MessFeedback[]>(res);
  },

  async submitFeedback(data: {
    student_id: string;
    meal_type: string;
    rating: number;
    hygiene_rating: number;
    taste_rating: number;
    comments?: string;
    date?: string;
  }): Promise<MessFeedback> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MessFeedback>(res);
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const url = userId ? `${API_BASE}/notifications?user_id=${userId}` : `${API_BASE}/notifications`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<NotificationItem[]>(res);
  },

  async markNotificationRead(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Analytics
  async getRoomAnalytics(): Promise<RoomAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/rooms`, { headers: getHeaders() });
    return handleResponse<RoomAnalytics>(res);
  },

  async getComplaintAnalytics(): Promise<ComplaintAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/complaints`, { headers: getHeaders() });
    return handleResponse<ComplaintAnalytics>(res);
  },

  async getMaintenanceAnalytics(): Promise<MaintenanceAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/maintenance`, { headers: getHeaders() });
    return handleResponse<MaintenanceAnalytics>(res);
  },
};

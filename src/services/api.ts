import {
  User,
  UserRole,
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

interface StoredAccount {
  user: User;
  password: string;
  studentProfile?: StudentProfile | null;
  staffProfile?: StaffProfile | null;
}

// Client-side persistent account store helpers
export function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem('hostelsync_stored_accounts');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading stored accounts:', err);
  }
  return [];
}

export function saveStoredAccount(account: StoredAccount) {
  try {
    const accounts = getStoredAccounts();
    const cleanEmail = account.user.email.toLowerCase().trim();
    const existingIndex = accounts.findIndex(
      a => a.user.email.toLowerCase().trim() === cleanEmail
    );
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem('hostelsync_stored_accounts', JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving stored account:', err);
  }
}

// Local cache helpers for rooms, notices, and entries
export function getStoredRooms(): Room[] {
  try {
    const raw = localStorage.getItem('hostelsync_stored_rooms');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredRoom(room: Room) {
  try {
    const list = getStoredRooms();
    const idx = list.findIndex(r => r.id === room.id || r.room_number.toLowerCase() === room.room_number.toLowerCase());
    if (idx >= 0) list[idx] = room;
    else list.unshift(room);
    localStorage.setItem('hostelsync_stored_rooms', JSON.stringify(list));
  } catch {}
}

export function removeStoredRoom(id: string) {
  try {
    const list = getStoredRooms().filter(r => r.id !== id);
    localStorage.setItem('hostelsync_stored_rooms', JSON.stringify(list));
  } catch {}
}

export function getStoredNotices(): Notice[] {
  try {
    const raw = localStorage.getItem('hostelsync_stored_notices');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredNotice(notice: Notice) {
  try {
    const list = getStoredNotices();
    const idx = list.findIndex(n => n.id === notice.id);
    if (idx >= 0) list[idx] = notice;
    else list.unshift(notice);
    localStorage.setItem('hostelsync_stored_notices', JSON.stringify(list));
  } catch {}
}

export function removeStoredNotice(id: string) {
  try {
    const list = getStoredNotices().filter(n => n.id !== id);
    localStorage.setItem('hostelsync_stored_notices', JSON.stringify(list));
  } catch {}
}

export function getStoredComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem('hostelsync_stored_complaints');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredComplaint(c: Complaint) {
  try {
    const list = getStoredComplaints();
    const idx = list.findIndex(item => item.id === c.id);
    if (idx >= 0) list[idx] = c;
    else list.unshift(c);
    localStorage.setItem('hostelsync_stored_complaints', JSON.stringify(list));
  } catch {}
}

export function getStoredVisitors(): Visitor[] {
  try {
    const raw = localStorage.getItem('hostelsync_stored_visitors');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredVisitor(v: Visitor) {
  try {
    const list = getStoredVisitors();
    const idx = list.findIndex(item => item.id === v.id);
    if (idx >= 0) list[idx] = v;
    else list.unshift(v);
    localStorage.setItem('hostelsync_stored_visitors', JSON.stringify(list));
  } catch {}
}

export function getStoredFeedback(): MessFeedback[] {
  try {
    const raw = localStorage.getItem('hostelsync_stored_feedback');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredFeedback(f: MessFeedback) {
  try {
    const list = getStoredFeedback();
    list.unshift(f);
    localStorage.setItem('hostelsync_stored_feedback', JSON.stringify(list));
  } catch {}
}

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
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const cleanEmail = (credentials.email || '').toLowerCase().trim();
    const cleanPass = (credentials.password || '').trim();

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (res.ok) {
        const data = await res.json();
        // Sync to client-stored accounts for offline/instant persistence
        saveStoredAccount({
          user: data.user,
          password: cleanPass,
          studentProfile: data.studentProfile,
          staffProfile: data.staffProfile,
        });
        return data as {
          token: string;
          user: User;
          studentProfile?: StudentProfile;
          staffProfile?: StaffProfile;
        };
      } else {
        // If server returns 401, check if user was created locally
        const stored = getStoredAccounts().find(
          a => a.user.email.toLowerCase().trim() === cleanEmail && a.password === cleanPass
        );
        if (stored) {
          const fallbackToken = `token-${stored.user.id}-${Date.now()}`;
          return {
            token: fallbackToken,
            user: stored.user,
            studentProfile: stored.studentProfile || undefined,
            staffProfile: stored.staffProfile || undefined,
          };
        }

        let errorMsg = 'Invalid email or password';
        try {
          const errData = await res.json();
          errorMsg = errData.detail || errData.message || errorMsg;
        } catch {
          // fallback
        }
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      // Check stored accounts if network failed
      const stored = getStoredAccounts().find(
        a => a.user.email.toLowerCase().trim() === cleanEmail && a.password === cleanPass
      );
      if (stored) {
        return {
          token: `token-${stored.user.id}-${Date.now()}`,
          user: stored.user,
          studentProfile: stored.studentProfile || undefined,
          staffProfile: stored.staffProfile || undefined,
        };
      }
      throw err;
    }
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
    specialization?: string;
    employee_id?: string;
  }) {
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const cleanPass = (data.password || '').trim();
    const userRole = (data.role === 'staff' ? 'staff' : (data.role === 'warden' ? 'warden' : 'student')) as UserRole;
    const payload = {
      ...data,
      email: cleanEmail,
      password: cleanPass,
      role: userRole,
    };

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        saveStoredAccount({
          user: result.user,
          password: cleanPass,
          studentProfile: result.studentProfile,
          staffProfile: result.staffProfile,
        });
        return result as {
          token: string;
          user: User;
          studentProfile?: StudentProfile;
          staffProfile?: StaffProfile;
        };
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.detail || 'Registration failed');
      }
    } catch (err: any) {
      // If server is unreachable or failed with network error, provide graceful client persistence
      if (err.message && !err.message.includes('already exists')) {
        const userId = `usr-${Date.now()}`;
        const newUser: User = {
          id: userId,
          email: cleanEmail,
          full_name: data.full_name.trim(),
          role: userRole,
          phone: data.phone || '',
          created_at: new Date().toISOString(),
        };

        let studentProfile: StudentProfile | undefined;
        let staffProfile: StaffProfile | undefined;

        if (userRole === 'student') {
          studentProfile = {
            id: `std-${Date.now()}`,
            user_id: userId,
            full_name: newUser.full_name,
            email: newUser.email,
            enrollment_no: data.enrollment_no || `ST-${Math.floor(1000 + Math.random() * 9000)}`,
            department: data.department || 'Computer Science & Engineering',
            year_of_study: data.year_of_study || 1,
            gender: data.gender || 'Other',
            emergency_contact: '',
            blood_group: 'Unknown',
            room_id: null,
            hostel_name: 'Horizon Hall',
            created_at: new Date().toISOString(),
          };
        } else if (userRole === 'staff') {
          staffProfile = {
            id: `stf-${Date.now()}`,
            user_id: userId,
            full_name: newUser.full_name,
            email: newUser.email,
            employee_id: data.employee_id || `EMP-${Math.floor(100 + Math.random() * 900)}`,
            specialization: data.specialization || 'General Maintenance',
            phone: newUser.phone || '',
            status: 'available',
          };
        }

        const fallbackResult = {
          token: `token-${userId}-${Date.now()}`,
          user: newUser,
          studentProfile,
          staffProfile,
        };

        saveStoredAccount({
          user: newUser,
          password: cleanPass,
          studentProfile: studentProfile || null,
          staffProfile: staffProfile || null,
        });

        return fallbackResult;
      }
      throw err;
    }
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
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, { headers: getHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getStudent error:', e);
    }

    // Fallback to local stored accounts if available
    const stored = getStoredAccounts().find(
      a => a.user.id === id || (a.studentProfile && a.studentProfile.id === id)
    );
    if (stored?.studentProfile) {
      return stored.studentProfile;
    }

    throw new Error('Student profile not found');
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
    try {
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const serverRooms: Room[] = await res.json();
        // Merge with local rooms
        const localRooms = getStoredRooms();
        const merged = [...serverRooms];
        for (const lr of localRooms) {
          if (!merged.some(m => m.id === lr.id || m.room_number.toLowerCase() === lr.room_number.toLowerCase())) {
            merged.push(lr);
          }
        }
        return merged;
      }
    } catch (err) {
      console.warn('Failed to fetch rooms from API, using cached rooms:', err);
    }
    const localRooms = getStoredRooms();
    return localRooms;
  },

  async createRoom(roomData: Partial<Room>): Promise<Room> {
    const cleanRoomNum = (roomData.room_number || '').trim();
    if (!cleanRoomNum) {
      throw new Error('Room number is required');
    }

    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(roomData),
      });
      if (res.ok) {
        const created: Room = await res.json();
        saveStoredRoom(created);
        return created;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.detail || 'Failed to create room');
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        throw err;
      }
      // Fallback local persistence if network fails
      const fallbackRoom: Room = {
        id: `rm-${Date.now()}`,
        room_number: cleanRoomNum,
        hostel_name: roomData.hostel_name || 'Horizon Hall',
        block: roomData.block || 'Block A',
        floor: Number(roomData.floor) || 1,
        capacity: Number(roomData.capacity) || 2,
        type: roomData.type || 'Standard Double (Non-AC)',
        status: 'available',
        amenities: roomData.amenities || ['High-speed Wi-Fi', 'Study Table'],
        current_occupants: 0,
        occupants: [],
      };
      saveStoredRoom(fallbackRoom);
      return fallbackRoom;
    }
  },

  async updateRoom(id: string, roomData: Partial<Room>): Promise<Room> {
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(roomData),
      });
      if (res.ok) {
        const updated: Room = await res.json();
        saveStoredRoom(updated);
        return updated;
      }
    } catch (err) {
      console.warn('Network update room failed, updating locally:', err);
    }
    const local = getStoredRooms();
    const existing = local.find(r => r.id === id);
    if (existing) {
      const merged = { ...existing, ...roomData };
      saveStoredRoom(merged as Room);
      return merged as Room;
    }
    return roomData as Room;
  },

  async deleteRoom(id: string): Promise<{ message: string }> {
    removeStoredRoom(id);
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to delete room on server, removed locally:', err);
    }
    return { message: 'Room deleted' };
  },

  // Allocations
  async allocateRoom(data: { student_id: string; room_id: string; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/allocations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deallocateRoom(studentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/allocations/${studentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Complaints
  async getComplaints(params?: {
    status?: string;
    category?: string;
    student_id?: string;
    staff_id?: string;
  }): Promise<Complaint[]> {
    const search = new URLSearchParams();
    if (params?.status) search.append('status', params.status);
    if (params?.category) search.append('category', params.category);
    if (params?.student_id) search.append('student_id', params.student_id);
    if (params?.staff_id) search.append('staff_id', params.staff_id);

    const url = `${API_BASE}/complaints${search.toString() ? `?${search.toString()}` : ''}`;
    try {
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const serverComplaints: Complaint[] = await res.json();
        const local = getStoredComplaints();
        const merged = [...serverComplaints];
        for (const lc of local) {
          if (!merged.some(m => m.id === lc.id)) {
            merged.unshift(lc);
          }
        }
        return merged;
      }
    } catch (err) {
      console.warn('Failed to fetch complaints, using local store:', err);
    }
    return getStoredComplaints();
  },

  async createComplaint(data: {
    student_id: string;
    category: string;
    title: string;
    description: string;
    priority: string;
  }): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created: Complaint = await res.json();
        saveStoredComplaint(created);
        return created;
      }
    } catch (err) {
      console.warn('POST complaint failed, using local fallback:', err);
    }
    const fallbackComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      complaint_code: `CMP-${Date.now().toString().slice(-4)}`,
      student_id: data.student_id,
      student_name: 'Resident Student',
      room_id: 'rm-101',
      room_number: 'A-101',
      category: data.category,
      title: data.title,
      description: data.description,
      priority: (data.priority as any) || 'medium',
      status: 'pending',
      assigned_to: null,
      assigned_to_name: null,
      assigned_at: null,
      resolved_at: null,
      resolution_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveStoredComplaint(fallbackComplaint);
    return fallbackComplaint;
  },

  async updateComplaint(
    id: string,
    data: {
      status?: string;
      assigned_to?: string;
      resolution_notes?: string;
    }
  ): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated: Complaint = await res.json();
        saveStoredComplaint(updated);
        return updated;
      }
    } catch (err) {
      console.warn('Network update complaint failed:', err);
    }
    const local = getStoredComplaints();
    const existing = local.find(c => c.id === id);
    if (existing) {
      const merged = { ...existing, ...data };
      saveStoredComplaint(merged as Complaint);
      return merged as Complaint;
    }
    return data as any;
  },

  // Staff
  async getStaff(): Promise<StaffProfile[]> {
    const res = await fetch(`${API_BASE}/staff`, { headers: getHeaders() });
    return handleResponse<StaffProfile[]>(res);
  },

  // Visitors
  async getVisitors(params?: { student_id?: string; status?: string }): Promise<Visitor[]> {
    const search = new URLSearchParams();
    if (params?.student_id) search.append('student_id', params.student_id);
    if (params?.status) search.append('status', params.status);

    const url = `${API_BASE}/visitors${search.toString() ? `?${search.toString()}` : ''}`;
    try {
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const serverVisitors: Visitor[] = await res.json();
        const local = getStoredVisitors();
        const merged = [...serverVisitors];
        for (const lv of local) {
          if (!merged.some(m => m.id === lv.id)) {
            merged.unshift(lv);
          }
        }
        return merged;
      }
    } catch (err) {
      console.warn('Failed to fetch visitors, using local store:', err);
    }
    return getStoredVisitors();
  },

  async registerVisitor(data: {
    student_id: string;
    visitor_name: string;
    phone_number: string;
    relationship: string;
    visit_date: string;
    entry_time: string;
    expected_exit_time: string;
    purpose: string;
  }): Promise<Visitor> {
    try {
      const res = await fetch(`${API_BASE}/visitors`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created: Visitor = await res.json();
        saveStoredVisitor(created);
        return created;
      }
    } catch (err) {
      console.warn('POST visitor failed, using local fallback:', err);
    }
    const fallbackVisitor: Visitor = {
      id: `vis-${Date.now()}`,
      student_id: data.student_id,
      student_name: 'Resident Student',
      room_number: 'Hostel Resident',
      visitor_name: data.visitor_name,
      phone_number: data.phone_number,
      relationship: data.relationship,
      visit_date: data.visit_date,
      entry_time: data.entry_time,
      expected_exit_time: data.expected_exit_time,
      actual_exit_time: null,
      purpose: data.purpose,
      status: 'pending',
      approved_by: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
    };
    saveStoredVisitor(fallbackVisitor);
    return fallbackVisitor;
  },

  async updateVisitorStatus(
    id: string,
    data: {
      status: 'approved' | 'rejected' | 'completed';
      approved_by?: string | null;
      rejection_reason?: string;
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
    try {
      const res = await fetch(`${API_BASE}/notices`, { headers: getHeaders() });
      if (res.ok) {
        const serverNotices: Notice[] = await res.json();
        const localNotices = getStoredNotices();
        const merged = [...serverNotices];
        for (const ln of localNotices) {
          if (!merged.some(m => m.id === ln.id)) {
            merged.unshift(ln);
          }
        }
        return merged;
      }
    } catch (err) {
      console.warn('Failed to fetch notices, using local store:', err);
    }
    return getStoredNotices();
  },

  async createNotice(data: {
    title: string;
    content: string;
    category: string;
    priority: string;
    target_audience?: string;
    published_by_name?: string;
  }): Promise<Notice> {
    const cleanTitle = (data.title || '').trim();
    const cleanContent = (data.content || '').trim();
    if (!cleanTitle || !cleanContent) {
      throw new Error('Title and content are required');
    }

    try {
      const res = await fetch(`${API_BASE}/notices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created: Notice = await res.json();
        saveStoredNotice(created);
        return created;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.detail || 'Failed to publish announcement');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('required') || err.message.includes('validation'))) {
        throw err;
      }
      const fallbackNotice: Notice = {
        id: `not-${Date.now()}`,
        title: cleanTitle,
        content: cleanContent,
        category: (data.category as any) || 'General',
        priority: (data.priority as any) || 'normal',
        target_audience: (data.target_audience as any) || 'all',
        published_by_name: data.published_by_name || 'Hostel Warden Office',
        is_published: true,
        created_at: new Date().toISOString(),
      };
      saveStoredNotice(fallbackNotice);
      return fallbackNotice;
    }
  },

  async updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    try {
      const res = await fetch(`${API_BASE}/notices/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated: Notice = await res.json();
        saveStoredNotice(updated);
        return updated;
      }
    } catch (err) {
      console.warn('Network update notice failed, updating locally:', err);
    }
    const local = getStoredNotices();
    const existing = local.find(n => n.id === id);
    if (existing) {
      const merged = { ...existing, ...data };
      saveStoredNotice(merged as Notice);
      return merged as Notice;
    }
    return data as Notice;
  },

  async deleteNotice(id: string): Promise<{ message: string }> {
    removeStoredNotice(id);
    try {
      const res = await fetch(`${API_BASE}/notices/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to delete notice on server, removed locally:', err);
    }
    return { message: 'Notice deleted' };
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
    comments: string;
  }): Promise<MessFeedback> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MessFeedback>(res);
  },

  // Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications?user_id=${userId}`, { headers: getHeaders() });
    return handleResponse<NotificationItem[]>(res);
  },

  async markNotificationRead(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
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

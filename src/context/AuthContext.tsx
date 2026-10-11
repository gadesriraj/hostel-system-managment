import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, StaffProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  studentProfile: StudentProfile | null;
  staffProfile: StaffProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerStudent: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'warden' | 'student' | 'staff', subOption?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore saved session on load or auto-login with default Warden role
  useEffect(() => {
    const savedToken = localStorage.getItem('hostelsync_token');
    const savedUser = localStorage.getItem('hostelsync_user');
    const savedStudent = localStorage.getItem('hostelsync_student');
    const savedStaff = localStorage.getItem('hostelsync_staff');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (savedStudent) setStudentProfile(JSON.parse(savedStudent));
        if (savedStaff) setStaffProfile(JSON.parse(savedStaff));
      } catch (err) {
        console.error('Failed to parse cached session', err);
        localStorage.clear();
      }
      setIsLoading(false);
    } else {
      // Default to Warden Demo account for initial review
      switchDemoRole('warden').finally(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      setStudentProfile(data.studentProfile || null);
      setStaffProfile(data.staffProfile || null);

      localStorage.setItem('hostelsync_token', data.token);
      localStorage.setItem('hostelsync_user', JSON.stringify(data.user));
      if (data.studentProfile) {
        localStorage.setItem('hostelsync_student', JSON.stringify(data.studentProfile));
      } else {
        localStorage.removeItem('hostelsync_student');
      }
      if (data.staffProfile) {
        localStorage.setItem('hostelsync_staff', JSON.stringify(data.staffProfile));
      } else {
        localStorage.removeItem('hostelsync_staff');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (formData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);
      setToken(data.token);
      setUser(data.user);
      setStudentProfile(data.studentProfile || null);
      setStaffProfile(null);

      localStorage.setItem('hostelsync_token', data.token);
      localStorage.setItem('hostelsync_user', JSON.stringify(data.user));
      if (data.studentProfile) {
        localStorage.setItem('hostelsync_student', JSON.stringify(data.studentProfile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
    setStudentProfile(null);
    setStaffProfile(null);
    localStorage.removeItem('hostelsync_token');
    localStorage.removeItem('hostelsync_user');
    localStorage.removeItem('hostelsync_student');
    localStorage.removeItem('hostelsync_staff');
  };

  const switchDemoRole = async (role: 'warden' | 'student' | 'staff', subOption?: string) => {
    setIsLoading(true);
    try {
      if (role === 'warden') {
        await login('warden@hostelsync.edu', 'admin123');
      } else if (role === 'student') {
        const studentEmail = subOption === 'priya' ? 'priya@hostelsync.edu' : 'student@hostelsync.edu';
        await login(studentEmail, 'student123');
      } else if (role === 'staff') {
        const staffEmail = subOption === 'carlos' ? 'carlos@hostelsync.edu' : 'staff@hostelsync.edu';
        await login(staffEmail, 'staff123');
      }
    } catch (err) {
      console.error('Demo switch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      if (user.role === 'student') {
        const student = await api.getStudent(user.id);
        setStudentProfile(student);
        localStorage.setItem('hostelsync_student', JSON.stringify(student));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        studentProfile,
        staffProfile,
        isLoading,
        login,
        registerStudent,
        logout,
        switchDemoRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

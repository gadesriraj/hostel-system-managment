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
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore saved session on load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('hostelsync_token');
      const savedUser = localStorage.getItem('hostelsync_user');
      const savedStudent = localStorage.getItem('hostelsync_student');
      const savedStaff = localStorage.getItem('hostelsync_staff');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (savedStudent) setStudentProfile(JSON.parse(savedStudent));
        if (savedStaff) setStaffProfile(JSON.parse(savedStaff));
      }
    } catch (err) {
      console.error('Failed to parse cached session:', err);
      localStorage.removeItem('hostelsync_token');
      localStorage.removeItem('hostelsync_user');
      localStorage.removeItem('hostelsync_student');
      localStorage.removeItem('hostelsync_staff');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Note: Do NOT set global isLoading=true here.
    // AuthPage manages its own button loading spinner so AuthPage is never unmounted during login.
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
  };

  const register = async (formData: any) => {
    // Note: Do NOT set global isLoading=true here.
    // AuthPage manages its own button loading spinner so AuthPage is never unmounted during registration.
    const data = await api.register(formData);
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
        register,
        logout,
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

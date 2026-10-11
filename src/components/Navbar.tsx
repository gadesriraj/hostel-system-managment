import React, { useState } from 'react';
import {
  Building2,
  Bell,
  LogOut,
  Wrench,
  GraduationCap,
  Layers,
  Menu,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'warden':
        return {
          label: 'Warden / Admin',
          bg: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: <Building2 className="w-3.5 h-3.5" />,
        };
      case 'staff':
        return {
          label: 'Hostel Staff',
          bg: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: <Wrench className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: 'Student Resident',
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: <GraduationCap className="w-3.5 h-3.5" />,
        };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                Hostel<span className="text-indigo-600">Sync</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 hidden sm:inline-block">
                  v1.0
                </span>
              </span>
              <p className="text-[10px] text-gray-500 hidden sm:block">Campus Living & Maintenance</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          </button>

          {/* Current User Profile info */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shadow-2xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.full_name}</p>
              <div
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border mt-0.5 ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

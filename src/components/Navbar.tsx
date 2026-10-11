import React, { useState } from 'react';
import {
  Building2,
  Bell,
  LogOut,
  UserCheck,
  Wrench,
  GraduationCap,
  ChevronDown,
  Layers,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
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
          {/* Quick Role Switcher for instant evaluator demo testing */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Switch Role:</span>
              <span className="font-semibold text-gray-900 capitalize">{user?.role}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  Switch Active Portal
                </div>
                <button
                  onClick={() => {
                    switchDemoRole('warden');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    user?.role === 'warden' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Dr. Robert Vance</div>
                    <div className="text-[10px] text-gray-400">Chief Warden / Admin</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('student', 'alex');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    user?.role === 'student' && user.email.includes('student')
                      ? 'text-indigo-600 font-semibold bg-indigo-50/50'
                      : 'text-gray-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">Alex Morgan</div>
                    <div className="text-[10px] text-gray-400">Student • Room A-204</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('student', 'priya');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    user?.role === 'student' && user.email.includes('priya')
                      ? 'text-indigo-600 font-semibold bg-indigo-50/50'
                      : 'text-gray-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <div>
                    <div className="font-medium">Priya Sharma</div>
                    <div className="text-[10px] text-gray-400">Student • Room B-102</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('staff', 'david');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    user?.role === 'staff' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-gray-700'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-medium">David Miller</div>
                    <div className="text-[10px] text-gray-400">Staff • Electrical Specialist</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notifications button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          </button>

          {/* Current User Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-300">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.full_name}</p>
              <div
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
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

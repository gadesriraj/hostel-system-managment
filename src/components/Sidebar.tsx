import React from 'react';
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  Wrench,
  ShieldCheck,
  Megaphone,
  BarChart3,
  UtensilsCrossed,
  CheckCircle2,
  User,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen = false,
  onClose,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const wardenNav = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'rooms', label: 'Room Management', icon: <DoorOpen className="w-4 h-4" /> },
    { id: 'students', label: 'Students & Allocations', icon: <Users className="w-4 h-4" /> },
    { id: 'complaints', label: 'Complaints & Staffing', icon: <Wrench className="w-4 h-4" /> },
    { id: 'visitors', label: 'Visitor Approvals', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'notices', label: 'Hostel Notices', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Insights', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const studentNav = [
    { id: 'my_room', label: 'My Room & Roommates', icon: <Home className="w-4 h-4" /> },
    { id: 'complaints', label: 'Maintenance Requests', icon: <Wrench className="w-4 h-4" /> },
    { id: 'visitors', label: 'Visitor Registration', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'mess', label: 'Mess Feedback', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'notices', label: 'Hostel Notices', icon: <Megaphone className="w-4 h-4" /> },
  ];

  const staffNav = [
    { id: 'my_tasks', label: 'Assigned Work Orders', icon: <Wrench className="w-4 h-4" /> },
    { id: 'task_history', label: 'Completed Repairs', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'profile', label: 'Staff Profile', icon: <User className="w-4 h-4" /> },
  ];

  const navItems = role === 'warden' ? wardenNav : role === 'staff' ? staffNav : studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800 hidden lg:flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Campus Residence</h2>
            <p className="text-[11px] text-slate-400 capitalize">{role} Portal</p>
          </div>
        </div>

        <div className="p-3 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
          Main Navigation
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span>HostelSync v1.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="API Online" />
          </div>
          <p className="mt-1 text-slate-600 text-[10px]">Connected to REST API</p>
        </div>
      </aside>
    </>
  );
};

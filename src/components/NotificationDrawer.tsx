import React, { useState, useEffect } from 'react';
import { X, Check, Bell, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {notifications.filter(n => !n.is_read).length} new
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-lg transition-colors flex gap-3 text-left ${
                  item.is_read ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50/60 hover:bg-indigo-50'
                }`}
              >
                <div className="mt-0.5">
                  {item.type === 'complaint_update' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : item.type === 'visitor_status' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Info className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {!item.is_read && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    title="Mark as read"
                    className="self-center p-1 text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

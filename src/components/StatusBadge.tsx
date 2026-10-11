import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'room' | 'complaint' | 'visitor' | 'priority' | 'default';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default', className = '' }) => {
  const norm = (status || '').toLowerCase().replace(/_/g, ' ');

  let bg = 'bg-gray-100 text-gray-700 border-gray-200';

  if (type === 'priority') {
    switch (norm) {
      case 'urgent':
        bg = 'bg-red-50 text-red-700 border-red-200 font-semibold';
        break;
      case 'high':
        bg = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'medium':
        bg = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'low':
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
    }
  } else if (type === 'room') {
    switch (norm) {
      case 'available':
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'partially occupied':
        bg = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'full':
        bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'maintenance':
        bg = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  } else if (type === 'visitor') {
    switch (norm) {
      case 'approved':
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'pending':
        bg = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'rejected':
        bg = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'completed':
        bg = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else {
    // complaint & general
    switch (norm) {
      case 'pending':
        bg = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'assigned':
        bg = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'in progress':
        bg = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'resolved':
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'rejected':
        bg = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {norm}
    </span>
  );
};

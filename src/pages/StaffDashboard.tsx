import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  User,
  Phone,
  DoorOpen,
  Send,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Complaint, StaffProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';

interface StaffDashboardProps {
  activeTab: string;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ activeTab }) => {
  const { user, staffProfile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Selected complaint for resolution modal
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadStaffComplaints();
  }, [user, staffProfile]);

  const loadStaffComplaints = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Find staff ID
      const allStaff = await api.getStaff();
      const currentStaff = allStaff.find(s => s.user_id === user.id || s.email === user.email);
      const staffId = currentStaff ? currentStaff.id : (staffProfile?.id || '');

      const assignedTasks = await api.getComplaints({ staff_id: staffId });
      setComplaints(assignedTasks);
    } catch (err) {
      console.error('Error fetching staff tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleStartWork = async (complaintId: string) => {
    try {
      await api.updateComplaint(complaintId, { status: 'in_progress' });
      showToast('Work order status updated to: In Progress.');
      loadStaffComplaints();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    setIsUpdating(true);
    try {
      await api.updateComplaint(resolvingComplaint.id, {
        status: 'resolved',
        resolution_notes: resolutionNotes || 'Repaired and verified functional.',
      });
      setResolvingComplaint(null);
      setResolutionNotes('');
      showToast(`Complaint ${resolvingComplaint.complaint_code} marked as resolved!`);
      loadStaffComplaints();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading Technician Orders...</p>
        </div>
      </div>
    );
  }

  const activeTasks = complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress');
  const completedTasks = complaints.filter(c => c.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="font-bold text-emerald-700">
            ×
          </button>
        </div>
      )}

      {/* Staff Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-xl text-amber-400">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{user?.full_name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  EMP-ELEC-04
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Hostel Facilities • Electrical & AC Maintenance
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Shift: Morning (08:00 - 16:30) • Status: Active On-Duty</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 self-start sm:self-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">Available for Dispatch</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Work Orders"
          value={activeTasks.length}
          subtitle="Tickets needing resolution"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          title="Completed Repairs"
          value={completedTasks.length}
          subtitle="All time verified fixes"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Resolution Efficiency"
          value={`${complaints.length > 0 ? Math.round((completedTasks.length / complaints.length) * 100) : 100}%`}
          subtitle="Assigned vs completed"
          icon={<Sparkles className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* TAB VIEWS */}
      {activeTab === 'my_tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Assigned Work Orders ({activeTasks.length})</h2>
              <p className="text-xs text-gray-500">Repair tickets dispatched directly to you by the Warden Office</p>
            </div>
          </div>

          {activeTasks.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 shadow-xs">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
              <h3 className="font-bold text-gray-800 text-base">All Caught Up!</h3>
              <p className="text-xs text-gray-500 mt-1">No active maintenance tasks in your queue right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded text-xs">
                        {task.complaint_code}
                      </span>
                      <StatusBadge status={task.priority} type="priority" />
                      <StatusBadge status={task.status} type="complaint" />
                      <span className="text-xs font-semibold text-gray-700 bg-slate-100 px-2 py-0.5 rounded">
                        {task.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-900">{task.title}</h3>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{task.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1 font-semibold text-gray-800">
                        <DoorOpen className="w-4 h-4 text-indigo-600" />
                        <span>Room {task.room_number}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Resident: {task.student_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Logged: {new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {task.status === 'assigned' && (
                      <button
                        onClick={() => handleStartWork(task.id)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mark In Progress</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setResolvingComplaint(task);
                        setResolutionNotes('');
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete & Resolve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED REPAIRS TAB */}
      {activeTab === 'task_history' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Completed Repair History ({completedTasks.length})</h2>
            <p className="text-xs text-gray-500">Log of fixed maintenance tickets with verification notes</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Room & Student</th>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Resolution Notes</th>
                    <th className="py-3 px-4">Resolved Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No completed tasks recorded yet.
                      </td>
                    </tr>
                  ) : (
                    completedTasks.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{t.complaint_code}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900">Room {t.room_number}</span>
                          <span className="text-[11px] text-gray-400 block">{t.student_name}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs font-medium text-gray-800">{t.title}</td>
                        <td className="py-3 px-4 text-emerald-800 bg-emerald-50/50 p-2 rounded">
                          {t.resolution_notes || 'Resolved and tested by technician.'}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {t.resolved_at ? new Date(t.resolved_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status="resolved" type="complaint" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs max-w-2xl">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Technician Profile & Shift Details</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <span className="text-gray-400 uppercase text-[10px] font-bold block">Technician Name</span>
                <span className="text-sm font-bold text-gray-900">{user?.full_name}</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase text-[10px] font-bold block">Employee Code</span>
                <span className="text-sm font-bold text-gray-900">EMP-ELEC-04</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase text-[10px] font-bold block">Specialization</span>
                <span className="text-sm font-bold text-gray-900">Electrical & Air Conditioning</span>
              </div>
              <div>
                <span className="text-gray-400 uppercase text-[10px] font-bold block">Phone</span>
                <span className="text-sm font-bold text-gray-900">{user?.phone || '+1 (555) 890-1234'}</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900">
              <h4 className="font-bold text-xs mb-1">Standard Operating Procedure</h4>
              <p className="text-[11px] leading-relaxed">
                Always notify the hostel resident or floor monitor prior to entering student rooms. Ensure personal protective equipment (PPE) is worn for high voltage repairs. Verify all plumbing and electrical fittings before marking work orders as Resolved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Mark Ticket as Resolved</h3>
            <p className="text-xs text-gray-500 mb-3">
              Ticket: <span className="font-mono font-bold text-indigo-600">{resolvingComplaint.complaint_code}</span> ({resolvingComplaint.title}) in Room {resolvingComplaint.room_number}
            </p>

            <form onSubmit={handleResolveComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Resolution Notes / Action Taken
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Replaced capacitor in fan regulator, lubricated ball bearings, tested speed levels 1-5..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5"
                >
                  {isUpdating && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

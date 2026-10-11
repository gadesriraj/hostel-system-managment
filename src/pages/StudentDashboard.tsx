import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Wrench,
  ShieldCheck,
  UtensilsCrossed,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Megaphone,
  Star,
  User,
  Phone,
  Droplets,
  Zap,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StudentProfile, Complaint, Visitor, Notice, MessFeedback } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';

interface StudentDashboardProps {
  activeTab: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState('');

  // Complaint Form
  const [compForm, setCompForm] = useState({
    category: 'Electrical',
    title: '',
    description: '',
    priority: 'medium',
  });

  // Visitor Form
  const [visForm, setVisForm] = useState({
    visitor_name: '',
    phone_number: '',
    relationship: 'Parent',
    visit_date: new Date().toISOString().split('T')[0],
    entry_time: '14:00',
    expected_exit_time: '18:00',
    purpose: '',
  });

  // Feedback Form
  const [feedForm, setFeedForm] = useState({
    meal_type: 'lunch' as 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    rating: 4,
    hygiene_rating: 4,
    taste_rating: 4,
    comments: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studentData = await api.getStudent(user.id);
      setProfile(studentData);

      const [cList, vList, nList, fList] = await Promise.all([
        api.getComplaints({ student_id: studentData.id }),
        api.getVisitors({ student_id: studentData.id }),
        api.getNotices(),
        api.getFeedback(),
      ]);

      setComplaints(cList);
      setVisitors(vList);
      setNotices(nList);
      setFeedbacks(fList.filter(f => f.student_id === studentData.id));
    } catch (err) {
      console.error('Error loading student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      await api.createComplaint({
        student_id: profile.id,
        category: compForm.category,
        title: compForm.title,
        description: compForm.description,
        priority: compForm.priority,
      });
      setShowComplaintModal(false);
      setCompForm({ category: 'Electrical', title: '', description: '', priority: 'medium' });
      setAlertSuccess('Maintenance complaint logged successfully!');
      setTimeout(() => setAlertSuccess(''), 4000);
      const updated = await api.getComplaints({ student_id: profile.id });
      setComplaints(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      await api.registerVisitor({
        student_id: profile.id,
        visitor_name: visForm.visitor_name,
        phone_number: visForm.phone_number,
        relationship: visForm.relationship,
        visit_date: visForm.visit_date,
        entry_time: visForm.entry_time,
        expected_exit_time: visForm.expected_exit_time,
        purpose: visForm.purpose,
      });
      setShowVisitorModal(false);
      setVisForm({
        visitor_name: '',
        phone_number: '',
        relationship: 'Parent',
        visit_date: new Date().toISOString().split('T')[0],
        entry_time: '14:00',
        expected_exit_time: '18:00',
        purpose: '',
      });
      setAlertSuccess('Visitor pass requested! Awaiting Warden approval.');
      setTimeout(() => setAlertSuccess(''), 4000);
      const updated = await api.getVisitors({ student_id: profile.id });
      setVisitors(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to register visitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        student_id: profile.id,
        meal_type: feedForm.meal_type,
        rating: feedForm.rating,
        hygiene_rating: feedForm.hygiene_rating,
        taste_rating: feedForm.taste_rating,
        comments: feedForm.comments,
      });
      setShowFeedbackModal(false);
      setFeedForm({ meal_type: 'lunch', rating: 4, hygiene_rating: 4, taste_rating: 4, comments: '' });
      setAlertSuccess('Mess feedback submitted! Thank you.');
      setTimeout(() => setAlertSuccess(''), 4000);
      const updated = await api.getFeedback();
      setFeedbacks(updated.filter(f => f.student_id === profile.id));
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading Student Dashboard...</p>
        </div>
      </div>
    );
  }

  const room = profile?.room;
  const roommates = profile?.roommates || [];
  const pendingComplaints = complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {alertSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{alertSuccess}</span>
          </div>
          <button onClick={() => setAlertSuccess('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Top Banner with Student Profile summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-2xl text-indigo-300">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">{profile?.full_name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {profile?.enrollment_no}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {profile?.department} • Year {profile?.year_of_study} • Blood Group: {profile?.blood_group || 'O+'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span>Emergency: {profile?.emergency_contact || 'None listed'}</span>
                <span>•</span>
                <span>Hostel: {profile?.hostel_name || 'Horizon Hall'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComplaintModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Log Complaint</span>
            </button>

            <button
              onClick={() => setShowVisitorModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visitor Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Allocated Room"
          value={room ? room.room_number : 'Unassigned'}
          subtitle={room ? `${room.block}, Floor ${room.floor}` : 'Contact Warden'}
          icon={<Home className="w-5 h-5" />}
          color="indigo"
        />
        <MetricCard
          title="Room Occupancy"
          value={room ? `${room.current_occupants || roommates.length + 1} / ${room.capacity}` : '0 / 0'}
          subtitle={room ? room.status.replace('_', ' ') : 'No room assigned'}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Active Complaints"
          value={pendingComplaints}
          subtitle={pendingComplaints > 0 ? 'Work in progress' : 'All tickets resolved'}
          icon={<Wrench className="w-5 h-5" />}
          color={pendingComplaints > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="Hostel Notices"
          value={notices.length}
          subtitle="Recent announcements"
          icon={<Megaphone className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'my_room' && (
        <div className="space-y-6">
          {/* Room Allocation Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-indigo-600" />
                  <span>Room Details & Accommodation</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your primary hostel allocation status and room features
                </p>
              </div>
              {room && <StatusBadge status={room.status} type="room" />}
            </div>

            {room ? (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[11px] text-gray-700 font-semibold uppercase tracking-wider">Hostel & Block</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {room.hostel_name} — {room.block}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[11px] text-gray-700 font-semibold uppercase tracking-wider">Floor & Room No</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      Floor {room.floor} • Room {room.room_number}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[11px] text-gray-700 font-semibold uppercase tracking-wider">Room Type & Capacity</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {room.type} ({room.capacity} Bed Capacity)
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[11px] text-gray-700 font-semibold uppercase tracking-wider">Occupancy Status</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5 capitalize">
                      {room.current_occupants || roommates.length + 1} of {room.capacity} Beds Occupied
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                  <p className="text-xs font-bold text-indigo-900 mb-2">Room Amenities Provided</p>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities?.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md font-medium"
                      >
                        ✓ {amenity}
                      </span>
                    )) || <span className="text-xs text-gray-400">Standard furnishings</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                <h3 className="font-semibold text-gray-800">No Room Allocated Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  You are registered in the hostel system. The Chief Warden office will allocate your room shortly.
                </p>
              </div>
            )}
          </div>

          {/* Roommates Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Current Roommates ({roommates.length})</span>
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Students sharing Room {room?.room_number || 'A-204'} with you
            </p>

            {roommates.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-gray-500 text-xs">
                No roommates assigned currently. You have full private occupancy of this room.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roommates.map(rm => (
                  <div
                    key={rm.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                        {rm.full_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{rm.full_name}</h4>
                        <p className="text-[11px] text-gray-500">{rm.department}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-600 space-y-1">
                      <div>
                        <span className="text-gray-400">Enrollment:</span> {rm.enrollment_no}
                      </div>
                      <div>
                        <span className="text-gray-400">Year:</span> Year {rm.year_of_study}
                      </div>
                      <div className="truncate">
                        <span className="text-gray-400">Email:</span> {rm.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaints Tab */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Maintenance & Repair Complaints</h2>
              <p className="text-xs text-gray-500">Track and report issues in your room or common hostel areas</p>
            </div>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Maintenance Ticket</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No maintenance complaints filed yet.
                      </td>
                    </tr>
                  ) : (
                    complaints.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{c.complaint_code}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{c.category}</td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-gray-900">{c.title}</p>
                          <p className="text-gray-500 text-[11px] truncate mt-0.5">{c.description}</p>
                          {c.resolution_notes && (
                            <p className="mt-1 text-[11px] bg-emerald-50 text-emerald-800 p-1.5 rounded border border-emerald-200">
                              <strong>Fix Note:</strong> {c.resolution_notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.priority} type="priority" />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} type="complaint" />
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {c.assigned_to_name ? (
                            <span className="font-medium text-gray-900">{c.assigned_to_name}</span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {new Date(c.created_at).toLocaleDateString()}
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

      {/* Visitors Tab */}
      {activeTab === 'visitors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hostel Visitor Permits</h2>
              <p className="text-xs text-gray-500">Register visits for parents, relatives, or guests with warden verification</p>
            </div>
            <button
              onClick={() => setShowVisitorModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Visitor</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Visitor Name</th>
                    <th className="py-3 px-4">Relationship</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Visit Date</th>
                    <th className="py-3 px-4">Timings</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Permit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No visitor registrations found.
                      </td>
                    </tr>
                  ) : (
                    visitors.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">{v.visitor_name}</td>
                        <td className="py-3 px-4 text-gray-700">{v.relationship}</td>
                        <td className="py-3 px-4 text-gray-600 font-mono">{v.phone_number}</td>
                        <td className="py-3 px-4 text-gray-800">{v.visit_date}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {v.entry_time} – {v.expected_exit_time}
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{v.purpose}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={v.status} type="visitor" />
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

      {/* Mess Feedback Tab */}
      {activeTab === 'mess' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hostel Mess Quality & Feedback</h2>
              <p className="text-xs text-gray-500">Rate daily meals, hygiene standards, and nutritional quality</p>
            </div>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Meal Rating</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.length === 0 ? (
              <div className="col-span-2 p-8 bg-white rounded-2xl border border-gray-200 text-center text-gray-400">
                You haven't submitted any mess ratings yet.
              </div>
            ) : (
              feedbacks.map(f => (
                <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-700">
                      {f.meal_type}
                    </span>
                    <span className="text-[11px] text-gray-400">{f.date}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-gray-900">{f.rating}/5</span>
                      <span className="text-[10px] text-gray-400 ml-1">Overall</span>
                    </div>
                    <div className="text-[11px] text-gray-500">Hygiene: {f.hygiene_rating}/5</div>
                    <div className="text-[11px] text-gray-500">Taste: {f.taste_rating}/5</div>
                  </div>
                  {f.comments && (
                    <p className="mt-2.5 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                      "{f.comments}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hostel Notices & Directives</h2>
              <p className="text-xs text-gray-500">Official circulars, maintenance windows, and campus schedules</p>
            </div>
          </div>

          <div className="space-y-3">
            {notices.map(n => (
              <div
                key={n.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={n.priority} type="priority" />
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      {n.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-2">{n.title}</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{n.content}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Issued By: {n.published_by_name}</span>
                  <span>Target: Residents</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMIT COMPLAINT MODAL */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Log Maintenance Complaint</h3>
            <p className="text-xs text-gray-500 mb-4">
              Our facilities team responds to high & urgent tickets within 4 hours.
            </p>

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Issue Category</label>
                  <select
                    value={compForm.category}
                    onChange={e => setCompForm({ ...compForm, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Electrical">Electrical / Appliances</option>
                    <option value="Plumbing">Plumbing / Water Tap</option>
                    <option value="Carpentry">Carpentry / Furniture</option>
                    <option value="Wi-Fi/Internet">Wi-Fi & LAN Network</option>
                    <option value="Cleaning">Sanitation & Housekeeping</option>
                    <option value="Other">Other Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority Level</label>
                  <select
                    value={compForm.priority}
                    onChange={e => setCompForm({ ...compForm, priority: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="low">Low (Routine Check)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Prompt Attention)</option>
                    <option value="urgent">Urgent (Immediate Safety/Leak)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ticket Summary / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Washroom tap continuous drip"
                  value={compForm.title}
                  onChange={e => setCompForm({ ...compForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Please specify location in room, noise level, or parts affected..."
                  value={compForm.description}
                  onChange={e => setCompForm({ ...compForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER VISITOR MODAL */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Register Visitor Pass</h3>
            <p className="text-xs text-gray-500 mb-4">
              All guest entries require clearance from the Warden Office.
            </p>

            <form onSubmit={handleRegisterVisitor} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Visitor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thomas Morgan"
                    value={visForm.visitor_name}
                    onChange={e => setVisForm({ ...visForm, visitor_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    value={visForm.relationship}
                    onChange={e => setVisForm({ ...visForm, relationship: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend / Classmate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Visitor Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={visForm.phone_number}
                  onChange={e => setVisForm({ ...visForm, phone_number: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={visForm.visit_date}
                    onChange={e => setVisForm({ ...visForm, visit_date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Entry Time</label>
                  <input
                    type="time"
                    required
                    value={visForm.entry_time}
                    onChange={e => setVisForm({ ...visForm, entry_time: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Exit Time</label>
                  <input
                    type="time"
                    required
                    value={visForm.expected_exit_time}
                    onChange={e => setVisForm({ ...visForm, expected_exit_time: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delivering winter clothes & course books"
                  value={visForm.purpose}
                  onChange={e => setVisForm({ ...visForm, purpose: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Request Permit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESS FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Submit Mess Rating</h3>
            <p className="text-xs text-gray-500 mb-4">Hostel food committee reviews weekly averages</p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Meal Service</label>
                <select
                  value={feedForm.meal_type}
                  onChange={e => setFeedForm({ ...feedForm, meal_type: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Evening Tea / Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Overall Meal Quality (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedForm({ ...feedForm, rating: star })}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        feedForm.rating >= star
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hygiene Rating</label>
                  <select
                    value={feedForm.hygiene_rating}
                    onChange={e => setFeedForm({ ...feedForm, hygiene_rating: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  >
                    <option value={5}>5 - Excellent Hygiene</option>
                    <option value={4}>4 - Clean & Sanitized</option>
                    <option value={3}>3 - Acceptable</option>
                    <option value={2}>2 - Needs Attention</option>
                    <option value={1}>1 - Unhygienic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Taste & Freshness</label>
                  <select
                    value={feedForm.taste_rating}
                    onChange={e => setFeedForm({ ...feedForm, taste_rating: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  >
                    <option value={5}>5 - Delicious</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Inedible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Comments / Suggestions</label>
                <textarea
                  rows={2}
                  placeholder="Suggestions on rotis, curry spices, salad bar..."
                  value={feedForm.comments}
                  onChange={e => setFeedForm({ ...feedForm, comments: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

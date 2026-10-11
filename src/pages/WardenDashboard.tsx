import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  Users,
  Wrench,
  ShieldCheck,
  Megaphone,
  BarChart3,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  UserPlus,
  UserMinus,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import {
  Room,
  StudentProfile,
  StaffProfile,
  Complaint,
  Visitor,
  Notice,
  RoomAnalytics,
  ComplaintAnalytics,
  MaintenanceAnalytics,
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { ConfirmModal } from '../components/ConfirmModal';

interface WardenDashboardProps {
  activeTab: string;
}

export const WardenDashboard: React.FC<WardenDashboardProps> = ({ activeTab }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Analytics
  const [roomAnalytics, setRoomAnalytics] = useState<RoomAnalytics | null>(null);
  const [complaintAnalytics, setComplaintAnalytics] = useState<ComplaintAnalytics | null>(null);
  const [maintenanceAnalytics, setMaintenanceAnalytics] = useState<MaintenanceAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filters
  const [roomSearch, setRoomSearch] = useState('');
  const [roomBlockFilter, setRoomBlockFilter] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('');

  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('');

  const [complaintStatusFilter, setComplaintStatusFilter] = useState('');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('');

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    hostel_name: 'Horizon Hall',
    block: 'Block A',
    floor: 1,
    capacity: 2,
    type: 'Standard Double',
    amenities: 'High-speed Wi-Fi, Study Table',
  });

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedStudentForAlloc, setSelectedStudentForAlloc] = useState<any | null>(null);
  const [targetRoomId, setTargetRoomId] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assignedStaffId, setAssignedStaffId] = useState('');

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'normal',
    target_audience: 'all',
  });

  // Rejection modal
  const [rejectVisitorId, setRejectVisitorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Confirm delete modal
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'room' | 'allocation' | 'notice';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'room',
    id: '',
    title: '',
    message: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [rList, sList, stList, cList, vList, nList, rA, cA, mA] = await Promise.all([
        api.getRooms(),
        api.getStudents(),
        api.getStaff(),
        api.getComplaints(),
        api.getVisitors(),
        api.getNotices(),
        api.getRoomAnalytics(),
        api.getComplaintAnalytics(),
        api.getMaintenanceAnalytics(),
      ]);

      setRooms(rList);
      setStudents(sList);
      setStaff(stList);
      setComplaints(cList);
      setVisitors(vList);
      setNotices(nList);
      setRoomAnalytics(rA);
      setComplaintAnalytics(cA);
      setMaintenanceAnalytics(mA);
    } catch (err) {
      console.error('Error loading warden data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // ROOM CRUD
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenitiesList = roomForm.amenities
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

      if (editingRoom) {
        await api.updateRoom(editingRoom.id, {
          room_number: roomForm.room_number,
          hostel_name: roomForm.hostel_name,
          block: roomForm.block,
          floor: Number(roomForm.floor),
          capacity: Number(roomForm.capacity),
          type: roomForm.type,
          amenities: amenitiesList,
        });
        showToast(`Room ${roomForm.room_number} updated successfully.`);
      } else {
        await api.createRoom({
          room_number: roomForm.room_number,
          hostel_name: roomForm.hostel_name,
          block: roomForm.block,
          floor: Number(roomForm.floor),
          capacity: Number(roomForm.capacity),
          type: roomForm.type,
          amenities: amenitiesList,
        });
        showToast(`Room ${roomForm.room_number} created.`);
      }

      setShowRoomModal(false);
      setEditingRoom(null);
      setRoomForm({
        room_number: '',
        hostel_name: 'Horizon Hall',
        block: 'Block A',
        floor: 1,
        capacity: 2,
        type: 'Standard Double',
        amenities: 'High-speed Wi-Fi, Study Table',
      });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save room');
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await api.deleteRoom(confirmDelete.id);
      setConfirmDelete({ ...confirmDelete, isOpen: false });
      showToast('Room removed from hostel system.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ALLOCATION
  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAlloc || !targetRoomId) return;

    try {
      await api.allocateRoom({
        student_id: selectedStudentForAlloc.id,
        room_id: targetRoomId,
      });
      setShowAllocateModal(false);
      setSelectedStudentForAlloc(null);
      setTargetRoomId('');
      showToast('Student successfully allocated to room.');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Room allocation failed');
    }
  };

  const handleDeallocate = async () => {
    try {
      await api.deallocateRoom(confirmDelete.id);
      setConfirmDelete({ ...confirmDelete, isOpen: false });
      showToast('Student room allocation released.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // COMPLAINT ASSIGNMENT
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await api.updateComplaint(selectedComplaint.id, {
        assigned_to: assignedStaffId,
        status: assignedStaffId ? 'assigned' : 'pending',
      });
      setShowAssignModal(false);
      setSelectedComplaint(null);
      setAssignedStaffId('');
      showToast('Maintenance task assigned to technician.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // VISITOR APPROVAL
  const handleApproveVisitor = async (id: string) => {
    try {
      await api.updateVisitorStatus(id, {
        status: 'approved',
        approved_by: 'usr-warden-1',
      });
      showToast('Visitor pass approved.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectVisitor = async () => {
    if (!rejectVisitorId) return;
    try {
      await api.updateVisitorStatus(rejectVisitorId, {
        status: 'rejected',
        rejection_reason: rejectionReason || 'Security policy restriction',
      });
      setRejectVisitorId(null);
      setRejectionReason('');
      showToast('Visitor request rejected.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // NOTICES
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createNotice({
        title: noticeForm.title,
        content: noticeForm.content,
        category: noticeForm.category,
        priority: noticeForm.priority,
        target_audience: noticeForm.target_audience,
        published_by_name: 'Dr. Robert Vance (Chief Warden)',
      });
      setShowNoticeModal(false);
      setNoticeForm({
        title: '',
        content: '',
        category: 'General',
        priority: 'normal',
        target_audience: 'all',
      });
      showToast('Notice published to hostel board.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteNotice = async () => {
    try {
      await api.deleteNotice(confirmDelete.id);
      setConfirmDelete({ ...confirmDelete, isOpen: false });
      showToast('Notice deleted.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading Administration Dashboard...</p>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredRooms = rooms.filter(r => {
    const matchSearch =
      r.room_number.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.type.toLowerCase().includes(roomSearch.toLowerCase());
    const matchBlock = !roomBlockFilter || r.block === roomBlockFilter;
    const matchStatus = !roomStatusFilter || r.status === roomStatusFilter;
    return matchSearch && matchBlock && matchStatus;
  });

  const filteredStudents = students.filter(s => {
    const matchSearch =
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.enrollment_no.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.room_number && s.room_number.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchDept = !studentDeptFilter || s.department === studentDeptFilter;
    return matchSearch && matchDept;
  });

  const filteredComplaints = complaints.filter(c => {
    const matchStatus = !complaintStatusFilter || c.status === complaintStatusFilter;
    const matchCat = !complaintCategoryFilter || c.category.toLowerCase() === complaintCategoryFilter.toLowerCase();
    return matchStatus && matchCat;
  });

  const pendingVisitsCount = visitors.filter(v => v.status === 'pending').length;
  const activeRepairsCount = complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;

  // Chart data preparation
  const occupancyPieData = roomAnalytics
    ? [
        { name: 'Occupied', value: roomAnalytics.occupiedRooms, color: '#4f46e5' },
        { name: 'Partially Occupied', value: roomAnalytics.partiallyOccupiedRooms, color: '#06b6d4' },
        { name: 'Available', value: roomAnalytics.availableRooms, color: '#10b981' },
        { name: 'Maintenance', value: roomAnalytics.maintenanceRooms, color: '#f43f5e' },
      ]
    : [];

  const complaintPieData = complaintAnalytics
    ? [
        { name: 'Pending', value: complaintAnalytics.pendingComplaints, color: '#f59e0b' },
        { name: 'Assigned', value: complaintAnalytics.assignedComplaints, color: '#38bdf8' },
        { name: 'In Progress', value: complaintAnalytics.inProgressComplaints, color: '#3b82f6' },
        { name: 'Resolved', value: complaintAnalytics.resolvedComplaints, color: '#10b981' },
      ]
    : [];

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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={students.length}
          subtitle={`${students.filter(s => s.room_id).length} housed in campus`}
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />
        <MetricCard
          title="Room Occupancy"
          value={`${roomAnalytics?.occupancyPercentage || 0}%`}
          subtitle={`${roomAnalytics?.allocatedStudents || 0} / ${roomAnalytics?.totalCapacity || 0} Beds`}
          icon={<DoorOpen className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Active Repairs"
          value={activeRepairsCount}
          subtitle={`${complaints.filter(c => c.status === 'pending').length} pending assignment`}
          icon={<Wrench className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          title="Pending Visitors"
          value={pendingVisitsCount}
          subtitle="Pass approval requests"
          icon={<ShieldCheck className="w-5 h-5" />}
          color={pendingVisitsCount > 0 ? 'rose' : 'blue'}
        />
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Action Matrix */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs lg:col-span-2">
              <h3 className="text-base font-bold text-gray-900 mb-1">Hostel Operations Center</h3>
              <p className="text-xs text-gray-500 mb-4">
                Execute core administrative hostel actions in one click
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setEditingRoom(null);
                    setShowRoomModal(true);
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <DoorOpen className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-gray-900">Add New Room</p>
                  <p className="text-[10px] text-gray-400">Configure floor & capacity</p>
                </button>

                <button
                  onClick={() => setShowNoticeModal(true)}
                  className="p-3.5 bg-slate-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <Megaphone className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-gray-900">Post Notice</p>
                  <p className="text-[10px] text-gray-400">Publish announcement</p>
                </button>

                <button
                  onClick={() => {
                    const pendingV = visitors.find(v => v.status === 'pending');
                    if (pendingV) handleApproveVisitor(pendingV.id);
                    else showToast('No pending visitor requests.');
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-gray-900">Approve Next Pass</p>
                  <p className="text-[10px] text-gray-400">{pendingVisitsCount} awaiting approval</p>
                </button>

                <button
                  onClick={() => {
                    const firstUnallocated = students.find(s => !s.room_id);
                    if (firstUnallocated) {
                      setSelectedStudentForAlloc(firstUnallocated);
                      setShowAllocateModal(true);
                    } else {
                      showToast('All students have active room allocations.');
                    }
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <UserPlus className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-gray-900">Allocate Student</p>
                  <p className="text-[10px] text-gray-400">Assign unhoused resident</p>
                </button>
              </div>

              {/* Pending Maintenance Quick Table */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    High Priority Complaints Needing Action
                  </h4>
                  <span className="text-xs text-indigo-600 font-medium">
                    {complaints.filter(c => c.status === 'pending').length} unassigned tickets
                  </span>
                </div>

                <div className="space-y-2">
                  {complaints
                    .filter(c => c.status === 'pending')
                    .slice(0, 3)
                    .map(c => (
                      <div
                        key={c.id}
                        className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-800">{c.complaint_code}</span>
                            <span className="font-semibold text-gray-900">{c.title}</span>
                            <span className="text-gray-500 font-medium">• Room {c.room_number}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 truncate mt-0.5">{c.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setShowAssignModal(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          Assign Staff
                        </button>
                      </div>
                    ))}
                  {complaints.filter(c => c.status === 'pending').length === 0 && (
                    <p className="text-xs text-gray-400 py-3 text-center">
                      No unassigned complaints. Great job!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Occupancy Snapshot */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Hostel Occupancy</h3>
                <p className="text-xs text-gray-500 mb-4">Total residential distribution</p>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={occupancyPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {occupancyPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Total Rooms</span>
                  <span className="font-bold text-gray-900">{rooms.length}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Total Beds</span>
                  <span className="font-bold text-gray-900">{roomAnalytics?.totalCapacity || 0}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Available Rooms</span>
                  <span className="font-bold text-emerald-600">{roomAnalytics?.availableRooms || 0}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Under Repair</span>
                  <span className="font-bold text-rose-600">{roomAnalytics?.maintenanceRooms || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROOM MANAGEMENT TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Room Inventory & Capacity</h2>
              <p className="text-xs text-gray-500">Configure room types, block allocations, and view occupants</p>
            </div>
            <button
              onClick={() => {
                setEditingRoom(null);
                setRoomForm({
                  room_number: '',
                  hostel_name: 'Horizon Hall',
                  block: 'Block A',
                  floor: 1,
                  capacity: 2,
                  type: 'Standard Double',
                  amenities: 'High-speed Wi-Fi, Study Table',
                });
                setShowRoomModal(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hostel Room</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Room Number (e.g. A-101)..."
                value={roomSearch}
                onChange={e => setRoomSearch(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={roomBlockFilter}
              onChange={e => setRoomBlockFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
            >
              <option value="">All Blocks</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
            </select>

            <select
              value={roomStatusFilter}
              onChange={e => setRoomStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="partially_occupied">Partially Occupied</option>
              <option value="full">Full</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(r => {
              const occCount = r.current_occupants || 0;
              const occPercent = Math.round((occCount / r.capacity) * 100);

              return (
                <div
                  key={r.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{r.room_number}</h3>
                        <p className="text-xs text-gray-500">
                          {r.hostel_name} • {r.block} • Floor {r.floor}
                        </p>
                      </div>
                      <StatusBadge status={r.status} type="room" />
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Capacity & Occupancy:</span>
                        <span className="font-bold text-gray-900">
                          {occCount} / {r.capacity} Beds ({occPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            occPercent >= 100
                              ? 'bg-indigo-600'
                              : occPercent > 0
                              ? 'bg-blue-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(occPercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-600 italic">{r.type}</p>
                    </div>

                    {/* Occupants list */}
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Current Residents ({r.occupants?.length || 0})
                      </span>
                      <div className="mt-1 space-y-1">
                        {r.occupants && r.occupants.length > 0 ? (
                          r.occupants.map(o => (
                            <div
                              key={o.id}
                              className="text-xs text-gray-700 bg-white border border-gray-100 p-1.5 rounded-md flex items-center justify-between"
                            >
                              <span className="font-medium truncate">{o.full_name}</span>
                              <span className="text-[10px] text-gray-400">{o.enrollment_no}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">No students allocated</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingRoom(r);
                        setRoomForm({
                          room_number: r.room_number,
                          hostel_name: r.hostel_name,
                          block: r.block,
                          floor: r.floor,
                          capacity: r.capacity,
                          type: r.type,
                          amenities: r.amenities.join(', '),
                        });
                        setShowRoomModal(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                      title="Edit Room"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setConfirmDelete({
                          isOpen: true,
                          type: 'room',
                          id: r.id,
                          title: `Delete Room ${r.room_number}?`,
                          message: `Are you sure you want to delete Room ${r.room_number}? Any active student allocations will be vacated.`,
                        });
                      }}
                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STUDENT MANAGEMENT & ALLOCATIONS TAB */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Student Residence & Allocations</h2>
              <p className="text-xs text-gray-500">Manage enrolled residents, room placements, and de-allocations</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, enrollment no, or room..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={studentDeptFilter}
              onChange={e => setStudentDeptFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science</option>
              <option value="Electrical Engineering">Electrical Eng.</option>
              <option value="Mechanical Engineering">Mechanical Eng.</option>
              <option value="Biotechnology">Biotechnology</option>
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Enrollment No</th>
                    <th className="py-3 px-4">Department & Year</th>
                    <th className="py-3 px-4">Allocated Room</th>
                    <th className="py-3 px-4">Emergency Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{s.full_name}</p>
                        <p className="text-[11px] text-gray-400">{s.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-gray-800">{s.enrollment_no}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {s.department} • Year {s.year_of_study}
                      </td>
                      <td className="py-3 px-4">
                        {s.room_id && s.room_number ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs">
                            <DoorOpen className="w-3.5 h-3.5" />
                            {s.room_number} ({s.block})
                          </span>
                        ) : (
                          <span className="text-rose-600 font-medium bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                            Not Allocated
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{s.emergency_contact || 'N/A'}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedStudentForAlloc(s);
                            setShowAllocateModal(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-medium text-xs transition-colors cursor-pointer"
                        >
                          {s.room_id ? 'Change Room' : 'Assign Room'}
                        </button>

                        {s.room_id && (
                          <button
                            onClick={() => {
                              setConfirmDelete({
                                isOpen: true,
                                type: 'allocation',
                                id: s.id,
                                title: `De-allocate ${s.full_name}?`,
                                message: `Remove ${s.full_name} from Room ${s.room_number}? The bed will become available for new allocation.`,
                              });
                            }}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                            title="Remove Room Allocation"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINTS & STAFFING TAB */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hostel Complaints & Maintenance Dispatch</h2>
              <p className="text-xs text-gray-500">Triage resident maintenance tickets and assign specialized technicians</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
            <select
              value={complaintStatusFilter}
              onChange={e => setComplaintStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={complaintCategoryFilter}
              onChange={e => setComplaintCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Wi-Fi/Internet">Wi-Fi / LAN</option>
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Student & Room</th>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredComplaints.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{c.complaint_code}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900">{c.student_name}</span>
                        <span className="text-[11px] text-gray-500 block">Room {c.room_number}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-semibold text-gray-900 block">{c.title}</span>
                        <span className="text-[11px] text-gray-500 truncate block">{c.description}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{c.category}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.priority} type="priority" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} type="complaint" />
                      </td>
                      <td className="py-3 px-4">
                        {c.assigned_to_name ? (
                          <span className="font-semibold text-gray-800">{c.assigned_to_name}</span>
                        ) : (
                          <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setAssignedStaffId(c.assigned_to || '');
                            setShowAssignModal(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold cursor-pointer"
                        >
                          {c.assigned_to ? 'Reassign' : 'Assign Staff'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VISITOR APPROVALS TAB */}
      {activeTab === 'visitors' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hostel Visitor Permits & Gate Log</h2>
            <p className="text-xs text-gray-500">Review requests, approve visitor entries, and track checkout times</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Visitor</th>
                    <th className="py-3 px-4">Resident Student</th>
                    <th className="py-3 px-4">Relationship</th>
                    <th className="py-3 px-4">Date & Timings</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visitors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{v.visitor_name}</span>
                        <span className="text-[11px] text-gray-500 font-mono">{v.phone_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">{v.student_name}</span>
                        <span className="text-[11px] text-gray-500 block">Room {v.room_number}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{v.relationship}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 block">{v.visit_date}</span>
                        <span className="text-[11px] text-gray-500">
                          {v.entry_time} – {v.expected_exit_time}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-gray-600">{v.purpose}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={v.status} type="visitor" />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {v.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveVisitor(v.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectVisitorId(v.id)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Decision Recorded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NOTICES TAB */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hostel Notice Management</h2>
              <p className="text-xs text-gray-500">Publish directives, maintenance circulars, and rule reminders</p>
            </div>
            <button
              onClick={() => setShowNoticeModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {notices.map(n => (
              <div
                key={n.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusBadge status={n.priority} type="priority" />
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      {n.category}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      • {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{n.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.content}</p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Published by: {n.published_by_name} • Audience: {n.target_audience}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConfirmDelete({
                      isOpen: true,
                      type: 'notice',
                      id: n.id,
                      title: 'Delete Notice?',
                      message: `Are you sure you want to remove notice "${n.title}"?`,
                    });
                  }}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg self-end sm:self-start cursor-pointer"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hostel Analytics & Operational Insights</h2>
            <p className="text-xs text-gray-500">Visual breakdowns of room capacity, repair ticket SLAs, and technician metrics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Block Wise Breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Block-Wise Occupancy Rates</h3>
              <p className="text-xs text-gray-500 mb-4">Capacity vs Enrolled Residents by Hostel Block</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomAnalytics?.blockBreakdown || []}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="capacity" fill="#cbd5e1" name="Total Capacity" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentStudents" fill="#4f46e5" name="Occupants" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complaints Breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Complaints by Category</h3>
              <p className="text-xs text-gray-500 mb-4">Volume of repair tickets logged across departments</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complaintAnalytics?.byCategory || []} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" name="Tickets" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Maintenance Staff Performance Table */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Technician SLA & Work Order Performance</h3>
            <p className="text-xs text-gray-500 mb-4">Staff efficiency and assigned vs resolved repair quotas</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Technician Name</th>
                    <th className="py-2.5 px-4">Specialization</th>
                    <th className="py-2.5 px-4">Assigned Tickets</th>
                    <th className="py-2.5 px-4">Resolved Tickets</th>
                    <th className="py-2.5 px-4">Pending</th>
                    <th className="py-2.5 px-4">Efficiency Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {maintenanceAnalytics?.staffTaskStats.map(st => (
                    <tr key={st.staffId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-gray-900">{st.staffName}</td>
                      <td className="py-3 px-4 text-gray-700">{st.specialization}</td>
                      <td className="py-3 px-4 font-mono font-medium text-gray-900">{st.tasksAssigned}</td>
                      <td className="py-3 px-4 font-mono font-medium text-emerald-600">{st.tasksCompleted}</td>
                      <td className="py-3 px-4 font-mono font-medium text-amber-600">{st.tasksPending}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{st.efficiencyRate}%</span>
                          <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${st.efficiencyRate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROOM MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {editingRoom ? `Edit Room ${editingRoom.room_number}` : 'Add New Hostel Room'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Set room capacity, amenities, and floor</p>

            <form onSubmit={handleSaveRoom} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-301"
                    value={roomForm.room_number}
                    onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hostel Block</label>
                  <select
                    value={roomForm.block}
                    onChange={e => setRoomForm({ ...roomForm, block: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={roomForm.floor}
                    onChange={e => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={roomForm.capacity}
                    onChange={e => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={roomForm.type}
                  onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                >
                  <option value="Standard Double (Non-AC)">Standard Double (Non-AC)</option>
                  <option value="Deluxe Double (AC)">Deluxe Double (AC)</option>
                  <option value="Deluxe Triple (AC)">Deluxe Triple (AC)</option>
                  <option value="Dorm Quad (Non-AC)">Dorm Quad (Non-AC)</option>
                  <option value="Single Suite (AC)">Single Suite (AC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  placeholder="High-speed Wi-Fi, Study Table, Attached Bath"
                  value={roomForm.amenities}
                  onChange={e => setRoomForm({ ...roomForm, amenities: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALLOCATE STUDENT MODAL */}
      {showAllocateModal && selectedStudentForAlloc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Allocate Room</h3>
            <p className="text-xs text-gray-500 mb-4">
              Student: <span className="font-semibold text-gray-900">{selectedStudentForAlloc.full_name}</span> ({selectedStudentForAlloc.enrollment_no})
            </p>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Available Room</label>
                <select
                  required
                  value={targetRoomId}
                  onChange={e => setTargetRoomId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                >
                  <option value="">-- Choose a Room with Vacant Beds --</option>
                  {rooms
                    .filter(r => (r.current_occupants || 0) < r.capacity && r.status !== 'maintenance')
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        {r.room_number} ({r.block}, Floor {r.floor}) — {r.capacity - (r.current_occupants || 0)} vacant beds left ({r.type})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetRoomId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN STAFF MODAL */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Assign Maintenance Technician</h3>
            <p className="text-xs text-gray-500 mb-3">
              Ticket: <span className="font-mono font-bold text-indigo-600">{selectedComplaint.complaint_code}</span> ({selectedComplaint.category}) in Room {selectedComplaint.room_number}
            </p>

            <form onSubmit={handleAssignStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Qualified Staff</label>
                <select
                  required
                  value={assignedStaffId}
                  onChange={e => setAssignedStaffId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                >
                  <option value="">-- Choose Staff Member --</option>
                  {staff.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.specialization}) — Status: {st.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!assignedStaffId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg"
                >
                  Assign Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NOTICE MODAL */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Publish Hostel Announcement</h3>
            <p className="text-xs text-gray-500 mb-4">Broadcast important notice to student and staff portals</p>

            <form onSubmit={handleSaveNotice} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notice Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  >
                    <option value="General">General</option>
                    <option value="Maintenance">Maintenance Window</option>
                    <option value="Rules & Regulations">Rules & Regulations</option>
                    <option value="Events">Campus Events</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={e => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Transformer Inspection on Friday"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write clear instructions, timings, emergency contacts..."
                  value={noticeForm.content}
                  onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT VISITOR MODAL */}
      {rejectVisitorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reject Visitor Request</h3>
            <p className="text-xs text-gray-500 mb-3">Provide reason for audit and student notification</p>

            <textarea
              rows={3}
              placeholder="e.g. Visit outside permitted visiting hours; prior permission required..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-900 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectVisitorId(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectVisitor}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.title}
        message={confirmDelete.message}
        confirmLabel="Confirm"
        isDestructive={true}
        onConfirm={() => {
          if (confirmDelete.type === 'room') handleDeleteRoom();
          else if (confirmDelete.type === 'allocation') handleDeallocate();
          else if (confirmDelete.type === 'notice') handleDeleteNotice();
        }}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
      />
    </div>
  );
};

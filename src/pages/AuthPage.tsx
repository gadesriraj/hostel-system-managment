import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  Wrench,
  Lock,
  Mail,
  User,
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  RefreshCw,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AuthPage: React.FC = () => {
  const { login, registerStudent, switchDemoRole, automateRegisterAndLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoRegistering, setAutoRegistering] = useState(false);

  // Quick Personas fetched from API
  const [personas, setPersonas] = useState<
    Array<{
      id: string;
      full_name: string;
      email: string;
      password: string;
      role: 'student' | 'warden' | 'staff';
      tag: string;
      description: string;
    }>
  >([]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    enrollment_no: '',
    department: 'Computer Science',
    year_of_study: 1,
    gender: 'Male',
  });

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const data = await api.getTestPersonas();
      setPersonas(data);
    } catch {
      // Fallback local list if server is initializing
      setPersonas([
        {
          id: 'usr-warden-1',
          full_name: 'Dr. Robert Vance',
          email: 'warden@hostelsync.edu',
          password: 'admin123',
          role: 'warden',
          tag: 'Chief Warden',
          description: 'Hostel administrator with full control',
        },
        {
          id: 'usr-student-1',
          full_name: 'Alex Morgan',
          email: 'student@hostelsync.edu',
          password: 'student123',
          role: 'student',
          tag: 'Resident • Room A-204',
          description: 'Senior resident with roommates',
        },
        {
          id: 'usr-student-2',
          full_name: 'Priya Sharma',
          email: 'priya@hostelsync.edu',
          password: 'student123',
          role: 'student',
          tag: 'Resident • Room B-102',
          description: 'Engineering student resident',
        },
        {
          id: 'usr-staff-1',
          full_name: 'David Miller',
          email: 'staff@hostelsync.edu',
          password: 'staff123',
          role: 'staff',
          tag: 'Staff • Electrician',
          description: 'Maintenance technician',
        },
      ]);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      await registerStudent({
        ...regData,
        year_of_study: Number(regData.year_of_study),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // AUTOMATION 1: One-Click Auto-Fill Registration Form
  const handleAutoFillForm = () => {
    const candidates = [
      { name: 'Maya Patel', gender: 'Female', dept: 'Computer Science' },
      { name: 'Lucas Silva', gender: 'Male', dept: 'Mechanical Engineering' },
      { name: 'Elena Rostova', gender: 'Female', dept: 'Electrical Engineering' },
      { name: 'Aiden Ross', gender: 'Male', dept: 'Biotechnology' },
      { name: 'Kavita Rao', gender: 'Female', dept: 'Computer Science' },
      { name: 'Jin Woo', gender: 'Male', dept: 'Data Science' },
      { name: 'Siddharth Nair', gender: 'Male', dept: 'Civil Engineering' },
      { name: 'Chloe Bennet', gender: 'Female', dept: 'Information Technology' },
    ];
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const randId = Math.floor(1000 + Math.random() * 9000);
    const firstName = pick.name.split(' ')[0].toLowerCase();

    setRegData({
      full_name: `${pick.name}`,
      email: `${firstName}.${randId}@hostelsync.edu`,
      password: 'student123',
      phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      enrollment_no: `CS-2026-${randId}`,
      department: pick.dept,
      year_of_study: Math.floor(1 + Math.random() * 4),
      gender: pick.gender,
    });
    setSuccessToast(`Filled realistic profile for ${pick.name}!`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // AUTOMATION 2: One-Click Instant Register & Login
  const handleInstantAutoRegisterAndLogin = async () => {
    setErrorMessage('');
    setAutoRegistering(true);
    try {
      const res = await automateRegisterAndLogin({ autoAllocateRoom: true });
      setSuccessToast(`Auto-registered ${res.user.full_name} and logged in!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Auto-registration failed.');
      setAutoRegistering(false);
    }
  };

  // AUTOMATION 3: 1-Click Login as Persona
  const handlePersonaLogin = async (personaEmail: string, personaPass: string) => {
    setErrorMessage('');
    setLoading(true);
    try {
      await login(personaEmail, personaPass);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate persona.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefillLogin = (personaEmail: string, personaPass: string) => {
    setEmail(personaEmail);
    setPassword(personaPass);
    setIsRegister(false);
    setIsForgot(false);
    setSuccessToast(`Loaded credentials for ${personaEmail}`);
    setTimeout(() => setSuccessToast(''), 2500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-3">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          Hostel<span className="text-indigo-400">Sync</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Smart Centralized Hostel & Residence Management Platform
        </p>

        {/* AUTOMATION HIGHLIGHT BANNER */}
        <div className="mt-4 p-3 bg-indigo-950/70 border border-indigo-700/50 rounded-xl text-xs text-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-left">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="font-semibold text-white">Automated Onboarding & Testing Ready</p>
              <p className="text-[11px] text-indigo-300">
                1-click auto-registration & instant persona switching for testing
              </p>
            </div>
          </div>

          <button
            onClick={handleInstantAutoRegisterAndLogin}
            disabled={autoRegistering}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {autoRegistering ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Auto-Register & Log In</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md py-6 px-6 shadow-2xl rounded-2xl sm:px-8">
          {/* Toast / Feedback */}
          {successToast && (
            <div className="mb-4 p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Tabs: Sign In / Create Account */}
          <div className="flex border-b border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setIsForgot(false);
              }}
              className={`flex-1 pb-3 text-xs font-semibold tracking-wide border-b-2 cursor-pointer transition-colors ${
                !isRegister && !isForgot
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setIsForgot(false);
              }}
              className={`flex-1 pb-3 text-xs font-semibold tracking-wide border-b-2 cursor-pointer transition-colors ${
                isRegister
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Student
            </button>
          </div>

          {isForgot ? (
            <div>
              <h3 className="text-base font-semibold text-white mb-1">Reset Password</h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter your campus email to receive a recovery token.
              </p>

              {resetSuccess ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Reset link dispatched
                  </div>
                  Please check your inbox.
                  <button
                    onClick={() => {
                      setIsForgot(false);
                      setResetSuccess(false);
                    }}
                    className="mt-3 block w-full py-2 bg-slate-700 text-white rounded-lg text-center font-medium hover:bg-slate-600"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Campus Email</label>
                    <div className="mt-1 relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="student@hostelsync.edu"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Send Recovery Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgot(false)}
                    className="w-full text-center text-xs text-slate-400 hover:text-white"
                  >
                    Cancel and return to login
                  </button>
                </form>
              )}
            </div>
          ) : !isRegister ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. warden@hostelsync.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Student Registration Form with Auto-Fill Feature */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] text-slate-400">Student Profile Information</span>
                <button
                  type="button"
                  onClick={handleAutoFillForm}
                  className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Generate and fill randomized student data into all fields"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>⚡ Auto-Fill Realistic Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300">Full Name</label>
                  <div className="mt-0.5 relative">
                    <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regData.full_name}
                      onChange={e => setRegData({ ...regData, full_name: e.target.value })}
                      placeholder="Maya Patel"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300">College Email</label>
                  <div className="mt-0.5 relative">
                    <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={e => setRegData({ ...regData, email: e.target.value })}
                      placeholder="maya@hostelsync.edu"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300">Enrollment No.</label>
                  <input
                    type="text"
                    required
                    value={regData.enrollment_no}
                    onChange={e => setRegData({ ...regData, enrollment_no: e.target.value })}
                    placeholder="CS-2026-401"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300">Department</label>
                  <select
                    value={regData.department}
                    onChange={e => setRegData({ ...regData, department: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Eng.</option>
                    <option value="Mechanical Engineering">Mechanical Eng.</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300">Year</label>
                  <select
                    value={regData.year_of_study}
                    onChange={e => setRegData({ ...regData, year_of_study: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300">Gender</label>
                  <select
                    value={regData.gender}
                    onChange={e => setRegData({ ...regData, gender: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300">Phone</label>
                  <input
                    type="tel"
                    value={regData.phone}
                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="555-0100"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300">Password</label>
                <div className="mt-0.5 relative">
                  <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}

          {/* AUTOMATED QUICK PERSONAS SELECTOR */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Automated Test Accounts ({personas.length})</span>
              </span>
              <button
                onClick={loadPersonas}
                className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                title="Refresh Personas"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {personas.map(p => (
                <div
                  key={p.id}
                  className="p-2.5 bg-slate-900/90 border border-slate-700/70 hover:border-indigo-500/60 rounded-xl transition-all flex flex-col justify-between group text-left"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {p.full_name}
                        </span>
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${
                            p.role === 'warden'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                              : p.role === 'staff'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {p.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.email}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handlePrefillLogin(p.email, p.password)}
                      className="text-slate-400 hover:text-slate-200 font-medium px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Prefill into login form"
                    >
                      Fill Form
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePersonaLogin(p.email, p.password)}
                      className="px-2 py-0.5 bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium rounded-md text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      title="1-Click Auto-Login"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-300" />
                      <span>Auto-Login</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

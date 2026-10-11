import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  Wrench,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredAccounts } from '../services/api';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [storedAccounts, setStoredAccounts] = useState<any[]>([]);
  const [showStoredAccounts, setShowStoredAccounts] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    enrollment_no: '',
    department: 'Computer Science & Engineering',
    year_of_study: 1,
    gender: 'Male',
    specialization: 'Electrical & AC Maintenance',
    employee_id: '',
  });

  // Load any previously registered accounts stored on device
  useEffect(() => {
    loadStoredAccountsList();
  }, [isRegister]);

  const loadStoredAccountsList = () => {
    const list = getStoredAccounts();
    setStoredAccounts(list);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Login succeeded - useAuth now has user set and App.tsx will switch to dashboard.
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Invalid credentials. Please verify your email and password, or create a new account.'
      );
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regData.full_name.trim() || !regData.email.trim() || !regData.password) {
      setErrorMessage('Full name, email address, and password are required.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = regData.email.trim();
      const cleanPass = regData.password.trim();

      await register({
        ...regData,
        email: cleanEmail,
        password: cleanPass,
        year_of_study: Number(regData.year_of_study),
      });

      // Update stored list
      loadStoredAccountsList();
      setSuccessMessage('Account created and stored successfully! Entering your dashboard...');
      // State transition will be picked up by useAuth() since user was populated
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Registration failed. Please verify the information entered.'
      );
      setLoading(false);
    }
  };

  const handleAutofillStored = (stored: any) => {
    setEmail(stored.user.email);
    setPassword(stored.password || '');
    setErrorMessage('');
    setSuccessMessage(`Loaded stored credentials for ${stored.user.full_name} (${stored.user.role})`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email to receive recovery instructions.');
      return;
    }
    setResetSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Hostel<span className="text-indigo-400">Sync</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Smart Centralized Hostel & Residence Management Platform
        </p>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="mt-6 inline-flex p-1 bg-slate-800 border border-slate-700 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setIsForgot(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !isRegister && !isForgot
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setIsForgot(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isRegister
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create New Account
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-800/95 border border-slate-700/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {isForgot ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Reset Password</h3>
              <p className="text-xs text-slate-400 mb-6">
                Enter your registered email address to receive password reset instructions.
              </p>

              {resetSuccess ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Reset link dispatched
                  </div>
                  Please check your inbox. If registered, a recovery link will be sent.
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(false);
                      setResetSuccess(false);
                    }}
                    className="mt-4 block w-full py-2 bg-slate-700 text-white rounded-lg text-center font-medium hover:bg-slate-600 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Registered Email</label>
                    <div className="mt-1 relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="yourname@hostelsync.edu"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    Send Recovery Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgot(false)}
                    className="w-full text-center text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel and return to Sign In
                  </button>
                </form>
              )}
            </div>
          ) : !isRegister ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. resident@hostelsync.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Create one now
                </button>
              </div>

              {/* Stored Accounts list helper if any accounts were created */}
              {storedAccounts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setShowStoredAccounts(!showStoredAccounts)}
                    className="w-full flex items-center justify-between text-left text-xs font-medium text-slate-400 hover:text-indigo-300 cursor-pointer py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Stored Accounts in System ({storedAccounts.length})</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        showStoredAccounts ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showStoredAccounts && (
                    <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {storedAccounts.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleAutofillStored(item)}
                          className="p-2 bg-slate-900/90 hover:bg-indigo-950/40 border border-slate-700/70 hover:border-indigo-500/50 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="font-medium text-white truncate">{item.user.full_name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{item.user.email}</p>
                          </div>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {item.user.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          ) : (
            /* Create New Account Form */
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Account Role</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 border border-slate-700 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRegData({ ...regData, role: 'student' })}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      regData.role === 'student'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Student
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegData({ ...regData, role: 'warden' })}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      regData.role === 'warden'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Warden
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegData({ ...regData, role: 'staff' })}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      regData.role === 'staff'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Staff
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Full Name</label>
                <div className="mt-1 relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regData.full_name}
                    onChange={e => setRegData({ ...regData, full_name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={e => {
                      setRegData({ ...regData, email: e.target.value });
                      setEmail(e.target.value);
                    }}
                    placeholder="name@hostelsync.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Student-specific fields */}
              {regData.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300">Enrollment No.</label>
                      <input
                        type="text"
                        value={regData.enrollment_no}
                        onChange={e => setRegData({ ...regData, enrollment_no: e.target.value })}
                        placeholder="e.g. CS-2026-101"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300">Department</label>
                      <select
                        value={regData.department}
                        onChange={e => setRegData({ ...regData, department: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Computer Science & Engineering">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Eng.</option>
                        <option value="Mechanical Engineering">Mechanical Eng.</option>
                        <option value="Biotechnology">Biotechnology</option>
                        <option value="Business Administration">Business Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300">Year of Study</label>
                      <select
                        value={regData.year_of_study}
                        onChange={e => setRegData({ ...regData, year_of_study: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value={1}>Year 1 (Freshman)</option>
                        <option value={2}>Year 2 (Sophomore)</option>
                        <option value={3}>Year 3 (Junior)</option>
                        <option value={4}>Year 4 (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300">Gender</label>
                      <select
                        value={regData.gender}
                        onChange={e => setRegData({ ...regData, gender: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Staff-specific fields */}
              {regData.role === 'staff' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Specialization</label>
                    <select
                      value={regData.specialization}
                      onChange={e => setRegData({ ...regData, specialization: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Electrical & AC Maintenance">Electrical & AC</option>
                      <option value="Plumbing & Drainage">Plumbing & Water</option>
                      <option value="Carpentry & Furniture">Carpentry & Lock</option>
                      <option value="Sanitation & Cleaning">Sanitation</option>
                      <option value="General Maintenance">General Tech</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Employee ID</label>
                    <input
                      type="text"
                      value={regData.employee_id}
                      onChange={e => setRegData({ ...regData, employee_id: e.target.value })}
                      placeholder="e.g. EMP-501"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Phone number */}
              <div>
                <label className="block text-xs font-medium text-slate-300">Contact Phone</label>
                <div className="mt-1 relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    value={regData.phone}
                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={regData.password}
                    onChange={e => {
                      setRegData({ ...regData, password: e.target.value });
                      setPassword(e.target.value);
                    }}
                    placeholder="Create a password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Account & Enter Dashboard'
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Sign in with existing account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

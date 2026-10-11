import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, registerStudent, switchDemoRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isForgot ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Reset Password</h3>
              <p className="text-xs text-slate-400 mb-6">
                Enter your registered campus email to receive a recovery token.
              </p>

              {resetSuccess ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Reset link dispatched
                  </div>
                  Please check your inbox. If found, proceed to reset your credentials.
                  <button
                    onClick={() => {
                      setIsForgot(false);
                      setResetSuccess(false);
                    }}
                    className="mt-4 block w-full py-2 bg-slate-700 text-white rounded-lg text-center font-medium hover:bg-slate-600"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Campus Email</label>
                    <div className="mt-1 relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="student@hostelsync.edu"
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
                    className="w-full text-center text-xs text-slate-400 hover:text-white"
                  >
                    Cancel and return to login
                  </button>
                </form>
              )}
            </div>
          ) : !isRegister ? (
            /* Login Form */
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
                    placeholder="e.g. warden@hostelsync.edu"
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
                    className="text-xs text-indigo-400 hover:text-indigo-300"
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
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">New student resident? </span>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            /* Student Registration Form */
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300">Full Name</label>
                <div className="mt-1 relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regData.full_name}
                    onChange={e => setRegData({ ...regData, full_name: e.target.value })}
                    placeholder="Jordan Lee"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">College Email</label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={e => setRegData({ ...regData, email: e.target.value })}
                    placeholder="jordan@hostelsync.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300">Enrollment No.</label>
                  <input
                    type="text"
                    required
                    value={regData.enrollment_no}
                    onChange={e => setRegData({ ...regData, enrollment_no: e.target.value })}
                    placeholder="CS-2025-099"
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
                    <option value="Computer Science">Computer Science</option>
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

              <div>
                <label className="block text-xs font-medium text-slate-300">Phone</label>
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

              <div>
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Complete Registration'
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already registered? </span>
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => switchDemoRole('warden')}
                className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-purple-500/30 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold mb-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Warden
                </div>
                <div className="text-[10px] text-slate-400 truncate">Dr. Vance</div>
              </button>

              <button
                type="button"
                onClick={() => switchDemoRole('student', 'alex')}
                className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-emerald-500/30 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student
                </div>
                <div className="text-[10px] text-slate-400 truncate">Alex (A-204)</div>
              </button>

              <button
                type="button"
                onClick={() => switchDemoRole('staff', 'david')}
                className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-amber-500/30 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-0.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Staff
                </div>
                <div className="text-[10px] text-slate-400 truncate">David (Electric)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

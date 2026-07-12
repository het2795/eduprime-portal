import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login, token, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated and user state is loaded, redirect to their home
  useEffect(() => {
    if (token && user) {
      if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (result.user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-navy-950 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-brand-purple/10 dark:bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-navy-700/50 p-8 relative z-10 transition-all duration-300">
        {/* Title logo banner */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/30 animate-pulse-subtle">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white font-heading">
            Edu<span className="text-brand-blue">Prime</span> Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium">Smart Student Portal Management System</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your student email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 outline-none focus:border-brand-blue dark:focus:border-brand-blue text-slate-800 dark:text-white transition-colors"
                required
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 outline-none focus:border-brand-blue dark:focus:border-brand-blue text-slate-800 dark:text-white transition-colors"
                required
              />
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-brand-blue hover:underline cursor-pointer">Forgot Password?</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs font-heading tracking-wide transition-all shadow-md shadow-brand-blue/20 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            {submitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In to Portal'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-navy-700/50 text-center">
          <p className="text-[10px] text-slate-400">
            Demo Student Credential: <br />
            <span className="font-semibold text-slate-500 dark:text-slate-300">arjun@eduprime.edu</span> / <span className="font-semibold text-slate-500 dark:text-slate-300">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

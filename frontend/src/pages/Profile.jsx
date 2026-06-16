import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, ShieldAlert, Award, FileText, CheckCircle2, Loader } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/history');
        if (response.data.success) {
          setTotalAnalyses(response.data.history.length);
        }
      } catch (err) {
        console.error('Error fetching statistics for profile:', err);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!name) {
      setError('Name cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    if (password && password.length < 6) {
      setError('New password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Put request to update profile details
      const response = await api.put('/auth/profile', { name, password });
      if (response.data.success) {
        setSuccess('Profile details updated successfully.');
        // Update user details in localStorage
        const updatedUser = { ...user, name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setPassword('');
        setConfirmPassword('');
        // Dispatch simple event to sync Sidebar
        window.dispatchEvent(new Event('auth-sync'));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Profile Management
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage your patient login credentials, name, and settings.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Info Left Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 text-center space-y-4">
            {/* Avatar circle */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-medical-550 text-white text-3xl font-extrabold shadow-lg shadow-medical-500/10">
              {user?.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
            </div>
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex justify-around text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">History Count</p>
                <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-200">{totalAnalyses}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">System Role</p>
                <p className="mt-1 text-sm font-bold text-medical-550">Patient</p>
              </div>
            </div>
          </div>

          {/* Guidelines info card */}
          <div className="glass-panel p-6 bg-gradient-to-br from-medical-50 to-white dark:from-slate-900 dark:to-slate-900/50">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 text-medical-550" />
              Security Information
            </h4>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We encrypt and hash all password hashes stored on our systems using standard cryptographic protocols. We recommend changing your passwords periodically to ensure security.
            </p>
          </div>
        </div>

        {/* Configuration Right Card */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h3>

            {success && (
              <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-550" />
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Email (Disabled) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-650 text-slate-400 dark:text-slate-500">
                    Email Address (Read-only)
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm opacity-60">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-600 dark:text-slate-400">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty to keep current"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm placeholder-slate-400 focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm placeholder-slate-400 focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center rounded-xl bg-medical-550 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-medical-500/10 transition-all hover:bg-medical-600 hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

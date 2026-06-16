import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  History,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Stethoscope
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Symptom Checker', path: '/checker', icon: Activity },
    { name: 'Analysis History', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-6 w-6 text-medical-550" />
          <span className="text-lg font-bold bg-gradient-to-r from-medical-550 to-emerald-500 bg-clip-text text-transparent">
            AuraCheck
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar element */}
      <aside
        className={`fixed bottom-0 top-0 z-40 flex w-64 flex-col border-r border-slate-200/50 bg-white p-5 transition-transform duration-300 dark:border-slate-800/50 dark:bg-slate-900 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden items-center space-x-2.5 pb-6 md:flex">
          <div className="rounded-xl bg-medical-500/10 p-2 text-medical-550">
            <Stethoscope className="h-6 w-6 text-medical-550" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-medical-550 to-emerald-500 bg-clip-text text-transparent">
            AuraCheck
          </span>
        </div>

        {/* User Card */}
        <div className="mb-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-550 text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || 'User'}
              </h4>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {user?.email || 'patient@auracheck.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-medical-550 text-white shadow-md shadow-medical-500/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="mt-auto space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleDarkMode}
            className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
          >
            <span className="flex items-center space-x-3">
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {darkMode ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <LogOut className="h-5 w-5 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay backdrop for mobile when sidebar drawer is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;

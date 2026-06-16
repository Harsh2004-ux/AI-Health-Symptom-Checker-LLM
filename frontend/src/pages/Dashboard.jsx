import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Activity,
  History,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/history');
        if (response.data.success) {
          setHistory(response.data.history);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Could not retrieve recent updates.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalChecks = history.length;
  const recentChecks = history.slice(0, 3);
  const lastCheck = history.length > 0 ? new Date(history[0].createdAt).toLocaleDateString() : 'N/A';

  // Calculate if any recent checks had high severity
  const hasHighSeverityAlert = history.slice(0, 5).some(
    (item) => item.aiResponse?.severity?.toLowerCase() === 'high'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Welcome back, {user?.name || 'Patient'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Monitor your symptoms and analyze health patterns in real-time.
          </p>
        </div>
        <Link
          to="/checker"
          className="inline-flex items-center justify-center rounded-xl bg-medical-550 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-medical-500/10 transition-all hover:bg-medical-600 hover:shadow-lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Check Symptoms
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Checks */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Analysis Runs
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : totalChecks}
            </h3>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Recorded since registration
            </p>
          </div>
          <div className="rounded-xl bg-medical-50 p-3.5 text-medical-550 dark:bg-medical-950/40">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Last Check */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Last Diagnostic Date
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : lastCheck}
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Your most recent symptom log
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-550 dark:bg-indigo-950/40">
            <History className="h-6 w-6 text-indigo-550" />
          </div>
        </div>

        {/* Card 3: Alert Status */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Warnings
            </p>
            <h3
              className={`mt-2 text-xl font-bold ${
                hasHighSeverityAlert
                  ? 'text-rose-500'
                  : 'text-emerald-500'
              }`}
            >
              {loading ? '...' : hasHighSeverityAlert ? 'High Severity Alert' : 'No Critical Alerts'}
            </h3>
            <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500">
              Based on recent 5 assessments
            </p>
          </div>
          <div
            className={`rounded-xl p-3.5 ${
              hasHighSeverityAlert
                ? 'bg-rose-50 text-rose-550 dark:bg-rose-950/40'
                : 'bg-emerald-50 text-emerald-550 dark:bg-emerald-950/40'
            }`}
          >
            {hasHighSeverityAlert ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <CheckCircle className="h-6 w-6" />
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent History & General Tips */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Symptom Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-slate-400" />
              Recent Symptoms Analyses
            </h3>
            <Link
              to="/history"
              className="text-xs font-semibold text-medical-550 hover:text-medical-600 flex items-center"
            >
              See All History
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel p-12 text-center text-slate-400">
              Loading recent audits...
            </div>
          ) : recentChecks.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                No analyses completed yet.
              </p>
              <Link
                to="/checker"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                Start your first scan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentChecks.map((check) => (
                <div
                  key={check.id}
                  className="glass-panel p-5 glass-panel-hover flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      "{check.symptoms}"
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span>{new Date(check.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{check.aiResponse?.possibleDiseases?.[0] || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        check.aiResponse?.severity?.toLowerCase() === 'high'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                          : check.aiResponse?.severity?.toLowerCase() === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}
                    >
                      {check.aiResponse?.severity || 'Low'}
                    </span>
                    <Link
                      to={`/history`}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* General Health Tip */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-slate-400" />
            General Wellness Tip
          </h3>
          <div className="glass-panel p-6 bg-gradient-to-br from-medical-500/10 to-emerald-500/5 border-medical-550/20 dark:from-medical-950/25 dark:to-emerald-950/15">
            <h4 className="font-bold text-medical-800 dark:text-medical-300">
              Stay Hydrated & Rested
            </h4>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Most minor health symptoms, such as head pain, fatigue, and mild muscle cramps, can be triggered or exacerbated by poor hydration and lack of sleep. Ensure you drink 2-3 liters of water daily and aim for 7-8 hours of quality rest.
            </p>
            <div className="mt-5 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                AI Health Recommendation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

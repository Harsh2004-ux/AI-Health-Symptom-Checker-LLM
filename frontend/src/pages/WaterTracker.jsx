import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Droplets, Plus, Target } from 'lucide-react';

const WaterTracker = () => {
  const [goal, setGoal] = useState(8);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/health/water');
      if (res.data.success) setHistory(res.data.data);
    } catch (e) { console.error(e); }
  };

  // Today's intake
  const today = new Date().toLocaleDateString();
  const todayEntries = history.filter(h => new Date(h.created_at).toLocaleDateString() === today);
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);
  const progress = Math.min(100, (todayTotal / goal) * 100);

  const addGlass = async () => {
    setLoading(true);
    try {
      await api.post('/health/water', { amount: 1, goal });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Group by day
  const dailyMap = {};
  history.forEach(h => {
    const day = new Date(h.created_at).toLocaleDateString();
    if (!dailyMap[day]) dailyMap[day] = { total: 0, goal: h.goal };
    dailyMap[day].total += h.amount;
  });
  const dailyHistory = Object.entries(dailyMap).map(([day, v]) => ({ day, ...v }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Water Intake Tracker</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Stay hydrated. Track your daily water consumption.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Progress Card */}
        <div className="lg:col-span-2 glass-panel p-8 flex flex-col items-center justify-center text-center space-y-6">
          {/* Circular Progress */}
          <div className="relative h-48 w-48">
            <svg className="h-48 w-48 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" strokeWidth="12" className="stroke-slate-200 dark:stroke-slate-800" />
              <circle cx="80" cy="80" r="70" fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-blue-500 transition-all duration-700"
                strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="h-8 w-8 text-blue-500 mb-1" />
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{todayTotal}</span>
              <span className="text-xs text-slate-400">of {goal} glasses</span>
            </div>
          </div>

          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {progress >= 100 ? '🎉 Daily goal reached!' : `${Math.round(progress)}% of daily goal`}
          </p>

          <button onClick={addGlass} disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-600 disabled:opacity-50 transition-all">
            <Plus className="h-5 w-5" /> Add 1 Glass (250ml)
          </button>
        </div>

        {/* Goal Setting & Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Target className="h-5 w-5 text-blue-500" /> Set Daily Goal</h3>
            <div className="flex items-center gap-3">
              <input type="number" min="1" max="20" value={goal} onChange={e => setGoal(parseInt(e.target.value) || 8)}
                className="w-20 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-center text-sm font-bold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
              <span className="text-sm text-slate-500">glasses / day</span>
            </div>
          </div>

          <div className="glass-panel p-6 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-900/50">
            <h4 className="font-bold text-blue-800 dark:text-blue-300">💧 Hydration Tip</h4>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Adequate hydration helps maintain body temperature, lubricates joints, and prevents kidney stones. Aim for 2-3 liters of water daily.
            </p>
          </div>
        </div>
      </div>

      {/* Daily History */}
      {dailyHistory.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Daily History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 text-left">Date</th><th className="px-6 py-3 text-left">Glasses</th><th className="px-6 py-3 text-left">Goal</th><th className="px-6 py-3 text-left">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dailyHistory.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-3 text-slate-500">{d.day}</td>
                    <td className="px-6 py-3 font-bold">{d.total}</td>
                    <td className="px-6 py-3">{d.goal}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.total >= d.goal ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'}`}>
                        {d.total >= d.goal ? 'Completed' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default WaterTracker;

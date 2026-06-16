import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HeartPulse, Plus, TrendingUp } from 'lucide-react';

const HealthTracker = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ weight: '', blood_pressure_systolic: '', blood_pressure_diastolic: '', blood_sugar: '', heart_rate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/health/metrics');
      if (res.data.success) setData(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await api.post('/health/metrics', {
        weight: form.weight ? parseFloat(form.weight) : null,
        blood_pressure_systolic: form.blood_pressure_systolic ? parseInt(form.blood_pressure_systolic) : null,
        blood_pressure_diastolic: form.blood_pressure_diastolic ? parseInt(form.blood_pressure_diastolic) : null,
        blood_sugar: form.blood_sugar ? parseInt(form.blood_sugar) : null,
        heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
      });
      if (res.data.success) {
        setSuccess('Health metric saved.');
        setForm({ weight: '', blood_pressure_systolic: '', blood_pressure_diastolic: '', blood_sugar: '', heart_rate: '' });
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setLoading(false); }
  };

  const chartData = data.map(d => ({
    date: new Date(d.created_at).toLocaleDateString(),
    weight: d.weight,
    systolic: d.blood_pressure_systolic,
    diastolic: d.blood_pressure_diastolic,
    sugar: d.blood_sugar,
    heart: d.heart_rate,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Health Tracker</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Track your vital health metrics and view trends over time.</p>
      </div>

      {/* Form */}
      <div className="glass-panel p-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4"><Plus className="h-5 w-5 text-medical-550" /> Log Health Metrics</h3>
        {error && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">{error}</div>}
        {success && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">{success}</div>}
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Weight (kg)</label>
            <input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="65.5"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">BP Systolic</label>
            <input type="number" value={form.blood_pressure_systolic} onChange={e => setForm({...form, blood_pressure_systolic: e.target.value})} placeholder="120"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">BP Diastolic</label>
            <input type="number" value={form.blood_pressure_diastolic} onChange={e => setForm({...form, blood_pressure_diastolic: e.target.value})} placeholder="80"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Blood Sugar</label>
            <input type="number" value={form.blood_sugar} onChange={e => setForm({...form, blood_sugar: e.target.value})} placeholder="100"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Heart Rate</label>
            <input type="number" value={form.heart_rate} onChange={e => setForm({...form, heart_rate: e.target.value})} placeholder="72"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </div>
          <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
            <button type="submit" disabled={loading} className="rounded-xl bg-medical-550 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-medical-600 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Metrics'}
            </button>
          </div>
        </form>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { title: 'Weight Trend', key: 'weight', color: '#14b8a6', unit: 'kg' },
            { title: 'Blood Pressure', key: null, color: null, unit: 'mmHg' },
            { title: 'Blood Sugar', key: 'sugar', color: '#f59e0b', unit: 'mg/dL' },
            { title: 'Heart Rate', key: 'heart', color: '#ef4444', unit: 'bpm' },
          ].map((chart, idx) => (
            <div key={idx} className="glass-panel p-5">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" /> {chart.title} ({chart.unit})
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  {chart.key ? (
                    <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={{ r: 3 }} />
                  ) : (
                    <>
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* History Table */}
      {data.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Metrics History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3">Weight</th><th className="px-4 py-3">BP</th><th className="px-4 py-3">Sugar</th><th className="px-4 py-3">Heart Rate</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.slice().reverse().map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-center">
                    <td className="px-4 py-3 text-left text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{r.weight || '—'} kg</td>
                    <td className="px-4 py-3">{r.blood_pressure_systolic || '—'}/{r.blood_pressure_diastolic || '—'}</td>
                    <td className="px-4 py-3">{r.blood_sugar || '—'}</td>
                    <td className="px-4 py-3">{r.heart_rate || '—'} bpm</td>
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
export default HealthTracker;

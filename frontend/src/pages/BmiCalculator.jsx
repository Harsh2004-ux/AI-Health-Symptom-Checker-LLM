import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Trash2, Calculator } from 'lucide-react';

const BMI_RANGES = [
  { label: 'Underweight', range: '< 18.5', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/30' },
  { label: 'Normal', range: '18.5 – 24.9', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/30' },
  { label: 'Overweight', range: '25 – 29.9', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/30' },
  { label: 'Obese', range: '≥ 30', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/30' },
];

function getCategoryStyle(category) {
  const map = { Underweight: BMI_RANGES[0], Normal: BMI_RANGES[1], Overweight: BMI_RANGES[2], Obese: BMI_RANGES[3] };
  return map[category] || BMI_RANGES[1];
}

const BmiCalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/health/bmi');
      if (res.data.success) setHistory(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    if (!height || !weight) { setError('Please enter both height and weight.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/health/bmi', { height: parseFloat(height), weight: parseFloat(weight) });
      if (res.data.success) {
        setResult(res.data);
        fetchHistory();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to calculate BMI.');
    } finally { setLoading(false); }
  };

  const bmiPercent = result ? Math.min(100, ((result.bmi - 10) / 30) * 100) : 0;
  const style = result ? getCategoryStyle(result.category) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">BMI Calculator</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Calculate your Body Mass Index and track your progress over time.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Calculator className="h-5 w-5 text-medical-550" /> Calculate BMI</h3>
          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">{error}</div>}
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400">Height (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 170"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400">Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center rounded-xl bg-medical-550 py-3 text-sm font-semibold text-white shadow-md hover:bg-medical-600 disabled:opacity-50">
              {loading ? 'Calculating...' : 'Calculate BMI'}
            </button>
          </form>

          {/* Result */}
          {result && style && (
            <div className={`rounded-2xl border p-5 ${style.bg} ${style.border} animate-fade-in`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Your BMI</span>
                <span className={`text-4xl font-extrabold ${style.color}`}>{result.bmi}</span>
              </div>
              <div className="mt-3 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={`h-3 rounded-full transition-all duration-700 ${result.category === 'Underweight' ? 'bg-blue-400' : result.category === 'Normal' ? 'bg-emerald-400' : result.category === 'Overweight' ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${bmiPercent}%` }}></div>
              </div>
              <p className={`mt-3 text-lg font-bold ${style.color}`}>{result.category}</p>
            </div>
          )}
        </div>

        {/* BMI Range Reference */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">BMI Categories</h3>
          {BMI_RANGES.map(r => (
            <div key={r.label} className={`rounded-xl border p-4 flex items-center justify-between ${r.bg} ${r.border}`}>
              <span className={`font-bold ${r.color}`}>{r.label}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{r.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">BMI History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Height</th>
                  <th className="px-6 py-3 text-left">Weight</th>
                  <th className="px-6 py-3 text-left">BMI</th>
                  <th className="px-6 py-3 text-left">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map(item => {
                  const s = getCategoryStyle(item.category);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-3 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-3">{item.height} cm</td>
                      <td className="px-6 py-3">{item.weight} kg</td>
                      <td className="px-6 py-3 font-bold">{item.bmi}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.color}`}>{item.category}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default BmiCalculator;

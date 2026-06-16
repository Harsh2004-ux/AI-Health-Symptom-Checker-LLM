import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  History as HistoryIcon,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  X,
  Clipboard,
  CheckCircle,
  Apple,
  Lightbulb,
  Stethoscope
} from 'lucide-react';

const History = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/history');
      if (response.data.success) {
        setHistoryList(response.data.history);
      }
    } catch (err) {
      console.error('Error fetching history list:', err);
      setError('Failed to fetch previous checks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this symptom record from your history?')) {
      return;
    }

    try {
      const response = await api.delete(`/history/${id}`);
      if (response.data.success) {
        setSuccessMessage('Record deleted successfully.');
        // Remove from local list
        setHistoryList(historyList.filter((item) => item.id !== id));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting history item:', err);
      alert('Failed to delete history record. Please try again.');
    }
  };

  const getSeverityStyle = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'high') {
      return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
    }
    if (s === 'medium') {
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
    }
    return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Analysis History
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Review your previous checks, diagnosis warnings, and dietary reports.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-16 text-center text-slate-400">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-350 border-t-medical-550 mb-4"></div>
          Loading history logs...
        </div>
      ) : historyList.length === 0 ? (
        <div className="glass-panel p-16 text-center max-w-2xl mx-auto">
          <HistoryIcon className="mx-auto h-16 w-16 text-slate-200 dark:text-slate-700" />
          <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Your history list is empty</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            You haven't run any AI health assessments yet. Go to the Symptom Checker page to complete your first evaluation.
          </p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500">
                  <th className="px-6 py-4">Analysis Date</th>
                  <th className="px-6 py-4">Symptoms Logged</th>
                  <th className="px-6 py-4">Possible Conditions</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {historyList.map((record) => {
                  const ai = record.aiResponse || {};
                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      {/* Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Symptoms Summary */}
                      <td className="px-6 py-4 max-w-xs truncate text-slate-700 dark:text-slate-300 font-medium">
                        {record.symptoms}
                      </td>

                      {/* Possible Condition */}
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {ai.possibleDiseases && ai.possibleDiseases.length > 0
                          ? ai.possibleDiseases.join(', ')
                          : 'Unknown'}
                      </td>

                      {/* Severity Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getSeverityStyle(
                            ai.severity
                          )}`}
                        >
                          {ai.severity || 'Low'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="View report details"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Details</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Assessed on {new Date(selectedRecord.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-6 space-y-6">
              {/* User Symptoms Description */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Logged Symptoms
                </span>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 italic font-medium">
                  "{selectedRecord.symptoms}"
                </p>
              </div>

              {/* Grid section */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Possible Diseases */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                    <Clipboard className="mr-2 h-4 w-4" />
                    Possible Conditions
                  </h4>
                  {selectedRecord.aiResponse?.possibleDiseases?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {selectedRecord.aiResponse.possibleDiseases.map((d, i) => (
                        <li key={i} className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-medical-550"></span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">Unknown</p>
                  )}
                </div>

                {/* Severity Status */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Severity & Consultation
                  </h4>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getSeverityStyle(
                        selectedRecord.aiResponse?.severity
                      )}`}
                    >
                      {selectedRecord.aiResponse?.severity || 'Low'} Severity
                    </span>
                  </div>
                  {/* Doctor recommendation alert */}
                  <div
                    className={`mt-2 rounded-xl p-3 border text-xs leading-relaxed ${
                      selectedRecord.aiResponse?.doctorConsultationRequired
                        ? 'border-rose-200 bg-rose-50/50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/10 dark:text-rose-300'
                        : 'border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider mb-1">
                      <Stethoscope className="h-4 w-4 shrink-0" />
                      <span>
                        {selectedRecord.aiResponse?.doctorConsultationRequired
                          ? 'Consult Physician'
                          : 'Monitor from Home'}
                      </span>
                    </div>
                    {selectedRecord.aiResponse?.doctorConsultationRequired
                      ? 'Clinical checking is highly encouraged for safety.'
                      : 'Home rest and self-care monitoring should be safe for now.'}
                  </div>
                </div>

                {/* Precautions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Recommended Precautions
                  </h4>
                  {selectedRecord.aiResponse?.precautions?.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedRecord.aiResponse.precautions.map((p, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">None</p>
                  )}
                </div>

                {/* Diets */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                    <Apple className="mr-2 h-4 w-4" />
                    Dietary Suggestions
                  </h4>
                  {selectedRecord.aiResponse?.dietRecommendations?.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedRecord.aiResponse.dietRecommendations.map((diet, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
                          {diet}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">None</p>
                  )}
                </div>
              </div>

              {/* General Advice */}
              {selectedRecord.aiResponse?.healthAdvice?.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    General Advice
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedRecord.aiResponse.healthAdvice.map((advice, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
                      >
                        {advice}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

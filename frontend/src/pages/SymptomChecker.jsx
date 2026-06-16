import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Activity,
  AlertOctagon,
  Apple,
  Clipboard,
  AlertTriangle,
  Lightbulb,
  HeartHandshake,
  CheckCircle,
  FileCheck2,
  Stethoscope
} from 'lucide-react';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const sampleSymptoms = [
    { label: 'Flu Symptoms', text: 'I have a dry cough, sore throat, mild runny nose, and feeling fatigued with a body temperature of 100°F since yesterday.' },
    { label: 'Migraine', text: 'Thumping headache on the left side of my head, accompanied by nausea, sensitivity to bright light, and blurry vision.' },
    { label: 'Indigestion', text: 'Feeling bloated after meals with a burning sensation in my chest, stomach cramps, and slight acid reflux.' },
  ];

  const handleSampleClick = (text) => {
    setSymptoms(text);
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe your symptoms first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    // Dynamic loading text updates for premium feel
    const stages = [
      'Reading your description...',
      'Connecting to Gemini LLM...',
      'Analyzing health symptoms...',
      'Structuring diagnostic possibilities...',
      'Finalizing precautions and health advisory...'
    ];

    let stageIdx = 0;
    setStatusText(stages[0]);
    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setStatusText(stages[stageIdx]);
    }, 2000);

    try {
      const response = await api.post('/symptoms/analyze', { symptoms });
      if (response.data.success) {
        setResult(response.data.aiResponse);
      } else {
        setError('Analysis returned unsuccessful status. Please retry.');
      }
    } catch (err) {
      console.error('Symptom analysis error:', err);
      setError(
        err.response?.data?.message ||
        'Symptom checker analysis failed. Please verify your internet connection or Gemini API key configuration.'
      );
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          AI Symptom Checker
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          State what you are feeling in natural language. Our AI assistant will analyze and evaluate possibilities.
        </p>
      </div>

      {/* Input Area & Sample Suggestions */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  How are you feeling today?
                </label>
                <textarea
                  id="symptoms"
                  rows={6}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  disabled={isLoading}
                  placeholder="Describe your symptoms in detail (e.g., I have had a severe throat infection and high fever since the last 2 days...)"
                  className="mt-3 block w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm placeholder-slate-400 focus:border-medical-550 focus:outline-none focus:ring-1 focus:ring-medical-550 dark:border-slate-800 dark:bg-slate-900 dark:text-white disabled:opacity-75"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading || !symptoms.trim()}
                  className="flex items-center justify-center rounded-xl bg-medical-550 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-medical-500/10 transition-all hover:bg-medical-600 hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2.5 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {statusText}
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Analyze Symptoms
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSymptoms('');
                    setResult(null);
                    setError('');
                  }}
                  disabled={isLoading || !symptoms}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Clear Entry
                </button>
              </div>
            </form>
          </div>

          {/* Medical Advisory Box */}
          <div className="rounded-2xl border border-amber-200/50 bg-amber-50/50 p-5 dark:border-amber-900/30 dark:bg-amber-950/10">
            <div className="flex space-x-3">
              <AlertOctagon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Important Educational Notice
                </h4>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed">
                  This analysis is driven by generative artificial intelligence (Gemini) and is intended for informational and educational purposes only. It is not a substitute for professional clinical judgments, diagnosis, or treatments. Always consult a healthcare provider for any questions regarding a medical condition.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Templates Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-slate-400" />
            Quick Example Prompts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any option below to pre-fill the symptom form.
          </p>
          <div className="space-y-3">
            {sampleSymptoms.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                disabled={isLoading}
                className="w-full text-left glass-panel p-4 glass-panel-hover text-xs focus:ring-1 focus:ring-medical-550 focus:outline-none"
              >
                <h4 className="font-bold text-slate-700 dark:text-slate-300">{sample.label}</h4>
                <p className="mt-2 text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="space-y-8 animate-fade-in border-t border-slate-200/50 dark:border-slate-800/50 pt-8">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-emerald-550/10 p-2 text-emerald-550">
              <FileCheck2 className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis Results</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 1. Possible Diseases Card */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                <Clipboard className="mr-2 h-4 w-4" />
                Possible Diseases/Conditions
              </h3>
              {result.possibleDiseases && result.possibleDiseases.length > 0 ? (
                <ul className="space-y-2">
                  {result.possibleDiseases.map((disease, idx) => (
                    <li key={idx} className="flex items-center space-x-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-medical-550"></span>
                      <span>{disease}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No matching diseases identified.</p>
              )}
            </div>

            {/* 2. Severity & Consultation Card */}
            <div className="glass-panel p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Assessment Severity
                </h3>
                <div className="mt-4 flex items-center space-x-4">
                  <span
                    className={`inline-flex rounded-xl px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${
                      result.severity?.toLowerCase() === 'high'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                        : result.severity?.toLowerCase() === 'medium'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                    }`}
                  >
                    {result.severity || 'Low'} Severity
                  </span>
                </div>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Severity level is evaluated based on symptoms complexity and high-risk indicators in the diagnosis.
                </p>
              </div>

              {/* Consultation Alert Box */}
              <div
                className={`mt-6 rounded-xl border p-4 ${
                  result.doctorConsultationRequired
                    ? 'border-rose-200 bg-rose-50/50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/10 dark:text-rose-300'
                    : 'border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {result.doctorConsultationRequired
                      ? 'Doctor Consultation Recommended'
                      : 'Self-Care Monitoring Permitted'}
                  </span>
                </div>
                <p className="mt-2 text-xs opacity-90 leading-relaxed">
                  {result.doctorConsultationRequired
                    ? 'A clinical checkup is strongly suggested to properly rule out serious pathologies.'
                    : 'Your symptoms appear mild, but check back or consult a doctor if they persist or get worse.'}
                </p>
              </div>
            </div>

            {/* 3. Precautions Card */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                <HeartHandshake className="mr-2 h-4 w-4" />
                Precautionary Actions
              </h3>
              {result.precautions && result.precautions.length > 0 ? (
                <ul className="space-y-3">
                  {result.precautions.map((precaution, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-medical-550 shrink-0 mt-0.5" />
                      <span>{precaution}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No specific precautions indicated.</p>
              )}
            </div>

            {/* 4. Diet Recommendations Card */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                <Apple className="mr-2 h-4 w-4" />
                Supportive Diet & Nutrition
              </h3>
              {result.dietRecommendations && result.dietRecommendations.length > 0 ? (
                <ul className="space-y-3">
                  {result.dietRecommendations.map((diet, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{diet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No specific diet recommendations suggested.</p>
              )}
            </div>

            {/* 5. General Health Advice (Full Width) */}
            <div className="glass-panel p-6 space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                <Lightbulb className="mr-2 h-4 w-4" />
                General Health Advice
              </h3>
              {result.healthAdvice && result.healthAdvice.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.healthAdvice.map((advice, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                    >
                      {advice}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No general health advice reported.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;

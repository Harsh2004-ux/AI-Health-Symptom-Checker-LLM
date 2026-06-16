import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Shield, Heart, HelpCircle, ArrowRight, Activity, Brain } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation Header */}
      <header className="mx-auto max-w-7xl px-6 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-medical-550 p-2 text-white shadow-md shadow-medical-500/10">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-medical-550 to-emerald-500 bg-clip-text text-transparent">
              AuraCheck
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-medical-550 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-medical-500/10 transition-all hover:bg-medical-600 hover:shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-medical-550 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-medical-500/10 transition-all hover:bg-medical-600 hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center md:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-medical-100/60 px-4 py-1.5 dark:bg-medical-900/30 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-medical-550 animate-pulse"></span>
            <span className="text-xs font-semibold text-medical-800 dark:text-medical-300">
              Powered by Google Gemini Large Language Models
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            Understand Your Health in{' '}
            <span className="bg-gradient-to-r from-medical-550 to-emerald-400 bg-clip-text text-transparent">
              Plain English
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Enter your symptoms in everyday language. AuraCheck uses cutting-edge artificial intelligence to analyze your symptoms, suggest possibilities, outline key precautions, and advise on next steps.
          </p>

          {/* Call-to-actions */}
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              to={isAuthenticated ? '/checker' : '/register'}
              className="w-full inline-flex items-center justify-center rounded-xl bg-medical-550 px-8 py-4 text-base font-bold text-white shadow-lg shadow-medical-500/10 transition-all hover:bg-medical-600 hover:shadow-xl hover:shadow-medical-500/20 sm:w-auto"
            >
              Analyze Symptoms Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 sm:w-auto"
            >
              How it Works
            </a>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div id="features" className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="glass-panel p-8 text-left glass-panel-hover">
            <div className="inline-flex rounded-xl bg-medical-50 p-3 text-medical-550 dark:bg-medical-950/40">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Gemini LLM Analysis</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Processes raw natural language descriptions. No medical jargon required. State your symptoms exactly how you feel them.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 text-left glass-panel-hover">
            <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-550 dark:bg-emerald-950/40">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Precautions & Advice</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Provides general health care precautions, lifestyle insights, and alerts if immediate professional medical consultation is needed.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 text-left glass-panel-hover">
            <div className="inline-flex rounded-xl bg-rose-50 p-3 text-rose-550 dark:bg-rose-950/40">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Diet & Nutrition</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Generates supportive dietary recommendations tailored to your symptoms to promote wellness and symptom relief.
            </p>
          </div>
        </div>
      </section>

      {/* Medical Disclaimer Section */}
      <footer className="mt-auto border-t border-slate-200/50 bg-slate-100/50 py-12 dark:border-slate-800/50 dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-6 text-center md:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Important Medical Disclaimer
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            AuraCheck is an AI-powered educational reference tool and does not provide formal medical diagnosis, clinical advice, or treatment recommendations. The suggestions provided should not replace professional medical evaluations. If you are experiencing serious or life-threatening symptoms, please contact your local emergency services or consult a qualified physician immediately.
          </p>
          <p className="mt-8 text-xs text-slate-400 dark:text-slate-600">
            &copy; {new Date().getFullYear()} AuraCheck. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

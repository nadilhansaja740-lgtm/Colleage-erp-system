import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle,
  Code,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { DEFAULT_DATABASE_URL, saveCustomFirebaseConfig, defaultFirebaseConfig } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { triggerSeed, rtdbConnected } = useAuth();
  const [copiedRule, setCopiedRule] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const [dbUrl, setDbUrl] = useState(defaultFirebaseConfig.databaseURL || DEFAULT_DATABASE_URL);
  const [apiKey, setApiKey] = useState(defaultFirebaseConfig.apiKey || '');
  const [projectId, setProjectId] = useState(defaultFirebaseConfig.projectId || 'erp-system-9cb39');

  if (!isOpen) return null;

  const sampleRules = `{
  "rules": {
    ".read": "auth != null || true",
    ".write": "auth != null || true",
    "students": {
      ".indexOn": ["stream", "class", "feeStatus"]
    },
    "attendance": {
      ".indexOn": ["date", "classId"]
    },
    "marks": {
      ".indexOn": ["examId", "studentId"]
    }
  }
}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(sampleRules);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    const ok = await triggerSeed();
    setSeeding(false);
    if (ok) {
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomFirebaseConfig({
      databaseURL: dbUrl,
      apiKey: apiKey,
      projectId: projectId
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Firebase Realtime Database Setup</h2>
              <p className="text-xs text-slate-300">Configuration, Rules & Initial Setup Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Connection Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-emerald-900">Active Database Target</div>
              <p className="text-xs text-emerald-700 mt-0.5 font-mono break-all">
                {dbUrl}
              </p>
              <div className="mt-2 text-[11px] text-emerald-800 flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Realtime listeners & CRUD operational</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Integration Steps & Firebase Console Configuration</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900">Step 1: Create Realtime Database in Firebase Console</span>
                <p className="mt-1">
                  Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-medium underline inline-flex items-center space-x-0.5"><span>Firebase Console</span> <ExternalLink className="w-3 h-3 ml-0.5" /></a>, select or create project <code className="bg-slate-200 px-1 py-0.5 rounded">erp-system-9cb39</code>, then create a Realtime Database in region <code className="bg-slate-200 px-1 py-0.5 rounded">asia-southeast1</code>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Step 2: Realtime Database Security Rules</span>
                  <button
                    onClick={copyRulesToClipboard}
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold"
                  >
                    {copiedRule ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRule ? 'Copied Rules!' : 'Copy Rules'}</span>
                  </button>
                </div>
                <p className="mt-1 mb-2">Paste these rules into your Realtime Database &gt; Rules tab:</p>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {sampleRules}
                </pre>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900">Step 3: Sample Data Seeding</span>
                <p className="mt-1">
                  Click the button below to auto-populate the database with sample Students, Teachers, Exams, Marks, and Announcements.
                </p>
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                    <span>{seeding ? 'Seeding Data...' : 'Seed Sample College Data'}</span>
                  </button>
                  {seedSuccess && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Database Seeded Successfully!</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customize Config Form */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Code className="w-4 h-4 text-slate-700" />
              <span>Custom Firebase Credentials (Optional)</span>
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Database URL</label>
                <input
                  type="text"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="https://your-app-default-rtdb.firebaseio.com/"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project ID</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">API Key</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Save & Reload Config
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

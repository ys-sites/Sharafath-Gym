import { useState, ChangeEvent } from 'react';
import { 
  Database, 
  UploadCloud, 
  DownloadCloud, 
  Copy, 
  Check, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  getGymStore, 
  exportGymDataJSON, 
  importGymDataJSON, 
  resetToSeedData,
  GymDataStore 
} from '../lib/manualStorage';

export default function DataHub() {
  const [store, setStore] = useState<GymDataStore>(getGymStore());
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  const [pasteJSON, setPasteJSON] = useState('');

  const refresh = () => {
    setStore(getGymStore());
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportGymDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sharafath-gym-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    const jsonStr = exportGymDataJSON();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importGymDataJSON(content);
      if (res.success) {
        setImportStatus({ type: 'success', message: res.message });
        refresh();
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!pasteJSON.trim()) return;
    const res = importGymDataJSON(pasteJSON);
    if (res.success) {
      setImportStatus({ type: 'success', message: res.message });
      setPasteJSON('');
      refresh();
    } else {
      setImportStatus({ type: 'error', message: res.message });
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset to Coach Mousa's baseline seed data? This will restore the official program entries.")) {
      resetToSeedData();
      refresh();
      setImportStatus({ type: 'success', message: "Data successfully reset to Coach Mousa's baseline profile." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                Manual Storage Hub
              </span>
              <span className="text-xs text-zinc-400 font-mono">100% Offline & Private</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Data Management & Upload Portal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Upload your gym logs, export timestamped JSON backups, or transfer your workout data 
              seamlessly across devices with zero external cloud or database dependencies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 self-start md:self-auto">
            <HardDrive size={20} className="text-amber-400" />
            <div className="text-xs">
              <span className="text-zinc-500 block uppercase font-mono text-[10px]">Storage Status</span>
              <span className="text-white font-bold font-mono">Active & Persistent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Logged Workouts</span>
          <p className="text-2xl font-bold font-mono text-amber-300">{store.workouts.length} sessions</p>
          <span className="text-xs text-zinc-400">Includes Day 6 Lower & splits</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Weight Check-Ins</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">{store.weights.length} entries</p>
          <span className="text-xs text-zinc-400">82kg → 75kg trajectory</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Nutrition Days</span>
          <p className="text-2xl font-bold font-mono text-cyan-400">{store.nutrition.length} records</p>
          <span className="text-xs text-zinc-400">2,200 kcal protocol</span>
        </div>
      </div>

      {/* Status Notice */}
      {importStatus.type !== 'idle' && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono ${
          importStatus.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          {importStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Two Column: Upload & Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Column */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <UploadCloud size={18} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Upload / Import Gym Data
            </h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Upload a previously exported JSON gym file from your device to restore or update your workouts and body stats.
          </p>

          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-xl cursor-pointer bg-zinc-950/60 transition-colors group">
            <UploadCloud size={32} className="text-zinc-500 group-hover:text-amber-400 transition-colors mb-2" />
            <span className="text-xs font-bold text-zinc-300 group-hover:text-white">Click to Select JSON File</span>
            <span className="text-[10px] font-mono text-zinc-500 mt-1">.json backup format</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-mono text-zinc-400 block">Or Paste JSON Data Directly:</label>
            <textarea
              rows={4}
              placeholder="Paste raw JSON here..."
              value={pasteJSON}
              onChange={e => setPasteJSON(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-300 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={handlePasteImport}
              disabled={!pasteJSON.trim()}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-bold text-white transition-colors"
            >
              Parse & Import JSON
            </button>
          </div>
        </div>

        {/* Export Column */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <DownloadCloud size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Export / Backup Gym Data
            </h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Download your entire training history, logged sets, weigh-ins, and nutritional records into a single portable file.
          </p>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Current Backup Size:</span>
              <span className="text-white font-bold">~{(exportGymDataJSON().length / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Last Updated:</span>
              <span className="text-zinc-300">{store.lastUpdated.slice(0, 10)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <DownloadCloud size={16} />
              <span>Download Timestamped Backup (.json)</span>
            </button>

            <button
              onClick={handleCopyClipboard}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw JSON to Clipboard'}</span>
            </button>
          </div>

          {/* Reset button */}
          <div className="pt-6 border-t border-zinc-800">
            <button
              onClick={handleResetDefaults}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all font-mono"
            >
              <RotateCcw size={13} />
              <span>Restore Coach Mousa Presets & Initial History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

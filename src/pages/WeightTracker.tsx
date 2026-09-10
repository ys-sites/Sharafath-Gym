import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { 
  Scale, 
  Plus, 
  Trash2, 
  TrendingDown, 
  Sparkles, 
  Award, 
  Calendar, 
  Moon, 
  Zap, 
  Info,
  Check
} from 'lucide-react';
import { 
  getGymStore, 
  saveWeightEntry, 
  deleteWeightEntry, 
  ManualWeightEntry 
} from '../lib/manualStorage';
import { SHARAFATH_PROFILE } from '../data/blueprintData';

export default function WeightTracker() {
  const [store, setStore] = useState(getGymStore());
  const [showInputForm, setShowInputForm] = useState(false);

  // Form states
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState<number | ''>(80.0);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [energyLevel, setEnergyLevel] = useState<number>(8);
  const [waistCm, setWaistCm] = useState<number | ''>(90.0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => setStore(getGymStore());
    window.addEventListener('sharafath-gym-data-updated', handleUpdate);
    return () => window.removeEventListener('sharafath-gym-data-updated', handleUpdate);
  }, []);

  const startingWeight = SHARAFATH_PROFILE.startingWeightKg; // 82.0
  const targetWeight = SHARAFATH_PROFILE.goalWeightKg; // 75.0

  const sortedWeights = useMemo(() => {
    return [...store.weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [store.weights]);

  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weightKg : startingWeight;
  const lostKg = Math.max(0, startingWeight - currentWeight);
  const remainingKg = Math.max(0, currentWeight - targetWeight);
  const totalGoalDelta = startingWeight - targetWeight; // 7.0
  const progressPct = Math.min(100, Math.round((lostKg / totalGoalDelta) * 100));

  // Compute 7-day rolling average for the latest weigh-in
  const rollingAverage = useMemo(() => {
    if (sortedWeights.length === 0) return currentWeight;
    const last3 = sortedWeights.slice(-4);
    const sum = last3.reduce((acc, curr) => acc + curr.weightKg, 0);
    return (sum / last3.length).toFixed(1);
  }, [sortedWeights, currentWeight]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (weightKg === '' || Number(weightKg) <= 0) return;

    saveWeightEntry({
      date,
      weightKg: Number(weightKg),
      sleepHours,
      stressLevel,
      energyLevel,
      waistCm: waistCm === '' ? undefined : Number(waistCm),
      notes: notes.trim() || undefined
    });

    setShowInputForm(false);
    setNotes('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Milestone Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                Transformation Tracker
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Fat Loss & Body Composition
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Body Weight & Metric Trajectory
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Tracking your path from 82.0 kg down to 75.0 kg. Monitor 3–4 morning weigh-ins per week 
              and review rolling weekly averages as prescribed by coach Mousa.
            </p>
          </div>

          <button
            onClick={() => setShowInputForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-[0.98] transition-all self-start md:self-auto"
          >
            <Plus size={16} />
            <span>Record Weigh-In</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Starting Weight</span>
          <p className="text-2xl font-bold font-mono text-zinc-200">{startingWeight.toFixed(1)} kg</p>
          <span className="text-xs text-zinc-400">Baseline Assessment</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Current Morning Weight</span>
          <p className="text-2xl font-bold font-mono text-amber-300">{currentWeight.toFixed(1)} kg</p>
          <span className="text-xs text-emerald-400 font-mono font-medium">-{lostKg.toFixed(1)} kg lost</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Weekly Rolling Avg</span>
          <p className="text-2xl font-bold font-mono text-cyan-300">{rollingAverage} kg</p>
          <span className="text-xs text-zinc-400">3–4 session smoothing</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Goal</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">{targetWeight.toFixed(1)} kg</p>
          <span className="text-xs text-zinc-400 font-mono">{remainingKg.toFixed(1)} kg remaining</span>
        </div>
      </div>

      {/* Progress Bar & Coach Guidance */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 font-medium">Fat Loss Progress Toward 75.0 kg Target:</span>
          <span className="text-amber-300 font-bold">{progressPct}% Completed</span>
        </div>
        <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div 
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-300">
          <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Coach Mousa Directive:</strong> "Use 3–4 morning weigh-ins per week under similar conditions and compare weekly averages. Do not cut calories based on one day-to-day reading."
          </p>
        </div>
      </div>

      {/* Trajectory Chart */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Weight Trajectory Graph
            </h2>
            <p className="text-xs text-zinc-400">
              Visualizing morning weigh-in trends against the 75.0 kg target line.
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sortedWeights} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={val => val.slice(5)} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="kg" domain={[74, 83]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  borderColor: '#3f3f46', 
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`${value} kg`, 'Morning Weight']}
                labelFormatter={label => `Weigh-In Date: ${label}`}
              />
              <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target 75 kg', fill: '#10b981', fontSize: 11, position: 'insideTopRight' }} />
              <ReferenceLine y={82} stroke="#71717a" strokeDasharray="2 2" label={{ value: 'Starting 82 kg', fill: '#71717a', fontSize: 10, position: 'insideTopLeft' }} />
              <Area type="monotone" dataKey="weightKg" stroke="#10b981" strokeWidth={3} fill="url(#weightArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Manual Input Modal / Drawer */}
      {showInputForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Record Morning Weigh-In</h3>
              </div>
              <button 
                onClick={() => setShowInputForm(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 80.2"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-amber-300 font-bold border border-zinc-800 rounded-xl px-3 py-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={e => setSleepHours(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Stress (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={stressLevel}
                    onChange={e => setStressLevel(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Energy (1–10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={energyLevel}
                    onChange={e => setEnergyLevel(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Waist Measurement (cm, optional)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 90.5"
                  value={waistCm}
                  onChange={e => setWaistCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Observations / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Feeling rested, consistent meals yesterday"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowInputForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:brightness-110"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical Log Table */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Weigh-In History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Weight (kg)</th>
                <th className="py-2.5 px-3">Sleep</th>
                <th className="py-2.5 px-3">Energy / Stress</th>
                <th className="py-2.5 px-3">Waist (cm)</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {[...sortedWeights].reverse().map(item => (
                <tr key={item.id} className="hover:bg-zinc-900/40">
                  <td className="py-3 px-3 font-mono font-medium text-zinc-200">{item.date}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">{item.weightKg.toFixed(1)} kg</td>
                  <td className="py-3 px-3 text-zinc-300 font-mono">{item.sleepHours}h</td>
                  <td className="py-3 px-3 text-zinc-300 font-mono">
                    <span className="text-emerald-400">{item.energyLevel}/10</span> • <span className="text-zinc-500">{item.stressLevel}/5 str</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-400">{item.waistCm ? `${item.waistCm} cm` : '—'}</td>
                  <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{item.notes || '—'}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => deleteWeightEntry(item.id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

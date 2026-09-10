import { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { 
  Scale, 
  TrendingDown, 
  Sparkles, 
  Award, 
  Calendar, 
  Moon, 
  Zap, 
  Info
} from 'lucide-react';
import { GYM_DATA } from '../data/gymHistoryData';
import { SHARAFATH_PROFILE } from '../data/blueprintData';

export default function WeightTracker() {
  const startingWeight = SHARAFATH_PROFILE.startingWeightKg; // 82.0
  const targetWeight = SHARAFATH_PROFILE.goalWeightKg; // 75.0

  const sortedWeights = useMemo(() => {
    return [...GYM_DATA.weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

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

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      {/* Header & Milestone Status */}
      <div className="double-bezel-outer p-1.5 sm:p-2 rounded-[2rem] transition-all">
        <div className="double-bezel-inner p-6 sm:p-8 rounded-[calc(2rem-0.5rem)] relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  Transformation Tracker
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Fat Loss & Body Composition
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Body Weight & Metric Trajectory
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-light">
                Tracking your path from 82.0 kg down to 75.0 kg. Morning weigh-in trends 
                and rolling weekly averages as prescribed by coach Mousa Ghanem.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-right self-start md:self-auto backdrop-blur-sm">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Status</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">On Track (-1.9 kg)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (Double-Bezel) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Starting Weight', val: `${startingWeight.toFixed(1)} kg`, sub: 'Baseline Assessment', color: 'text-zinc-200' },
          { label: 'Current Morning Weight', val: `${currentWeight.toFixed(1)} kg`, sub: `-${lostKg.toFixed(1)} kg lost`, color: 'text-amber-300', badgeColor: 'text-emerald-400' },
          { label: 'Weekly Rolling Avg', val: `${rollingAverage} kg`, sub: '3–4 session smoothing', color: 'text-cyan-300' },
          { label: 'Target Goal', val: `${targetWeight.toFixed(1)} kg`, sub: `${remainingKg.toFixed(1)} kg remaining`, color: 'text-emerald-400', badgeColor: 'text-zinc-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="double-bezel-outer p-1 rounded-2xl">
            <div className="double-bezel-inner p-5 rounded-[calc(1rem-2px)] space-y-1.5 h-full flex flex-col justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{kpi.label}</span>
              <p className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${kpi.color}`}>{kpi.val}</p>
              <span className={`text-xs font-mono ${kpi.badgeColor || 'text-zinc-400'}`}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar & Coach Guidance */}
      <div className="double-bezel-outer p-1.5 rounded-[1.75rem]">
        <div className="double-bezel-inner p-6 sm:p-8 rounded-[calc(1.75rem-0.375rem)] space-y-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 font-medium">Fat Loss Progress Toward 75.0 kg Target:</span>
            <span className="text-amber-300 font-bold font-mono">{progressPct}% Completed</span>
          </div>
          <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div 
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/20"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-300">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white font-medium">Coach Mousa Directive:</strong> "Use 3–4 morning weigh-ins per week under similar conditions and compare weekly averages. Do not cut calories based on one day-to-day reading."
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory Chart (Double-Bezel) */}
      <div className="double-bezel-outer p-1.5 rounded-[2rem]">
        <div className="double-bezel-inner p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">Body Composition Metric</span>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
                Weight Trajectory Graph
              </h2>
              <p className="text-xs text-zinc-400 font-light">
                Visualizing morning weigh-in trends against the 75.0 kg target line.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              Target: <span className="text-emerald-400 font-bold">75.0 kg</span>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-4">
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
                    backgroundColor: '#09090b', 
                    borderColor: '#27272a', 
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)'
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
      </div>

      {/* Historical Log Table */}
      <div className="double-bezel-outer p-1.5 rounded-[1.75rem]">
        <div className="double-bezel-inner p-6 sm:p-8 rounded-[calc(1.75rem-0.375rem)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold font-serif text-white">Weigh-In History</h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">{sortedWeights.length} Recorded Entries</span>
          </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {[...sortedWeights].reverse().map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-zinc-200">{item.date}</td>
                    <td className="py-3 px-3 font-bold text-amber-300">{item.weightKg.toFixed(1)} kg</td>
                    <td className="py-3 px-3 text-zinc-300">{item.sleepHours}h</td>
                    <td className="py-3 px-3 text-zinc-300">
                      <span className="text-emerald-400">{item.energyLevel}/10</span> • <span className="text-zinc-500">{item.stressLevel}/5 str</span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">{item.waistCm ? `${item.waistCm} cm` : '—'}</td>
                    <td className="py-3 px-3 text-zinc-400 max-w-xs truncate font-sans">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

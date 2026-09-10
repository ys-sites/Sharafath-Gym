import { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Dumbbell, 
  Calendar, 
  Filter, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Flame
} from 'lucide-react';
import { 
  getGymStore, 
  getExerciseProgression, 
  getDistinctExercises, 
  ManualWorkoutSession 
} from '../lib/manualStorage';
import { PHASE_2_WORKOUTS } from '../data/blueprintData';

type TimeFrame = 'daily' | 'weekly' | 'monthly';

export default function ProgressAnalytics() {
  const [store, setStore] = useState(getGymStore());
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [selectedExercise, setSelectedExercise] = useState<string>('Smith machine squat');

  useEffect(() => {
    const handleUpdate = () => setStore(getGymStore());
    window.addEventListener('sharafath-gym-data-updated', handleUpdate);
    return () => window.removeEventListener('sharafath-gym-data-updated', handleUpdate);
  }, []);

  const dayOptions = [
    { key: 'All', label: 'All Workouts' },
    { key: 'Day 1 Push', label: 'Day 1 Push' },
    { key: 'Day 2 Pull', label: 'Day 2 Pull' },
    { key: 'Day 3 Legs', label: 'Day 3 Legs' },
    { key: 'Day 5 Upper', label: 'Day 5 Upper' },
    { key: 'Day 6 Lower', label: 'Day 6 Lower' },
  ];

  // Filter workouts by selected day
  const filteredWorkouts = useMemo(() => {
    if (selectedDay === 'All') return store.workouts;
    return store.workouts.filter(w => w.dayLabel.toLowerCase().includes(selectedDay.toLowerCase()));
  }, [store.workouts, selectedDay]);

  // Distinct exercises available in the filtered workouts or all
  const availableExercises = useMemo(() => {
    const set = new Set<string>();
    filteredWorkouts.forEach(w => {
      w.exercises.forEach(e => {
        if (!e.isSkipped && e.sets.length > 0) set.add(e.name);
      });
    });
    const list = Array.from(set);
    if (list.length === 0) return getDistinctExercises();
    return list;
  }, [filteredWorkouts]);

  // Ensure selected exercise is valid for filter
  useEffect(() => {
    if (availableExercises.length > 0 && !availableExercises.includes(selectedExercise)) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise]);

  // Exercise progression data
  const rawExerciseHistory = useMemo(() => {
    return getExerciseProgression(selectedExercise);
  }, [selectedExercise, store.workouts]);

  // Compute direction (Increasing, Decreasing, Building Reps)
  const progressionStatus = useMemo(() => {
    if (rawExerciseHistory.length === 0) {
      return { status: 'none', label: 'No Data Yet', deltaKg: 0, desc: 'Log a session to track progress.' };
    }
    if (rawExerciseHistory.length === 1) {
      const p = rawExerciseHistory[0];
      return { 
        status: 'baseline', 
        label: 'Baseline Set', 
        deltaKg: 0, 
        desc: `Working weight: ${p.topWeightKg > 0 ? `${p.topWeightKg} kg` : 'Bodyweight'} (${p.setSummary})` 
      };
    }
    const prev = rawExerciseHistory[rawExerciseHistory.length - 2];
    const latest = rawExerciseHistory[rawExerciseHistory.length - 1];
    const delta = latest.topWeightKg - prev.topWeightKg;

    if (delta > 0) {
      return {
        status: 'increasing',
        label: `Weight Increased (+${delta} kg)`,
        deltaKg: delta,
        desc: `Progression achieved! Load moved from ${prev.topWeightKg}kg to ${latest.topWeightKg}kg.`
      };
    } else if (delta < 0) {
      return {
        status: 'decreasing',
        label: `Weight Decreased (${delta} kg)`,
        deltaKg: delta,
        desc: `Lower weight logged. Focus on rep quality and recovery before adding load.`
      };
    } else {
      // Weight is identical: check reps
      const repDelta = latest.totalReps - prev.totalReps;
      if (repDelta > 0) {
        return {
          status: 'building-reps',
          label: `Building Reps (+${repDelta} reps)`,
          deltaKg: 0,
          desc: `Maintained ${latest.topWeightKg}kg and gained ${repDelta} reps towards top of range.`
        };
      } else {
        return {
          status: 'maintaining',
          label: `Load Maintained (${latest.topWeightKg} kg)`,
          deltaKg: 0,
          desc: `Form stabilization. Strive for additional reps next session.`
        };
      }
    }
  }, [rawExerciseHistory]);

  // Time-aggregated workout volume data for the chart
  const aggregatedVolumeData = useMemo(() => {
    const sorted = [...filteredWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (timeFrame === 'daily') {
      return sorted.map(w => ({
        label: w.date.slice(5), // MM-DD
        fullName: `${w.dayLabel} (${w.date})`,
        volume: w.totalVolumeKg,
        sets: w.totalSetsCompleted,
        duration: w.durationMinutes
      }));
    }

    if (timeFrame === 'weekly') {
      // Group by week starting date
      const weeksMap: { [key: string]: { volume: number; sets: number; count: number } } = {};
      sorted.forEach(w => {
        const d = new Date(w.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const monday = new Date(d.setDate(diff)).toISOString().slice(5, 10);
        if (!weeksMap[monday]) {
          weeksMap[monday] = { volume: 0, sets: 0, count: 0 };
        }
        weeksMap[monday].volume += w.totalVolumeKg;
        weeksMap[monday].sets += w.totalSetsCompleted;
        weeksMap[monday].count += 1;
      });
      return Object.entries(weeksMap).map(([week, data]) => ({
        label: `Wk of ${week}`,
        fullName: `Week of ${week} (${data.count} sessions)`,
        volume: data.volume,
        sets: data.sets,
        duration: data.count * 60
      }));
    }

    // Monthly
    const monthsMap: { [key: string]: { volume: number; sets: number; count: number } } = {};
    sorted.forEach(w => {
      const monthKey = w.date.slice(0, 7); // YYYY-MM
      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = { volume: 0, sets: 0, count: 0 };
      }
      monthsMap[monthKey].volume += w.totalVolumeKg;
      monthsMap[monthKey].sets += w.totalSetsCompleted;
      monthsMap[monthKey].count += 1;
    });
    return Object.entries(monthsMap).map(([month, data]) => ({
      label: month,
      fullName: `${month} (${data.count} sessions)`,
      volume: data.volume,
      sets: data.sets,
      duration: data.count * 60
    }));
  }, [filteredWorkouts, timeFrame]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Philosophy Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Progression Engine
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Coach Mousa Progression Cycle
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Session Progression & Weight Trajectory
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Monitor whether your working weights are increasing, maintaining, or building reps session-by-session. 
              Organized by Day of Exercise across Daily, Weekly, and Monthly cycles.
            </p>
          </div>

          {/* Quick Coach Cue */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 max-w-xs space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Coach Mousa Cue</span>
            </div>
            <p className="text-xs text-zinc-400 italic leading-snug">
              "When all working sets reach the top of the range with consistent form, add the smallest practical weight increase next session."
            </p>
          </div>
        </div>
      </div>

      {/* Routine / Day Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-xl bg-zinc-900/70 border border-zinc-800/90">
        {/* Day Selector Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {dayOptions.map(option => (
            <button
              key={option.key}
              onClick={() => setSelectedDay(option.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedDay === option.key
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Time Interval Tabs (Daily / Weekly / Monthly) */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly'] as TimeFrame[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                timeFrame === tf
                  ? 'bg-zinc-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Section: Individual Exercise Weight Progression ("Increasing or Decreasing?") */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Exercise Load Trajectory
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select an exercise to see if your working weight is increasing or decreasing over time.
            </p>
          </div>

          {/* Exercise Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">Select Movement:</span>
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              aria-label="Select Movement"
              className="bg-zinc-950 text-amber-300 text-xs font-medium border border-zinc-700/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
            >
              {availableExercises.map(name => (
                <option key={name} value={name} className="bg-zinc-900 text-zinc-100">
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Directional Status Banner */}
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              progressionStatus.status === 'increasing' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              progressionStatus.status === 'decreasing' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              progressionStatus.status === 'building-reps' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {progressionStatus.status === 'increasing' && <TrendingUp size={20} />}
              {progressionStatus.status === 'decreasing' && <TrendingDown size={20} />}
              {progressionStatus.status === 'building-reps' && <Flame size={20} />}
              {(progressionStatus.status === 'maintaining' || progressionStatus.status === 'baseline') && <Minus size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  {selectedExercise}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  progressionStatus.status === 'increasing' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  progressionStatus.status === 'decreasing' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  progressionStatus.status === 'building-reps' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                  'bg-zinc-800 text-zinc-300'
                }`}>
                  {progressionStatus.label}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {progressionStatus.desc}
              </p>
            </div>
          </div>

          {rawExerciseHistory.length > 0 && (
            <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto">
              <div className="text-right">
                <span className="text-zinc-500 text-[10px] uppercase block">Latest Load</span>
                <span className="text-amber-300 font-bold text-sm">
                  {rawExerciseHistory[rawExerciseHistory.length - 1].topWeightKg > 0 
                    ? `${rawExerciseHistory[rawExerciseHistory.length - 1].topWeightKg} kg` 
                    : 'Bodyweight'}
                </span>
              </div>
              <div className="text-right border-l border-zinc-800 pl-4">
                <span className="text-zinc-500 text-[10px] uppercase block">Sets & Reps</span>
                <span className="text-zinc-300 font-semibold">
                  {rawExerciseHistory[rawExerciseHistory.length - 1].setSummary}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart View */}
        {rawExerciseHistory.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rawExerciseHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false}
                    unit="kg"
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      borderColor: '#3f3f46', 
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [`${value} kg`, 'Working Weight']}
                    labelFormatter={(label) => `Session Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="topWeightKg" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#weightGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Session Timeline Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {rawExerciseHistory.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono text-zinc-400">{item.date}</span>
                    <p className="font-medium text-zinc-200">{item.dayLabel}</p>
                    <span className="text-[11px] text-zinc-400">Reps: {item.setSummary}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-amber-300">
                      {item.topWeightKg > 0 ? `${item.topWeightKg} kg` : 'Bodyweight'}
                    </span>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      {item.totalVolume > 0 ? `${item.totalVolume.toLocaleString()} kg vol` : 'Calisthenics'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No history recorded yet for {selectedExercise}. Complete and log this exercise in a session to view charts.
          </div>
        )}
      </div>

      {/* Secondary Section: Total Session Volume Progression (Daily / Weekly / Monthly) */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Total Training Volume ({timeFrame.toUpperCase()})
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cumulative kilograms moved across completed sets in {selectedDay}.
            </p>
          </div>

          <div className="text-xs font-mono text-zinc-400">
            Total Sessions Logged: <span className="text-amber-300 font-bold">{filteredWorkouts.length}</span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedVolumeData} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#71717a" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  borderColor: '#3f3f46', 
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} kg`, 'Total Volume']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
              />
              <Bar dataKey="volume" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Sessions Log Table (Featuring Sharafath's actual logged Day 6 Lower) */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div>
            <h3 className="text-base font-bold text-white">
              Completed Session History ({selectedDay})
            </h3>
            <p className="text-xs text-zinc-400">
              Review exercise set records, weight values, and coach check-in notes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredWorkouts.map((session) => (
            <div 
              key={session.id}
              className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-5 space-y-4 transition-all hover:border-zinc-700"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {session.dayLabel}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {session.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-zinc-500" />
                      {session.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-zinc-500" />
                      {session.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {session.totalVolumeKg.toLocaleString()} kg volume
                    </span>
                  </div>
                </div>

                {session.cardioSummary && (
                  <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-400 font-mono">Cardio: </span>
                    <span className="text-zinc-300">{session.cardioSummary}</span>
                  </div>
                )}
              </div>

              {/* Exercises Table matching user screenshot */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                      <th className="py-2 px-3">Exercise</th>
                      <th className="py-2 px-3">Target Range</th>
                      <th className="py-2 px-3">Working Weight</th>
                      <th className="py-2 px-3">Sets × Reps Logged</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {session.exercises.map((ex, idx) => {
                      const repsString = ex.sets.map(s => {
                        if (s.durationSeconds) return `${s.durationSeconds}s`;
                        return s.reps ?? '-';
                      }).join(', ');

                      const topWeight = Math.max(0, ...ex.sets.map(s => s.weightKg ?? 0));

                      return (
                        <tr key={idx} className={ex.isSkipped ? 'opacity-40' : 'hover:bg-zinc-900/40'}>
                          <td className="py-2.5 px-3 font-medium text-zinc-200">
                            {ex.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-400">
                            {ex.targetSetsReps}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-300 font-bold">
                            {ex.isSkipped ? '—' : topWeight > 0 ? `${topWeight} kg` : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-300">
                            {ex.isSkipped ? 'Skipped' : repsString || 'Completed'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {ex.isSkipped ? (
                              <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded bg-zinc-900">
                                Skipped
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                Logged
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Overall Session Notes */}
              {session.overallNotes && (
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-xs text-zinc-300 flex items-start gap-2">
                  <span className="font-mono text-amber-400 font-semibold shrink-0">Notes:</span>
                  <span>{session.overallNotes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

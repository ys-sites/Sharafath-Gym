import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  TrendingUp, 
  BookOpen, 
  Scale, 
  UtensilsCrossed, 
  Award, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Database,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { getGymStore, ManualWorkoutSession } from '../lib/manualStorage';
import { SHARAFATH_PROFILE, PHASE_2_WORKOUTS, NUTRITION_BLUEPRINT } from '../data/blueprintData';

export default function Home() {
  const [store, setStore] = useState(getGymStore());
  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = () => setStore(getGymStore());
    window.addEventListener('sharafath-gym-data-updated', handleUpdate);
    return () => window.removeEventListener('sharafath-gym-data-updated', handleUpdate);
  }, []);

  const latestWorkout: ManualWorkoutSession | undefined = store.workouts[0];
  const startingWeight = SHARAFATH_PROFILE.startingWeightKg; // 82.0
  const targetWeight = SHARAFATH_PROFILE.goalWeightKg; // 75.0
  const currentWeight = store.weights.length > 0 ? store.weights[store.weights.length - 1].weightKg : startingWeight;
  const lostKg = Math.max(0, startingWeight - currentWeight);
  const progressPct = Math.min(100, Math.round((lostKg / (startingWeight - targetWeight)) * 100));

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Editorial Luxury Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-[#0E1017] to-zinc-950 border border-zinc-800/80 p-8 sm:p-12 shadow-2xl">
        {/* Subtle background sculpture / luxury motif */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              ASCENSION PROTOCOL
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs text-zinc-400 font-mono">
              Certified Elite Coach Mousa Ghanem
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none">
              A More Beautiful You.
            </h1>
            <p className="font-serif text-lg sm:text-xl text-amber-300/90 italic tracking-wide">
              Mind • Body • Appearance • Purpose
            </p>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
            Welcome to your bespoke performance and physique transformation dashboard, <strong>{SHARAFATH_PROFILE.name}</strong>. 
            Track working weights session-by-session, maintain your 2,200 kcal nutrition targets, 
            and execute Coach Mousa's progression cycle with consistency.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/logger')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Log Today's Workout</span>
            </button>

            <button
              onClick={() => navigate('/progression')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 hover:text-amber-300 hover:border-amber-400/50 font-semibold text-xs transition-all active:scale-[0.98]"
            >
              <TrendingUp size={16} />
              <span>View Progression Charts</span>
            </button>

            <button
              onClick={() => navigate('/blueprint')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900/40 border border-zinc-800 text-zinc-400 hover:text-white font-medium text-xs transition-all"
            >
              <BookOpen size={16} />
              <span>Full PDF Blueprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goal & Transformation Bar */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Body Recomposition Goal Tracker
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Target: Move from 82 kg toward 75 kg while preserving muscle and building basic strength.
            </p>
          </div>

          <button
            onClick={() => navigate('/weight')}
            className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold self-start sm:self-auto"
          >
            <span>Weight Analytics</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Triple Milestone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Baseline Starting Weight</span>
            <p className="text-xl font-bold font-mono text-zinc-300">{startingWeight.toFixed(1)} kg</p>
            <span className="text-[11px] text-zinc-400">Recorded August 2026</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400">Current Morning Weight</span>
            <p className="text-xl font-bold font-mono text-amber-300">{currentWeight.toFixed(1)} kg</p>
            <span className="text-[11px] font-mono font-semibold text-emerald-400">-{lostKg.toFixed(1)} kg lost ({progressPct}%)</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400">Target Weight Goal</span>
            <p className="text-xl font-bold font-mono text-emerald-400">{targetWeight.toFixed(1)} kg</p>
            <span className="text-[11px] text-zinc-400 font-mono">{(currentWeight - targetWeight).toFixed(1)} kg to go</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div 
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>Start: 82.0 kg</span>
            <span className="text-amber-300 font-bold">{progressPct}% of Goal Achieved</span>
            <span>Goal: 75.0 kg</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Latest Workout Session & Coach Mousa 7-Day Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Latest Workout Recap (Features user's Day 6 Lower) */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Dumbbell size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Latest Logged Workout</h3>
              </div>
              {latestWorkout && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {latestWorkout.dayLabel}
                </span>
              )}
            </div>

            {latestWorkout ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar size={14} />
                    <span>{latestWorkout.date}</span>
                    <span>•</span>
                    <Clock size={14} />
                    <span>{latestWorkout.durationMinutes} mins</span>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {latestWorkout.totalVolumeKg.toLocaleString()} kg Volume
                  </span>
                </div>

                {/* Exercises Preview Table */}
                <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Session Highlights</span>
                  <div className="space-y-1.5 text-xs">
                    {latestWorkout.exercises.slice(0, 5).map((ex, idx) => {
                      const reps = ex.sets.map(s => s.reps).filter(Boolean).join(', ');
                      const maxW = Math.max(0, ...ex.sets.map(s => s.weightKg ?? 0));
                      return (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-zinc-900">
                          <span className="font-medium text-zinc-200 truncate">{ex.name}</span>
                          <span className="font-mono text-zinc-400 text-[11px]">
                            {ex.isSkipped ? (
                              <span className="text-zinc-400">Skipped</span>
                            ) : (
                              <span className="text-amber-300 font-semibold">{maxW > 0 ? `${maxW}kg` : 'BW'} ({reps || 'Done'})</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {latestWorkout.overallNotes && (
                  <p className="text-xs text-zinc-400 italic bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/60">
                    "{latestWorkout.overallNotes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-zinc-500">
                No sessions logged yet.
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/progression')}
              className="w-full py-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 text-xs font-bold text-zinc-200 hover:text-amber-300 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Inspect Detailed Progression Data</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right: Phase 2 Cycle Quick Access */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-amber-400" />
              <h3 className="text-base font-bold text-white">Phase 2 Routine (7-Day Cycle)</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Coach Mousa Split</span>
          </div>

          <div className="space-y-2">
            {PHASE_2_WORKOUTS.map((w) => (
              <div
                key={w.dayNumber}
                onClick={() => navigate(`/blueprint`)}
                className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-amber-400">
                      Day {w.dayNumber}
                    </span>
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                      {w.title.replace(`Day ${w.dayNumber} `, '')}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    {w.focusMuscles}
                  </span>
                </div>

                <ChevronRight size={16} className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div 
          onClick={() => navigate('/progression')}
          className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all group space-y-2"
        >
          <TrendingUp className="text-amber-400 mb-2" size={24} />
          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
            Progression Charts
          </h4>
          <p className="text-xs text-zinc-400">
            Daily, weekly, and monthly chart comparisons organized by exercise.
          </p>
        </div>

        <div 
          onClick={() => navigate('/blueprint')}
          className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all group space-y-2"
        >
          <BookOpen className="text-emerald-400 mb-2" size={24} />
          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
            Master PDF Blueprint
          </h4>
          <p className="text-xs text-zinc-400">
            Full 19-page dossier, exercise tables, cues, and micronutrient matrices.
          </p>
        </div>

        <div 
          onClick={() => navigate('/nutrition')}
          className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all group space-y-2"
        >
          <UtensilsCrossed className="text-cyan-400 mb-2" size={24} />
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
            2,200 kcal Nutrition
          </h4>
          <p className="text-xs text-zinc-400">
            170g Protein • 60g Fat • 245g Carbs with Halal and low-oxalate swaps.
          </p>
        </div>

        <div 
          onClick={() => navigate('/data-hub')}
          className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all group space-y-2"
        >
          <Database className="text-rose-400 mb-2" size={24} />
          <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
            Data Upload & Backup
          </h4>
          <p className="text-xs text-zinc-400">
            Import/upload your gym data or export instant JSON backups.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BookOpen, 
  Scale, 
  UtensilsCrossed, 
  Award, 
  ArrowUpRight, 
  Sparkles, 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { GYM_DATA, WorkoutSession } from '../data/gymHistoryData';
import { SHARAFATH_PROFILE, PHASE_2_WORKOUTS, NUTRITION_BLUEPRINT } from '../data/blueprintData';

export default function Home() {
  const navigate = useNavigate();

  const latestWorkout: WorkoutSession | undefined = GYM_DATA.workouts[0];
  const startingWeight = SHARAFATH_PROFILE.startingWeightKg; // 82.0
  const targetWeight = SHARAFATH_PROFILE.goalWeightKg; // 75.0
  const latestWeightEntry = GYM_DATA.weights[GYM_DATA.weights.length - 1];
  const currentWeight = latestWeightEntry ? latestWeightEntry.weightKg : 80.1;
  const lostKg = Math.max(0, startingWeight - currentWeight);
  const progressPct = Math.min(100, Math.round((lostKg / (startingWeight - targetWeight)) * 100));

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Editorial Luxury Hero Section - Double Bezel */}
      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle sculpture watermark backdrop */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-amber-500/[0.03] to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-6">
            {/* Eyebrow badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-subtle" />
                ASCENSION ARCHITECTURE
              </span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-xs text-zinc-400 font-mono tracking-wider">
                {SHARAFATH_PROFILE.coach}
              </span>
            </div>

            {/* Display Typography */}
            <div className="space-y-2">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-none">
                A More Beautiful You.
              </h1>
              <p className="font-serif text-lg sm:text-2xl text-amber-300/90 italic tracking-wide">
                Mind • Body • Appearance • Purpose
              </p>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed font-light">
              Bespoke performance analytics and progression portal for <strong>{SHARAFATH_PROFILE.name}</strong>. 
              Monitoring working weight trajectory toward your <strong>75.0 kg target</strong>, tracking Phase 2 volume, 
              and applying Coach Mousa’s high-intensity progression cycle.
            </p>

            {/* CTAs with Button-in-Button pattern */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => navigate('/progression')}
                className="group relative inline-flex items-center gap-3 pl-6 pr-2 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-[0_10px_25px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span>Inspect Progression Charts</span>
                <span className="w-8 h-8 rounded-full bg-zinc-950/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight size={15} className="stroke-[2.5]" />
                </span>
              </button>

              <button
                onClick={() => navigate('/blueprint')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-200 hover:text-amber-300 hover:border-amber-400/50 font-semibold text-xs transition-all active:scale-[0.98]"
              >
                <BookOpen size={15} />
                <span>Read Master Blueprint</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Recomposition Card - Double Bezel */}
      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  Body Recomposition Trajectory
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-light">
                Target: Move from 82.0 kg toward 75.0 kg while preserving muscle and building basic strength.
              </p>
            </div>

            <button
              onClick={() => navigate('/weight')}
              className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold self-start sm:self-auto transition-colors"
            >
              <span>Weight Analytics</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Three Key Weight Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Baseline Starting Weight</span>
              <p className="text-2xl font-bold font-mono text-zinc-300">{startingWeight.toFixed(1)} kg</p>
              <span className="text-[11px] text-zinc-400">Initial Assessment</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400">Current Morning Weight</span>
              <p className="text-2xl font-bold font-mono text-amber-300">{currentWeight.toFixed(1)} kg</p>
              <span className="text-[11px] font-mono font-semibold text-emerald-400">-{lostKg.toFixed(1)} kg lost ({progressPct}%)</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400">Target Goal</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">{targetWeight.toFixed(1)} kg</p>
              <span className="text-[11px] text-zinc-400 font-mono">{(currentWeight - targetWeight).toFixed(1)} kg remaining</span>
            </div>
          </div>

          {/* Progress Visualizer */}
          <div className="space-y-2 pt-2">
            <div className="w-full bg-zinc-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div 
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
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
      </div>

      {/* Bento 2.0 Grid: Recent Session Highlight & 7-Day Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Col: Latest Logged Session (Features user's Day 6 Lower) */}
        <div className="lg:col-span-7 double-bezel-outer">
          <div className="double-bezel-inner p-6 sm:p-8 h-full flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Flame size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Latest Logged Session</h3>
                    <span className="text-[11px] text-zinc-400 font-mono">Weekly Update Verification</span>
                  </div>
                </div>

                {latestWorkout && (
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {latestWorkout.dayLabel}
                  </span>
                )}
              </div>

              {latestWorkout ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar size={13} className="text-zinc-500" />
                        {latestWorkout.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Clock size={13} className="text-zinc-500" />
                        {latestWorkout.durationMinutes} mins
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold">
                      {latestWorkout.totalVolumeKg.toLocaleString()} kg Volume
                    </span>
                  </div>

                  {/* Exercises Preview Table */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">
                      Movement Breakdown
                    </span>
                    <div className="divide-y divide-zinc-800/60 rounded-xl bg-zinc-950/70 border border-zinc-800/80 overflow-hidden text-xs">
                      {latestWorkout.exercises.slice(0, 5).map((ex, idx) => {
                        const reps = ex.sets.map(s => s.reps).filter(Boolean).join(', ');
                        const maxW = Math.max(0, ...ex.sets.map(s => s.weightKg ?? 0));
                        return (
                          <div key={idx} className="flex justify-between items-center px-3.5 py-2.5 hover:bg-zinc-900/30 transition-colors">
                            <span className="font-medium text-zinc-200">{ex.name}</span>
                            <span className="font-mono text-zinc-400 text-[11px]">
                              {ex.isSkipped ? (
                                <span className="text-zinc-500 px-2 py-0.5 rounded bg-zinc-900">Skipped</span>
                              ) : (
                                <span className="text-amber-300 font-bold">{maxW > 0 ? `${maxW} kg` : 'BW'} <span className="text-zinc-400 font-normal">({reps})</span></span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {latestWorkout.overallNotes && (
                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-300 italic flex items-start gap-2">
                      <span className="text-amber-400 font-mono not-italic font-bold">Notes:</span>
                      <span>"{latestWorkout.overallNotes}"</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-zinc-500">No sessions recorded yet.</div>
              )}
            </div>

            <button
              onClick={() => navigate('/progression')}
              className="w-full py-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 text-xs font-bold text-zinc-200 hover:text-amber-300 flex items-center justify-center gap-2 transition-all group mt-4"
            >
              <span>View Full Progression Data</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* 5-Col: Phase 2 Routine (7-Day Cycle) */}
        <div className="lg:col-span-5 double-bezel-outer">
          <div className="double-bezel-inner p-6 sm:p-8 h-full flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Phase 2 Split</h3>
                    <span className="text-[11px] text-zinc-400 font-mono">7-Day Cycle</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase text-zinc-500">Sept 7, 2026</span>
              </div>

              <div className="space-y-2">
                {PHASE_2_WORKOUTS.map((w) => (
                  <div
                    key={w.dayNumber}
                    onClick={() => navigate('/blueprint')}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-amber-400 border border-zinc-800">
                          Day {w.dayNumber}
                        </span>
                        <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                          {w.title.replace(`Day ${w.dayNumber} `, '')}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 mt-0.5 block font-light">
                        {w.focusMuscles}
                      </span>
                    </div>

                    <ChevronRight size={15} className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/blueprint')}
              className="w-full py-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 text-xs font-bold text-zinc-200 hover:text-amber-300 flex items-center justify-center gap-2 transition-all group"
            >
              <span>Explore All PDF Workouts & Cues</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Feature Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/progression')}
          className="double-bezel-outer cursor-pointer group"
        >
          <div className="double-bezel-inner p-6 space-y-3 h-full flex flex-col justify-between group-hover:border-amber-500/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <TrendingUp size={20} />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                Progression Engine
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Daily, weekly, and monthly tracking organized by workout routine. Automatic load delta calculations.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 flex items-center gap-1 font-semibold pt-2">
              Open Charts <ChevronRight size={13} />
            </span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/blueprint')}
          className="double-bezel-outer cursor-pointer group"
        >
          <div className="double-bezel-inner p-6 space-y-3 h-full flex flex-col justify-between group-hover:border-emerald-500/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <BookOpen size={20} />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Master PDF Blueprint
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Complete 19-page dossier: Performance File, Moussa's 5-Day Split, Progression Cycle, and Micronutrient tables.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold pt-2">
              View Blueprint <ChevronRight size={13} />
            </span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/nutrition')}
          className="double-bezel-outer cursor-pointer group"
        >
          <div className="double-bezel-inner p-6 space-y-3 h-full flex flex-col justify-between group-hover:border-cyan-500/40 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                <UtensilsCrossed size={20} />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                2,200 kcal Protocol
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                170g Protein • 60g Fat • 245g Carbs with Halal standards and low-oxalate food replacement rules.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1 font-semibold pt-2">
              Review Macros <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

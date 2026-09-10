import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Sparkles, 
  Flame, 
  Timer, 
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { 
  saveWorkoutSession, 
  ManualWorkoutSession, 
  ManualLoggedExercise, 
  ManualExerciseSet,
  getExerciseProgression 
} from '../lib/manualStorage';
import { PHASE_2_WORKOUTS, MOUSSA_5DAY_BLUEPRINT } from '../data/blueprintData';

export default function WorkoutLogger() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [dayLabel, setDayLabel] = useState<string>('Day 1 Push');
  const [title, setTitle] = useState<string>('Phase 2 Day 1 Push');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [cardioSummary, setCardioSummary] = useState<string>('');
  const [overallNotes, setOverallNotes] = useState<string>('');
  const [exercises, setExercises] = useState<ManualLoggedExercise[]>([]);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load routine template
  const loadRoutine = (routineName: string) => {
    // Check Phase 2
    const p2 = PHASE_2_WORKOUTS.find(w => w.title.toLowerCase() === routineName.toLowerCase());
    if (p2) {
      setDayLabel(p2.title);
      setTitle(`Phase 2 ${p2.title}`);
      setCardioSummary(p2.finisher || '');
      setExercises(
        p2.exercises.map(ex => {
          // Check previous weight for this exercise to help Sharafath beat it!
          const history = getExerciseProgression(ex.name);
          const lastWeight = history.length > 0 ? history[history.length - 1].topWeightKg : null;

          const sets: ManualExerciseSet[] = [
            { setNumber: 1, weightKg: lastWeight, reps: 8, completed: true },
            { setNumber: 2, weightKg: lastWeight, reps: 8, completed: true },
            { setNumber: 3, weightKg: lastWeight, reps: 8, completed: true }
          ];

          return {
            name: ex.name,
            targetSetsReps: ex.setsReps,
            isSkipped: false,
            sets,
            notes: ex.howToPerform
          };
        })
      );
      return;
    }

    // Check Moussa 5-Day
    const m5 = MOUSSA_5DAY_BLUEPRINT.find(w => w.title.toLowerCase().includes(routineName.toLowerCase()));
    if (m5) {
      setDayLabel(m5.title);
      setTitle(`Moussa Split: ${m5.title}`);
      setCardioSummary(m5.warmup);
      const exList: ManualLoggedExercise[] = [];
      m5.sections.forEach(sec => {
        sec.exercises.forEach(ex => {
          exList.push({
            name: ex.name,
            targetSetsReps: ex.setsReps,
            isSkipped: false,
            sets: [
              { setNumber: 1, weightKg: null, reps: 8, completed: true },
              { setNumber: 2, weightKg: null, reps: 8, completed: true }
            ],
            notes: ex.executionNote
          });
        });
      });
      setExercises(exList);
    }
  };

  // Check URL params on mount
  useEffect(() => {
    const dayParam = searchParams.get('day');
    if (dayParam) {
      const match = PHASE_2_WORKOUTS.find(w => w.dayNumber === Number(dayParam));
      if (match) {
        loadRoutine(match.title);
        return;
      }
    }
    // Default to Day 1 Push
    loadRoutine('Day 1 Push');
  }, [searchParams]);

  // Set changes
  const updateSet = (
    exIdx: number, 
    setIdx: number, 
    field: keyof ManualExerciseSet, 
    val: any
  ) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      ex.sets = sets;
      copy[exIdx] = ex;
      return copy;
    });
  };

  const addSet = (exIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const nextNum = ex.sets.length + 1;
      ex.sets = [
        ...ex.sets,
        {
          setNumber: nextNum,
          weightKg: lastSet ? lastSet.weightKg : null,
          reps: lastSet ? lastSet.reps : 8,
          completed: true
        }
      ];
      copy[exIdx] = ex;
      return copy;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      ex.sets = ex.sets.filter((_, idx) => idx !== setIdx).map((s, idx) => ({
        ...s,
        setNumber: idx + 1
      }));
      copy[exIdx] = ex;
      return copy;
    });
  };

  const toggleSkipExercise = (exIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      copy[exIdx] = { ...copy[exIdx], isSkipped: !copy[exIdx].isSkipped };
      return copy;
    });
  };

  const addCustomExercise = () => {
    const name = window.prompt("Enter exercise name:");
    if (!name || !name.trim()) return;
    setExercises(prev => [
      ...prev,
      {
        name: name.trim(),
        targetSetsReps: "3 × 8–12",
        isSkipped: false,
        sets: [
          { setNumber: 1, weightKg: 20, reps: 10, completed: true },
          { setNumber: 2, weightKg: 20, reps: 10, completed: true },
          { setNumber: 3, weightKg: 20, reps: 10, completed: true }
        ]
      }
    ]);
  };

  // Real-time metrics
  const totalVolume = exercises.reduce((acc, ex) => {
    if (ex.isSkipped) return acc;
    return acc + ex.sets.reduce((sAcc, s) => {
      if (s.completed && s.weightKg && s.reps) {
        return sAcc + (s.weightKg * s.reps);
      }
      return sAcc;
    }, 0);
  }, 0);

  const totalSetsCompleted = exercises.reduce((acc, ex) => {
    if (ex.isSkipped) return acc;
    return acc + ex.sets.filter(s => s.completed).length;
  }, 0);

  const handleSave = () => {
    const session: Omit<ManualWorkoutSession, 'id' | 'createdAt'> = {
      date: sessionDate,
      dayLabel,
      title,
      durationMinutes,
      cardioSummary,
      overallNotes,
      totalVolumeKg: totalVolume,
      totalSetsCompleted,
      exercises
    };

    saveWorkoutSession(session);
    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/progression');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Quick Plan Loader */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Session Logger
              </span>
              <span className="text-xs text-zinc-400 font-mono">Manual Gym Entry</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Log Workout Session
            </h1>
            <p className="text-xs text-zinc-400">
              Select any prescribed workout from your plan, input sets, weights, and reps, and track volume in real time.
            </p>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
              <span className="text-[10px] text-zinc-400 uppercase block">Total Volume</span>
              <span className="text-base font-bold text-amber-300">
                {totalVolume.toLocaleString()} kg
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
              <span className="text-[10px] text-zinc-400 uppercase block">Sets Done</span>
              <span className="text-base font-bold text-emerald-400">
                {totalSetsCompleted} sets
              </span>
            </div>
          </div>
        </div>

        {/* Routine Quick Picker */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-zinc-400 block">
            Load Template From Blueprint:
          </label>
          <div className="flex flex-wrap gap-2">
            {PHASE_2_WORKOUTS.filter(w => w.dayNumber !== 4 && w.dayNumber !== 7).map(w => (
              <button
                key={w.dayNumber}
                type="button"
                onClick={() => loadRoutine(w.title)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  dayLabel === w.title
                    ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {w.title}
              </button>
            ))}
            <button
              type="button"
              onClick={addCustomExercise}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-zinc-700 text-zinc-400 hover:text-amber-300 hover:border-amber-400"
            >
              + Add Custom Move
            </button>
          </div>
        </div>

        {/* Session Meta Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2.5 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Workout Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Duration (Minutes)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2.5 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => (
          <div 
            key={exIdx}
            className={`rounded-2xl border p-5 transition-all ${
              ex.isSkipped 
                ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60' 
                : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{ex.name}</span>
                  <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {ex.targetSetsReps}
                  </span>
                </div>
                {ex.notes && (
                  <p className="text-[11px] text-zinc-400 mt-0.5">{ex.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSkipExercise(exIdx)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                    ex.isSkipped 
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {ex.isSkipped ? 'Mark Included' : 'Skip Exercise'}
                </button>
                {!ex.isSkipped && (
                  <button
                    type="button"
                    onClick={() => addSet(exIdx)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-300 hover:bg-zinc-800 flex items-center gap-1 font-medium"
                  >
                    <Plus size={13} />
                    <span>Add Set</span>
                  </button>
                )}
              </div>
            </div>

            {/* Set by Set inputs */}
            {!ex.isSkipped && (
              <div className="pt-4 space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-zinc-500 uppercase px-2">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-4">Weight (kg)</span>
                  <span className="col-span-4">Reps / Secs</span>
                  <span className="col-span-2 text-right">Action</span>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-12 gap-2 items-center bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/60">
                    <span className="col-span-2 text-xs font-mono font-bold text-zinc-400 pl-2">
                      #{set.setNumber}
                    </span>

                    <div className="col-span-4">
                      <input
                        type="number"
                        placeholder="kg (or empty)"
                        value={set.weightKg ?? ''}
                        onChange={e => updateSet(exIdx, setIdx, 'weightKg', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        placeholder="Reps (e.g. 10)"
                        value={set.reps ?? set.durationSeconds ?? ''}
                        onChange={e => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          if (ex.name.toLowerCase().includes('plank')) {
                            updateSet(exIdx, setIdx, 'durationSeconds', val);
                          } else {
                            updateSet(exIdx, setIdx, 'reps', val);
                          }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeSet(exIdx, setIdx)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Remove set"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cardio & Overall Notes */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono">
          Session Finisher & Observations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Cardio / Steps Completed</label>
            <input
              type="text"
              placeholder="e.g. 15 min incline treadmill walking at 10% / StairMaster"
              value={cardioSummary}
              onChange={e => setCardioSummary(e.target.value)}
              className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">Coach Check-In / Session Notes</label>
            <input
              type="text"
              placeholder="e.g. Solid session overall — hip thrust skipped, everything else hit."
              value={overallNotes}
              onChange={e => setOverallNotes(e.target.value)}
              className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800 sticky bottom-4 z-20 backdrop-blur-xl shadow-2xl">
        <div className="text-xs text-zinc-400 font-mono">
          Ready to save: <span className="text-amber-300 font-bold">{totalVolume.toLocaleString()} kg</span> volume • <span className="text-emerald-400 font-bold">{totalSetsCompleted} sets</span>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs">
              <Check size={16} />
              <span>Session Logged Successfully!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Save size={16} />
              <span>Save & Complete Workout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

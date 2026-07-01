import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Plus, Check, ChevronDown, Clock, Dumbbell, Search, Play, Pause, FastForward } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { YouTubeReference } from '../components/ui/YouTubeReference';

// ... (keep types and MOCK_LIBRARY)
// Types for active state
type ActiveSet = {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
};

type ActiveExercise = {
  id: string;
  exercise_id: string; // from DB
  name: string;
  youtube_url?: string;
  sets: ActiveSet[];
};

// Mock library if DB not available
const MOCK_LIBRARY = [
  { id: '1', name: 'Barbell Bench Press', youtube_url: 'https://www.youtube.com/watch?v=rxD321l2svE' },
  { id: '2', name: 'Squat', youtube_url: 'https://www.youtube.com/watch?v=bEv6CCg2BC8' },
  { id: '3', name: 'Deadlift', youtube_url: 'https://www.youtube.com/watch?v=op9kVnSso6Q' },
  { id: '4', name: 'Pull-up', youtube_url: 'https://www.youtube.com/watch?v=eGo4IYtl4jO' },
  { id: '5', name: 'Overhead Press', youtube_url: 'https://www.youtube.com/watch?v=2yjwXTZEpac' },
  { id: 'ex1', name: 'Machine Chest Press', youtube_url: 'https://www.youtube.com/watch?v=pLofEAcfsO8' },
  { id: 'ex2', name: 'Incline Dumbbell Press', youtube_url: 'https://www.youtube.com/watch?v=IP4oeKh1Sd4' },
  { id: 'ex3', name: 'Machine Pec Deck Fly', youtube_url: 'https://www.youtube.com/watch?v=JYmszQs-mRs' },
  { id: 'ex4', name: 'Dumbbell Lateral Raise', youtube_url: 'https://www.youtube.com/watch?v=PzsMitRdI_8' },
  { id: 'ex5', name: 'Reverse Pec Deck', youtube_url: 'https://www.youtube.com/watch?v=P6-N-VGCVxk' },
  { id: 'ex6', name: 'Tricep Pushdown', youtube_url: 'https://www.youtube.com/watch?v=-zLyUAo1gMw' },
  { id: 'ex8', name: 'Wide-Grip Lat Pulldown', youtube_url: 'https://www.youtube.com/watch?v=8hzVLzu-RJk' },
  { id: 'ex9', name: 'Close-Grip Lat Pulldown', youtube_url: 'https://www.youtube.com/watch?v=8hzVLzu-RJk' },
  { id: 'ex10', name: 'Seated Cable Row', youtube_url: 'https://www.youtube.com/watch?v=vwHG9Jfu4sw' },
  { id: 'ex12', name: 'Lat Pullover Machine', youtube_url: 'https://www.youtube.com/watch?v=32auHIqgEoM' },
  { id: 'ex13', name: 'Preacher Curl', youtube_url: 'https://www.youtube.com/watch?v=Gydpcouclx8' },
  { id: 'ex16', name: 'Hack Squat', youtube_url: 'https://www.youtube.com/watch?v=0tn5K9NlCfo' },
  { id: 'ex17', name: 'Leg Press', youtube_url: 'https://www.youtube.com/watch?v=ETOAyWM6i6A' },
  { id: 'ex18', name: 'Leg Extension', youtube_url: 'https://www.youtube.com/watch?v=swZQC689o9U' },
  { id: 'ex19', name: 'Romanian Deadlift (Dumbbell)', youtube_url: 'https://www.youtube.com/watch?v=hQgFixeXdZo' },
  { id: 'ex20', name: 'Seated Leg Curl', youtube_url: 'https://www.youtube.com/watch?v=IOufFLwNOTU' },
  { id: 'ex21', name: 'Standing Calf Raise', youtube_url: 'https://www.youtube.com/watch?v=SRUtMJ0tE2A' },
  { id: 'ex22', name: 'Seated Leg Raises', youtube_url: 'https://www.youtube.com/watch?v=l4kQd9eWclE' },
];

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const location = useLocation();
  const template = location.state?.template;

  const [workoutName, setWorkoutName] = useState(template ? template.name : 'Workout');
  const [exercises, setExercises] = useState<ActiveExercise[]>(() => {
    if (template && template.exercises) {
      return template.exercises.map((ex: any) => ({
        id: Math.random().toString(),
        exercise_id: ex.id,
        name: ex.name,
        youtube_url: ex.youtube_url,
        sets: Array.from({ length: ex.target_sets || 1 }).map(() => ({
          id: Math.random().toString(),
          reps: ex.target_reps ? ex.target_reps.toString() : '',
          weight: '',
          completed: false
        }))
      }));
    }
    return [];
  });
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimerDuration, setRestTimerDuration] = useState(90); // default 90s
  
  // Workout Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Rest Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRestTimerActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restTimerSeconds === 0) {
      setIsRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimerSeconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const formatRestTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startRestTimer = () => {
    setRestTimerSeconds(restTimerDuration);
    setIsRestTimerActive(true);
  };

  const addSelectedExercise = (libraryItem: any) => {
    const newEx: ActiveExercise = {
      id: Math.random().toString(),
      exercise_id: libraryItem.id,
      name: libraryItem.name,
      youtube_url: libraryItem.youtube_url,
      sets: [
        { id: Math.random().toString(), reps: '', weight: '', completed: false }
      ]
    };
    setExercises([...exercises, newEx]);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const addSet = (exId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { 
            id: Math.random().toString(), 
            reps: lastSet ? lastSet.reps : '', 
            weight: lastSet ? lastSet.weight : '', 
            completed: false 
          }]
        };
      }
      return ex;
    }));
  };

  const updateSet = (exId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return ex;
    }));
  };

  const toggleSetComplete = (exId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              const newCompleted = !s.completed;
              if (newCompleted) {
                startRestTimer();
              }
              return { ...s, completed: newCompleted };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const finishWorkout = async () => {
    alert('Workout finished! Data would be saved to Supabase here.');
    navigate(-1);
  };

  const filteredLibrary = MOCK_LIBRARY.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-neutral-900 border-b border-neutral-800 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 text-neutral-400 hover:text-white transition-colors">
            <ChevronDown size={28} />
          </button>
          <div>
            <input 
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="bg-transparent text-xl font-bold focus:outline-none w-full"
            />
            <div className="flex items-center text-indigo-500 text-sm font-medium gap-1 mt-0.5">
              <Clock size={14} />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={finishWorkout}
          className="bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-bold active:scale-95 transition-transform"
        >
          Finish
        </button>
      </header>

      {/* Exercises List */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-neutral-500 gap-4">
            <Dumbbell size={48} className="opacity-20" />
            <p>No exercises added yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {exercises.map((ex) => (
              <div key={ex.id} className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                <div className="px-4 py-3 bg-neutral-900/50 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-indigo-400">{ex.name}</h3>
                </div>
                
                {ex.youtube_url && (
                  <div className="px-3 pb-2 pt-1">
                    <YouTubeReference url={ex.youtube_url} />
                  </div>
                )}
                
                <div className="p-2">
                  {/* Headers */}
                  <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 px-2 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 text-center">
                    <div>Set</div>
                    <div>lbs</div>
                    <div>Reps</div>
                    <div><Check size={14} className="mx-auto" /></div>
                  </div>

                  {/* Sets */}
                  <div className="space-y-1">
                    {ex.sets.map((set, setIndex) => (
                      <div 
                        key={set.id} 
                        className={cn(
                          "grid grid-cols-[30px_1fr_1fr_40px] gap-2 px-2 py-1 items-center rounded",
                          set.completed ? "bg-green-500/10" : "bg-neutral-800/50"
                        )}
                      >
                        <div className="text-center text-sm font-medium text-neutral-400">
                          {setIndex + 1}
                        </div>
                        <div>
                          <input 
                            type="number" 
                            inputMode="decimal"
                            value={set.weight}
                            onChange={(e) => updateSet(ex.id, set.id, 'weight', e.target.value)}
                            disabled={set.completed}
                            className={cn(
                              "w-full bg-neutral-800 rounded px-2 py-1.5 text-center font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors",
                              set.completed && "bg-transparent text-green-500"
                            )}
                            placeholder="-"
                          />
                        </div>
                        <div>
                          <input 
                            type="number" 
                            inputMode="numeric"
                            value={set.reps}
                            onChange={(e) => updateSet(ex.id, set.id, 'reps', e.target.value)}
                            disabled={set.completed}
                            className={cn(
                              "w-full bg-neutral-800 rounded px-2 py-1.5 text-center font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors",
                              set.completed && "bg-transparent text-green-500"
                            )}
                            placeholder="-"
                          />
                        </div>
                        <button
                          onClick={() => toggleSetComplete(ex.id, set.id)}
                          className={cn(
                            "flex items-center justify-center w-8 h-8 mx-auto rounded transition-colors",
                            set.completed ? "bg-green-500 text-white" : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
                          )}
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => addSet(ex.id)}
                    className="w-full mt-2 py-1.5 text-sm font-medium text-neutral-400 hover:text-white bg-neutral-800/30 hover:bg-neutral-800 rounded transition-colors"
                  >
                    + Add Set
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 active:bg-indigo-500/20 transition-colors"
        >
          <Plus size={20} />
          Add Exercise
        </button>
      </main>

      {/* Rest Timer Overlay */}
      {restTimerSeconds > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-indigo-600 text-white p-4 flex flex-col gap-2 z-40 rounded-t-2xl shadow-[0_-10px_40px_rgba(79,70,229,0.3)] transition-transform duration-300">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">Rest Timer</h4>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-mono font-bold tracking-wider">{formatRestTime(restTimerSeconds)}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsRestTimerActive(!isRestTimerActive)} 
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  {isRestTimerActive ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button 
                  onClick={() => setRestTimerSeconds(0)} 
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <FastForward size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="w-full h-1 bg-white/20 rounded overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-linear"
              style={{ width: `${(restTimerSeconds / restTimerDuration) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
          <div className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900">
            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
              <X size={24} />
            </button>
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full bg-neutral-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredLibrary.map(item => (
              <button
                key={item.id}
                onClick={() => addSelectedExercise(item)}
                className="w-full text-left p-4 hover:bg-neutral-900 rounded-lg border-b border-neutral-800/50 flex justify-between items-center"
              >
                <span className="font-medium text-lg">{item.name}</span>
                <Plus size={20} className="text-indigo-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

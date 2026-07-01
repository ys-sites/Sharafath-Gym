import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Dumbbell, Activity, Check, RotateCw, Plus, Minus, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateWorkout, swapExerciseSlot, WorkoutGoal, WorkoutSplit, GeneratedExerciseSlot, GOAL_SCHEMES } from '../lib/workoutGenerator';

const MUSCLE_GROUPS = [
  'Chest', 'Shoulders', 'Triceps', 'Lats', 'Middle back', 
  'Lower back', 'Biceps', 'Forearms', 'Traps', 
  'Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Abdominals'
];

export default function GenerateWorkout() {
  const navigate = useNavigate();
  
  // Steps: 1 = Goal, 2 = Split/Day, 3 = Review
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<WorkoutGoal>('hypertrophy');
  const [split, setSplit] = useState<WorkoutSplit>('push_pull_legs');
  const [day, setDay] = useState('push');
  
  // Single focus muscles selection
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  
  // Generated list state
  const [slots, setSlots] = useState<GeneratedExerciseSlot[]>([]);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      setError('');
      try {
        const generated = await generateWorkout(split, day, goal, selectedMuscles);
        if (generated.length === 0) {
          setError('No exercises found matching your choices. Try adding more muscles.');
        } else {
          setSlots(generated);
          
          // Auto generate workout name
          const goalName = goal.charAt(0).toUpperCase() + goal.slice(1);
          let splitName = '';
          if (split === 'push_pull_legs') splitName = `${day.toUpperCase()} Day`;
          else if (split === 'upper_lower') splitName = `${day.toUpperCase()} Day`;
          else if (split === 'full_body') splitName = 'Full Body';
          else splitName = selectedMuscles.join('/') || 'Custom Focus';

          setCustomName(`AI ${goalName} ${splitName}`);
          setStep(3);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to generate workout.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSwapSlot = async (index: number) => {
    const slotToSwap = slots[index];
    const alreadySelectedIds = slots.map(s => s.exercise.id);
    
    setLoading(true);
    try {
      const newSlot = await swapExerciseSlot(slotToSwap, alreadySelectedIds, goal);
      if (newSlot) {
        const newSlots = [...slots];
        newSlots[index] = newSlot;
        setSlots(newSlots);
      } else {
        alert('No alternative exercise found targeting the same muscle group.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSets = (index: number, val: number) => {
    const newSlots = [...slots];
    newSlots[index].target_sets = Math.max(1, newSlots[index].target_sets + val);
    setSlots(newSlots);
  };

  const handleUpdateReps = (index: number, reps: string) => {
    const newSlots = [...slots];
    newSlots[index].target_reps = reps;
    setSlots(newSlots);
  };

  const handleSaveAsProgram = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // 1. Create template
      const { data: template, error: tempError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: customName.trim() || 'Generated AI Workout',
          split_day: split === 'push_pull_legs' || split === 'upper_lower' ? day : 'Full Body'
        })
        .select()
        .single();

      if (tempError) throw tempError;

      // 2. Insert exercises
      const exercisesToInsert = slots.map((slot, idx) => ({
        template_id: template.id,
        exercise_id: slot.exercise.id,
        order_index: idx,
        target_sets: slot.target_sets,
        target_reps: slot.target_reps
      }));

      const { error: itemsError } = await supabase
        .from('template_exercises')
        .insert(exercisesToInsert);

      if (itemsError) throw itemsError;

      alert('Program saved successfully!');
      navigate('/programs');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save program');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNow = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // 1. Create a template first so we can refer it or logger state
      const { data: template, error: tempError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: customName.trim() || 'Generated AI Workout',
          split_day: split === 'push_pull_legs' || split === 'upper_lower' ? day : 'Full Body'
        })
        .select()
        .single();

      if (tempError) throw tempError;

      const exercisesToInsert = slots.map((slot, idx) => ({
        template_id: template.id,
        exercise_id: slot.exercise.id,
        order_index: idx,
        target_sets: slot.target_sets,
        target_reps: slot.target_reps
      }));

      const { error: itemsError } = await supabase
        .from('template_exercises')
        .insert(exercisesToInsert);

      if (itemsError) throw itemsError;

      // 2. Navigate to logger with this template
      navigate('/logger', { 
        state: { 
          template: {
            id: template.id,
            name: template.name,
            exercises: slots.map(s => ({
              id: s.exercise.id,
              name: s.exercise.name,
              youtube_url: s.exercise.youtube_url || '',
              target_sets: s.target_sets,
              target_reps: s.target_reps,
              rest: s.rest
            }))
          }
        } 
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to start workout');
    } finally {
      setLoading(false);
    }
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  return (
    <div className="p-6 pb-32 bg-[#0C0D12] min-h-screen text-white font-sans text-left">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-6">
        <div className="bg-white/5 border border-white/10 p-1 rounded-full shadow-lg">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/programs')} 
            className="w-10 h-10 flex items-center justify-center bg-[#15161E] border border-neutral-800/40 rounded-full text-white active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight flex-1 text-center pr-12 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          AI Workout Generator
        </h1>
      </div>

      {loading && step !== 3 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-neutral-400">Generating training plan...</span>
        </div>
      )}

      {!loading && step === 1 && (
        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1">Step 1 of 3</span>
            <h2 className="text-2xl font-extrabold text-white">Choose your goal</h2>
            <p className="text-xs text-neutral-400 font-medium mt-1">We will tailor set/rep ranges and rest times to your desired outcome.</p>
          </div>

          <div className="space-y-4">
            {(['strength', 'hypertrophy', 'endurance'] as const).map((g) => {
              const isActive = goal === g;
              const details = GOAL_SCHEMES[g];
              return (
                <div key={g} className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
                  <div 
                    onClick={() => setGoal(g)}
                    className={`rounded-[calc(2rem-0.375rem)] p-5 border cursor-pointer transition-all flex items-center justify-between ${isActive ? 'bg-indigo-550 border-indigo-450' : 'bg-[#13141C] border-neutral-800/30 hover:border-indigo-500/20'}`}
                  >
                    <div>
                      <h3 className="font-extrabold capitalize text-base text-white">{g}</h3>
                      <p className="text-[11px] text-neutral-300 font-medium mt-1">
                        {g === 'strength' && 'Focuses on heavy loads and full recovery.'}
                        {g === 'hypertrophy' && 'Ideal for muscular growth and moderate sets.'}
                        {g === 'endurance' && 'Build stamina using high reps and short rest.'}
                      </p>
                    </div>
                    <div className="bg-black/25 px-3 py-1.5 rounded-xl text-[10px] font-black text-white shrink-0">
                      {details.sets}S x {details.reps}R
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={handleNextStep}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full text-base transition-all active:scale-[0.98] uppercase tracking-wider"
          >
            Continue
          </button>
        </div>
      )}

      {!loading && step === 2 && (
        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1">Step 2 of 3</span>
            <h2 className="text-2xl font-extrabold text-white">Select splits & target</h2>
            <p className="text-xs text-neutral-400 font-medium mt-1">Choose how you want to segment your muscle groups.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800/40 p-1.5 rounded-2xl flex gap-1">
              {(['push_pull_legs', 'upper_lower', 'full_body', 'single_focus'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSplit(s);
                    if (s === 'push_pull_legs') setDay('push');
                    else if (s === 'upper_lower') setDay('upper');
                    else setDay('full_body');
                  }}
                  className={`flex-1 py-2.5 text-[10px] font-extrabold rounded-xl capitalize transition-all ${split === s ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Split Subday Options */}
            {split === 'push_pull_legs' && (
              <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
                <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2rem-0.375rem)] p-5 space-y-3">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Select Training Day</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['push', 'pull', 'legs'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDay(d)}
                        className={`py-3 text-xs font-extrabold rounded-xl capitalize transition-all border ${day === d ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-black/20 border-neutral-850 text-neutral-400 hover:text-neutral-300'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {split === 'upper_lower' && (
              <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
                <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2rem-0.375rem)] p-5 space-y-3">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Select Training Day</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['upper', 'lower'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDay(d)}
                        className={`py-3 text-xs font-extrabold rounded-xl capitalize transition-all border ${day === d ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-black/20 border-neutral-850 text-neutral-400 hover:text-neutral-300'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Focus Muscle Group selection */}
            {split === 'single_focus' && (
              <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2.2rem] shadow-xl">
                <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2.2rem-0.375rem)] p-5 space-y-3">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Target Muscles (Pick 1-2)</span>
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {MUSCLE_GROUPS.map(muscle => {
                      const isSelected = selectedMuscles.includes(muscle);
                      return (
                        <button
                          key={muscle}
                          type="button"
                          onClick={() => toggleMuscle(muscle)}
                          className={`py-2 px-3 text-xs font-extrabold rounded-xl text-left transition-all border flex items-center justify-between ${isSelected ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-black/20 border-neutral-850 text-neutral-400 hover:text-neutral-300'}`}
                        >
                          {muscle}
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}

          <button 
            onClick={handleNextStep}
            disabled={split === 'single_focus' && selectedMuscles.length === 0}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-extrabold py-4 rounded-full text-base transition-all active:scale-[0.98] uppercase tracking-wider"
          >
            Generate Workout
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 max-w-md mx-auto relative z-10">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1">Step 3 of 3</span>
            <h2 className="text-2xl font-extrabold text-white">Review generated plan</h2>
            <p className="text-xs text-neutral-400 font-medium mt-1">Review composition. Tap swap to roll alternative movements.</p>
          </div>

          {/* Custom Name input box */}
          <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
            <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2rem-0.375rem)] p-4 flex flex-col justify-start">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Routine Title</span>
              <input 
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-transparent text-base font-extrabold text-white focus:outline-none mt-1"
                placeholder="E.g. Strength Chest Routine"
              />
            </div>
          </div>

          <div className="space-y-4">
            {slots.map((slot, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-xl">
                <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2.2rem-0.5rem)] overflow-hidden flex flex-col">
                  {/* Image banner if present */}
                  {slot.exercise.image_urls && slot.exercise.image_urls.length > 0 && (
                    <div className="w-full h-28 relative">
                      <img 
                        src={slot.exercise.image_urls[0]} 
                        alt={slot.exercise.name} 
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13141C] to-transparent"></div>
                      <span className="absolute bottom-2 left-4 text-[10px] font-bold bg-black/60 px-2 py-1 border border-white/5 rounded-full capitalize text-neutral-300">
                        {slot.exercise.muscle_group} · {slot.exercise.equipment}
                      </span>
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        {!slot.exercise.image_urls?.length && (
                          <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1 block">
                            {slot.exercise.muscle_group}
                          </span>
                        )}
                        <h3 className="font-extrabold text-base text-white leading-tight">{slot.exercise.name}</h3>
                        <p className="text-[10px] text-neutral-500 capitalize font-bold mt-1">Level: {slot.exercise.level} · {slot.exercise.equipment}</p>
                      </div>
                      
                      {/* Swap button */}
                      <button
                        type="button"
                        onClick={() => handleSwapSlot(idx)}
                        className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-indigo-400 hover:text-indigo-300 active:scale-90 transition-transform"
                        title="Swap Exercise"
                      >
                        <RotateCw size={14} />
                      </button>
                    </div>

                    {/* Sets / Reps selection fields */}
                    <div className="flex gap-4 border-t border-neutral-850/60 pt-3">
                      <div className="flex-1 flex items-center justify-between bg-neutral-900 p-2 px-3.5 rounded-xl border border-neutral-850">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Sets</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateSets(idx, -1)}
                            className="w-6 h-6 rounded-full bg-black/35 flex items-center justify-center text-xs active:scale-90"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-sm font-extrabold">{slot.target_sets}</span>
                          <button 
                            onClick={() => handleUpdateSets(idx, 1)}
                            className="w-6 h-6 rounded-full bg-black/35 flex items-center justify-center text-xs active:scale-90"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center bg-neutral-900 p-2 px-3 border border-neutral-850 rounded-xl">
                        <span className="text-[9px] text-neutral-500 uppercase block font-bold pl-1.5">Reps</span>
                        <input 
                          type="text"
                          value={slot.target_reps}
                          onChange={(e) => handleUpdateReps(idx, e.target.value)}
                          className="w-full bg-transparent text-xs font-extrabold text-white focus:outline-none pl-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleStartNow}
              className="w-full bg-indigo-500 hover:bg-indigo-650 text-white font-extrabold py-4 rounded-full text-base transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Zap size={16} className="fill-white text-white" />
              Start Workout Now
            </button>
            
            <button
              onClick={handleSaveAsProgram}
              className="w-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-extrabold py-4 rounded-full text-sm transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Save as Program template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

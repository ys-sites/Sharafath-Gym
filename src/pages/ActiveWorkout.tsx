import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Play, Pause, Check, Plus, Volume2, VolumeX, Maximize, Clock } from 'lucide-react';

const ROUTINES: Record<string, { name: string; category: string; duration: string; calories: string; difficulty: string; exercises: Array<{ name: string; reps: string; sets: number; videoUrl?: string; tip?: string }> }> = {
  push_1: {
    name: 'Day 1: PUSH (Chest/Shoulders)',
    category: 'Strength',
    duration: '45 Min',
    calories: '320 kcal',
    difficulty: 'Beginner',
    exercises: [
      { name: 'Machine Chest Press', reps: '6-10', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=pLofEAcfsO8', tip: 'First set is warm up. Focus on feeling the muscle, not lifting heavy.' },
      { name: 'Incline Dumbbell Press', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=IP4oeKh1Sd4', tip: 'Control the tempo. Keep your lower back protected.' },
      { name: 'Machine Pec Deck Fly', reps: '10-15', sets: 2, videoUrl: 'https://www.youtube.com/watch?v=JYmszQs-mRs', tip: 'Contract the chest at the peak. Do not let shoulders rotate forward.' },
      { name: 'Dumbbell Lateral Raise', reps: '12-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=PzsMitRdI_8', tip: 'Keep arms slightly bent. Lift with your elbows.' },
      { name: 'Reverse Pec Deck', reps: '12-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=P6-N-VGCVxk', tip: 'Perform with controlled speed. Do not throw the weight.' },
      { name: 'Tricep Pushdown (rope)', reps: '10-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=-zLyUAo1gMw', tip: 'Keep elbows locked at your side. Full range of motion.' },
      { name: 'Overhead Rope Extension', reps: '10-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=1657VVZi0Ms', tip: 'Stretch triceps at the bottom, brace core.' }
    ]
  },
  pull_1: {
    name: 'Day 2: PULL (Back/Biceps)',
    category: 'Strength',
    duration: '40 Min',
    calories: '300 kcal',
    difficulty: 'Beginner',
    exercises: [
      { name: 'Wide-Grip Lat Pulldown', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=8hzVLzu-RJk', tip: 'Pull down to upper chest, squeeze shoulder blades.' },
      { name: 'Close-Grip Lat Pulldown', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=8hzVLzu-RJk', tip: 'Pull down focusing on lower lats activation.' },
      { name: 'Seated Cable Row', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=vwHG9Jfu4sw', tip: 'Keep back flat. Do not swing your upper body.' },
      { name: 'Wide-Grip Row', reps: '3x8', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=1nRP8S_O6l0', tip: 'Target upper back thickness. Pull with elbows wide.' },
      { name: 'Lat Pullover Machine', reps: '10-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=32auHIqgEoM', tip: 'Isolate lats. Keep arms locked and control the stretch.' },
      { name: 'Preacher Curl', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=Gydpcouclx8', tip: 'Keep armpits locked against pad. Focus on bicep peak.' },
      { name: 'Incline Dumbbell Curl', reps: '10-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=HhHHBj3qTJ4', tip: 'Curl with palms facing up, control the eccentric phase.' },
      { name: 'Hammer Curl', reps: '10-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=BRVDS6HVR9Q', tip: 'Target brachialis. Palms facing each other throughout.' }
    ]
  },
  legs_1: {
    name: 'Day 3: LEGS (Quads/Hamstrings)',
    category: 'Strength',
    duration: '50 Min',
    calories: '420 kcal',
    difficulty: 'Beginner',
    exercises: [
      { name: 'Hack Squat', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=0tn5K9NlCfo', tip: 'Go deep, control speed, keep heels flat on platform.' },
      { name: 'Leg Press', reps: '10-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=ETOAyWM6i6A', tip: 'Do not lock out knees. Keep feet shoulder-width apart.' },
      { name: 'Leg Extension', reps: '12-15', sets: 2, videoUrl: 'https://www.youtube.com/watch?v=swZQC689o9U', tip: 'Pause at the top extension to maximize quad loading.' },
      { name: 'Dumbbell Romanian Deadlift', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=hQgFixeXdZo', tip: 'Push hips back. Lower weight along shins, protect lower back.' },
      { name: 'Seated Leg Curl', reps: '10-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=IOufFLwNOTU', tip: 'Flex hamstrings fully at the bottom. Hold for a split second.' },
      { name: 'Standing Calf Raise', reps: '12-20', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=SRUtMJ0tE2A', tip: 'Full range of motion. Go up on tiptoes, stretch down.' },
      { name: 'Seated Leg Raise', reps: '10-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=l4kQd9eWclE', tip: 'Brace core, lift legs without shifting weight.' }
    ]
  },
  upper_1: {
    name: 'Day 5: UPPER (Chest/Back/Shoulders)',
    category: 'Strength',
    duration: '50 Min',
    calories: '380 kcal',
    difficulty: 'Beginner',
    exercises: [
      { name: 'Incline Machine Press', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=VesHgJR14E8', tip: 'Focus on upper chest muscle tension. Squeeze at peak.' },
      { name: 'Machine Chest Press', reps: '8-12', sets: 2, videoUrl: 'https://www.youtube.com/watch?v=pLofEAcfsO8', tip: 'Maintain a stable trunk. Retract shoulders.' },
      { name: 'Assisted Pull-Up', reps: '6-10', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=gx0RWT7WbmA', tip: 'Pull chest to bar. Control descent fully.' },
      { name: 'Chest-Supported Row', reps: '8-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=vmX58YYK3-8', tip: 'Keep chest glued to support. Squeeze middle back.' },
      { name: 'Lat Pullover Machine', reps: '10-15', sets: 2, videoUrl: 'https://www.youtube.com/watch?v=32auHIqgEoM', tip: 'Slow stretch at the top. Drive down with elbows.' },
      { name: 'Dumbbell Lateral Raise', reps: '12-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=PzsMitRdI_8', tip: 'Keep shoulders down. Isolate lateral deltoids.' },
      { name: 'Reverse Pec Deck', reps: '12-15', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=P6-N-VGCVxk', tip: 'Focus rear shoulders. Do not use momentum.' },
      { name: 'Preacher Curl', reps: '10-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=Gydpcouclx8', tip: 'Strict arm curls on preacher pad.' },
      { name: 'Cable Curl', reps: '10-12', sets: 2, videoUrl: 'https://www.youtube.com/watch?v=NFzTWp2qpiE', tip: 'Constant bicep tension throughout the motion.' },
      { name: 'Rope Pushdown', reps: '10-12', sets: 3, videoUrl: 'https://www.youtube.com/watch?v=qHDrQglWgS4', tip: 'Flare rope outward at full extension.' },
      { name: 'Overhead Cable Extension', reps: '10-12', sets: 2, videoUrl: 'https://www.youtube.com/watch?v=1657VVZi0Ms', tip: 'Extend fully to load triceps long head.' }
    ]
  }
};

function getYoutubeId(url?: string) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const activeRoutine = (id && ROUTINES[id]) || ROUTINES.push_1;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = activeRoutine.exercises[currentExerciseIndex];

  const [isPlaying, setIsPlaying] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState('');
  const [feeling, setFeeling] = useState(1); // 0 = Too easy, 1 = Just right, 2 = Too hard
  
  // Fullscreen states
  const [isFullscreenVideo, setIsFullscreenVideo] = useState(false);
  const [isFullscreenMuted, setIsFullscreenMuted] = useState(true);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRestTimerActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimerSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleExitWorkout = () => {
    const confirmExit = window.confirm("Are you sure you want to end this workout? Progress will not be saved.");
    if (confirmExit) {
      navigate('/');
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < activeRoutine.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setWeight('');
    } else {
      alert("Workout Completed! Excellent job Mohamed Sharafath!");
      navigate('/');
    }
  };

  const progressPercent = ((currentExerciseIndex + 1) / activeRoutine.exercises.length) * 100;
  const videoId = getYoutubeId(currentExercise.videoUrl);

  return (
    <div className="bg-[#0C0D12] min-h-screen text-white font-sans flex flex-col relative overflow-hidden pb-8">
      {/* Dynamic Video background */}
      <div className="absolute inset-0 z-0 h-[45vh] overflow-hidden bg-black">
        {videoId ? (
          <iframe 
            className="w-full h-full object-cover pointer-events-none opacity-60 absolute inset-0 scale-[1.35]" 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}&vq=hd725`}
            allow="autoplay; encrypted-media"
            title="Exercise demo video"
            frameBorder="0"
          />
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" 
            alt="Fallback background"
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0C0D12]"></div>
      </div>

      {/* Top Floating Controls */}
      <div className="relative z-10 p-6 pt-12 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-10 px-4 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="font-extrabold text-sm">{formatTime(seconds)}</span>
          </button>
          
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-transform">
            <Volume2 size={16} className="text-white" />
          </button>
        </div>

        {/* Exit Button */}
        <button 
          onClick={handleExitWorkout}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-transform hover:bg-black/60"
        >
          <X size={16} className="text-neutral-300" />
        </button>
      </div>

      {/* Floating Expand Button */}
      <div className="absolute top-[38vh] right-4 z-10">
        <button 
          onClick={() => setIsFullscreenVideo(true)}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-transform hover:bg-black/60 text-white shadow-lg"
          title="Fullscreen Video"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* Active Exercise UI Overlay info */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[28vh] px-6 text-center mt-2">
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-extrabold mb-3">
          Exercise {currentExerciseIndex + 1} of {activeRoutine.exercises.length}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 max-w-xs leading-none">
          {currentExercise.name}
        </h1>
        <div className="w-10 h-1 bg-indigo-500 rounded-full mt-2"></div>
      </div>

      {/* Progress slider bar */}
      <div className="relative z-10 w-full bg-neutral-900 h-1.5 mb-6">
        <div className="bg-indigo-500 h-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Bottom control panel */}
      <div className="relative z-20 flex-1 flex flex-col bg-[#0C0D12] px-6">
        
        {isRestTimerActive && restTimerSeconds > 0 && (
          <div className="bg-indigo-650/90 border border-indigo-500/30 p-4 rounded-[1.5rem] mb-6 flex items-center justify-between text-white shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="text-indigo-350 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Rest:</span>
              <span className="text-lg font-black tracking-tight">{Math.floor(restTimerSeconds / 60)}:{(restTimerSeconds % 60) < 10 ? '0' : ''}{restTimerSeconds % 60}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setRestTimerSeconds(prev => prev + 30)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] font-extrabold uppercase rounded-lg border border-white/5 transition-transform"
              >
                +30s
              </button>
              <button 
                onClick={() => {
                  setRestTimerSeconds(0);
                  setIsRestTimerActive(false);
                }}
                className="px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 active:scale-95 text-[10px] font-extrabold uppercase rounded-lg transition-transform"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Coach tip box (Double bezel) */}
        <div className="bg-white/5 border border-white/10 p-1 rounded-[2rem] shadow-xl mb-6">
          <div className="bg-[#13141C] border border-neutral-850 rounded-[calc(2rem-0.25rem)] pt-8 pb-5 px-5 relative">
            
            {/* Coach avatar badge */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 border-[#13141C] overflow-hidden bg-neutral-800 shadow-md">
              <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=150" alt="Coach Adam" className="w-full h-full object-cover" />
            </div>

            <h3 className="text-[9px] font-extrabold text-indigo-400 tracking-[0.2em] text-center uppercase mb-2">Coach Adam</h3>
            <p className="text-xs text-neutral-400 leading-relaxed text-center mb-4 font-medium">
              {currentExercise.tip || "Maintain strict form, focus on target muscle contraction, and stay consistent."}
            </p>
            
            <div className="h-[1px] bg-neutral-800/80 -mx-5 mb-4"></div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500 font-extrabold uppercase tracking-wider text-[9px]">Target Splits</span>
              <div className="text-indigo-400 font-extrabold">
                {currentExercise.sets} Sets • {currentExercise.reps} Reps
              </div>
            </div>
          </div>
        </div>

        {/* Inputs and Next Controller */}
        <div className="space-y-6 mt-auto">
          <div className="flex items-center justify-between gap-6">
            
            {/* Log Stats FAB */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setShowLogSheet(true)}
                className="w-14 h-14 rounded-full bg-[#13141C] border border-neutral-850 flex items-center justify-center mb-1.5 hover:bg-neutral-800 active:scale-95 transition-all text-indigo-400"
              >
                <Plus size={24} />
              </button>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Log Set</span>
            </div>

            {/* Reps display counter indicator */}
            <div className="w-28 h-28 rounded-full border-4 border-neutral-850 flex flex-col items-center justify-center relative bg-[#13141C] shadow-inner">
              <div className="text-3xl font-extrabold text-white">{currentExercise.reps.split('-').pop().split('x').pop()}</div>
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-extrabold mt-0.5">Target Reps</div>
            </div>

            {/* Next Button */}
            <div className="flex flex-col items-center">
              <button 
                onClick={handleNext}
                className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-650 flex items-center justify-center mb-1.5 active:scale-95 transition-all shadow-[0_6px_20px_rgba(99,102,241,0.35)] text-white"
              >
                <Check size={28} />
              </button>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Next</span>
            </div>

          </div>
        </div>

      </div>

      {/* Log set modal sheet overlay */}
      {showLogSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm" onClick={() => setShowLogSheet(false)}>
          <div className="bg-[#13141C] border-t border-neutral-850 w-full rounded-t-[2.5rem] pb-8 animate-in slide-in-from-bottom-full max-w-sm" onClick={e => e.stopPropagation()}>
             {/* Handle indicator */}
             <div className="flex justify-center pt-4 pb-2">
               <div className="w-12 h-1.5 bg-neutral-800 rounded-full"></div>
             </div>
             
             <div className="flex justify-between items-center px-6 py-4">
               <button onClick={() => setShowLogSheet(false)} className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                 <X size={16} />
               </button>
               <h3 className="text-base font-extrabold tracking-tight capitalize">{currentExercise.name}</h3>
               <div className="w-9"></div>
             </div>
             
             <div className="h-[1px] bg-neutral-800/80 w-full mb-6"></div>

             <div className="px-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-850">
                     <span className="text-[9px] text-neutral-500 uppercase block font-bold">Reps Performed</span>
                     <input
                       type="number"
                       value={reps}
                       onChange={(e) => setReps(Number(e.target.value))}
                       className="w-full bg-transparent text-xl font-extrabold text-white focus:outline-none mt-1"
                     />
                  </div>
                  <div className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-850">
                     <span className="text-[9px] text-neutral-500 uppercase block font-bold">Weight (kg)</span>
                     <input
                       type="text"
                       value={weight}
                       onChange={(e) => setWeight(e.target.value)}
                       placeholder="0.0"
                       className="w-full bg-transparent text-xl font-extrabold text-white focus:outline-none mt-1"
                     />
                  </div>
                </div>

                {/* Feeling assessment */}
                <div className="space-y-2">
                   <span className="text-[9px] text-neutral-500 uppercase block font-bold tracking-wider text-center">How did the set feel?</span>
                   <div className="flex gap-2 bg-neutral-900 border border-neutral-850 p-1 rounded-xl">
                      {(['Too Easy', 'Just Right', 'Too Hard'] as const).map((desc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFeeling(idx)}
                          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${feeling === idx ? 'bg-indigo-500 text-white shadow' : 'text-neutral-400 hover:text-neutral-300'}`}
                        >
                          {desc}
                        </button>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => {
                    const restTime = (currentExercise as any).rest || 90;
                    setRestTimerSeconds(restTime);
                    setIsRestTimerActive(true);
                    setShowLogSheet(false);
                  }}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-xl text-sm transition-all active:scale-[0.98] uppercase tracking-wider shadow-lg shadow-indigo-500/25"
                >
                  Save Set
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Fullscreen Video Modal */}
      {isFullscreenVideo && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          {videoId ? (
            <iframe 
              className="w-full h-full object-cover absolute inset-0 pointer-events-none scale-[1.35]" 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isFullscreenMuted ? 1 : 0}&loop=1&playlist=${videoId}&vq=hd720&controls=0`}
              allow="autoplay; encrypted-media"
              title="Fullscreen demo video"
              frameBorder="0"
            />
          ) : (
            <div className="text-neutral-500 text-sm">No video available</div>
          )}
          
          {/* Header controls overlay */}
          <div className="absolute top-0 inset-x-0 p-6 pt-12 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="font-extrabold text-lg text-white tracking-tight">{currentExercise.name}</h3>
            <button 
              onClick={() => setIsFullscreenVideo(false)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-transform"
            >
              <X size={18} />
            </button>
          </div>

          {/* Bottom sound toggle overlay */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-4">
            <button 
              onClick={() => setIsFullscreenMuted(!isFullscreenMuted)}
              className="px-6 py-3 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              {isFullscreenMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isFullscreenMuted ? "Unmute Audio" : "Mute Audio"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

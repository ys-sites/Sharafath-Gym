import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, MoreHorizontal, ArrowDown, Play, Heart, RefreshCw, X, Edit2, ArrowLeftRight, Navigation, Trash2, Star, Dumbbell, Clock, Flame } from 'lucide-react';

export default function WorkoutDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Mock details for the workout
  const programDetails = {
    title: "Massive Upper Body",
    rating: "4.9",
    reviews: "240 reviews",
    duration: "45 Min",
    difficulty: "Advanced",
    category: "Strength",
    calories: "350 kcal",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800",
    description: "Build serious upper body strength and mass with this targeted dumbbell hypertrophy split. Focuses on chest expansion, upper back thickness, and shoulder stability through high-intensity circuits."
  };

  // Mock data for the circuits
  const circuits = [
    {
      id: 1,
      name: 'CIRCUIT 1 (Hypertrophy)',
      rounds: 3,
      exercises: [
        { id: '1a', name: 'Dumbbell Bench Press', details: '12, 10, 8 Reps', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=200' },
        { id: '1b', name: 'Dumbbell Chest Fly', details: '15, 12, 10 Reps', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200' },
        { id: '1c', name: 'Dumbbell Single Arm Row', details: '12 Reps Each Side', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=200' },
        { id: '1d', name: 'Dumbbell Arnold Press', details: '12, 10 Reps', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=200' },
      ]
    },
    {
      id: 2,
      name: 'CIRCUIT 2 (Finisher)',
      rounds: 2,
      exercises: [
        { id: '2a', name: 'Push-ups to Failure', details: 'Max Reps', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200' }
      ]
    }
  ];

  return (
    <div className="bg-[#0C0D12] min-h-screen text-white font-sans flex flex-col pb-36 relative">
      {/* Top Floating Header (Hero Cover) */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img 
          src={programDetails.image} 
          alt={programDetails.title} 
          className="w-full h-full object-cover"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0C0D12]"></div>
        
        {/* Navigation Buttons Overlay */}
        <div className="absolute top-12 left-0 w-full px-6 flex justify-between items-center z-20">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors">
              <Share2 size={16} className="text-white" />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all ${isSaved ? 'text-indigo-400 bg-indigo-500/20' : 'text-white'}`}
            >
              <Heart size={16} className={isSaved ? 'fill-indigo-400' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Program Details Content */}
      <div className="relative z-10 -mt-10 px-6 space-y-6">
        <div>
          {/* Eyebrow badge / Category */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3">
            {programDetails.category}
          </div>
          
          {/* Workout Title */}
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            {programDetails.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-300">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span>{programDetails.rating}</span>
            <span className="text-neutral-500 font-medium">({programDetails.reviews})</span>
          </div>
        </div>

        {/* Stats Grid Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl shadow-md">
            <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2-0.25rem)] p-3 flex flex-col items-center justify-center text-center">
              <Clock size={16} className="text-indigo-400 mb-1" />
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Duration</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{programDetails.duration}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl shadow-md">
            <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2-0.25rem)] p-3 flex flex-col items-center justify-center text-center">
              <Dumbbell size={16} className="text-teal-400 mb-1" />
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Level</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{programDetails.difficulty}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl shadow-md">
            <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2-0.25rem)] p-3 flex flex-col items-center justify-center text-center">
              <Flame size={16} className="text-red-500 mb-1 animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Burn</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{programDetails.calories}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-base tracking-tight">About the workout</h3>
          <p className="text-sm text-neutral-400 leading-relaxed font-medium">
            {programDetails.description}
          </p>
        </div>

        {/* Exercises Circuits List */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-base tracking-tight">Routine Circuit</h3>
          
          {circuits.map((circuit, cIdx) => (
            <div key={circuit.id} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-[11px] font-extrabold text-neutral-500 tracking-widest uppercase">{circuit.name}</h4>
                <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
                  {circuit.rounds} Rounds
                </div>
              </div>
              
              {/* Double-Bezel list container */}
              <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-xl relative">
                <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-5 border border-neutral-800/30 relative">
                  
                  {/* Vertical connector line */}
                  <div className="absolute left-[34px] top-8 bottom-8 w-[1px] bg-indigo-500/20 z-0"></div>
                  
                  <div className="space-y-6 relative z-10">
                    {circuit.exercises.map((ex, eIdx) => (
                      <div key={ex.id} className="relative">
                        <div className="flex items-center gap-4">
                          {/* Image box with small border */}
                          <div className="w-16 h-16 rounded-2xl bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700/40 z-10 shadow-md">
                            <img src={ex.img} alt={ex.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-extrabold text-white text-base leading-tight pr-8 tracking-tight">{ex.name}</h3>
                            <p className="text-xs font-bold text-neutral-400 mt-1">{ex.details}</p>
                          </div>
                          
                          <button 
                            onClick={() => setActiveMenu(ex.id)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-white"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                        
                        {/* Connecting arrows */}
                        {eIdx < circuit.exercises.length - 1 && (
                          <div className="flex justify-center w-16 mt-4 text-indigo-500/40">
                            <ArrowDown size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fixed bottom button (Double bezel floating wrapper) */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0C0D12] via-[#0C0D12]/95 to-transparent z-40">
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-full shadow-2xl max-w-lg mx-auto">
          <button 
            onClick={() => navigate(`/active-workout/${id}`)}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full text-lg transition-all active:scale-[0.98] tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Play size={18} className="fill-white" /> Start workout
          </button>
        </div>
      </div>

      {/* Option Menu Overlay */}
      {activeMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveMenu(null)}>
          <div className="bg-[#13141C] w-full rounded-t-3xl p-6 pb-12 border-t border-neutral-800/40 max-w-md animate-in slide-in-from-bottom-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold tracking-tight">Modify exercise</h3>
              <button onClick={() => setActiveMenu(null)} className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <button className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Edit2 size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">Edit Reps / Sets</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Easily adjust Target ranges</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">Swap Exercise</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Choose alternate movements</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                  <Navigation size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">Re-order Circuit</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Shift position in group</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <Trash2 size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-red-500 text-sm">Remove from Routine</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Delete exercise completely</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

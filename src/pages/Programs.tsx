import { useState } from 'react';
import { Search, ChevronLeft, Dumbbell, Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_PROGRAMS = [
  { 
    id: 'push_1', 
    name: 'Day 1: PUSH (Chest/Shoulders)', 
    split_day: 'Day 1', 
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [
      { id: 'ex1', name: 'Machine Chest Press', target_sets: 3, target_reps: '6-10' },
      { id: 'ex2', name: 'Incline Dumbbell Press', target_sets: 3, target_reps: '8-12' },
    ] 
  },
  { 
    id: 'pull_1', 
    name: 'Day 2: PULL (Back/Biceps)', 
    split_day: 'Day 2', 
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [
      { id: 'ex8', name: 'Wide-Grip Lat Pulldown', target_sets: 3, target_reps: '8-12' },
      { id: 'ex9', name: 'Close-Grip Lat Pulldown', target_sets: 3, target_reps: '8-12' },
    ] 
  },
  { 
    id: 'legs_1', 
    name: 'Day 3: LEGS (Quads/Hamstrings)', 
    split_day: 'Day 3', 
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [
      { id: 'ex16', name: 'Hack Squat', target_sets: 3, target_reps: '8-12' },
      { id: 'ex17', name: 'Leg Press', target_sets: 3, target_reps: '10-15' },
    ] 
  },
  { 
    id: 'upper_1', 
    name: 'Day 5: UPPER (Hypertrophy)', 
    split_day: 'Day 5', 
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [
      { id: 'ex23', name: 'Incline Machine Press', target_sets: 3, target_reps: '8-12' },
    ] 
  }
];

export default function Programs() {
  const navigate = useNavigate();
  const [programs] = useState(MOCK_PROGRAMS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 pb-32 bg-[#0C0D12] min-h-screen text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-6">
        <div className="bg-white/5 border border-white/10 p-1 rounded-full shadow-lg">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center bg-[#15161E] border border-neutral-800/40 rounded-full text-white active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight flex-1 text-center pr-12 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Explore split routines
        </h1>
      </div>

      {/* Search Input Box */}
      <div className="bg-white/5 border border-white/10 p-1.5 rounded-full shadow-lg mb-8 max-w-md mx-auto">
        <div className="relative flex items-center bg-[#13141C] border border-neutral-800/30 rounded-full">
          <div className="absolute left-4 pointer-events-none">
            <Search size={18} className="text-neutral-500" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts, routines..." 
            className="w-full bg-transparent text-white text-sm py-4 pl-12 pr-6 focus:outline-none placeholder:text-neutral-500 font-medium"
          />
        </div>
      </div>

      {/* Categories Grid (Double-Bezel cards) */}
      <div className="space-y-6 max-w-md mx-auto">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <div key={program.id} className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-xl">
              <div 
                onClick={() => navigate(`/workout/${program.id}`)}
                className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] overflow-hidden flex cursor-pointer active:scale-[0.98] transition-all duration-300 border border-neutral-800/30 group hover:border-indigo-500/20"
              >
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1.5 block">
                    {program.split_day}
                  </span>
                  <h3 className="font-extrabold text-lg mb-2 text-white leading-snug group-hover:text-indigo-300 transition-colors pr-2">
                    {program.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800/40 rounded-full px-3 py-1 text-xs text-neutral-400 font-bold w-max">
                    <Dumbbell size={12} className="text-indigo-400" /> {program.exercises.length} Exercises
                  </div>
                </div>
                
                {/* Image panel with gradient fade */}
                <div className="w-2/5 relative shrink-0">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#13141C] to-transparent z-10 w-1/3"></div>
                  <img 
                    src={program.image} 
                    alt={program.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-neutral-500 font-bold">
            No routines matching search query.
          </div>
        )}
      </div>
    </div>
  );
}

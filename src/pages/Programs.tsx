import { useState } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_PROGRAMS = [
  { 
    id: 'push_1', 
    name: 'Day 1: PUSH', 
    split_day: 'Day 1', 
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [
      { id: 'ex1', name: 'Machine Chest Press', target_sets: 3, target_reps: '6-10' },
      { id: 'ex2', name: 'Incline Dumbbell Press', target_sets: 3, target_reps: '8-12' },
    ] 
  },
  { 
    id: 'pull_1', 
    name: 'Day 2: PULL', 
    split_day: 'Day 2', 
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [
      { id: 'ex8', name: 'Wide-Grip Lat Pulldown', target_sets: 3, target_reps: '8-12' },
      { id: 'ex9', name: 'Close-Grip Lat Pulldown', target_sets: 3, target_reps: '8-12' },
    ] 
  },
  { 
    id: 'legs_1', 
    name: 'Day 3: LEGS', 
    split_day: 'Day 3', 
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [
      { id: 'ex16', name: 'Hack Squat', target_sets: 3, target_reps: '8-12' },
      { id: 'ex17', name: 'Leg Press', target_sets: 3, target_reps: '10-15' },
    ] 
  },
  { 
    id: 'upper_1', 
    name: 'Day 5: UPPER', 
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

  const startProgram = (program: any) => {
    navigate('/logger', { state: { template: program } });
  };

  return (
    <div className="p-6 pb-24 font-sans bg-[#0F1015] min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pt-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-[#1A1A24] rounded-full text-white">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center pr-8">Categories</h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-neutral-500" />
        </div>
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full bg-[#1A1A24] text-white border border-neutral-800 rounded-full py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>



      {/* Category Cards */}
      <div className="space-y-4">
        {programs.map((program, index) => {
          // Rotate some subtle gradients for the cards
          const gradients = [
            'from-indigo-500/20 to-purple-500/5',
            'from-pink-500/20 to-rose-500/5',
            'from-emerald-500/20 to-teal-500/5',
            'from-orange-500/20 to-amber-500/5',
          ];
          const gradient = gradients[index % gradients.length];
          
          return (
            <div 
              key={program.id} 
              onClick={() => navigate(`/workout/${program.id}`)}
              className={`bg-gradient-to-r ${gradient} bg-[#1A1A24] border border-neutral-800/50 rounded-[32px] overflow-hidden flex cursor-pointer active:scale-[0.98] transition-transform`}
            >
              <div className="flex-1 p-6 flex flex-col justify-center">
                <h3 className="font-bold text-xl mb-1 text-white">{program.name}</h3>
                <p className="text-sm text-neutral-400">{program.exercises.length} Exercises</p>
              </div>
              <div className="w-1/2 relative">
                {/* Image fading into the background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A24] to-transparent z-10 w-1/3"></div>
                <img 
                  src={program.image} 
                  alt={program.name} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, Dumbbell, Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MOCK_PROGRAMS = [
  { 
    id: 'push_1', 
    name: 'Day 1: PUSH (Chest/Shoulders/Triceps)', 
    split_day: 'Day 1', 
    image: 'https://img.youtube.com/vi/pLofEAcfsO8/hqdefault.jpg',
    exercises: [
      { id: 'ex1', name: 'Machine Chest Press', target_sets: 3, target_reps: '6-10' },
      { id: 'ex2', name: 'Incline Dumbbell Press', target_sets: 3, target_reps: '8-12' },
      { id: 'ex3', name: 'Machine Pec Deck Fly', target_sets: 2, target_reps: '10-15' },
      { id: 'ex4', name: 'Dumbbell Lateral Raise', target_sets: 3, target_reps: '12-15' },
      { id: 'ex5', name: 'Reverse Pec Deck', target_sets: 3, target_reps: '12-15' },
      { id: 'ex6', name: 'Tricep Pushdown (rope)', target_sets: 3, target_reps: '10-15' },
      { id: 'ex7', name: 'Overhead Rope Extension', target_sets: 3, target_reps: '10-15' },
      { id: 'ex8', name: 'Incline Treadmill', target_sets: 1, target_reps: '15 Min' },
    ] 
  },
  { 
    id: 'pull_1', 
    name: 'Day 2: PULL (Back/Biceps)', 
    split_day: 'Day 2', 
    image: 'https://img.youtube.com/vi/8hzVLzu-RJk/hqdefault.jpg',
    exercises: [
      { id: 'ex9', name: 'Wide-Grip Lat Pulldown', target_sets: 3, target_reps: '8-12' },
      { id: 'ex10', name: 'Close-Grip Lat Pulldown', target_sets: 3, target_reps: '8-12' },
      { id: 'ex11', name: 'Seated Cable Row', target_sets: 3, target_reps: '8-12' },
      { id: 'ex12', name: 'Wide-Grip Row', target_sets: 3, target_reps: '8' },
      { id: 'ex13', name: 'Lat Pullover Machine', target_sets: 3, target_reps: '10-15' },
      { id: 'ex14', name: 'Preacher Curl', target_sets: 3, target_reps: '8-12' },
      { id: 'ex15', name: 'Incline Dumbbell Curl', target_sets: 3, target_reps: '10-12' },
      { id: 'ex16', name: 'Hammer Curl', target_sets: 3, target_reps: '10-12' },
      { id: 'ex17', name: 'Stairmaster', target_sets: 1, target_reps: '15 Min' },
    ] 
  },
  { 
    id: 'legs_1', 
    name: 'Day 3: LEGS (Quads/Hamstrings)', 
    split_day: 'Day 3', 
    image: 'https://img.youtube.com/vi/0tn5K9NlCfo/hqdefault.jpg',
    exercises: [
      { id: 'ex18', name: 'Hack Squat', target_sets: 3, target_reps: '8-12' },
      { id: 'ex19', name: 'Leg Press', target_sets: 3, target_reps: '10-15' },
      { id: 'ex20', name: 'Leg Extension', target_sets: 2, target_reps: '12-15' },
      { id: 'ex21', name: 'Dumbbell Romanian Deadlift', target_sets: 3, target_reps: '8-12' },
      { id: 'ex22', name: 'Seated Leg Curl', target_sets: 3, target_reps: '10-15' },
      { id: 'ex23', name: 'Standing Calf Raise', target_sets: 3, target_reps: '12-20' },
      { id: 'ex24', name: 'Seated Leg Raises (core)', target_sets: 3, target_reps: '10-15' },
    ] 
  },
  { 
    id: 'rest_4', 
    name: 'Day 4: Rest / Active Recovery', 
    split_day: 'Day 4', 
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [] 
  },
  { 
    id: 'upper_1', 
    name: 'Day 5: UPPER (Hypertrophy)', 
    split_day: 'Day 5', 
    image: 'https://img.youtube.com/vi/VesHgJR14E8/hqdefault.jpg',
    exercises: [
      { id: 'ex25', name: 'Incline Machine Press', target_sets: 3, target_reps: '8-12' },
      { id: 'ex26', name: 'Machine Chest Press', target_sets: 2, target_reps: '8-12' },
      { id: 'ex27', name: 'Pull-Ups / Assisted Pull-Ups', target_sets: 3, target_reps: '6-10' },
      { id: 'ex28', name: 'Chest-Supported Row', target_sets: 3, target_reps: '8-12' },
      { id: 'ex29', name: 'Lat Pullover Machine', target_sets: 3, target_reps: '10-12' },
      { id: 'ex30', name: 'Dumbbell Lateral Raise', target_sets: 3, target_reps: '12-15' },
      { id: 'ex31', name: 'Reverse Pec Deck', target_sets: 3, target_reps: '12-15' },
      { id: 'ex32', name: 'Preacher Curl', target_sets: 3, target_reps: '10-12' },
      { id: 'ex33', name: 'Cable Curl', target_sets: 2, target_reps: '10-12' },
      { id: 'ex34', name: 'Rope Pushdown', target_sets: 3, target_reps: '10-12' },
      { id: 'ex35', name: 'Overhead Cable Extension', target_sets: 2, target_reps: '10-12' },
    ] 
  },
  { 
    id: 'lower_1', 
    name: 'Day 6: LOWER (Quads/Hamstrings/Core)', 
    split_day: 'Day 6', 
    image: 'https://img.youtube.com/vi/HPXa3HdJQnc/hqdefault.jpg',
    exercises: [
      { id: 'ex36', name: 'Smith Machine Squat', target_sets: 3, target_reps: '8-12' },
      { id: 'ex37', name: 'Walking Lunges', target_sets: 3, target_reps: '10-12' },
      { id: 'ex38', name: 'Leg Extension', target_sets: 2, target_reps: '12-15' },
      { id: 'ex39', name: 'Romanian Deadlift (barbell)', target_sets: 3, target_reps: '8-12' },
      { id: 'ex40', name: 'Lying Leg Curl', target_sets: 3, target_reps: '10-12' },
      { id: 'ex41', name: 'Hip Thrust', target_sets: 3, target_reps: '10-12' },
      { id: 'ex42', name: 'Standing Calf Raise', target_sets: 3, target_reps: '12-15' },
      { id: 'ex43', name: 'Seated Calf Raise', target_sets: 3, target_reps: '12-15' },
      { id: 'ex44', name: 'Cable Crunch', target_sets: 3, target_reps: '12-15' },
      { id: 'ex45', name: 'Plank', target_sets: 3, target_reps: '1 Min' },
    ] 
  },
  { 
    id: 'rest_7', 
    name: 'Day 7: Rest', 
    split_day: 'Day 7', 
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300&h=200',
    exercises: [] 
  }
];

export default function Programs() {
  const navigate = useNavigate();
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDbTemplates = async () => {
      if (!supabase) return;
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data: templates } = await supabase
          .from('workout_templates')
          .select(`
            id,
            name,
            split_day,
            template_exercises (
              id,
              target_sets,
              target_reps,
              exercises ( id, name, youtube_url, image_urls )
            )
          `)
          .eq('user_id', user.id);

        if (templates) {
          const formatted = templates.map(t => ({
            id: t.id,
            name: t.name,
            split_day: t.split_day || 'Custom Program',
            image: (t.template_exercises?.[0]?.exercises as any)?.image_urls?.[0] || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300&h=200',
            exercises: (t.template_exercises || []).map((te: any) => ({
              id: te.exercises?.id,
              name: te.exercises?.name || 'Exercise',
              target_sets: te.target_sets,
              target_reps: te.target_reps
            }))
          }));
          setDbTemplates(formatted);
        }
      } catch (err) {
        console.error('Error fetching custom programs:', err);
      }
    };

    fetchDbTemplates();
  }, []);

  // Standard split templates (e.g. "Day 1: PUSH...") are already shown via MOCK_PROGRAMS below;
  // exclude DB templates that match that naming pattern so they don't show up twice.
  const STANDARD_SPLIT_NAME = /^day\s*\d+\s*:/i;
  const dedupedDbTemplates = dbTemplates.filter(t => !STANDARD_SPLIT_NAME.test(t.name));

  // Rest days have no exercises to log, so they don't belong in an explore/browse list.
  const REST_DAY_IDS = new Set(['rest_4', 'rest_7']);
  const visibleMockPrograms = MOCK_PROGRAMS.filter(p => !REST_DAY_IDS.has(p.id));

  const allPrograms = [...dedupedDbTemplates, ...visibleMockPrograms];

  const filteredPrograms = allPrograms.filter(p =>
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

      {/* Generate Workout Callout Card */}
      <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-2xl mb-8 max-w-md mx-auto">
        <div 
          onClick={() => navigate('/generate-workout')}
          className="bg-indigo-500 rounded-[calc(2.2rem-0.5rem)] p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] hover:scale-[1.01] transition-all duration-300 shadow-xl group border border-indigo-400/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
          <div className="relative z-10 text-left">
            <span className="text-[10px] font-extrabold text-indigo-100 uppercase tracking-wider block mb-1">AI Generator</span>
            <h2 className="text-lg font-extrabold text-white tracking-tight mb-1">Generate Workout</h2>
            <p className="text-indigo-100 text-xs opacity-80 font-medium">Create split-based routines customized to your goal</p>
          </div>
          <div className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
            <Star size={16} className="fill-black text-black animate-pulse" />
          </div>
        </div>
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


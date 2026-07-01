import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays, isSameDay } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Apple, Calendar, MoreHorizontal, Flame, X, Camera } from 'lucide-react';
import MealLoggerModal from '../components/nutrition/MealLoggerModal';

function ShallowArc({ value, max }: { value: number; max: number }) {
  const percent = Math.min(value / max, 1) || 0;
  
  return (
    <div className="relative w-full h-16 flex flex-col items-center justify-end mt-4">
      <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 300 60" preserveAspectRatio="none">
        {/* Background track */}
        <path d="M 10 50 Q 150 -10 290 50" fill="transparent" stroke="#262626" strokeWidth="4" strokeLinecap="round" />
        {/* Middle tick */}
        <line x1="150" y1="20" x2="150" y2="28" stroke="#555" strokeWidth="2" strokeLinecap="round" />
        {/* Foreground track */}
        <path 
          d="M 10 50 Q 150 -10 290 50" 
          fill="transparent" 
          stroke="#6366f1" 
          strokeWidth="4" 
          strokeLinecap="round" 
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - (percent * 100)}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="flex justify-between w-full px-[20%] text-[10px] text-neutral-500 font-medium pb-1">
        <span>{Math.round(max * 0.9)}</span>
        <span>{Math.round(max * 1.1)}</span>
      </div>
    </div>
  );
}

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Targets (would typically come from profile)
  const targets = {
    calories: 2042,
    protein: 149,
    carbs: 182,
    fats: 79
  };

  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

  const fetchMeals = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('meals')
        .select(`
          id, meal_type, logged_at, photo_url,
          meal_items ( name, calories, protein_g, carbs_g, fats_g )
        `)
        .eq('user_id', user?.id)
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;
      
      setMeals(data || []);
      
      let cal = 0, pro = 0, car = 0, fat = 0;
      data?.forEach(meal => {
        meal.meal_items.forEach((item: any) => {
          cal += item.calories || 0;
          pro += item.protein_g || 0;
          car += item.carbs_g || 0;
          fat += item.fats_g || 0;
        });
      });
      setTotals({ calories: Math.round(cal), protein: Math.round(pro), carbs: Math.round(car), fats: Math.round(fat) });
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => subDays(today, 3 - i));

  return (
    <div className="flex flex-col min-h-screen bg-[#0F1015] font-sans text-white">
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">U</div>
          <div className="flex items-center gap-1 text-neutral-300 font-medium text-sm">
            <Flame className="text-neutral-500 fill-neutral-500" size={16} /> 0
          </div>
        </div>
        <div className="flex items-center gap-2 font-bold text-lg">
          <Calendar size={18} className="text-white" /> Today
        </div>
        <button className="text-white">
          <MoreHorizontal size={24} />
        </button>
      </div>
      
      {/* Week Strip */}
      <div className="flex justify-between px-4 pb-4 overflow-x-auto hide-scrollbar">
        {weekDays.map((date, i) => (
          <button
            key={i}
            onClick={() => setSelectedDate(date)}
            className="flex flex-col items-center gap-2 px-2"
          >
            <span className={`text-xs font-medium ${isSameDay(date, selectedDate) ? 'text-white' : 'text-neutral-500'}`}>
              {format(date, 'EE').charAt(0)}
            </span>
            <span className={`text-lg font-bold ${isSameDay(date, selectedDate) ? 'text-indigo-400' : 'text-neutral-300'}`}>
              {format(date, 'd')}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${isSameDay(date, selectedDate) ? 'bg-indigo-500' : 'bg-transparent'}`} />
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-32">
        {/* Scan Banner */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/30 border border-indigo-500/20 rounded-3xl p-5 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10 w-2/3 space-y-3">
            <h3 className="text-white font-bold text-base leading-tight">Get calories and macros from a photo</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded-full font-bold text-sm inline-block shadow-[0_4px_14px_rgba(99,102,241,0.4)]"
            >
              Scan your meal
            </button>
          </div>
          {/* Mock Illustration */}
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-28 h-28 bg-indigo-500/10 rounded-full flex items-center justify-center opacity-80 border border-indigo-500/20">
             <span className="text-4xl">🥗</span>
          </div>
          <button className="absolute top-3 right-3 text-indigo-300 hover:text-indigo-100 bg-black/20 rounded-full p-1 z-20">
            <X size={14} />
          </button>
        </div>

        {/* Main Dashboard Card */}
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex-1 text-center pl-8">
               <div className="text-3xl font-bold tracking-tight text-white">{totals.calories.toLocaleString()} <span className="text-neutral-500 text-lg">/ {targets.calories.toLocaleString()}</span></div>
               <div className="text-indigo-400 text-sm font-bold mt-1">kcal</div>
            </div>
          </div>

          <ShallowArc value={totals.calories} max={targets.calories} />

          <div className="flex justify-between mt-6 px-1">
            <div className="text-center flex-1">
              <div className="text-white font-medium text-[15px]">Protein</div>
              <div className="text-neutral-300 font-medium text-sm mt-1">{totals.protein} / {targets.protein} g</div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full mt-3 overflow-hidden mx-auto max-w-[85%]">
                <div className="h-full bg-indigo-400 transition-all" style={{ width: `${Math.min(totals.protein/targets.protein*100, 100)}%` }} />
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="text-white font-medium text-[15px]">Carbs</div>
              <div className="text-neutral-300 font-medium text-sm mt-1">{totals.carbs} / {targets.carbs} g</div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full mt-3 overflow-hidden mx-auto max-w-[85%]">
                <div className="h-full bg-purple-400 transition-all" style={{ width: `${Math.min(totals.carbs/targets.carbs*100, 100)}%` }} />
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="text-white font-medium text-[15px]">Fats</div>
              <div className="text-neutral-300 font-medium text-sm mt-1">{totals.fats} / {targets.fats} g</div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full mt-3 overflow-hidden mx-auto max-w-[85%]">
                <div className="h-full bg-pink-400 transition-all" style={{ width: `${Math.min(totals.fats/targets.fats*100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition FAB */}
        <div className="fixed bottom-24 right-6 z-50">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-14 h-14 bg-indigo-500 text-white rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.4)] active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Recent Meals Section */}
        {meals.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4 px-2">Recent Meals</h2>
            <div className="space-y-3">
              {meals.map(meal => {
                const mealCals = meal.meal_items.reduce((acc: number, item: any) => acc + item.calories, 0);
                return (
                  <div key={meal.id} className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-3 pr-4 flex gap-4 items-center">
                    {meal.photo_url ? (
                      <div className="w-16 h-16 rounded-[20px] bg-neutral-800 flex-shrink-0 overflow-hidden border border-neutral-800">
                        <img src={meal.photo_url} alt="Meal" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-[20px] bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                        <Camera size={24} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="font-bold text-white text-[15px] capitalize">{meal.meal_type || 'Snack'}</h3>
                        <span className="font-bold text-indigo-400 text-sm">{Math.round(mealCals)} kcal</span>
                      </div>
                      <p className="text-sm text-neutral-400 line-clamp-1">
                        {meal.meal_items.map((i: any) => i.name).join(', ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {isModalOpen && (
        <MealLoggerModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            setIsModalOpen(false);
            fetchMeals();
          }} 
        />
      )}
    </div>
  );
}

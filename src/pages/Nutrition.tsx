import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { 
  Plus, ChevronLeft, Calendar, Flame, X, Camera, 
  Check, Star, Trash2, Edit2, ChevronRight, Apple 
} from 'lucide-react';
import MealLoggerModal from '../components/nutrition/MealLoggerModal';

function ShallowArc({ value, max }: { value: number; max: number }) {
  const percent = Math.min(value / max, 1) || 0;
  
  return (
    <div className="relative w-full h-24 flex flex-col items-center justify-end mt-2">
      <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 300 80" preserveAspectRatio="none">
        {/* Background track */}
        <path d="M 15 70 Q 150 -10 285 70" fill="transparent" stroke="#262626" strokeWidth="5" strokeLinecap="round" />
        {/* Foreground track */}
        <path 
          d="M 15 70 Q 150 -10 285 70" 
          fill="transparent" 
          stroke="#6366f1" 
          strokeWidth="5" 
          strokeLinecap="round" 
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - (percent * 100)}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Target Marker */}
      <div className="absolute top-[35%] text-center">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value.toLocaleString()}</span>
        <span className="text-neutral-500 text-xs font-bold block mt-0.5">/ {max.toLocaleString()} kcal</span>
      </div>
      <div className="flex justify-between w-full px-[15%] text-[9px] text-neutral-500 font-bold pb-2">
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
  const [loggedDays, setLoggedDays] = useState<Record<string, boolean>>({});

  // Targets state loaded from Profiles
  const [targets, setTargets] = useState({
    calories: 2200,
    protein: 160,
    carbs: 300,
    fats: 60
  });

  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

  // Favorites & Recent Meals
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('favorite_meals');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentMeals, setRecentMeals] = useState<any[]>([]);

  // Manual Food Entry Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPortion, setManualPortion] = useState('1 serving');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFats, setManualFats] = useState('');
  const [manualMealType, setManualMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  // Meal Detail Modal State
  const [activeMealDetail, setActiveMealDetail] = useState<any | null>(null);

  // Targets loader
  const fetchTargets = async () => {
    if (!supabase) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_calorie_target, protein_target_g, carbs_target_g, fats_target_g')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setTargets({
          calories: data.daily_calorie_target || 2200,
          protein: data.protein_target_g || 160,
          carbs: data.carbs_target_g || 300,
          fats: data.fats_target_g || 60
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7-Day Indicators
  const fetchWeekLogs = async () => {
    if (!supabase) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const startOfWeek = subDays(new Date(), 6);
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('meals')
        .select('logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', startOfWeek.toISOString());

      if (data) {
        const logMap: Record<string, boolean> = {};
        data.forEach(meal => {
          const dateStr = format(new Date(meal.logged_at), 'yyyy-MM-dd');
          logMap[dateStr] = true;
        });
        setLoggedDays(logMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recent meals
  const fetchRecentMeals = async () => {
    if (!supabase) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('meals')
        .select(`
          id, meal_type, logged_at, photo_url,
          meal_items ( name, calories, protein_g, carbs_g, fats_g, portion )
        `)
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentMeals(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeals = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      const { data, error } = await supabase
        .from('meals')
        .select(`
          id, meal_type, logged_at, photo_url,
          meal_items ( id, name, portion, calories, protein_g, carbs_g, fats_g )
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
    fetchTargets();
    fetchWeekLogs();
    fetchRecentMeals();
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  // Re-log shortcut
  const reLogMeal = async (meal: any) => {
    if (!supabase) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data: newMeal, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          meal_type: meal.meal_type || 'snack',
          logged_at: selectedDate.toISOString(),
          photo_url: meal.photo_url
        })
        .select()
        .single();

      if (mealError) throw mealError;

      const itemsToInsert = meal.meal_items.map((item: any) => ({
        meal_id: newMeal.id,
        name: item.name,
        portion: item.portion || '1 serving',
        calories: item.calories || 0,
        protein_g: item.protein_g || 0,
        carbs_g: item.carbs_g || 0,
        fats_g: item.fats_g || 0
      }));

      const { error: itemsError } = await supabase
        .from('meal_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      fetchMeals();
      fetchWeekLogs();
      fetchRecentMeals();
    } catch (err) {
      console.error(err);
    }
  };

  // Star Toggle
  const toggleFavorite = (meal: any) => {
    let newFavs = [...favorites];
    const isFav = favorites.some(f => f.id === meal.id);
    if (isFav) {
      newFavs = newFavs.filter(f => f.id !== meal.id);
    } else {
      newFavs.push({
        id: meal.id,
        meal_type: meal.meal_type,
        photo_url: meal.photo_url,
        meal_items: meal.meal_items
      });
    }
    setFavorites(newFavs);
    localStorage.setItem('favorite_meals', JSON.stringify(newFavs));
  };

  // In-place edits & Deletions
  const handleUpdateMealItem = async (itemId: string, field: string, value: any) => {
    if (!supabase) return;
    try {
      const updatedItems = activeMealDetail.meal_items.map((i: any) => 
        i.id === itemId ? { ...i, [field]: value } : i
      );
      
      setActiveMealDetail({
        ...activeMealDetail,
        meal_items: updatedItems
      });

      const { error } = await supabase
        .from('meal_items')
        .update({ [field]: value })
        .eq('id', itemId);

      if (error) throw error;
      fetchMeals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMealItem = async (itemId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('meal_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      const remainingItems = activeMealDetail.meal_items.filter((i: any) => i.id !== itemId);
      
      if (remainingItems.length === 0) {
        await supabase.from('meals').delete().eq('id', activeMealDetail.id);
        setActiveMealDetail(null);
      } else {
        setActiveMealDetail({
          ...activeMealDetail,
          meal_items: remainingItems
        });
      }
      
      fetchMeals();
      fetchWeekLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
      setActiveMealDetail(null);
      fetchMeals();
      fetchWeekLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          meal_type: manualMealType,
          logged_at: selectedDate.toISOString()
        })
        .select()
        .single();

      if (mealError) throw mealError;

      const { error: itemError } = await supabase
        .from('meal_items')
        .insert({
          meal_id: mealData.id,
          name: manualName,
          portion: manualPortion,
          calories: Number(manualCalories) || 0,
          protein_g: Number(manualProtein) || 0,
          carbs_g: Number(manualCarbs) || 0,
          fats_g: Number(manualFats) || 0
        });

      if (itemError) throw itemError;

      setManualName('');
      setManualPortion('1 serving');
      setManualCalories('');
      setManualProtein('');
      setManualCarbs('');
      setManualFats('');
      setShowManualForm(false);
      
      fetchMeals();
      fetchWeekLogs();
      fetchRecentMeals();
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

  // Categorize meals for list grouping
  const mealGroups = {
    breakfast: meals.filter(m => m.meal_type === 'breakfast'),
    lunch: meals.filter(m => m.meal_type === 'lunch'),
    dinner: meals.filter(m => m.meal_type === 'dinner'),
    snack: meals.filter(m => m.meal_type === 'snack' || !m.meal_type)
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0C0D12] font-sans text-white pb-32">
      {/* Header Info */}
      <div className="flex justify-between items-center px-6 pt-10 pb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
          <Flame size={12} className="text-indigo-400" /> Track Diary
        </div>
        <div className="flex items-center gap-2 font-extrabold text-lg text-white">
          <Calendar size={18} className="text-indigo-400" /> {isSameDay(selectedDate, today) ? 'Today' : format(selectedDate, 'MMM d')}
        </div>
        <div className="w-10"></div>
      </div>
      
      {/* Fitia-Style 7-Day Horizontal strip */}
      <div className="flex justify-between px-6 pb-6 overflow-x-auto hide-scrollbar scroll-smooth">
        {weekDays.map((date, i) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const hasLogged = loggedDays[dateStr];
          const isSelected = isSameDay(date, selectedDate);
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className="flex flex-col items-center gap-2 px-1 relative focus:outline-none min-w-[42px]"
            >
              <span className={`text-[10px] uppercase font-extrabold tracking-wider ${isSelected ? 'text-indigo-400' : 'text-neutral-500'}`}>
                {format(date, 'EE').charAt(0)}
              </span>
              
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-neutral-400 hover:text-white'}`}>
                {format(date, 'd')}
              </div>
              
              {/* Log indicator dot */}
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${hasLogged ? 'bg-indigo-500' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-6 space-y-6">
        
        {/* Fitia Calories & Macros Arc dashboard */}
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2.2rem] shadow-2xl">
          <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2.2rem-0.5rem)] p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
            
            <ShallowArc value={totals.calories} max={targets.calories} />

            {/* Protein, Carbs, Fats Macro Horizontal fill bars */}
            <div className="grid grid-cols-3 gap-4 mt-6 border-t border-neutral-800/60 pt-5">
              <div className="text-center">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Protein</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{totals.protein} / {targets.protein} g</span>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min((totals.protein / targets.protein) * 105, 100)}%` }} />
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Carbs</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{totals.carbs} / {targets.carbs} g</span>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min((totals.carbs / targets.carbs) * 105, 100)}%` }} />
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Fats</span>
                <span className="text-xs font-extrabold text-white mt-1 block">{totals.fats} / {targets.fats} g</span>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${Math.min((totals.fats / targets.fats) * 105, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scan & Manual Quick Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <Camera size={16} /> Scan Meal
          </button>
          
          <button 
            onClick={() => setShowManualForm(true)}
            className="bg-neutral-900 hover:bg-neutral-855 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] text-xs uppercase tracking-wider border border-neutral-850 flex items-center justify-center gap-2"
          >
            <Plus size={16} className="text-indigo-400" /> Log Manually
          </button>
        </div>

        {/* Manual Log Drawer Overlay Form */}
        {showManualForm && (
          <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2.2rem] shadow-2xl relative animate-in slide-in-from-bottom-5 duration-300">
            <button 
              onClick={() => setShowManualForm(false)} 
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white z-20"
              type="button"
            >
              <X size={14} />
            </button>

            <form onSubmit={handleManualSave} className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2.2rem-0.5rem)] p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-neutral-400 uppercase tracking-wider mb-2">Log Food Item</h3>
              
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="E.g., Greek Yogurt"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Portion</label>
                  <input
                    type="text"
                    required
                    value={manualPortion}
                    onChange={(e) => setManualPortion(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Prot (g)</label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Carb (g)</label>
                  <input
                    type="number"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Fat (g)</label>
                  <input
                    type="number"
                    value={manualFats}
                    onChange={(e) => setManualFats(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Meal category</label>
                <div className="flex gap-1.5">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setManualMealType(type)}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg capitalize border transition-all ${manualMealType === type ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs mt-2"
              >
                Log to Diary
              </button>
            </form>
          </div>
        )}

        {/* Grouped Meals List */}
        <div className="space-y-5">
          <h2 className="text-base font-extrabold uppercase tracking-widest text-neutral-500 px-1">Today's Meals</h2>
          
          {loading ? (
            <p className="text-center py-6 text-sm text-neutral-500 animate-pulse font-medium">Fetching logged meals...</p>
          ) : meals.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-neutral-800 rounded-3xl text-neutral-500 font-bold text-sm">
              No meals logged for this date.
            </div>
          ) : (
            (['breakfast', 'lunch', 'dinner', 'snack'] as const).map((groupKey) => {
              const groupMeals = mealGroups[groupKey];
              if (groupMeals.length === 0) return null;
              
              return (
                <div key={groupKey} className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 pl-1 capitalize">{groupKey}</h3>
                  {groupMeals.map((meal) => {
                    const mealCals = meal.meal_items.reduce((acc: number, item: any) => acc + (item.calories || 0), 0);
                    const isStarred = favorites.some(f => f.id === meal.id);
                    
                    return (
                      <div key={meal.id} className="bg-white/5 border border-white/10 p-1.5 rounded-[1.8rem] shadow-xl group/card">
                        <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(1.8rem-0.375rem)] p-4 flex gap-4 items-center">
                          {meal.photo_url ? (
                            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-neutral-800/60">
                              <img src={meal.photo_url} alt="Meal" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 flex items-center justify-center shrink-0">
                              <Apple size={20} />
                            </div>
                          )}

                          <div 
                            onClick={() => setActiveMealDetail(meal)}
                            className="flex-1 cursor-pointer"
                          >
                            <h4 className="font-extrabold text-sm text-white capitalize leading-tight mb-1 group-hover/card:text-indigo-400 transition-colors">
                              {meal.meal_items.map((i: any) => i.name).join(', ')}
                            </h4>
                            <span className="font-bold text-neutral-500 text-xs">{Math.round(mealCals)} kcal</span>
                          </div>

                          {/* Action stars / chevron */}
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => toggleFavorite(meal)}
                              className={`p-2 rounded-full hover:bg-neutral-800 transition-colors ${isStarred ? 'text-amber-500' : 'text-neutral-500 hover:text-neutral-400'}`}
                            >
                              <Star size={16} className={isStarred ? 'fill-amber-500' : ''} />
                            </button>
                            
                            <button 
                              onClick={() => setActiveMealDetail(meal)}
                              className="p-2 rounded-full text-neutral-500 hover:text-white"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Favorites and Recent Meals Tabs */}
        <div className="space-y-4">
          <div className="flex bg-neutral-900 border border-neutral-850 p-1 rounded-full max-w-[280px] mx-auto w-full">
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-extrabold rounded-full transition-all ${activeTab === 'recent' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-extrabold rounded-full transition-all ${activeTab === 'favorites' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Favorites
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === 'recent' ? (
              recentMeals.length === 0 ? (
                <p className="text-center py-6 text-xs text-neutral-500 font-bold">No recent meals logged yet.</p>
              ) : (
                recentMeals.map((meal) => {
                  const mealCals = meal.meal_items.reduce((acc: number, item: any) => acc + (item.calories || 0), 0);
                  return (
                    <div key={meal.id} className="bg-neutral-900/60 border border-neutral-850 rounded-2xl p-3 px-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xs text-white capitalize leading-tight mb-1">
                          {meal.meal_items.map((i: any) => i.name).join(', ')}
                        </h4>
                        <span className="text-[10px] text-indigo-400 font-extrabold tracking-wider capitalize">{meal.meal_type || 'snack'} • {Math.round(mealCals)} kcal</span>
                      </div>
                      <button 
                        onClick={() => reLogMeal(meal)}
                        className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
                      >
                        Re-log
                      </button>
                    </div>
                  );
                })
              )
            ) : (
              favorites.length === 0 ? (
                <p className="text-center py-6 text-xs text-neutral-500 font-bold">Star meals to add them to your favorites.</p>
              ) : (
                favorites.map((meal) => {
                  const mealCals = meal.meal_items.reduce((acc: number, item: any) => acc + (item.calories || 0), 0);
                  return (
                    <div key={meal.id} className="bg-neutral-900/60 border border-neutral-850 rounded-2xl p-3 px-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xs text-white capitalize leading-tight mb-1">
                          {meal.meal_items.map((i: any) => i.name).join(', ')}
                        </h4>
                        <span className="text-[10px] text-indigo-400 font-extrabold tracking-wider capitalize">{meal.meal_type || 'snack'} • {Math.round(mealCals)} kcal</span>
                      </div>
                      <button 
                        onClick={() => reLogMeal(meal)}
                        className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
                      >
                        Re-log
                      </button>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

      </div>

      {/* Detail breakdown & Inline Edit Modal Overlay */}
      {activeMealDetail && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 font-sans">
          <div className="bg-[#13141C] border border-neutral-800/80 rounded-[2.2rem] w-full max-w-sm max-h-[85vh] overflow-y-auto p-6 relative">
            <button 
              onClick={() => setActiveMealDetail(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
              type="button"
            >
              <X size={16} />
            </button>

            <h3 className="font-extrabold text-lg text-white mb-6 pr-6 capitalize flex items-center gap-2">
              <Apple size={18} className="text-indigo-400" /> Detail breakdown
            </h3>

            <div className="space-y-4 mb-6">
              {activeMealDetail.meal_items.map((item: any) => (
                <div key={item.id} className="bg-black/30 border border-neutral-800/50 rounded-2xl p-4 space-y-3 relative group">
                  <button 
                    onClick={() => handleDeleteMealItem(item.id)}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 p-1.5 transition-colors"
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="space-y-1 pr-6">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Food Item</label>
                    <input 
                      value={item.name}
                      onChange={(e) => handleUpdateMealItem(item.id, 'name', e.target.value)}
                      className="w-full bg-transparent text-sm font-extrabold text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#13141C] rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                       <span className="text-[9px] text-neutral-500 uppercase block font-bold">Portion</span>
                       <input 
                         value={item.portion}
                         onChange={(e) => handleUpdateMealItem(item.id, 'portion', e.target.value)}
                         className="w-full bg-transparent text-xs text-white focus:outline-none"
                       />
                    </div>
                    <div className="bg-[#13141C] rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                       <span className="text-[9px] text-neutral-500 uppercase block font-bold">Calories</span>
                       <input 
                         type="number"
                         value={item.calories || 0}
                         onChange={(e) => handleUpdateMealItem(item.id, 'calories', Number(e.target.value))}
                         className="w-full bg-transparent text-xs text-white focus:outline-none"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#13141C] rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                       <span className="text-[9px] text-neutral-500 uppercase block font-bold">Prot (g)</span>
                       <input 
                         type="number"
                         value={item.protein_g || 0}
                         onChange={(e) => handleUpdateMealItem(item.id, 'protein_g', Number(e.target.value))}
                         className="w-full bg-transparent text-xs text-white focus:outline-none"
                       />
                    </div>
                    <div className="bg-[#13141C] rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                       <span className="text-[9px] text-neutral-500 uppercase block font-bold">Carb (g)</span>
                       <input 
                         type="number"
                         value={item.carbs_g || 0}
                         onChange={(e) => handleUpdateMealItem(item.id, 'carbs_g', Number(e.target.value))}
                         className="w-full bg-transparent text-xs text-white focus:outline-none"
                       />
                    </div>
                    <div className="bg-[#13141C] rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                       <span className="text-[9px] text-neutral-500 uppercase block font-bold">Fat (g)</span>
                       <input 
                         type="number"
                         value={item.fats_g || 0}
                         onChange={(e) => handleUpdateMealItem(item.id, 'fats_g', Number(e.target.value))}
                         className="w-full bg-transparent text-xs text-white focus:outline-none"
                       />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleDeleteMeal(activeMealDetail.id)}
                className="flex-1 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5"
                type="button"
              >
                <Trash2 size={14} /> Delete Meal
              </button>
              <button 
                onClick={() => setActiveMealDetail(null)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl text-center"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <MealLoggerModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            setIsModalOpen(false);
            fetchMeals();
            fetchWeekLogs();
            fetchRecentMeals();
          }} 
        />
      )}
    </div>
  );
}

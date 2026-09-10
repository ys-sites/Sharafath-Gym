import { useState, useEffect, FormEvent } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Droplet, 
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Apple
} from 'lucide-react';
import { 
  getGymStore, 
  saveNutritionEntry, 
  ManualNutritionEntry 
} from '../lib/manualStorage';
import { NUTRITION_BLUEPRINT } from '../data/blueprintData';

export default function NutritionLogPage() {
  const [store, setStore] = useState(getGymStore());
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [calories, setCalories] = useState<number>(2200);
  const [proteinG, setProteinG] = useState<number>(170);
  const [fatG, setFatG] = useState<number>(60);
  const [carbsG, setCarbsG] = useState<number>(245);
  const [waterLiters, setWaterLiters] = useState<number>(3.5);
  const [halalCompliant, setHalalCompliant] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => setStore(getGymStore());
    window.addEventListener('sharafath-gym-data-updated', handleUpdate);
    return () => window.removeEventListener('sharafath-gym-data-updated', handleUpdate);
  }, []);

  const targets = NUTRITION_BLUEPRINT.dailyTargets;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    saveNutritionEntry({
      date,
      calories,
      proteinG,
      fatG,
      carbsG,
      waterLiters,
      halalCompliant,
      notes: notes.trim() || undefined
    });
    setShowForm(false);
    setNotes('');
  };

  const latestLog = store.nutrition.length > 0 ? store.nutrition[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Nutrition Blueprint
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Coach Mousa 2,200 kcal Protocol
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Daily Macro & Nutrition Log
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Halal food choices, lower-oxalate selection, and exact macro calibration: 
              2,200 kcal (170g Protein • 60g Fat • 245g Carbs).
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-[0.98] transition-all self-start md:self-auto"
          >
            <Plus size={16} />
            <span>Log Daily Macros</span>
          </button>
        </div>
      </div>

      {/* Target Macro Calibration Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Calories</span>
          <p className="text-2xl font-bold font-mono text-amber-300">{targets.energyKcal} kcal</p>
          <span className="text-xs text-zinc-400 font-mono">Deficit: ~300 kcal below maint</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Protein</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">{targets.proteinG} g</p>
          <span className="text-xs text-zinc-400 font-mono">~2.1 g/kg lean mass</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Fats</span>
          <p className="text-2xl font-bold font-mono text-cyan-400">{targets.fatG} g</p>
          <span className="text-xs text-zinc-400 font-mono">Olive oil, eggs, dairy</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Carbs</span>
          <p className="text-2xl font-bold font-mono text-rose-400">{targets.carbG} g</p>
          <span className="text-xs text-zinc-400 font-mono">Training fuel & recovery</span>
        </div>
      </div>

      {/* Quick Swap & Replacement Reference */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase font-mono">
              Foods To Leave Out & Healthy Swaps (Low-Oxalate)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {NUTRITION_BLUEPRINT.foodsToReplace.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
              <div className="text-rose-400 font-mono font-medium">
                ✕ Leave out: <span className="text-zinc-300 font-normal">{item.leaveOut}</span>
              </div>
              <div className="text-emerald-400 font-mono font-medium">
                ✓ Use instead: <span className="text-zinc-200 font-semibold">{item.useInstead}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Log Daily Macro Intake</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Total Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={e => setCalories(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-amber-300 font-bold border border-zinc-800 rounded-xl px-3 py-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={proteinG}
                    onChange={e => setProteinG(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-emerald-400 font-mono font-bold border border-zinc-800 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={fatG}
                    onChange={e => setFatG(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-cyan-400 font-mono font-bold border border-zinc-800 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbsG}
                    onChange={e => setCarbsG(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-rose-400 font-mono font-bold border border-zinc-800 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Water Intake (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterLiters}
                    onChange={e => setWaterLiters(Number(e.target.value))}
                    className="w-full bg-zinc-950 text-xs text-white font-mono border border-zinc-800 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={halalCompliant}
                      onChange={e => setHalalCompliant(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700"
                    />
                    <span>100% Halal Certified</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Meal Notes / Foods Eaten</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken breast with jasmine rice, Greek yogurt snack"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 text-xs text-white border border-zinc-800 rounded-xl px-3 py-2 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:brightness-110"
                >
                  Save Daily Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical Nutrition Table */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Macro Logging History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Calories</th>
                <th className="py-2.5 px-3">Protein</th>
                <th className="py-2.5 px-3">Fat</th>
                <th className="py-2.5 px-3">Carbs</th>
                <th className="py-2.5 px-3">Water</th>
                <th className="py-2.5 px-3">Halal</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {store.nutrition.map(item => (
                <tr key={item.id} className="hover:bg-zinc-900/40">
                  <td className="py-3 px-3 font-mono font-medium text-zinc-200">{item.date}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-300">{item.calories} kcal</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">{item.proteinG}g</td>
                  <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">{item.fatG}g</td>
                  <td className="py-3 px-3 font-mono text-rose-400 font-semibold">{item.carbsG}g</td>
                  <td className="py-3 px-3 font-mono text-zinc-300">{item.waterLiters}L</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Halal ✓
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

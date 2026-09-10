import { 
  UtensilsCrossed, 
  Sparkles, 
  Flame, 
  Droplet, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { GYM_DATA } from '../data/gymHistoryData';
import { NUTRITION_BLUEPRINT } from '../data/blueprintData';

export default function NutritionLogPage() {
  const targets = NUTRITION_BLUEPRINT.dailyTargets;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="double-bezel-outer p-1.5 sm:p-2 rounded-[2rem] transition-all">
        <div className="double-bezel-inner p-6 sm:p-8 rounded-[calc(2rem-0.5rem)] relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-amber-500/[0.04] blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  Nutrition Blueprint
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Coach Mousa 2,200 kcal Protocol
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Daily Macro & Nutrition Status
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-light">
                Halal food choices, lower-oxalate selection, and exact macro calibration: 
                2,200 kcal (170g Protein • 60g Fat • 245g Carbs).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-right self-start md:self-auto backdrop-blur-sm">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Daily Target</span>
              <span className="text-amber-300 font-bold font-mono text-sm">2,200 kcal / 170g P</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Macro Calibration Grid (Double-Bezel) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Target Calories', val: `${targets.energyKcal} kcal`, sub: 'Deficit: ~300 kcal below maint', color: 'text-amber-300' },
          { label: 'Target Protein', val: `${targets.proteinG} g`, sub: '~2.1 g/kg lean mass', color: 'text-emerald-400' },
          { label: 'Target Fats', val: `${targets.fatG} g`, sub: 'Olive oil, eggs, dairy', color: 'text-cyan-400' },
          { label: 'Target Carbs', val: `${targets.carbG} g`, sub: 'Training fuel & recovery', color: 'text-rose-400' },
        ].map((macro, idx) => (
          <div key={idx} className="double-bezel-outer p-1 rounded-2xl">
            <div className="double-bezel-inner p-5 rounded-[calc(1rem-2px)] space-y-1.5 h-full flex flex-col justify-between">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{macro.label}</span>
              <p className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${macro.color}`}>{macro.val}</p>
              <span className="text-xs text-zinc-400 font-mono">{macro.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Swap & Replacement Reference */}
      <div className="double-bezel-outer p-1.5 rounded-[2rem]">
        <div className="double-bezel-inner p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Foods To Leave Out & Healthy Swaps (Low-Oxalate)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {NUTRITION_BLUEPRINT.foodsToReplace.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs space-y-1.5 backdrop-blur-sm">
                <div className="text-rose-400 font-mono font-medium flex items-center gap-1.5">
                  <span className="text-rose-500 font-bold">✕ Leave out:</span>
                  <span className="text-zinc-300 font-normal font-sans">{item.leaveOut}</span>
                </div>
                <div className="text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓ Use instead:</span>
                  <span className="text-zinc-200 font-medium font-sans">{item.useInstead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Nutrition Table */}
      <div className="double-bezel-outer p-1.5 rounded-[1.75rem]">
        <div className="double-bezel-inner p-6 sm:p-8 rounded-[calc(1.75rem-0.375rem)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold font-serif text-white">Macro Logging History</h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">{GYM_DATA.nutrition.length} Days Recorded</span>
          </div>
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
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {GYM_DATA.nutrition.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-zinc-200">{item.date}</td>
                    <td className="py-3 px-3 font-bold text-amber-300">{item.calories} kcal</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{item.proteinG}g</td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold">{item.fatG}g</td>
                    <td className="py-3 px-3 text-rose-400 font-semibold">{item.carbsG}g</td>
                    <td className="py-3 px-3 text-zinc-300">{item.waterLiters}L</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Halal ✓
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 max-w-xs truncate font-sans">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

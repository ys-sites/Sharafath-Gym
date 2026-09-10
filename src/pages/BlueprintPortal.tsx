import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Dumbbell, 
  Utensils, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ChevronRight,
  Search,
  Layers,
  HeartPulse,
  Award
} from 'lucide-react';
import { 
  SHARAFATH_PROFILE, 
  PHASE_2_WORKOUTS, 
  MOUSSA_5DAY_BLUEPRINT, 
  NUTRITION_BLUEPRINT,
  MICRONUTRIENT_TABLE_1,
  MICRONUTRIENT_TABLE_2,
  MICRONUTRIENT_TABLE_3,
  MICRONUTRIENT_TABLE_4
} from '../data/blueprintData';

type TabSection = 'performance' | 'phase2' | '5day' | 'progression' | 'nutrition' | 'micronutrients';

export default function BlueprintPortal() {
  const [activeTab, setActiveTab] = useState<TabSection>('performance');
  const [selectedPhaseDay, setSelectedPhaseDay] = useState<number>(1);
  const [selected5DayId, setSelected5DayId] = useState<string>('moussa-01');
  const [selectedMicroTable, setSelectedMicroTable] = useState<number>(1);
  const [microSearch, setMicroSearch] = useState<string>('');
  const navigate = useNavigate();

  const currentPhaseDayWorkout = PHASE_2_WORKOUTS.find(w => w.dayNumber === selectedPhaseDay) || PHASE_2_WORKOUTS[0];
  const current5DayWorkout = MOUSSA_5DAY_BLUEPRINT.find(w => w.id === selected5DayId) || MOUSSA_5DAY_BLUEPRINT[0];

  const getActiveMicroTableData = () => {
    let data = MICRONUTRIENT_TABLE_1;
    if (selectedMicroTable === 2) data = MICRONUTRIENT_TABLE_2;
    if (selectedMicroTable === 3) data = MICRONUTRIENT_TABLE_3;
    if (selectedMicroTable === 4) data = MICRONUTRIENT_TABLE_4;

    if (!microSearch.trim()) return data;
    const q = microSearch.toLowerCase();
    return data.filter(item => 
      item.nutrient.toLowerCase().includes(q) ||
      item.primaryPurpose.toLowerCase().includes(q) ||
      item.bestFoodSources.toLowerCase().includes(q)
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Master Blueprint & Dossier
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Mousa Ghanem Coaching File
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Ascension Master Blueprint
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Complete, comprehensive reproduction of Sharafath’s 19-page Fitness & Performance plan. 
              Review program architecture, daily routines, progression models, nutrition protocols, and micronutrient guidelines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 max-w-xs shadow-inner">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-serif uppercase tracking-wider">
              <Award size={16} />
              <span>Certified Coaching</span>
            </div>
            <p className="text-xs text-zinc-300 font-medium">
              Made by {SHARAFATH_PROFILE.coach}
            </p>
            <p className="text-[11px] text-zinc-500">
              {SHARAFATH_PROFILE.motto}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/80 scrollbar-none">
        {[
          { id: 'performance', label: 'Performance File', icon: User },
          { id: 'phase2', label: 'Phase 2 (7-Day Cycle)', icon: Calendar },
          { id: '5day', label: '5-Day Hypertrophy Split', icon: Dumbbell },
          { id: 'progression', label: 'Progression Model', icon: Flame },
          { id: 'nutrition', label: 'Nutrition & Macros', icon: Utensils },
          { id: 'micronutrients', label: 'Micronutrient Blueprint', icon: HeartPulse },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabSection)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PERFORMANCE FILE */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Identity Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Client Name</span>
              <p className="text-lg font-bold text-white">{SHARAFATH_PROFILE.name}</p>
              <span className="text-xs text-zinc-400">Age: {SHARAFATH_PROFILE.age} • Exp: {SHARAFATH_PROFILE.experienceLevel}</span>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Height</span>
              <p className="text-lg font-bold text-white">{SHARAFATH_PROFILE.heightCm} cm</p>
              <span className="text-xs text-zinc-400">{SHARAFATH_PROFILE.heightFt}</span>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Starting Weight</span>
              <p className="text-lg font-bold text-amber-300">{SHARAFATH_PROFILE.startingWeightKg} kg</p>
              <span className="text-xs text-zinc-400">Approx. {SHARAFATH_PROFILE.startingWeightLbs} lb</span>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Goal</span>
              <p className="text-lg font-bold text-emerald-400">{SHARAFATH_PROFILE.goalWeightKg} kg</p>
              <span className="text-xs text-emerald-400/80 font-mono">-7.0 kg fat loss goal</span>
            </div>
          </div>

          {/* Goal & Focus Banner */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Primary Directive & Goal
              </h2>
            </div>
            <p className="text-base text-zinc-200 font-medium">
              "{SHARAFATH_PROFILE.primaryGoal}"
            </p>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 space-y-2">
              <p><strong className="text-amber-300">Food Strategy:</strong> Fat loss is the stated goal. Estimated maintenance is 2,500 kcal; target is 2,000–2,200 kcal. Build consistent intake first; do not automatically increase or cut calories because "under-eating" is listed.</p>
              <p><strong className="text-emerald-400">Success Milestone:</strong> Complete the agreed sessions, record your meals, and bring one question to your check-in.</p>
            </div>
          </div>

          {/* Three Starting Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
              Start With These Three Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SHARAFATH_PROFILE.threeActions.map(action => (
                <div key={action.step} className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-300 text-sm">
                    0{action.step}
                  </div>
                  <h4 className="text-sm font-bold text-white">{action.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{action.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Starting Situation & Coaching Focus Table */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Your Starting Situation Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-4">Area</th>
                    <th className="py-2.5 px-4">Current Picture</th>
                    <th className="py-2.5 px-4">Coaching Focus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {Object.entries(SHARAFATH_PROFILE.startingSituation).map(([areaKey, item]) => (
                    <tr key={areaKey} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300 capitalize">{areaKey}</td>
                      <td className="py-3 px-4 text-zinc-300">{item.current}</td>
                      <td className="py-3 px-4 text-zinc-200 font-medium">{item.coachingFocus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Execution Rules */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">How to Run Each Workout (Execution Rules)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHARAFATH_PROFILE.generalExecutionRules.map((rule, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    {rule.title}
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">{rule.rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: PHASE 2 (7-DAY CYCLE) */}
      {/* ========================================================================= */}
      {activeTab === 'phase2' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Day Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {PHASE_2_WORKOUTS.map(w => (
              <button
                key={w.dayNumber}
                onClick={() => setSelectedPhaseDay(w.dayNumber)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  selectedPhaseDay === w.dayNumber
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span className="text-[10px] font-mono text-zinc-400 block">Day {w.dayNumber}</span>
                <span className={`text-xs font-bold block truncate ${
                  selectedPhaseDay === w.dayNumber ? 'text-amber-300' : 'text-zinc-200'
                }`}>
                  {w.title.replace(`Day ${w.dayNumber} `, '')}
                </span>
              </button>
            ))}
          </div>

          {/* Routine Detail Box */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Phase 2 Cycle
                  </span>
                  <h2 className="text-xl font-bold text-white">
                    {currentPhaseDayWorkout.title}
                  </h2>
                </div>
                <p className="text-sm text-zinc-400 mt-1">
                  {currentPhaseDayWorkout.subtitle} • Target: {currentPhaseDayWorkout.focusMuscles}
                </p>
              </div>
            </div>

            {/* Warmup */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-3">
              <Flame size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white uppercase font-mono">Prescribed Warm-Up:</span>
                <p className="text-xs text-zinc-300 mt-0.5">{currentPhaseDayWorkout.warmup}</p>
              </div>
            </div>

            {/* Exercise Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-4">Exercise</th>
                    <th className="py-2.5 px-4">Sets × Reps</th>
                    <th className="py-2.5 px-4">Rest Period</th>
                    <th className="py-2.5 px-4">How to Perform & Execution Cues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {currentPhaseDayWorkout.exercises.map((ex, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4 font-semibold text-zinc-100">
                        <div className="flex items-center gap-2">
                          <span>{ex.name}</span>
                          {ex.isOptional && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              Optional
                            </span>
                          )}
                        </div>
                        {ex.notes && (
                          <span className="text-[11px] text-zinc-400 block mt-0.5 font-normal">
                            {ex.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                        {ex.setsReps}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300 whitespace-nowrap">
                        {ex.rest}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 leading-relaxed">
                        {ex.howToPerform}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Finisher & Recovery */}
            {(currentPhaseDayWorkout.finisher || currentPhaseDayWorkout.recoveryNotes) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                {currentPhaseDayWorkout.finisher && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Finish The Session</span>
                    <p className="text-xs text-zinc-300">{currentPhaseDayWorkout.finisher}</p>
                  </div>
                )}
                {currentPhaseDayWorkout.recoveryNotes && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase">Recovery & Coach Notes</span>
                    <p className="text-xs text-zinc-300">{currentPhaseDayWorkout.recoveryNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: 5-DAY HYPERTROPHY SPLIT */}
      {/* ========================================================================= */}
      {activeTab === '5day' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-amber-300 uppercase font-mono block mb-1">Moussa’s Hypertrophy Blueprint (5-Day Split)</span>
            A five-session hypertrophy-focused split built around controlled execution, high-effort working sets, and concentrated volume.
          </div>

          <div className="flex flex-wrap gap-2">
            {MOUSSA_5DAY_BLUEPRINT.map(split => (
              <button
                key={split.id}
                onClick={() => setSelected5DayId(split.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  selected5DayId === split.id
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {split.title}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">{current5DayWorkout.title}</h2>
              <p className="text-xs text-amber-400 italic">"{current5DayWorkout.motto}"</p>
              <p className="text-xs text-zinc-400 pt-1 font-mono">Warm-Up: {current5DayWorkout.warmup}</p>
            </div>

            {current5DayWorkout.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h3 className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                  {sec.category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                        <th className="py-2 px-3">Exercise</th>
                        <th className="py-2 px-3">Sets × Reps</th>
                        <th className="py-2 px-3">Execution / Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {sec.exercises.map((ex, eIdx) => (
                        <tr key={eIdx} className="hover:bg-zinc-900/40">
                          <td className="py-3 px-3 font-semibold text-zinc-200">{ex.name}</td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-300">{ex.setsReps}</td>
                          <td className="py-3 px-3 text-zinc-300">
                            {ex.executionNote ? (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[11px]">
                                {ex.executionNote}
                              </span>
                            ) : 'Standard controlled execution'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {current5DayWorkout.finisher && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-emerald-400">Finisher</span>
                <p className="text-xs text-zinc-200">
                  {current5DayWorkout.finisher.exercise} • {current5DayWorkout.finisher.setsReps} ({current5DayWorkout.finisher.note})
                </p>
              </div>
            )}

            {current5DayWorkout.postNutrition && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono">
                {current5DayWorkout.postNutrition}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: PROGRESSION MODEL CYCLE */}
      {/* ========================================================================= */}
      {activeTab === 'progression' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest block mb-1">
                Client Blueprint • Training Protocol
              </span>
              <h2 className="font-serif text-2xl font-bold text-white">The Progression Cycle</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Build reps. Progress the load. Repeat with purpose. Consistency • Technique • Measurable Progress.
              </p>
            </div>

            {/* Foundation Banner */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <strong className="block mb-0.5">First 2 Weeks / Build the Foundation:</strong>
              Prioritize consistency and technique over intensity. Establish controlled reps and record every workout.
            </div>

            {/* Flowchart Representation */}
            <div className="space-y-4 max-w-xl mx-auto py-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1 shadow-md">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">01 / Train</span>
                <h4 className="text-sm font-bold text-white">Work within your rep range</h4>
                <p className="text-xs text-zinc-400">Keep technique consistent.</p>
              </div>

              <div className="flex justify-center text-zinc-600">
                <div className="w-0.5 h-6 bg-zinc-700" />
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1 shadow-md">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">02 / Track</span>
                <h4 className="text-sm font-bold text-white">Log every workout</h4>
                <p className="text-xs text-zinc-400">Record load and reps for each set.</p>
              </div>

              <div className="flex justify-center text-zinc-600">
                <div className="w-0.5 h-6 bg-zinc-700" />
              </div>

              {/* Step 3 (Decision Node) */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-amber-500/40 text-center space-y-1 shadow-lg">
                <span className="text-[10px] font-mono text-amber-400 uppercase">03 / Review Each Exercise</span>
                <h4 className="text-sm font-bold text-amber-200">
                  Top of the rep range reached with consistent technique?
                </h4>
              </div>

              {/* Fork */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Yes Branch */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">YES ↓ (Increase Load)</span>
                  <h5 className="text-xs font-bold text-white">Add weight next session</h5>
                  <p className="text-[11px] text-zinc-400">Build back toward the top of the range.</p>
                </div>

                {/* Not Yet Branch */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <span className="text-xs font-mono font-bold text-zinc-400 block">NOT YET ↓ (Maintain Load)</span>
                  <h5 className="text-xs font-bold text-white">Keep weight. Improve reps.</h5>
                  <p className="text-[11px] text-zinc-400">Aim for more reps with the same form.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: NUTRITION BLUEPRINT */}
      {/* ========================================================================= */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Macro Check Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Energy Target</span>
              <p className="text-2xl font-bold font-mono text-amber-300">{NUTRITION_BLUEPRINT.dailyTargets.energyKcal} kcal</p>
              <span className="text-xs text-zinc-400">Provisional starting point</span>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Protein (170g)</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">680 kcal</p>
              <span className="text-xs text-zinc-400">Spread across meals</span>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Fats (60g)</span>
              <p className="text-2xl font-bold font-mono text-cyan-400">540 kcal</p>
              <span className="text-xs text-zinc-400">Olive oil, eggs, dairy</span>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Carbohydrates (245g)</span>
              <p className="text-2xl font-bold font-mono text-rose-400">980 kcal</p>
              <span className="text-xs text-zinc-400">Rice, bread, fruit</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono">
            <span className="text-amber-400 font-bold">Macro check: </span>
            {NUTRITION_BLUEPRINT.dailyTargets.macroCheck}
          </div>

          {/* Repeatable Meal Structure */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Repeatable Meal Structure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NUTRITION_BLUEPRINT.mealStructure.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-mono uppercase font-bold text-amber-300">{m.when}</span>
                  <p className="text-sm font-semibold text-white">{m.example}</p>
                  <p className="text-xs text-zinc-400">{m.instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Food Choices and Easy Swaps */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Food Choices & Easy Swaps</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Choose Most Often</th>
                    <th className="py-2.5 px-3">Useful Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {NUTRITION_BLUEPRINT.foodChoicesAndSwaps.map((f, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">{f.category}</td>
                      <td className="py-3 px-3 text-zinc-200 font-medium">{f.chooseMostOften}</td>
                      <td className="py-3 px-3 text-zinc-400">{f.usefulNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Replace Foods That Do Not Fit (Low-Oxalate / Preferences) */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Replace Foods That Do Not Fit This Version</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NUTRITION_BLUEPRINT.foodsToReplace.map((swap, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                    <span>LEAVE OUT:</span>
                    <span className="text-zinc-300 font-normal">{swap.leaveOut}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono border-t border-zinc-800/60 pt-2">
                    <span>USE INSTEAD:</span>
                    <span className="text-zinc-200 font-medium">{swap.useInstead}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Halal Standards & Hormone Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono">Halal Choices & Standards</h4>
              <div className="space-y-3">
                {NUTRITION_BLUEPRINT.halalStandards.map((h, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/70 text-xs space-y-0.5">
                    <span className="font-mono text-amber-300 font-bold block">{h.area}</span>
                    <span className="text-zinc-300">{h.standard}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono">Prioritize Normal Hormone Function</h4>
              <div className="space-y-3">
                {NUTRITION_BLUEPRINT.testosteronePriorities.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/70 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-400 font-bold">{t.priority}</span>
                    </div>
                    <p className="text-zinc-200 font-medium">{t.action}</p>
                    <p className="text-zinc-500 text-[11px]">{t.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: MICRONUTRIENT BLUEPRINT TABLES */}
      {/* ========================================================================= */}
      {activeTab === 'micronutrients' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Table Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 1, label: 'Table 1: Fat-Soluble Vitamins' },
                { id: 2, label: 'Table 2: Water-Soluble Vitamins' },
                { id: 3, label: 'Table 3: Major Minerals' },
                { id: 4, label: 'Table 4: Trace Minerals' },
              ].map(tbl => (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedMicroTable(tbl.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedMicroTable === tbl.id
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tbl.label}
                </button>
              ))}
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search nutrient, food, or purpose..."
                value={microSearch}
                onChange={e => setMicroSearch(e.target.value)}
                className="w-full sm:w-64 bg-zinc-950 text-xs text-zinc-200 pl-9 pr-4 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <div className="text-xs text-zinc-400 font-mono">
              Educational Reference • U.S. FDA Daily Values (DV) for adults & children 4+. Requirements vary based on training load and energy intake.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">Nutrient</th>
                    <th className="py-2.5 px-3">Daily Value (DV)</th>
                    <th className="py-2.5 px-3">Primary Purpose</th>
                    <th className="py-2.5 px-3">Best Food Sources</th>
                    <th className="py-2.5 px-3">Deficiency Symptoms</th>
                    <th className="py-2.5 px-3">Excess & Practical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {getActiveMicroTableData().map((m, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                        {m.nutrient}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-300 whitespace-nowrap">
                        {m.dailyValue}
                      </td>
                      <td className="py-3 px-3 text-zinc-200 font-medium">
                        {m.primaryPurpose}
                      </td>
                      <td className="py-3 px-3 text-emerald-400">
                        {m.bestFoodSources}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {m.deficiency}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {m.excessAndNotes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

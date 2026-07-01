import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Play, Pause, ChevronUp, ChevronDown, Check, ArrowRight, ArrowLeftRight, Volume2, Maximize, Plus } from 'lucide-react';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [reps, setReps] = useState(20);
  const [weight, setWeight] = useState('');
  const [feeling, setFeeling] = useState(1); // 0 = Too easy, 1 = Just right, 2 = Too hard

  return (
    <div className="bg-[#0F1015] min-h-screen text-white font-sans flex flex-col relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 h-[60vh]">
        <img 
          src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" 
          alt="Video background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0F1015]"></div>
      </div>

      {/* Top Controls Overlay */}
      <div className="relative z-10 p-4 pt-10 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-10 px-4 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center gap-2 transition-active active:scale-95 border border-white/10"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span className="font-medium text-sm">0:12</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-active active:scale-95 border border-white/10">
            <Volume2 size={18} className="text-white" />
          </button>
        </div>
        <button className="w-10 h-10 flex items-center justify-center relative">
          <span className="text-2xl">🎉</span>
        </button>
      </div>

      {/* Center Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[35vh] px-6 text-center">
        <div className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest mb-4">
          Current
        </div>
        <h1 className="text-3xl font-bold mb-4">Dumbbell Bench Press</h1>
        <div className="w-12 h-1 bg-orange-500 rounded-full mb-8"></div>
        <div className="flex justify-end w-full">
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-active active:scale-95 border border-white/10">
            <Maximize size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-20 flex-1 flex flex-col bg-[#0F1015]">
        {/* Coach Tip Container */}
        <div className="px-4 -mt-8 mb-6">
          <div className="bg-[#1A1A24] border border-neutral-800 rounded-2xl relative pt-8 pb-4 px-5">
            {/* Coach Avatar (positioned halfway up) */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-[#1A1A24] overflow-hidden bg-neutral-800">
              <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=150" alt="Coach Adam" className="w-full h-full object-cover" />
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-[#1A1A24]">1</div>
            </div>
            
            <h3 className="text-[10px] font-bold text-orange-500 tracking-widest text-center uppercase mb-3">Tip from Coach Adam</h3>
            <p className="text-sm text-neutral-300 leading-relaxed text-center mb-6">
              Focus on full range of motion and control. This is a tough long circuit so stay focused and choose weights that allow you to continue without extended rests.
            </p>
            <div className="h-[1px] bg-neutral-800 -mx-5 mb-4"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 font-bold uppercase tracking-wider text-xs">Recommended Weight</span>
              <div className="flex items-center gap-1 text-orange-500 font-bold">
                11-15 kg
                <div className="w-4 h-4 rounded-full border border-orange-500 flex items-center justify-center text-[10px] opacity-70 ml-1">?</div>
              </div>
            </div>
          </div>
        </div>

        {/* Log Controls Section */}
        <div className="flex-1 px-6 flex flex-col">
          <div className="flex justify-center mb-4">
             <div className="text-center">
                <div className="text-xs text-neutral-400 mb-2">Log Weight & Reps</div>
                <button 
                  onClick={() => setShowLogSheet(true)}
                  className="w-12 h-12 rounded-full bg-[#1A1A24] border border-neutral-800 flex items-center justify-center mx-auto hover:bg-neutral-800 transition-colors"
                >
                  <Plus size={24} className="text-orange-500" />
                </button>
             </div>
          </div>
          
          <div className="flex-1 flex items-center justify-between mt-auto mb-12">
            <div className="flex flex-col items-center">
              <button className="w-14 h-14 rounded-full bg-[#1A1A24] border border-neutral-800 flex items-center justify-center mb-2 hover:bg-neutral-800 transition-colors">
                <ArrowLeftRight size={24} className="text-neutral-400" />
              </button>
              <span className="text-xs font-bold text-neutral-400">Alternate</span>
            </div>
            
            <div className="w-32 h-32 rounded-full border-4 border-neutral-600 flex flex-col items-center justify-center relative bg-[#0F1015]">
              {/* Progress Ring visual trick */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#FF6B35]" strokeDasharray="364" strokeDashoffset="120" />
              </svg>
              <div className="text-5xl font-bold">20</div>
              <div className="text-sm text-neutral-400 uppercase tracking-widest font-bold">reps</div>
            </div>
            
            <div className="flex flex-col items-center">
              <button className="w-14 h-14 rounded-full bg-[#FF6B35] flex items-center justify-center mb-2 hover:bg-[#FF8555] transition-colors shadow-[0_4px_20px_rgba(255,107,53,0.3)]">
                <Check size={32} className="text-white" />
              </button>
              <span className="text-xs font-bold text-neutral-400">Next</span>
            </div>
          </div>
        </div>

        {/* Bottom Nav equivalent */}
        <div className="h-20 bg-[#0F1015] border-t border-neutral-800 flex items-center justify-between px-6 pb-6 pt-4">
          <div className="flex items-center gap-2">
            <ChevronLeft size={20} className="text-neutral-400" />
            <span className="font-bold">Round <span className="text-orange-500">1</span> of 2</span>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center">
              <Edit2 size={16} className="text-neutral-400" />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center">
              {/* Using a chart icon replacement */}
              <div className="w-4 h-4 border-l-2 border-b-2 border-neutral-400 relative">
                 <div className="absolute bottom-0.5 left-1 w-1 h-2 bg-neutral-400"></div>
                 <div className="absolute bottom-0.5 left-2.5 w-1 h-3 bg-neutral-400"></div>
              </div>
            </button>
            <button className="w-10 h-10 rounded-full bg-[#1A1A24] flex flex-col gap-1 items-center justify-center px-2">
              <div className="w-4 h-0.5 bg-neutral-400"></div>
              <div className="w-4 h-0.5 bg-neutral-400"></div>
              <div className="w-4 h-0.5 bg-neutral-400"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Log Weight & Reps Sheet Overlay */}
      {showLogSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLogSheet(false)}>
          <div className="bg-[#1A1A24] w-full rounded-t-3xl pb-8 animate-in slide-in-from-bottom-full" onClick={e => e.stopPropagation()}>
             {/* Handle indicator */}
             <div className="flex justify-center pt-3 pb-2">
               <div className="w-12 h-1 bg-neutral-700 rounded-full"></div>
             </div>
             
             <div className="flex justify-between items-center px-6 py-4">
               <button onClick={() => setShowLogSheet(false)} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                 <X size={18} />
               </button>
               <h3 className="text-xl font-bold">Dumbbell Bench Press</h3>
               <button className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                 <ChevronUp size={18} />
               </button>
             </div>
             
             <div className="h-[1px] bg-neutral-800 w-full mb-6"></div>

             <div className="px-6">
                <div className="flex justify-between items-end mb-8 gap-4">
                  <div className="flex flex-col items-center">
                     <span className="text-orange-500 text-xs font-bold mb-2">Round</span>
                     <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-xl font-bold">
                       1
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-neutral-400 text-xs font-bold mb-2">Reps</span>
                     <div className="bg-[#242531] rounded-lg h-12 w-20 flex items-center justify-center text-2xl font-bold">
                       {reps}
                     </div>
                  </div>
                  <div className="flex flex-col flex-1">
                     <span className="text-neutral-400 text-xs font-bold mb-2">Weight Per Side</span>
                     <div className="flex items-center gap-2">
                       <div className="flex-1 bg-[#242531] rounded-lg h-12 border border-orange-500/50 flex items-center justify-center">
                         <span className="text-neutral-500 text-2xl font-light">+</span>
                       </div>
                       <div className="bg-neutral-800 rounded-lg h-12 px-3 flex items-center justify-center text-sm font-bold text-neutral-400">
                         kg
                       </div>
                     </div>
                  </div>
                </div>

                {/* Feeling Slider */}
                <div className="mb-8">
                   <div className="flex h-2 bg-neutral-800 rounded-full mb-4 relative">
                      <div className="flex-1 bg-green-500/80 rounded-l-full relative">
                         {feeling === 0 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-green-500 shadow-lg shadow-black/50 z-10 translate-x-1/2">
                           <div className="absolute inset-0 m-auto w-2 h-2 bg-green-500 rounded-full"></div>
                         </div>}
                      </div>
                      <div className="flex-1 bg-orange-400/80 relative border-l-2 border-[#1A1A24]">
                         {feeling === 1 && <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-orange-500 shadow-lg shadow-black/50 z-10 -translate-x-1/2 cursor-pointer">
                           <div className="absolute inset-0 m-auto w-2 h-2 bg-orange-500 rounded-full"></div>
                         </div>}
                      </div>
                      <div className="flex-1 bg-orange-600/80 relative border-l-2 border-[#1A1A24]">
                      </div>
                      <div className="flex-1 bg-red-600/80 rounded-r-full relative border-l-2 border-[#1A1A24]">
                         {feeling === 2 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-red-500 shadow-lg shadow-black/50 z-10 -translate-x-1/2">
                           <div className="absolute inset-0 m-auto w-2 h-2 bg-red-500 rounded-full"></div>
                         </div>}
                      </div>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                     <span>Too Easy</span>
                     <span>Just Right</span>
                     <span>Too Hard</span>
                   </div>
                </div>

                <button 
                  onClick={() => setShowLogSheet(false)}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF8555] text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-[0.98] tracking-widest uppercase mb-4"
                >
                  SAVE
                </button>
             </div>
             
             {/* Mock Numpad */}
             <div className="bg-[#121318] pt-4 px-2 pb-6 grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6,7,8,9,'.',0,'X'].map((key, i) => (
                   <button key={i} className="bg-[#2B2D38] active:bg-[#3B3D48] text-white py-3 rounded-lg text-2xl font-medium flex flex-col items-center justify-center h-14">
                      {key === 'X' ? <X size={24} /> : 
                       typeof key === 'number' ? (
                          <>
                            {key}
                            {key > 1 && <span className="text-[9px] tracking-[0.2em] font-normal text-neutral-400 uppercase mt-[-4px]">
                              {key === 2 ? 'abc' : key === 3 ? 'def' : key === 4 ? 'ghi' : key === 5 ? 'jkl' : key === 6 ? 'mno' : key === 7 ? 'pqrs' : key === 8 ? 'tuv' : 'wxyz'}
                            </span>}
                          </>
                       ) : key}
                   </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

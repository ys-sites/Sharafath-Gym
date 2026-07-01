import { useState, useRef } from 'react';
import { Camera, X, Check, Info, ScanLine, Barcode, ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MealLoggerModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function MealLoggerModal({ onClose, onSave }: MealLoggerModalProps) {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Image too large. Please use an image under 5MB.');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const analyzeMeal = async () => {
    if (!image && !description) {
      setError('Please provide a photo or description.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      }
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze meal. You can still enter details manually.');
      setAnalysisResult({
        items: [{ name: '', portion: '', calories: 0, protein: 0, carbs: 0, fats: 0 }],
        total: { calories: 0, protein: 0, carbs: 0, fats: 0 }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (!analysisResult) return;
    
    const newItems = [...analysisResult.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    const newTotal = newItems.reduce((acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fats: acc.fats + (Number(item.fats) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    setAnalysisResult({ ...analysisResult, items: newItems, total: newTotal });
  };

  const saveMeal = async () => {
    if (!analysisResult || !supabase) return;

    try {
      setIsAnalyzing(true);
      const user = (await supabase.auth.getUser()).data.user;
      
      let photoUrl = null;

      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user?.id,
          meal_type: 'snack',
          photo_url: photoUrl,
          ai_raw_response: analysisResult
        })
        .select()
        .single();
        
      if (mealError) throw mealError;

      const itemsToInsert = analysisResult.items.map((item: any) => ({
        meal_id: mealData.id,
        name: item.name || 'Unknown food',
        portion: item.portion || '1 serving',
        calories: Number(item.calories) || 0,
        protein_g: Number(item.protein) || 0,
        carbs_g: Number(item.carbs) || 0,
        fats_g: Number(item.fats) || 0,
      }));

      const { error: itemsError } = await supabase
        .from('meal_items')
        .insert(itemsToInsert);
        
      if (itemsError) throw itemsError;

      onSave();
    } catch (err) {
      console.error(err);
      setError('Failed to save meal.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans text-white">
      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
      />

      {!analysisResult && !isAnalyzing && !previewUrl ? (
        <div className="flex-1 flex flex-col relative h-full">
          {/* Top Bar */}
          <div className="flex justify-between items-center p-4 pt-12 absolute top-0 w-full z-10">
             <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-md">
                <span className="font-bold">10:42</span> {/* Mock time or empty */}
             </div>
             <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-colors">
               <Info size={18} className="text-white" />
             </button>
          </div>

          {/* Camera Viewfinder Area */}
          <div className="flex-1 flex flex-col items-center justify-center pt-20 px-6">
            <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <span className="text-white font-medium text-lg">Take a photo of your meal</span>
            </div>
            
            <div className="w-full aspect-[4/5] rounded-[32px] border-4 border-white/90 relative overflow-hidden bg-neutral-900/50 flex items-center justify-center">
              <Camera size={48} className="text-white/20" />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="pb-10 pt-6 px-8 flex flex-col items-center relative z-10">
            {/* Shutter */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center mb-4 transition-transform active:scale-95"
            >
              <div className="w-16 h-16 rounded-full bg-white"></div>
            </button>
            
            <span className="text-white font-medium text-lg mb-4">Meals</span>

            {/* Mode Switcher & Gallery */}
            <div className="w-full flex justify-between items-center px-4">
               <button className="w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center">
                 {/* Flash icon mock */}
                 <span className="text-white text-xl">⚡</span>
               </button>

               <div className="bg-neutral-800/80 rounded-full flex items-center p-1">
                 <button className="bg-yellow-500 rounded-full p-2.5 px-4 relative">
                   <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black z-10">
                     NEW
                   </div>
                   <ScanLine size={20} className="text-black" />
                 </button>
                 <button className="rounded-full p-2.5 px-4 text-neutral-400">
                   <Barcode size={20} />
                 </button>
               </div>

               <button 
                 onClick={() => {
                   if (fileInputRef.current) {
                     fileInputRef.current.removeAttribute('capture');
                     fileInputRef.current.click();
                   }
                 }}
                 className="w-10 h-10 rounded-lg bg-neutral-800/80 flex items-center justify-center border border-white/20 overflow-hidden"
               >
                 <ImageIcon size={20} className="text-white" />
               </button>
            </div>
          </div>

          {/* Close button absolute bottom left/right or top - let's put it top left replacing time */}
          <button onClick={onClose} className="absolute top-12 left-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-md z-20 hover:bg-black/60">
             <X size={18} />
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-6 bg-[#111]">
          {/* Post-Capture Review & Analysis UI */}
          <div className="flex justify-between items-center mb-6 pt-4">
             <button onClick={() => { setPreviewUrl(null); setImage(null); }} className="text-neutral-400 hover:text-white flex items-center gap-2">
               <X size={20} /> Retake
             </button>
             <h2 className="font-bold text-lg">Review Meal</h2>
             <div className="w-20"></div>
          </div>

          {previewUrl && (
            <div className="w-full aspect-square rounded-[32px] overflow-hidden bg-neutral-900 border border-neutral-800">
              <img src={previewUrl} alt="Captured meal" className="w-full h-full object-cover" />
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <>
              <button
                onClick={analyzeMeal}
                className="w-full bg-yellow-500 text-black font-bold py-4 rounded-3xl active:scale-[0.98] transition-transform text-lg shadow-lg shadow-yellow-500/20"
              >
                Scan & Analyze
              </button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neutral-400 font-medium animate-pulse">Analyzing nutritional data...</p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#1C1C1E] rounded-3xl p-6">
                <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-4">
                   <div>
                     <span className="text-neutral-400 text-sm font-medium">Total Calories</span>
                     <div className="text-3xl font-bold text-white">{analysisResult.total.calories} kcal</div>
                   </div>
                   <div className="flex gap-4 text-sm font-medium text-neutral-300">
                     <span className="flex flex-col items-center text-blue-400"><span className="text-xs text-neutral-500 uppercase">Pro</span>{analysisResult.total.protein}g</span>
                     <span className="flex flex-col items-center text-green-400"><span className="text-xs text-neutral-500 uppercase">Car</span>{analysisResult.total.carbs}g</span>
                     <span className="flex flex-col items-center text-yellow-400"><span className="text-xs text-neutral-500 uppercase">Fat</span>{analysisResult.total.fats}g</span>
                   </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-white">Detected Items</h3>
                <div className="space-y-4">
                  {analysisResult.items.map((item: any, i: number) => (
                    <div key={i} className="bg-black/50 border border-neutral-800 rounded-2xl p-4">
                      <input 
                        value={item.name}
                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                        className="w-full bg-transparent text-lg font-bold text-white focus:outline-none mb-2"
                      />
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-neutral-900 rounded-xl p-2 px-3 border border-neutral-800 focus-within:border-yellow-500">
                           <span className="text-[10px] text-neutral-500 uppercase block font-bold">Portion</span>
                           <input 
                             value={item.portion}
                             onChange={(e) => updateItem(i, 'portion', e.target.value)}
                             className="w-full bg-transparent text-sm text-white focus:outline-none"
                           />
                        </div>
                        <div className="bg-neutral-900 rounded-xl p-2 px-3 border border-neutral-800 focus-within:border-yellow-500">
                           <span className="text-[10px] text-neutral-500 uppercase block font-bold">Calories</span>
                           <input 
                             type="number"
                             value={item.calories}
                             onChange={(e) => updateItem(i, 'calories', e.target.value)}
                             className="w-full bg-transparent text-sm text-white focus:outline-none"
                           />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={saveMeal}
                className="w-full bg-neutral-800 text-white font-bold py-4 rounded-3xl border border-neutral-700 hover:bg-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Check size={24} className="text-yellow-500" />
                Add to Diary
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, ChangeEvent } from 'react';
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

  // Fitia/Sporter customization states
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [inputMode, setInputMode] = useState<'camera' | 'text'>('camera');

  const handleImageCapture = (e: ChangeEvent<HTMLInputElement>) => {
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        const base64Data = base64Str.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const analyzeMeal = async () => {
    if (!image && !description) {
      setError('Please provide a photo or description.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const payload: { image?: string; mimeType?: string; description?: string } = {};

      if (image) {
        const base64Data = await fileToBase64(image);
        payload.image = base64Data;
        payload.mimeType = image.type;
      }
      if (description) {
        payload.description = description;
      }

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
          meal_type: mealType,
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
        <div className="flex-1 flex flex-col relative h-full pt-16 px-6 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={onClose} className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-white hover:bg-neutral-800">
               <X size={18} />
            </button>
            <h2 className="font-extrabold text-lg tracking-tight text-white">Log Meal</h2>
            <div className="w-10"></div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-neutral-900 border border-neutral-800/80 p-1 rounded-full mb-6 max-w-[280px] mx-auto w-full">
            <button 
              type="button"
              onClick={() => setInputMode('camera')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-full transition-all ${inputMode === 'camera' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Scan Photo
            </button>
            <button 
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-full transition-all ${inputMode === 'text' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Write Text
            </button>
          </div>

          {/* Meal Type Selector */}
          <div className="space-y-2 mb-8 max-w-sm mx-auto w-full">
            <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest text-center">Which meal is this?</label>
            <div className="flex gap-2 bg-neutral-900 border border-neutral-800/40 p-1.5 rounded-2xl">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl capitalize transition-all ${mealType === type ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Input View */}
          {inputMode === 'camera' ? (
            <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full">
              {/* Camera Viewfinder */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full aspect-[4/5] rounded-[32px] border-4 border-white/10 relative overflow-hidden bg-neutral-900/50 flex items-center justify-center">
                  <Camera size={48} className="text-white/20" />
                  <span className="absolute bottom-6 text-neutral-400 text-xs font-medium bg-black/60 px-4 py-2 rounded-full border border-white/5">
                    Tap to trigger camera scan
                  </span>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 w-full h-full opacity-0"
                  />
                </div>
              </div>

              {/* Bottom Shutter trigger & Gallery */}
              <div className="py-6 flex justify-between items-center px-4">
                <button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-neutral-800"
                >
                  <ImageIcon size={20} className="text-neutral-300" />
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95 bg-white/20"
                >
                  <div className="w-12 h-12 rounded-full bg-white"></div>
                </button>

                <div className="w-12"></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full pb-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-400 pl-1">Describe your meal</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g., 2 scrambled eggs with spinach and a slice of toasted sourdough bread"
                    className="w-full min-h-[140px] bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm leading-relaxed"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center mb-4">{error}</p>}

              <button
                type="button"
                onClick={analyzeMeal}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full text-base transition-all active:scale-[0.98] uppercase tracking-wider shadow-lg shadow-indigo-500/20"
              >
                Analyze Description
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6 bg-[#0C0D12]">
          {/* Post-Capture Review & Analysis UI */}
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => { setPreviewUrl(null); setImage(null); setAnalysisResult(null); }} className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
               <X size={16} /> Retake
             </button>
             <h2 className="font-extrabold text-lg">Review Meal</h2>
             <div className="w-20"></div>
          </div>

          {previewUrl && !analysisResult && (
            <div className="w-full aspect-square rounded-[32px] overflow-hidden bg-neutral-900 border border-neutral-800 max-w-sm mx-auto">
              <img src={previewUrl} alt="Captured meal" className="w-full h-full object-cover" />
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="max-w-sm mx-auto w-full space-y-4">
              <button
                onClick={analyzeMeal}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full active:scale-[0.98] transition-transform text-base uppercase tracking-wider shadow-lg shadow-indigo-500/20"
              >
                Scan & Analyze
              </button>
              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 max-w-sm mx-auto">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neutral-400 font-bold text-sm animate-pulse uppercase tracking-wider">Analyzing nutritional data...</p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto w-full">
              <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2.2rem] shadow-2xl">
                <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2.2rem-0.5rem)] p-6 space-y-6">
                  <div className="flex justify-between items-end border-b border-neutral-850 pb-4">
                     <div>
                       <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Calories</span>
                       <div className="text-2xl font-extrabold text-white mt-0.5">{analysisResult.total.calories} kcal</div>
                     </div>
                     <div className="flex gap-3 text-xs font-bold text-neutral-400">
                       <span className="flex flex-col items-center"><span className="text-[9px] text-neutral-500 uppercase">Pro</span>{analysisResult.total.protein}g</span>
                       <span className="flex flex-col items-center"><span className="text-[9px] text-neutral-500 uppercase">Car</span>{analysisResult.total.carbs}g</span>
                       <span className="flex flex-col items-center"><span className="text-[9px] text-neutral-500 uppercase">Fat</span>{analysisResult.total.fats}g</span>
                     </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-neutral-400 uppercase tracking-wider">Detected Items</h3>
                  <div className="space-y-4">
                    {analysisResult.items.map((item: any, i: number) => (
                      <div key={i} className="bg-black/30 border border-neutral-800/50 rounded-2xl p-4 space-y-3">
                        <input 
                          value={item.name}
                          onChange={(e) => updateItem(i, 'name', e.target.value)}
                          className="w-full bg-transparent text-base font-extrabold text-white focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Portion</span>
                             <input 
                               value={item.portion}
                               onChange={(e) => updateItem(i, 'portion', e.target.value)}
                               className="w-full bg-transparent text-xs text-white focus:outline-none"
                             />
                          </div>
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Calories</span>
                             <input 
                               type="number"
                               value={item.calories}
                               onChange={(e) => updateItem(i, 'calories', Number(e.target.value))}
                               className="w-full bg-transparent text-xs text-white focus:outline-none"
                             />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Prot (g)</span>
                             <input 
                               type="number"
                               value={item.protein || 0}
                               onChange={(e) => updateItem(i, 'protein', Number(e.target.value))}
                               className="w-full bg-transparent text-xs text-white focus:outline-none"
                             />
                          </div>
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Carb (g)</span>
                             <input 
                               type="number"
                               value={item.carbs || 0}
                               onChange={(e) => updateItem(i, 'carbs', Number(e.target.value))}
                               className="w-full bg-transparent text-xs text-white focus:outline-none"
                             />
                          </div>
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Fat (g)</span>
                             <input 
                               type="number"
                               value={item.fats || 0}
                               onChange={(e) => updateItem(i, 'fats', Number(e.target.value))}
                               className="w-full bg-transparent text-xs text-white focus:outline-none"
                             />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-1.5 rounded-full shadow-2xl">
                <button
                  onClick={saveMeal}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider shadow-lg shadow-indigo-500/20"
                >
                  <Check size={20} className="text-white" />
                  Add to Diary
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

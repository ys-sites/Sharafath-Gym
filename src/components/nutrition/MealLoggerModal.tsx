import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Camera, X, Check, ImageIcon, Barcode, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Html5Qrcode } from 'html5-qrcode';

interface MealLoggerModalProps {
  onClose: () => void;
  onSave: () => void;
}

const SCAN_STATUSES = [
  'Identifying ingredients...',
  'Estimating portions...',
  'Calculating macros...'
];

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
  const [inputMode, setInputMode] = useState<'camera' | 'text' | 'barcode' | 'quickadd'>('camera');

  // Barcode scanning states
  const [barcodeScanError, setBarcodeScanError] = useState('');
  const [barcodeSearchQuery, setBarcodeSearchQuery] = useState('');
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [amountEaten, setAmountEaten] = useState<number>(100);

  // Quick Add states
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCalories, setQuickCalories] = useState('');
  const [quickProtein, setQuickProtein] = useState('');
  const [quickCarbs, setQuickCarbs] = useState('');
  const [quickFats, setQuickFats] = useState('');

  // Scanning animation states
  const [scanStatusIndex, setScanStatusIndex] = useState(0);
  const [recalculatingIndex, setRecalculatingIndex] = useState<number | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setScanStatusIndex(prev => (prev + 1) % SCAN_STATUSES.length);
      }, 1500);
    } else {
      setScanStatusIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

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

  const handleBarcodeScanned = async (barcode: string) => {
    setIsAnalyzing(true);
    setBarcodeScanError('');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,nutriments,serving_size,serving_quantity`);
      if (!res.ok) throw new Error("Product fetch failed");
      const data = await res.json();
      if (data.status === 0 || !data.product) {
        setScannedProduct({
          barcode,
          notFound: true,
          name: '',
          brand: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          servingSize: '100g',
          servingQty: 100
        });
        setAmountEaten(100);
      } else {
        const prod = data.product;
        const nutriments = prod.nutriments || {};
        
        const calories100g = Number(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
        const protein100g = Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0);
        const carbs100g = Number(nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0);
        const fats100g = Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0);

        const servingQty = Number(prod.serving_quantity || 100);

        setScannedProduct({
          barcode,
          notFound: false,
          name: prod.product_name || 'Unknown Item',
          brand: prod.brands || '',
          calories100g,
          protein100g,
          carbs100g,
          fats100g,
          servingSize: prod.serving_size || '100g',
          servingQty
        });
        setAmountEaten(servingQty);
      }
    } catch (err: any) {
      console.error(err);
      setBarcodeScanError("Failed to fetch product from Open Food Facts.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddBarcodeProduct = () => {
    if (!scannedProduct) return;
    
    let name = scannedProduct.name.trim() || 'Barcode Product';
    if (scannedProduct.brand) {
      name = `${name} (${scannedProduct.brand})`;
    }

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    if (scannedProduct.notFound) {
      calories = Number(scannedProduct.calories) || 0;
      protein = Number(scannedProduct.protein) || 0;
      carbs = Number(scannedProduct.carbs) || 0;
      fats = Number(scannedProduct.fats) || 0;
    } else {
      calories = Math.round((scannedProduct.calories100g * amountEaten) / 100);
      protein = Math.round(((scannedProduct.protein100g * amountEaten) / 100) * 10) / 10;
      carbs = Math.round(((scannedProduct.carbs100g * amountEaten) / 100) * 10) / 10;
      fats = Math.round(((scannedProduct.fats100g * amountEaten) / 100) * 10) / 10;
    }

    setAnalysisResult({
      items: [{
        name,
        portion: `${amountEaten}g`,
        calories,
        protein,
        carbs,
        fats,
        source: 'barcode'
      }],
      total: { calories, protein, carbs, fats }
    });
    setScannedProduct(null);
    setBarcodeSearchQuery('');
  };

  const handleQuickAdd = async () => {
    if (!quickCalories) {
      setError('Calories is required');
      return;
    }
    setIsAnalyzing(true);
    try {
      const calories = Number(quickCalories);
      const protein = Number(quickProtein || 0);
      const carbs = Number(quickCarbs || 0);
      const fats = Number(quickFats || 0);
      const name = quickTitle.trim() || 'Quick Add Meal';

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          meal_type: mealType,
          photo_url: null,
          ai_raw_response: { quick_add: true }
        })
        .select()
        .single();
      if (mealError) throw mealError;

      const { error: itemError } = await supabase
        .from('meal_items')
        .insert({
          meal_id: mealData.id,
          name,
          portion: '1 serving',
          calories,
          protein_g: protein,
          carbs_g: carbs,
          fats_g: fats,
          source: 'manual_entry'
        });
      if (itemError) throw itemError;

      onSave();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to quick add meal');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (inputMode !== 'barcode' || scannedProduct) return;

    let html5Qrcode: Html5Qrcode | null = null;
    const qrCodeId = "barcode-reader";

    const timer = setTimeout(() => {
      const element = document.getElementById(qrCodeId);
      if (!element) return;

      html5Qrcode = new Html5Qrcode(qrCodeId);
      html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            return { width: Math.min(width * 0.8, 250), height: 150 };
          }
        },
        (decodedText) => {
          handleBarcodeScanned(decodedText);
          if (html5Qrcode) {
            html5Qrcode.stop().catch(console.error);
          }
        },
        () => {}
      ).catch((err) => {
        console.warn("Camera start failed, falling back to manual entry:", err);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(console.error);
      }
    };
  }, [inputMode, scannedProduct]);

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
    } catch (err: any) {
      console.error("Gemini analysis error:", err);
      setError("Couldn't analyze this photo — try again or enter it manually.");
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddManualItem = () => {
    setAnalysisResult({
      items: [{ name: 'Custom Item', portion: '1 serving', calories: 0, protein: 0, carbs: 0, fats: 0 }],
      total: { calories: 0, protein: 0, carbs: 0, fats: 0 }
    });
    setError('');
  };

  const recalculateItem = async (index: number) => {
    if (!analysisResult) return;
    const item = analysisResult.items[index];
    if (!item.name || !item.portion) return;

    setRecalculatingIndex(index);
    try {
      const payload: { image?: string; mimeType?: string; correctedItem: { name: string; portion: string } } = {
        correctedItem: {
          name: item.name,
          portion: item.portion
        }
      };

      if (image) {
        const base64Data = await fileToBase64(image);
        payload.image = base64Data;
        payload.mimeType = image.type;
      }

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Recalculation failed');
      const data = await response.json();
      const updatedItem = data.items?.[0];

      if (updatedItem) {
        const newItems = [...analysisResult.items];
        newItems[index] = {
          ...newItems[index],
          calories: Number(updatedItem.calories) || 0,
          protein: Number(updatedItem.protein) || 0,
          carbs: Number(updatedItem.carbs) || 0,
          fats: Number(updatedItem.fats) || 0
        };

        const newTotal = newItems.reduce((acc, it) => ({
          calories: acc.calories + (Number(it.calories) || 0),
          protein: acc.protein + (Number(it.protein) || 0),
          carbs: acc.carbs + (Number(it.carbs) || 0),
          fats: acc.fats + (Number(it.fats) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        setAnalysisResult({ ...analysisResult, items: newItems, total: newTotal });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to recalculate macros. Please enter manually.');
    } finally {
      setRecalculatingIndex(null);
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
      if (!user) throw new Error('Not authenticated');

      let photoUrl = null;

      // Upload photo if exists
      if (image) {
        const bucketName = 'meal-photos';
        
        // Ensure bucket exists
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(b => b.name === bucketName);
          
          if (!bucketExists) {
            await supabase.storage.createBucket(bucketName, {
              public: false, // private bucket
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
              fileSizeLimit: 5242880 // 5MB
            });
          }
        } catch (e) {
          console.log("Bucket check/create error:", e);
        }

        const timestamp = Date.now();
        const fileExt = image.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${timestamp}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Storage upload error details:", uploadError);
          throw uploadError;
        }

        // Get signed URL for private bucket
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiration

        if (signedUrlError) {
          throw signedUrlError;
        }

        if (signedUrlData) {
          photoUrl = signedUrlData.signedUrl;
        }
      }

      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
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
        source: item.source || 'manual_entry'
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
          <div className="grid grid-cols-2 gap-2 bg-neutral-900 border border-neutral-800/80 p-1.5 rounded-2xl mb-6 max-w-[360px] mx-auto w-full">
            <button 
              type="button"
              onClick={() => setInputMode('camera')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${inputMode === 'camera' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Scan Photo
            </button>
            <button 
              type="button"
              onClick={() => setInputMode('barcode')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${inputMode === 'barcode' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Scan Barcode
            </button>
            <button 
              type="button"
              onClick={() => setInputMode('text')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${inputMode === 'text' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Write Text
            </button>
            <button 
              type="button"
              onClick={() => setInputMode('quickadd')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${inputMode === 'quickadd' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-300'}`}
            >
              Quick Add
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
          {inputMode === 'camera' && (
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
          )}

          {inputMode === 'barcode' && (
            <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full pb-10">
              <div className="space-y-6 flex-1 flex flex-col justify-start">
                {!scannedProduct ? (
                  <>
                    {/* Camera Scanner Viewfinder */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-400 pl-1 text-center">Scan product barcode</label>
                      <div className="w-full aspect-[4/3] rounded-[24px] border border-neutral-800 bg-neutral-950 overflow-hidden relative flex items-center justify-center">
                        <div id="barcode-reader" className="absolute inset-0 w-full h-full"></div>
                        <div className="absolute border-2 border-indigo-500/60 w-48 h-24 rounded-lg pointer-events-none z-10 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-indigo-500/80 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Manual Barcode Input Fallback */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-neutral-400 pl-1">Camera struggling? Type barcode number:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={barcodeSearchQuery}
                          onChange={(e) => setBarcodeSearchQuery(e.target.value)}
                          placeholder="E.g., 5449000000996"
                          className="flex-1 bg-neutral-900 border border-neutral-850 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => barcodeSearchQuery && handleBarcodeScanned(barcodeSearchQuery)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold px-5 rounded-xl text-sm transition-colors"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Scanned Product Info & Amount Eaten */
                  <div className="bg-[#13141C] border border-neutral-800/60 rounded-[2rem] p-5 space-y-4">
                    <div>
                      {scannedProduct.notFound ? (
                        <span className="text-red-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Product not found on OFF</span>
                      ) : (
                        <span className="text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Product Scanned ({scannedProduct.barcode})</span>
                      )}
                      <h3 className="font-extrabold text-lg text-white leading-tight">
                        {scannedProduct.notFound ? "Enter Custom Product" : scannedProduct.name}
                      </h3>
                      {scannedProduct.brand && (
                        <p className="text-xs text-neutral-400 font-medium mt-0.5">{scannedProduct.brand}</p>
                      )}
                    </div>

                    {scannedProduct.notFound ? (
                      /* Product Not Found Fields */
                      <div className="space-y-3 text-left">
                        <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850">
                          <span className="text-[9px] text-neutral-500 uppercase block font-bold">Product Name</span>
                          <input 
                            type="text"
                            value={scannedProduct.name}
                            onChange={(e) => setScannedProduct({ ...scannedProduct, name: e.target.value })}
                            className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                            placeholder="E.g. Protein Bar"
                          />
                        </div>
                        <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850">
                          <span className="text-[9px] text-neutral-500 uppercase block font-bold">Brand (Optional)</span>
                          <input 
                            type="text"
                            value={scannedProduct.brand}
                            onChange={(e) => setScannedProduct({ ...scannedProduct, brand: e.target.value })}
                            className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                            placeholder="E.g. Quest"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850">
                            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Calories</span>
                            <input 
                              type="number"
                              value={scannedProduct.calories}
                              onChange={(e) => setScannedProduct({ ...scannedProduct, calories: Number(e.target.value) })}
                              className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                            />
                          </div>
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850">
                            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Protein (g)</span>
                            <input 
                              type="number"
                              value={scannedProduct.protein}
                              onChange={(e) => setScannedProduct({ ...scannedProduct, protein: Number(e.target.value) })}
                              className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850">
                            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Carbs (g)</span>
                            <input 
                              type="number"
                              value={scannedProduct.carbs}
                              onChange={(e) => setScannedProduct({ ...scannedProduct, carbs: Number(e.target.value) })}
                              className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                            />
                          </div>
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850">
                            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Fats (g)</span>
                            <input 
                              type="number"
                              value={scannedProduct.fats}
                              onChange={(e) => setScannedProduct({ ...scannedProduct, fats: Number(e.target.value) })}
                              className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Product Found Fields */
                      <div className="space-y-4">
                        <div className="bg-neutral-900/40 rounded-2xl p-4 border border-neutral-850 grid grid-cols-2 gap-3 text-center">
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase font-bold">Calories (100g)</span>
                            <p className="text-base font-extrabold text-white mt-0.5">{scannedProduct.calories100g} kcal</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase font-bold">Serving Size</span>
                            <p className="text-base font-extrabold text-white mt-0.5">{scannedProduct.servingSize}</p>
                          </div>
                        </div>

                        <div className="bg-neutral-900/60 rounded-2xl p-4 border border-neutral-850">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase">Amount Eaten (grams)</span>
                            <button
                              type="button"
                              onClick={() => setAmountEaten(scannedProduct.servingQty)}
                              className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider"
                            >
                              Reset to serving ({scannedProduct.servingQty}g)
                            </button>
                          </div>
                          <input 
                            type="number"
                            value={amountEaten}
                            onChange={(e) => setAmountEaten(Number(e.target.value) || 0)}
                            className="w-full bg-transparent text-3xl font-extrabold text-white focus:outline-none border-b border-neutral-800 pb-2 text-center"
                          />
                        </div>

                        {/* Calculated total summary */}
                        <div className="bg-black/30 rounded-2xl p-4 border border-neutral-850/60 flex justify-between items-center text-xs text-neutral-400">
                          <span>Total Scaled:</span>
                          <span className="font-extrabold text-white">
                            {Math.round((scannedProduct.calories100g * amountEaten) / 100)} kcal · {Math.round(((scannedProduct.protein100g * amountEaten) / 100) * 10) / 10}g Pro
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setScannedProduct(null)}
                        className="flex-1 py-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 rounded-full text-xs font-extrabold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBarcodeProduct}
                        className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-full text-xs font-extrabold text-white uppercase tracking-wider"
                      >
                        {scannedProduct.notFound ? "Add Item" : "Add to Meal"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {barcodeScanError && <p className="text-red-500 text-xs font-bold text-center mt-4">{barcodeScanError}</p>}
            </div>
          )}

          {inputMode === 'text' && (
            <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full pb-10">
              <div className="space-y-4">
                <div className="space-y-2 text-left">
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

          {inputMode === 'quickadd' && (
            <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full pb-10">
              <div className="space-y-4 flex-1">
                <div className="bg-[#13141C] border border-neutral-800/60 rounded-[2rem] p-5 space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">Fast Log</span>
                    <h3 className="font-extrabold text-base text-white">Quick Add Nutrition</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Title */}
                    <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                      <span className="text-[9px] text-neutral-500 uppercase block font-bold">Meal Title</span>
                      <input 
                        type="text"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                        placeholder="E.g. Quick Protein Snack"
                      />
                    </div>

                    {/* Calories */}
                    <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                      <span className="text-[9px] text-neutral-500 uppercase block font-bold">Calories (kcal) *</span>
                      <input 
                        type="number"
                        value={quickCalories}
                        onChange={(e) => setQuickCalories(e.target.value)}
                        className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                        placeholder="Required"
                        required
                      />
                    </div>

                    {/* Protein */}
                    <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                      <span className="text-[9px] text-neutral-500 uppercase block font-bold">Protein (g)</span>
                      <input 
                        type="number"
                        value={quickProtein}
                        onChange={(e) => setQuickProtein(e.target.value)}
                        className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                        placeholder="Optional"
                      />
                    </div>

                    {/* Carbs */}
                    <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                      <span className="text-[9px] text-neutral-500 uppercase block font-bold">Carbs (g)</span>
                      <input 
                        type="number"
                        value={quickCarbs}
                        onChange={(e) => setQuickCarbs(e.target.value)}
                        className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                        placeholder="Optional"
                      />
                    </div>

                    {/* Fats */}
                    <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                      <span className="text-[9px] text-neutral-500 uppercase block font-bold">Fats (g)</span>
                      <input 
                        type="number"
                        value={quickFats}
                        onChange={(e) => setQuickFats(e.target.value)}
                        className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center mb-4">{error}</p>}

              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full text-base transition-all active:scale-[0.98] uppercase tracking-wider shadow-lg shadow-indigo-500/20"
              >
                Log Meal
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

          {previewUrl && (
            <div className="w-full aspect-square rounded-[32px] overflow-hidden bg-neutral-900 border border-neutral-800 max-w-sm mx-auto relative shadow-2xl">
              <img src={previewUrl} alt="Captured meal" className={`w-full h-full object-cover transition-opacity duration-300 ${isAnalyzing ? 'opacity-70' : 'opacity-100'}`} />
              
              {/* Scanning Overlay (only visible during analysis) */}
              {isAnalyzing && (
                <>
                  <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
                  <div className="absolute left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.9)] animate-scanner z-20"></div>
                </>
              )}
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="max-w-sm mx-auto w-full space-y-4">
              <button
                onClick={analyzeMeal}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full active:scale-[0.98] transition-transform text-base uppercase tracking-wider shadow-lg shadow-indigo-500/20"
              >
                Retry Scan
              </button>
              
              <button
                onClick={handleAddManualItem}
                className="w-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-300 font-extrabold py-4 rounded-full active:scale-[0.98] transition-transform text-xs uppercase tracking-wider"
              >
                Enter Details Manually
              </button>

              {error && <p className="text-red-500 text-xs font-bold text-center mt-2 leading-relaxed">{error}</p>}
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3 max-w-sm mx-auto text-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-400 font-extrabold text-sm uppercase tracking-widest animate-pulse">
                {SCAN_STATUSES[scanStatusIndex]}
              </p>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">AI engine is processing your image...</span>
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
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500 col-span-2">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Food Name</span>
                             <input 
                               value={item.name}
                               onChange={(e) => updateItem(i, 'name', e.target.value)}
                               className="w-full bg-transparent text-sm text-white focus:outline-none mt-0.5"
                               placeholder="E.g. Grilled Chicken"
                             />
                          </div>

                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Portion</span>
                             <input 
                               value={item.portion}
                               onChange={(e) => updateItem(i, 'portion', e.target.value)}
                               className="w-full bg-transparent text-xs text-white focus:outline-none mt-0.5"
                             />
                          </div>

                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Calories</span>
                             <input 
                               type="number"
                               value={item.calories}
                               onChange={(e) => updateItem(i, 'calories', Number(e.target.value))}
                               className="w-full bg-transparent text-xs text-white focus:outline-none mt-0.5"
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
                               className="w-full bg-transparent text-xs text-white focus:outline-none mt-0.5"
                             />
                          </div>
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Carb (g)</span>
                             <input 
                               type="number"
                               value={item.carbs || 0}
                               onChange={(e) => updateItem(i, 'carbs', Number(e.target.value))}
                               className="w-full bg-transparent text-xs text-white focus:outline-none mt-0.5"
                             />
                          </div>
                          <div className="bg-neutral-900/60 rounded-xl p-2 px-3 border border-neutral-850 focus-within:border-indigo-500">
                             <span className="text-[9px] text-neutral-500 uppercase block font-bold">Fat (g)</span>
                             <input 
                               type="number"
                               value={item.fats || 0}
                               onChange={(e) => updateItem(i, 'fats', Number(e.target.value))}
                               className="w-full bg-transparent text-xs text-white focus:outline-none mt-0.5"
                             />
                          </div>
                        </div>

                        {/* Recalculate button overlay trigger */}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-850/60">
                          <span className="text-[10px] text-neutral-500 font-medium">Edits name or portion?</span>
                          <button
                            type="button"
                            disabled={recalculatingIndex !== null}
                            onClick={() => recalculateItem(i)}
                            className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider hover:text-indigo-300 disabled:opacity-50 flex items-center gap-1.5 focus:outline-none active:scale-95 transition-transform"
                          >
                            {recalculatingIndex === i ? (
                              <>
                                <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                Recalculating...
                              </>
                            ) : (
                              "Recalculate Macros"
                            )}
                          </button>
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

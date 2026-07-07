import React, { useState, useEffect } from 'react';
import { AppStep, RecipeImage, Ingredient } from './types';
import { StepCapture } from './components/StepCapture';
import { StepReview } from './components/StepReview';
import { StepShop } from './components/StepShop';
import { extractIngredientsFromImages } from './services/gemini';

const STORAGE_KEY = 'recipe_to_cart_state';

export default function App() {
  const [step, setStep] = useState<AppStep>('capture');
  const [images, setImages] = useState<RecipeImage[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.step === 'shop' && parsed.ingredients && parsed.ingredients.length > 0) {
          setStep('shop');
          setIngredients(parsed.ingredients);
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  useEffect(() => {
    if (step === 'shop') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, ingredients }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [step, ingredients]);

  const handleProcessImages = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dataUrls = images.map(img => img.dataUrl);
      const extracted = await extractIngredientsFromImages(dataUrls);
      setIngredients(extracted);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReview = () => {
    const netList = ingredients.filter(item => item.quantity > 0);
    setIngredients(netList);
    setStep('shop');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new plan? This will clear your current list.')) {
      setStep('capture');
      setImages([]);
      setIngredients([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Mobile container constraint */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 text-center">
            Recipe to Cart
          </h1>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative">
          {step === 'capture' && (
            <StepCapture 
              images={images} 
              setImages={setImages} 
              onProcess={handleProcessImages}
              isProcessing={isProcessing}
            />
          )}
          
          {step === 'review' && (
            <StepReview 
              ingredients={ingredients} 
              setIngredients={setIngredients}
              onConfirm={handleConfirmReview}
            />
          )}

          {step === 'shop' && (
            <StepShop 
              ingredients={ingredients}
              setIngredients={setIngredients}
              onReset={handleReset}
            />
          )}
        </main>

      </div>
    </div>
  );
}

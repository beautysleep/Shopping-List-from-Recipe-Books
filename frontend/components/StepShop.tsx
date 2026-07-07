import React from 'react';
import { Ingredient } from '../types';
import { ShoppingCart, CheckCircle2, Circle, RotateCcw } from 'lucide-react';

interface StepShopProps {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  onReset: () => void;
}

export const StepShop: React.FC<StepShopProps> = ({ ingredients, setIngredients, onReset }) => {
  
  const toggleCheck = (id: string) => {
    setIngredients(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const checkedCount = ingredients.filter(i => i.checked).length;
  const totalCount = ingredients.length;
  const progress = totalCount === 0 ? 0 : (checkedCount / totalCount) * 100;
  const isComplete = checkedCount === totalCount && totalCount > 0;

  return (
    <div className="flex flex-col h-full pb-24">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" />
            Shopping List
          </h2>
          <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {checkedCount} / {totalCount}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isComplete && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">All done!</h3>
              <p className="text-sm opacity-90">You've collected everything on your list. Great job!</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {ingredients.map((item) => (
            <div 
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                item.checked 
                  ? 'bg-gray-50 border-gray-200 opacity-60 scale-[0.98]' 
                  : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'
              }`}
            >
              <div className="shrink-0">
                {item.checked ? (
                  <CheckCircle2 className="text-green-500" size={28} />
                ) : (
                  <Circle className="text-gray-300" size={28} />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className={`font-semibold text-lg capitalize transition-all ${
                  item.checked ? 'text-gray-500 line-through' : 'text-gray-800'
                }`}>
                  {item.name}
                </h3>
                <p className={`text-sm ${item.checked ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        <button
          onClick={onReset}
          className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98] transition-all"
        >
          <RotateCcw size={20} />
          Start New Plan
        </button>
      </div>
    </div>
  );
};

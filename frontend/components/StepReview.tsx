import React from 'react';
import { Ingredient } from '../types';
import { Minus, Plus, ArrowRight, PackageSearch } from 'lucide-react';

interface StepReviewProps {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  onConfirm: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({ ingredients, setIngredients, onConfirm }) => {
  
  const updateQuantity = (id: string, delta: number) => {
    setIngredients(prev => prev.map(item => {
      if (item.id === id) {
        // Prevent going below 0
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Filter out items that have been reduced to 0 for the final list preview
  const activeItemsCount = ingredients.filter(i => i.quantity > 0).length;

  return (
    <div className="flex flex-col h-full pb-24">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PackageSearch className="text-blue-600" />
            Check Your Pantry
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            This is your "Gross List". Decrease the quantity for items you already have at home.
          </p>
        </div>

        <div className="space-y-3">
          {ingredients.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                item.quantity === 0 ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex-1 pr-4">
                <h3 className={`font-semibold text-lg capitalize ${item.quantity === 0 ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {item.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {item.quantity > 0 ? `${item.quantity} ${item.unit}` : 'Already have enough'}
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-2 rounded-md bg-white text-gray-600 shadow-sm hover:text-red-600 active:scale-95 transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-gray-800 w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-2 rounded-md bg-white text-gray-600 shadow-sm hover:text-blue-600 active:scale-95 transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        <button
          onClick={onConfirm}
          className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-green-600 text-white shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all"
        >
          Confirm Net List ({activeItemsCount} items)
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

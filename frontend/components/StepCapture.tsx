import React, { useRef } from 'react';
import { Camera, ImagePlus, X, Loader2, ChefHat } from 'lucide-react';
import { RecipeImage } from '../types';

interface StepCaptureProps {
  images: RecipeImage[];
  setImages: React.Dispatch<React.SetStateAction<RecipeImage[]>>;
  onProcess: () => void;
  isProcessing: boolean;
}

export const StepCapture: React.FC<StepCaptureProps> = ({ images, setImages, onProcess, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => {
        return new Promise<RecipeImage>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              dataUrl: event.target?.result as string,
              file: file
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImages).then(loadedImages => {
        setImages(prev => [...prev, ...loadedImages]);
      });
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="flex flex-col h-full pb-24">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="text-center space-y-2 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-2">
            <ChefHat size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Plan Your Shop</h2>
          <p className="text-gray-500 text-sm px-4">
            Take photos of your recipes or upload screenshots. We'll extract and combine the ingredients for you.
          </p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                <img src={img.dataUrl} alt="Recipe" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <ImagePlus size={28} className="mb-2" />
              <span className="text-sm font-medium">Add More</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
            <Camera size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium mb-1">No recipes added yet</p>
            <p className="text-gray-400 text-sm text-center mb-6">Tap below to start adding photos of your meals for the week.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <Camera size={20} />
              Open Camera / Gallery
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        <button
          onClick={onProcess}
          disabled={images.length === 0 || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            images.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Extracting Ingredients...
            </>
          ) : (
            'Create Shopping List'
          )}
        </button>
      </div>
    </div>
  );
};

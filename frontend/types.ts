export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked?: boolean;
}

export interface RecipeImage {
  id: string;
  dataUrl: string;
  file: File;
}

export type AppStep = 'capture' | 'review' | 'shop';

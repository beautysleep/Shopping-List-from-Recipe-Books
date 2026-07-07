import { GoogleGenAI, Type } from '@google/genai';
import { Ingredient } from '../types';

// Initialize the SDK. It automatically picks up process.env.API_KEY in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const extractIngredientsFromImages = async (images: string[]): Promise<Ingredient[]> => {
  if (images.length === 0) return [];

  const parts = images.map(dataUrl => {
    // Extract base64 data and mime type from data URL
    const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data URL");
    
    return {
      inlineData: {
        mimeType: match[1],
        data: match[2]
      }
    };
  });

  const prompt = `
    Analyze these recipe images. Extract all ingredients required across all recipes.
    Aggregate identical ingredients into a single item, summing their quantities. 
    If units are different but compatible (e.g., 500g and 1kg), convert them to a common unit and sum them.
    If units are incompatible, list them as separate items.
    Normalize ingredient names to be singular and lowercase (e.g., "apples" -> "apple").
    If no specific unit is given (e.g., "3 apples"), use "whole" as the unit.

    SPECIAL RULES FOR SPECIFIC INGREDIENTS:
    1. Exclude "water" entirely, as it comes from the tap. Do not include it in the final list.
    2. For salt, pepper, spices, and dried herbs (e.g., "5g of salt", "1 tsp cumin"): Do not show a specific unit amount. Set the quantity to 1 and the unit to "to taste" or "jar". 
    3. Exception to rule 2: If a herb is explicitly specified as "fresh" (e.g., "10g fresh basil"), extract the normal quantity and unit as requested.
    4. For fruits and vegetables specified by weight (e.g., "150g strawberries"), estimate the equivalent count and size and append it to the ingredient name in parentheses. For example, if the recipe asks for 150g strawberries, output name: "strawberry (10 Medium sized)", quantity: 150, unit: "g".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [...parts, { text: prompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Name of the ingredient, singular, lowercase. For fruits/veg by weight, append estimated count (e.g., 'strawberry (10 medium sized)')."
              },
              quantity: {
                type: Type.NUMBER,
                description: "Total aggregated quantity needed."
              },
              unit: {
                type: Type.STRING,
                description: "Unit of measurement (e.g., g, ml, cups, tbsp, whole, to taste, jar)."
              }
            },
            required: ["name", "quantity", "unit"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from model");

    const parsed = JSON.parse(text);
    
    // Add unique IDs to the parsed items
    return parsed.map((item: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      checked: false
    }));

  } catch (error) {
    console.error("Error extracting ingredients:", error);
    throw error;
  }
};

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  is_pantry: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateIngredientInput {
  name: string;
  unit: string;
  is_pantry?: boolean;
}

export interface UpdateIngredientInput {
  name?: string;
  unit?: string;
  is_pantry?: boolean;
}

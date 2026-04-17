export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient_name: string;
  base_unit: string;
  quantity: number;
  unit: string;
}

export interface RecipeIngredientInput {
  ingredient_id: number;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  diners: number;
  ingredient_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[];
}

export interface CreateRecipeInput {
  name: string;
  description?: string | null;
  diners?: number;
  ingredients: RecipeIngredientInput[];
}

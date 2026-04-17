export interface EventIngredientInput {
  ingredient_id: number;
  quantity: number;
  unit: string;
}

export interface EventIngredient {
  id: number;
  meal_event_id: number;
  ingredient_id: number;
  ingredient_name: string;
  base_unit: string;
  quantity: number;
  unit: string;
}

export interface MealEvent {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  ingredient_count?: number;
  created_at: string;
  updated_at: string;
}

export interface MealEventWithIngredients extends MealEvent {
  ingredients: EventIngredient[];
}

export interface CreateMealEventInput {
  name: string;
  description?: string | null;
  ingredients: EventIngredientInput[];
}

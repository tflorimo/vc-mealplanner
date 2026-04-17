export type SlotType = 'desayuno' | 'almuerzo' | 'merienda' | 'cena';

export interface MealSlot {
  id: number;
  user_id: number;
  slot_date: string;
  slot_type: SlotType;
  is_fasting: boolean;
  recipe_id: number | null;
  meal_event_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface MealSlotWithDetails extends MealSlot {
  recipe_name: string | null;
  event_name: string | null;
}

export interface UpsertSlotInput {
  is_fasting?: boolean;
  recipe_id?: number | null;
  meal_event_id?: number | null;
}

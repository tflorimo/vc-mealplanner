export interface ShoppingLineItem {
  ingredient_id: number;
  ingredient_name: string;
  total_quantity: number;
  unit: string;
}

export interface SavedShoppingList {
  id: number;
  user_id: number;
  date_from: string;
  date_to: string;
  total_slots: number;
  total_items: number;
  generated_at: string;
}

export interface ShoppingResult {
  items: ShoppingLineItem[];
  list?: SavedShoppingList;
}

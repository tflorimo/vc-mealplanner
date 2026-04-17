import api from './api';
import { MealSlotWithDetails, UpsertSlotInput, SlotType } from '../models/MealSlot';
import { formatYearMonth } from '../utils/dateHelpers';

export const mealSlotApi = {
  getByMonth: async (year: number, month: number): Promise<MealSlotWithDetails[]> => {
    const { data } = await api.get<MealSlotWithDetails[]>('/meal-slots', {
      params: { month: formatYearMonth(year, month) },
    });
    return data;
  },

  upsert: async (
    date: string,
    slotType: SlotType,
    input: UpsertSlotInput,
  ): Promise<MealSlotWithDetails> => {
    const { data } = await api.put<MealSlotWithDetails>(`/meal-slots/${date}/${slotType}`, input);
    return data;
  },

  clear: async (date: string, slotType: SlotType): Promise<void> => {
    await api.delete(`/meal-slots/${date}/${slotType}`);
  },
};

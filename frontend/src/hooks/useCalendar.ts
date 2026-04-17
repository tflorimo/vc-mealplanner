import { useState, useEffect, useCallback } from 'react';
import { MealSlotWithDetails } from '../models/MealSlot';
import { mealSlotApi } from '../services/mealSlotApi';
import { prevMonth as calcPrev, nextMonth as calcNext } from '../utils/dateHelpers';

export function useCalendar() {
  const today = new Date();
  const [year, setYear]           = useState(today.getFullYear());
  const [month, setMonth]         = useState(today.getMonth() + 1);
  const [slots, setSlots]         = useState<MealSlotWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetchSlots = useCallback(async (y: number, m: number) => {
    setIsLoading(true);
    setError(null);
    try {
      setSlots(await mealSlotApi.getByMonth(y, m));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchSlots(year, month); }, [fetchSlots, year, month]);

  const goToPrevMonth = () => {
    const { year: y, month: m } = calcPrev(year, month);
    setYear(y); setMonth(m);
  };

  const goToNextMonth = () => {
    const { year: y, month: m } = calcNext(year, month);
    setYear(y); setMonth(m);
  };

  const goToNextMonthFromNow = () => {
    const { year: y, month: m } = calcNext(today.getFullYear(), today.getMonth() + 1);
    setYear(y); setMonth(m);
  };

  const refresh = () => fetchSlots(year, month);

  // Índice por fecha+tipo para O(1) lookup en el render del calendario
  const slotMap = new Map(
    slots.map((s) => [`${s.slot_date}:${s.slot_type}`, s]),
  );

  return {
    year, month, slots, slotMap, isLoading, error,
    goToPrevMonth, goToNextMonth, goToNextMonthFromNow, refresh,
  };
}

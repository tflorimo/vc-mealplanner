import { useState } from 'react';
import { SlotType } from '../models/MealSlot';
import { useCalendar } from '../hooks/useCalendar';
import { useRecipes } from '../hooks/useRecipes';
import { mealSlotApi } from '../services/mealSlotApi';
import MonthlyCalendar from '../components/calendar/MonthlyCalendar';
import SlotModal from '../components/calendar/SlotModal';

export default function CalendarPage() {
  const {
    year, month, slotMap,
    isLoading, error,
    goToPrevMonth, goToNextMonth,
    refresh,
  } = useCalendar();

  const { recipes } = useRecipes();

  const [modalDate, setModalDate]   = useState<string | null>(null);
  const [modalSlot, setModalSlot]   = useState<SlotType | null>(null);
  const [updatingSlots, setUpdatingSlots] = useState<Set<string>>(new Set());

  // Helpers para marcar qué slots están en vuelo
  const markUpdating = (key: string) =>
    setUpdatingSlots((prev) => new Set(prev).add(key));

  const unmarkUpdating = (key: string) =>
    setUpdatingSlots((prev) => { const s = new Set(prev); s.delete(key); return s; });

  const handleSlotClick = (date: string, slotType: SlotType) => {
    setModalDate(date);
    setModalSlot(slotType);
  };

  const handleFastingToggle = async (date: string, slotType: SlotType, isFasting: boolean) => {
    const key = `${date}:${slotType}`;
    markUpdating(key);
    try {
      await mealSlotApi.upsert(date, slotType, { is_fasting: isFasting });
      await refresh();
    } catch (err) {
      console.error('Error al actualizar ayuno:', err);
    } finally {
      unmarkUpdating(key);
    }
  };

  const handleAssignRecipe = async (recipeId: number) => {
    if (!modalDate || !modalSlot) return;
    await mealSlotApi.upsert(modalDate, modalSlot, { recipe_id: recipeId, is_fasting: false });
    await refresh();
  };

  const handleClearSlot = async () => {
    if (!modalDate || !modalSlot) return;
    const slot = slotMap.get(`${modalDate}:${modalSlot}`);
    if (slot) {
      await mealSlotApi.clear(modalDate, modalSlot);
      await refresh();
    }
  };

  const handleCloseModal = () => {
    setModalDate(null);
    setModalSlot(null);
  };

  const currentSlot = modalDate && modalSlot
    ? slotMap.get(`${modalDate}:${modalSlot}`)
    : undefined;

  return (
    <>
      <MonthlyCalendar
        year={year}
        month={month}
        slotMap={slotMap}
        isLoading={isLoading}
        error={error}
        updatingSlots={updatingSlots}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onSlotClick={handleSlotClick}
        onFastingToggle={(date, slotType, isFasting) => {
          void handleFastingToggle(date, slotType, isFasting);
        }}
      />

      <SlotModal
        isOpen={modalDate !== null}
        date={modalDate}
        slotType={modalSlot}
        currentSlot={currentSlot}
        recipes={recipes}
        onClose={handleCloseModal}
        onAssignRecipe={handleAssignRecipe}
        onClear={handleClearSlot}
      />
    </>
  );
}

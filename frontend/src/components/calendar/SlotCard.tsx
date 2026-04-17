import { MealSlotWithDetails } from '../../models/MealSlot';
import { SlotType } from '../../models/MealSlot';
import { SLOT_LABELS, SLOT_COLORS } from '../../constants/mealSlots';
import FastingToggle from './FastingToggle';

interface SlotCardProps {
  slotType: SlotType;
  slot: MealSlotWithDetails | undefined;
  isUpdating?: boolean;
  onClick: () => void;
  onFastingToggle: (isFasting: boolean) => void;
}

export default function SlotCard({
  slotType,
  slot,
  isUpdating = false,
  onClick,
  onFastingToggle,
}: SlotCardProps) {
  const isFasting  = slot?.is_fasting ?? false;
  const label      = SLOT_LABELS[slotType];
  const colors     = SLOT_COLORS[slotType];
  const hasContent = slot?.recipe_id != null || slot?.meal_event_id != null;
  const contentName = slot?.recipe_name ?? slot?.event_name;

  return (
    <div
      onClick={isFasting ? undefined : onClick}
      className={`
        rounded-lg border p-2 transition-all min-h-[56px]
        ${isFasting
          ? 'bg-gray-100 border-gray-200 opacity-60 cursor-default'
          : hasContent
            ? `${colors.bg} ${colors.border} border cursor-pointer hover:shadow-sm active:scale-[0.99]`
            : 'bg-white border-dashed border-gray-200 cursor-pointer hover:border-gray-400 hover:bg-gray-50'
        }
        ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-1">
        {/* Tipo de slot y contenido */}
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-semibold uppercase tracking-wide ${isFasting ? 'text-gray-400' : colors.text}`}>
            {label}
          </span>
          {isFasting ? (
            <p className="text-xs text-gray-400 mt-0.5 italic">Ayuno</p>
          ) : contentName ? (
            <p className="text-xs text-gray-700 mt-0.5 truncate font-medium">{contentName}</p>
          ) : (
            <p className="text-xs text-gray-300 mt-0.5">+ Agregar</p>
          )}
        </div>

        {/* Toggle de ayuno */}
        <FastingToggle
          isFasting={isFasting}
          onChange={onFastingToggle}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}

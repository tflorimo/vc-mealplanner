import { SlotType } from '../../models/MealSlot';
import { MealSlotWithDetails } from '../../models/MealSlot';
import { SLOT_TYPES } from '../../constants/mealSlots';
import SlotCard from './SlotCard';
import { formatDate, isToday } from '../../utils/dateHelpers';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  slotMap: Map<string, MealSlotWithDetails>;
  updatingSlots: Set<string>;
  onSlotClick: (date: string, slotType: SlotType) => void;
  onFastingToggle: (date: string, slotType: SlotType, isFasting: boolean) => void;
}

export default function DayCell({
  date,
  isCurrentMonth,
  slotMap,
  updatingSlots,
  onSlotClick,
  onFastingToggle,
}: DayCellProps) {
  const dateStr  = formatDate(date);
  const today    = isToday(date);

  return (
    <div className={`min-h-[140px] p-1.5 border-b border-r border-gray-100 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50/60'}`}>
      {/* Número del día */}
      <div className="flex justify-end mb-1">
        <span
          className={`
            text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
            ${today
              ? 'bg-primary-600 text-white'
              : isCurrentMonth
                ? 'text-gray-700'
                : 'text-gray-300'
            }
          `}
        >
          {date.getDate()}
        </span>
      </div>

      {/* Slots */}
      <div className="space-y-1">
        {SLOT_TYPES.map((slotType) => {
          const key  = `${dateStr}:${slotType}`;
          const slot = slotMap.get(key);
          return (
            <SlotCard
              key={slotType}
              slotType={slotType}
              slot={slot}
              isUpdating={updatingSlots.has(key)}
              onClick={() => onSlotClick(dateStr, slotType)}
              onFastingToggle={(isFasting) => onFastingToggle(dateStr, slotType, isFasting)}
            />
          );
        })}
      </div>
    </div>
  );
}

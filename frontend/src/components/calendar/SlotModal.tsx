import { useState } from 'react';
import { MealSlotWithDetails, SlotType } from '../../models/MealSlot';
import { Recipe } from '../../models/Recipe';
import { MealEvent, CreateMealEventInput } from '../../models/MealEvent';
import { SLOT_LABELS } from '../../constants/mealSlots';
import Modal from '../shared/Modal';
import MealEventForm from './MealEventForm';

type Tab = 'recipe' | 'event';

interface SlotModalProps {
  isOpen: boolean;
  date: string | null;
  slotType: SlotType | null;
  currentSlot: MealSlotWithDetails | undefined;
  recipes: Recipe[];
  events: MealEvent[];
  onClose: () => void;
  onAssignRecipe: (recipeId: number) => Promise<void>;
  onAssignEvent: (eventId: number) => Promise<void>;
  onCreateAndAssignEvent: (data: CreateMealEventInput) => Promise<void>;
  onClear: () => Promise<void>;
}

export default function SlotModal({
  isOpen, date, slotType, currentSlot,
  recipes, events,
  onClose, onAssignRecipe, onAssignEvent, onCreateAndAssignEvent, onClear,
}: SlotModalProps) {
  const [tab, setTab]               = useState<Tab>('recipe');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [eventSearch, setEventSearch]   = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [isWorking, setIsWorking]     = useState(false);

  if (!date || !slotType) return null;

  const label = SLOT_LABELS[slotType];

  const filteredRecipes = recipeSearch.trim()
    ? recipes.filter((r) => r.name.toLowerCase().includes(recipeSearch.trim().toLowerCase()))
    : recipes;

  const filteredEvents = eventSearch.trim()
    ? events.filter((e) => e.name.toLowerCase().includes(eventSearch.trim().toLowerCase()))
    : events;

  const wrap = async (fn: () => Promise<void>) => {
    setIsWorking(true);
    try { await fn(); onClose(); }
    finally { setIsWorking(false); }
  };

  const handleClose = () => {
    setRecipeSearch('');
    setEventSearch('');
    setShowEventForm(false);
    setTab('recipe');
    onClose();
  };

  const handleCreateEvent = async (data: CreateMealEventInput) => {
    await wrap(() => onCreateAndAssignEvent(data));
  };

  const hasContent = currentSlot?.recipe_id != null || currentSlot?.meal_event_id != null;

  return (
    <Modal isOpen={isOpen} title={`${label} — ${date}`} onClose={handleClose} size="md">
      {/* Asignación actual */}
      {hasContent && !currentSlot?.is_fasting && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-between gap-2">
          <span className="text-sm text-primary-800">
            Actual:{' '}
            <span className="font-semibold">
              {currentSlot?.recipe_name ?? currentSlot?.event_name}
            </span>
            {currentSlot?.meal_event_id && (
              <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                evento
              </span>
            )}
          </span>
          <button
            onClick={() => { void wrap(onClear); }}
            disabled={isWorking}
            className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 shrink-0"
          >
            Quitar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {(['recipe', 'event'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowEventForm(false); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'recipe' ? 'Receta' : 'Evento'}
          </button>
        ))}
      </div>

      {/* Tab: Receta */}
      {tab === 'recipe' && (
        <div className="space-y-3">
          <input
            type="text"
            value={recipeSearch}
            onChange={(e) => setRecipeSearch(e.target.value)}
            placeholder="Buscar receta..."
            className="input-base"
          />
          <div className="space-y-1 max-h-64 overflow-y-auto -mx-1 px-1">
            {filteredRecipes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                {recipes.length === 0 ? 'No hay recetas. Creá una en Recetas.' : 'Sin resultados.'}
              </p>
            ) : (
              filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => { void wrap(() => onAssignRecipe(recipe.id)); }}
                  disabled={isWorking}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${currentSlot?.recipe_id === recipe.id
                      ? 'bg-primary-100 text-primary-800 font-medium ring-1 ring-primary-300'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium truncate">{recipe.name}</span>
                    <span className="text-gray-300 text-xs shrink-0">{recipe.diners} com.</span>
                  </div>
                  {recipe.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{recipe.description}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Evento */}
      {tab === 'event' && (
        <div className="space-y-3">
          {!showEventForm ? (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Buscar evento..."
                  className="input-base flex-1"
                />
                <button
                  onClick={() => setShowEventForm(true)}
                  className="btn-secondary text-sm shrink-0"
                >
                  + Nuevo
                </button>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto -mx-1 px-1">
                {filteredEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    {events.length === 0
                      ? 'No hay eventos. Creá uno con "+ Nuevo".'
                      : 'Sin resultados.'}
                  </p>
                ) : (
                  filteredEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => { void wrap(() => onAssignEvent(event.id)); }}
                      disabled={isWorking}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
                        ${currentSlot?.meal_event_id === event.id
                          ? 'bg-primary-100 text-primary-800 font-medium ring-1 ring-primary-300'
                          : 'hover:bg-gray-50 text-gray-700'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium truncate">{event.name}</span>
                        {event.ingredient_count !== undefined && (
                          <span className="text-gray-300 text-xs shrink-0">
                            {event.ingredient_count} ing.
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <MealEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowEventForm(false)}
              isSubmitting={isWorking}
            />
          )}
        </div>
      )}
    </Modal>
  );
}

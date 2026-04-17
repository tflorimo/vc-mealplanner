import { useState } from 'react';
import { MealSlotWithDetails, SlotType } from '../../models/MealSlot';
import { Recipe } from '../../models/Recipe';
import { SLOT_LABELS } from '../../constants/mealSlots';
import Modal from '../shared/Modal';

interface SlotModalProps {
  isOpen: boolean;
  date: string | null;
  slotType: SlotType | null;
  currentSlot: MealSlotWithDetails | undefined;
  recipes: Recipe[];
  onClose: () => void;
  onAssignRecipe: (recipeId: number) => Promise<void>;
  onClear: () => Promise<void>;
}

export default function SlotModal({
  isOpen, date, slotType, currentSlot,
  recipes, onClose, onAssignRecipe, onClear,
}: SlotModalProps) {
  const [search, setSearch]       = useState('');
  const [isWorking, setIsWorking] = useState(false);

  if (!date || !slotType) return null;

  const label    = SLOT_LABELS[slotType];
  const filtered = search.trim()
    ? recipes.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
    : recipes;

  const handleAssign = async (recipeId: number) => {
    setIsWorking(true);
    try {
      await onAssignRecipe(recipeId);
      onClose();
    } finally {
      setIsWorking(false);
    }
  };

  const handleClear = async () => {
    setIsWorking(true);
    try {
      await onClear();
      onClose();
    } finally {
      setIsWorking(false);
    }
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} title={`${label} — ${date}`} onClose={handleClose} size="md">
      {/* Asignación actual */}
      {currentSlot?.recipe_name && !currentSlot.is_fasting && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-primary-800">
            Receta actual: <span className="font-semibold">{currentSlot.recipe_name}</span>
          </span>
          <button
            onClick={() => { void handleClear(); }}
            disabled={isWorking}
            className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 shrink-0"
          >
            Quitar
          </button>
        </div>
      )}

      {/* Opción limpiar si hay slot sin receta/evento */}
      {currentSlot && !currentSlot.recipe_name && !currentSlot.meal_event_id && !currentSlot.is_fasting && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={() => { void handleClear(); }}
            disabled={isWorking}
            className="text-xs text-gray-400 hover:text-red-500 font-medium disabled:opacity-50"
          >
            Limpiar slot
          </button>
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar receta..."
          className="input-base"
        />
      </div>

      {/* Lista de recetas */}
      <div className="space-y-1 max-h-72 overflow-y-auto -mx-1 px-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            {recipes.length === 0
              ? 'No hay recetas. Creá una en la sección Recetas.'
              : 'Sin resultados para esa búsqueda.'}
          </p>
        ) : (
          filtered.map((recipe) => {
            const isActive = currentSlot?.recipe_id === recipe.id;
            return (
              <button
                key={recipe.id}
                onClick={() => { void handleAssign(recipe.id); }}
                disabled={isWorking}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors
                  ${isActive
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
            );
          })
        )}
      </div>
    </Modal>
  );
}

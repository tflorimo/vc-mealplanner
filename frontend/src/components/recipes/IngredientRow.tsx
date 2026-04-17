import { Ingredient } from '../../models/Ingredient';
import { RecipeIngredientInput } from '../../models/Recipe';
import IngredientAutocomplete from '../ingredients/IngredientAutocomplete';

const UNITS = ['kg', 'g', 'L', 'ml', 'u'] as const;

interface IngredientRowProps {
  value: { ingredient: Ingredient | null; quantity: string; unit: string };
  onChange: (updated: { ingredient: Ingredient | null; quantity: string; unit: string }) => void;
  onRemove: () => void;
}

// Una fila en el formulario de receta: ingrediente + cantidad + unidad + botón eliminar.
export default function IngredientRow({ value, onChange, onRemove }: IngredientRowProps) {
  return (
    <div className="flex gap-2 items-start">
      {/* Autocompletado de ingrediente */}
      <div className="flex-1 min-w-0">
        <IngredientAutocomplete
          value={value.ingredient}
          onChange={(ing) => onChange({ ...value, ingredient: ing })}
          placeholder="Ingrediente..."
        />
      </div>

      {/* Cantidad */}
      <input
        type="number"
        min="0.001"
        step="0.001"
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: e.target.value })}
        placeholder="Cant."
        className="input-base w-24 shrink-0"
      />

      {/* Unidad */}
      <select
        value={value.unit}
        onChange={(e) => onChange({ ...value, unit: e.target.value })}
        className="input-base w-20 shrink-0"
      >
        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>

      {/* Eliminar */}
      <button
        type="button"
        onClick={onRemove}
        className="mt-1 text-gray-400 hover:text-red-500 shrink-0"
        aria-label="Eliminar ingrediente"
      >
        ✕
      </button>
    </div>
  );
}

// Helper: convierte el estado del row a RecipeIngredientInput (o null si incompleto)
export function rowToInput(row: IngredientRowProps['value']): RecipeIngredientInput | null {
  if (!row.ingredient || !row.quantity || Number(row.quantity) <= 0) return null;
  return {
    ingredient_id: row.ingredient.id,
    quantity: Number(row.quantity),
    unit: row.unit,
  };
}

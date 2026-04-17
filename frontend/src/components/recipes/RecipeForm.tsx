import { useState } from 'react';
import { RecipeWithIngredients, CreateRecipeInput } from '../../models/Recipe';
import { Ingredient } from '../../models/Ingredient';
import IngredientRow, { rowToInput } from './IngredientRow';
import ErrorBanner from '../shared/ErrorBanner';

type RowState = { ingredient: Ingredient | null; quantity: string; unit: string };

const emptyRow = (): RowState => ({ ingredient: null, quantity: '', unit: 'kg' });

interface RecipeFormProps {
  initialData?: RecipeWithIngredients;
  onSubmit: (data: CreateRecipeInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function RecipeForm({ initialData, onSubmit, onCancel, isSubmitting }: RecipeFormProps) {
  const [name, setName]         = useState(initialData?.name ?? '');
  const [description, setDesc]  = useState(initialData?.description ?? '');
  const [diners, setDiners]     = useState(initialData?.diners ?? 2);
  const [rows, setRows]         = useState<RowState[]>(
    initialData?.ingredients.length
      ? initialData.ingredients.map((i) => ({
          ingredient: { id: i.ingredient_id, name: i.ingredient_name, unit: i.base_unit, is_pantry: false, created_at: '', updated_at: '' },
          quantity: String(i.quantity),
          unit: i.unit,
        }))
      : [emptyRow()],
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const UNIT_GROUP: Record<string, string> = {
    kg: 'masa', g: 'masa', L: 'volumen', ml: 'volumen', u: 'pieza',
  };

  // Detecta el mismo ingrediente con unidades de grupos distintos dentro de la receta
  const unitWarnings: string[] = (() => {
    const seen = new Map<number, string>();
    const warnings: string[] = [];
    for (const row of rows) {
      if (!row.ingredient) continue;
      const id = row.ingredient.id;
      const group = UNIT_GROUP[row.unit] ?? row.unit;
      if (seen.has(id)) {
        const prevGroup = seen.get(id)!;
        if (prevGroup !== group) {
          warnings.push(
            `"${row.ingredient.name}" tiene unidades incompatibles (${prevGroup} y ${group}) — no se puede guardar.`,
          );
        } else {
          warnings.push(
            `"${row.ingredient.name}" aparece dos veces con unidades compatibles — se sumarán al calcular compras.`,
          );
        }
      } else {
        seen.set(id, group);
      }
    }
    return warnings;
  })();

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const updateRow = (index: number, updated: RowState) => {
    setRows((prev) => prev.map((r, i) => (i === index ? updated : r)));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.length === 1 ? [emptyRow()] : prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) { setValidationError('El nombre de la receta es requerido.'); return; }

    const ingredients = rows.map(rowToInput).filter((r): r is NonNullable<typeof r> => r !== null);

    if (ingredients.length === 0) {
      setValidationError('La receta debe tener al menos un ingrediente completo.');
      return;
    }

    const incompatible = unitWarnings.some(w => w.includes('incompatibles'));
    if (incompatible) {
      setValidationError('Corregí las unidades incompatibles antes de guardar.');
      return;
    }

    const incompleteRows = rows.filter((r) => r.ingredient !== null && rowToInput(r) === null);
    if (incompleteRows.length > 0) {
      setValidationError('Hay filas de ingredientes incompletas. Completalas o eliminalas.');
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      diners,
      ingredients,
    });
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5">
      {validationError && <ErrorBanner message={validationError} onDismiss={() => setValidationError(null)} />}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Milanesas con puré"
          className="input-base"
          maxLength={200}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          placeholder="Notas opcionales..."
          className="input-base resize-none"
        />
      </div>

      {/* Comensales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comensales</label>
        <input
          type="number"
          value={diners}
          onChange={(e) => setDiners(Math.max(1, Number(e.target.value)))}
          min={1} max={20}
          className="input-base w-24"
        />
      </div>

      {/* Ingredientes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredientes *
          <span className="text-xs text-gray-400 ml-2">Solo del maestro de ingredientes</span>
        </label>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <IngredientRow key={i} value={row} onChange={(u) => updateRow(i, u)} onRemove={() => removeRow(i)} />
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          + Agregar ingrediente
        </button>

        {/* Advertencias de unidades */}
        {unitWarnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {unitWarnings.map((w, i) => (
              <div
                key={i}
                className={`text-xs px-3 py-2 rounded-md ${
                  w.includes('incompatibles')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {w}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear receta'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}

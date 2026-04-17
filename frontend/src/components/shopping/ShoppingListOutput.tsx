import { ShoppingLineItem as LineItemComponent } from './ShoppingLineItem';
import { ShoppingLineItem, SavedShoppingList } from '../../models/ShoppingList';

interface Props {
  items: ShoppingLineItem[];
  savedList: SavedShoppingList | null;
  loading: boolean;
  error: string | null;
  lastRange: { from: string; to: string } | null;
}

export function ShoppingListOutput({ items, savedList, loading, error, lastRange }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Calculando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!lastRange) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        Seleccioná un rango y presioná Calcular
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No hay ingredientes para este rango de fechas
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">
          {items.length} {items.length === 1 ? 'ingrediente' : 'ingredientes'}
        </h3>
        {savedList && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            Guardado
          </span>
        )}
      </div>

      <ul className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 px-4">
        {items.map(item => (
          <LineItemComponent key={item.ingredient_id} item={item} />
        ))}
      </ul>
    </div>
  );
}

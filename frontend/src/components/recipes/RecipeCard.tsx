import { Recipe } from '../../models/Recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
}

export default function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la receta "${recipe.name}"?`)) {
      onDelete(recipe.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{recipe.name}</h3>
          {recipe.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
          )}
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>{recipe.diners} comensal{recipe.diners !== 1 ? 'es' : ''}</span>
            {recipe.ingredient_count !== undefined && (
              <span>{recipe.ingredient_count} ingrediente{recipe.ingredient_count !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(recipe)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
            aria-label="Editar receta"
            title="Editar"
          >
            ✎
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            aria-label="Eliminar receta"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

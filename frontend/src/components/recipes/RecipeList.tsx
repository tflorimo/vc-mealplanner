import { Recipe } from '../../models/Recipe';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
}

export default function RecipeList({ recipes, onEdit, onDelete }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No hay recetas todavía.</p>
        <p className="text-sm mt-1">Creá una usando el botón de arriba.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

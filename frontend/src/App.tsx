import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/shared/NavBar';
import CalendarPage from './pages/CalendarPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import IngredientsPage from './pages/IngredientsPage';

// ShoppingPage llega en Fase 4
function ShoppingPlaceholder() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-700">Lista de Compras</h1>
        <p className="text-gray-400 mt-2">Disponible en la Fase 4.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/"            element={<CalendarPage />} />
          <Route path="/recipes"     element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/shopping"    element={<ShoppingPlaceholder />} />
          {/* Redirigir rutas desconocidas al calendario */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

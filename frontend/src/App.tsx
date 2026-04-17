import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/shared/NavBar';
import CalendarPage from './pages/CalendarPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import IngredientsPage from './pages/IngredientsPage';
import { ShoppingPage } from './pages/ShoppingPage';

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
          <Route path="/shopping"    element={<ShoppingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

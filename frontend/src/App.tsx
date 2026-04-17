import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/shared/NavBar';

// Las páginas se implementarán en la Fase 2.
// Por ahora, placeholders para que el routing funcione.
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-700">{title}</h1>
        <p className="text-gray-400 mt-2">Próximamente...</p>
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
          <Route path="/" element={<PlaceholderPage title="Calendario" />} />
          <Route path="/recipes" element={<PlaceholderPage title="Recetas" />} />
          <Route path="/recipes/new" element={<PlaceholderPage title="Nueva Receta" />} />
          <Route path="/recipes/:id" element={<PlaceholderPage title="Editar Receta" />} />
          <Route path="/ingredients" element={<PlaceholderPage title="Ingredientes" />} />
          <Route path="/shopping" element={<PlaceholderPage title="Lista de Compras" />} />
          {/* Redirigir rutas desconocidas al calendario */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

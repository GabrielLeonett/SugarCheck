import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, useEffect } from 'react';
import ThemeWrapperContext from "./contexts/ThemeContext";
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from "./features/home";
import Login from "./features/login";


function App() {
  const refresh = useAuthStore((state) => state.refresh);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  useEffect(() => {
    const verifySession = async () => {
      try {
        await refresh();
      } catch (err) {
        console.log("Sin sesión previa activa.");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [refresh, setLoading]);

  if (isAuthLoading) {
    return <div>Cargando aplicación...</div>; // O un spinner estético
  }
  return (
    <Suspense fallback={<div>Cargando...</div>}>
    <ThemeWrapperContext>
      <Router>
        <Routes>
          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<Home />} />
          </Route>
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </ThemeWrapperContext>
    </Suspense>
  );
}

export default App;
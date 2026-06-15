import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, useEffect } from 'react';
import ThemeWrapperContext from "./contexts/ThemeContext";
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from "./features/Home";
import Login from "./features/Login";
import { PublicRoute } from "./components/shared/PublicRoute";
import Register from "./features/Register";
import ForgotPassword from "./features/ForgotPassword";
import Insulina from "./features/insulina"
import "./App.css";
import { PhysicalMonitoringPage } from "./features/MonitoreoFisico/pagesIMC/MonitoreoFisicoPage";

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
          <Route element={<PublicRoute/>}>
            <Route path='/login' element={<Login />} />
            <Route path='/olvidoContrasena' element={<ForgotPassword />} />
            <Route path='/register' element={<Register />} />
            <Route path= '/MonitoreoFisico' element={<PhysicalMonitoringPage />} />
          </Route>
          </Routes>
        </Router>
      </ThemeWrapperContext>
    </Suspense>
  );
}

export default App;
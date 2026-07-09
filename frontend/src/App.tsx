import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, useEffect } from 'react';
import ThemeWrapperContext from "./contexts/ThemeContext";
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from "./features/Home";
import Login from "./features/Login";
import { PublicRoute } from "./components/shared/PublicRoute";
import Register from "./features/Register";
import Insulina from "./features/Insulina/insulina"
import { PhysicalMonitoringPage } from "./features/MonitoreoFisico/pagesIMC/MonitoreoFisicoPage";
import Glucosa from "./features/ControlDeGlucosa/ControlDeGlucosaPage";
import ForgotPassword from "./features/ForgotPassword";
import { Camino } from "./features/Camino/Camino";
import "./App.css";
import { Profile } from "./features/Profile/Profile";
import { ChatIA } from "./features/ChatIA/Oraculo";


function App() {
  const refresh = useAuthStore((state) => state.refresh);
  const setLoading = useAuthStore((state) => state.setLoading);
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  useEffect(() => {
    const verifySession = async () => {
      try {
        // En tus componentes que hacen fetch:
        if (!user) return; // <--- ESTO EVITA LA PETICIÓN SI NO HAY SESIÓN
        await refresh();
      } catch (err) {
        console.log("Sin sesión previa activa.");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [refresh, setLoading, user]);

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
              <Route path="perfil" element={<Profile />} />
              {/* Quitamos la barra inicial en los hijos */}
              <Route path="bitacora">
                <Route path="control-glucosa" element={<Glucosa />} />
                <Route path="monitoreo-fisico" element={<PhysicalMonitoringPage />} />
                <Route path="dosis-insulina" element={<Insulina />} />
              </Route>
              <Route path="agente">
                <Route path="camino" element={<Camino />} />
              </Route>
            </Route>

                 <Route path="agente">
                 <Route path="oraculo-chat" element={<ChatIA />} />

               </Route>

             {/* Rutas Públicas */}
             <Route element={<PublicRoute />}>
               <Route path="/login" element={<Login />} />
               <Route path="/olvidoContrasena" element={<ForgotPassword />} />
               <Route path="/register" element={<Register />} />
             </Route>
           </Routes>
         </Router>
       </ThemeWrapperContext>
     </Suspense>
   );
}

export default App;
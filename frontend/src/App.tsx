import { useTranslation } from "react-i18next";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, useEffect } from 'react';
import ThemeWrapperContext from "./contexts/ThemeContext";
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from "./features/Home";
import Login from "./features/Login";
import { PublicRoute } from "./components/shared/PublicRoute";
import Register from "./features/Register";
import Insulina from "./features/insulina"
import { PhysicalMonitoringPage } from "./features/MonitoreoFisico/pagesIMC/MonitoreoFisicoPage";
import Glucosa from "./features/ControlDeGlucosa/ControlDeGlucosaPage";
import ForgotPassword from "./features/ForgotPassword";
import { Camino } from "./features/Camino/Camino";
import "./App.css";
import { Profile } from "./features/Profile/Profile";
import { LoadingScreen } from "./components/ui/LoadingScreen";

function App() {
  const { t } = useTranslation("common");
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

  return (
    <ThemeWrapperContext>
      {isAuthLoading ? (
        <LoadingScreen message={t("verificandoSesion")} />
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <Router>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route index element={<Home />} />
                <Route path="perfil" element={<Profile />} />
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
                 <Route path="oraculo-chat" element={<Oraculo />} />

               </Route>

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
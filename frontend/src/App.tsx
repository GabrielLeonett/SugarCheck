import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, useEffect } from 'react';
import ThemeWrapperContext from "./contexts/ThemeContext";
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from "./features/dsakfjafdsjksdfjl";
import Login from "./features/dfkjalfsdadfsjl";
import { PublicRoute } from "./components/shared/PublicRoute";
import Register from "./features/Register";
import Insulina from "./features/Insulina/insulina"
import "./App.css";
import { PhysicalMonitoringPage } from "./features/MonitoreoFisico/pagesIMC/MonitoreoFisicoPage";
import "./App.css";
import ForgotPassword from "./features/dfkjlashjdskfala";
import Glucosa from "./features/ControldeGlucosa";
import AnimationCharge from "./components/shared/AnimationCharge";
import Oraculo from "./features/ChatIA/Oraculo";

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
    return <AnimationCharge />;  } 
     return (
     <Suspense fallback={<div>Cargando...</div>}>
       <ThemeWrapperContext>
         <Router>
           <Routes>
             {/* Rutas Protegidas */}
             <Route element={<ProtectedRoute />}>
               <Route index element={<Home />} />
               {/* Quitamos la barra inicial en los hijos */}
               <Route path="bitacora">
                 <Route path="control-glucosa" element={<Glucosa />} />
                 <Route path="monitoreo-fisico" element={<PhysicalMonitoringPage />} />
                 <Route path="dosis-insulina" element={<Insulina />} />
                 <Route path="oraculo-chat" element={<Oraculo />} />

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
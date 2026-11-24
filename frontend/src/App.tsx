import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from 'react';
import ThemeWrapperContext from "./contexts/ThemeContext";
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from "./features/Home";
import Welcome from "./features/Welcome/Welcome";
import RouteSeo from "./seo/RouteSeo";
import Login from "./features/Login";
import { PublicRoute } from "./components/shared/PublicRoute";
import Register from "./features/Register";
import CompleteRegistration from "./features/CompleteRegistration";
import Insulina from "./features/Insulina/insulina"
import { PhysicalMonitoringPage } from "./features/MonitoreoFisico/pagesIMC/MonitoreoFisicoPage";
import Glucosa from "./features/ControlDeGlucosa/ControlDeGlucosaPage";
import ForgotPassword from "./features/ForgotPassword";
import ResetPassword from "./features/ResetPassword";
import { Camino } from "./features/Camino/Camino";
import ChatIA from "./features/ChatIA/Oraculo";
import "./App.css";
import { Profile } from "./features/Profile/Profile";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { useTranslation } from "react-i18next";
import ToastProvider from "./components/shared/ToastProvider";
import CookieConsent from "./components/shared/CookieConsent";
import PrivacyPolicy from "./features/Legal/PrivacyPolicy";
import TermsConditions from "./features/Legal/TermsConditions";
import CookiePolicy from "./features/Legal/CookiePolicy";

function RootRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <Home /> : <Welcome />;
}

function App() {
  const { t } = useTranslation("common");
  const refresh = useAuthStore((state) => state.refresh);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  // Las páginas públicas deben renderizarse de inmediato para visitantes y
  // rastreadores, sin esperar a que el backend responda a la verificación de sesión.
  const publicPathsWhileLoading = [
    "/",
    "/login",
    "/register",
    "/privacidad",
    "/terminos",
    "/cookies",
    "/olvidoContrasena",
    "/restablecer-contrasena",
  ];
  const currentPath =
    window.location.pathname.replace(/\/+$/, "") || "/";
  const canRenderWhileLoading = publicPathsWhileLoading.includes(currentPath);

  useEffect(() => {
    const verifySession = async () => {
      try {
        await refresh();
      } catch {
        console.log("Sin sesión previa activa.");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [refresh, setLoading]);

  return (
    <ThemeWrapperContext>
{isAuthLoading && !canRenderWhileLoading ? (
        <LoadingScreen message={t("verificandoSesion")} />
      ) : (
        <>
        <Suspense fallback={<LoadingScreen />}>
          <Router>
            <RouteSeo />
            <Routes>
              <Route path="/" element={<RootRoute />} />

              <Route element={<ProtectedRoute />}>
                <Route path="completar-registro" element={<CompleteRegistration />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="bitacora">
                  <Route path="control-glucosa" element={<Glucosa />} />
                  <Route path="monitoreo-fisico" element={<PhysicalMonitoringPage />} />
                  <Route path="dosis-insulina" element={<Insulina />} />
                </Route>
                <Route path="agente">
                  <Route path="camino" element={<Camino />} />
                  <Route path="oraculo-chat" element={<ChatIA />} />
                </Route>
              </Route>

             <Route element={<PublicRoute />}>
               <Route path="/login" element={<Login />} />
               <Route path="/olvidoContrasena" element={<ForgotPassword />} />
               <Route path="/restablecer-contrasena" element={<ResetPassword />} />
               <Route path="/register" element={<Register />} />
             </Route>

             <Route path="/privacidad" element={<PrivacyPolicy />} />
             <Route path="/terminos" element={<TermsConditions />} />
             <Route path="/cookies" element={<CookiePolicy />} />

             <Route path="*" element={<Navigate to="/" replace />} />
           </Routes>
           <CookieConsent />
          </Router>
        </Suspense>
        <ToastProvider />
        </>
      )}
   </ThemeWrapperContext>
   );
}

export default App;
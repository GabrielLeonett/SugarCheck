import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const ProtectedRoute = () => {
    const location = useLocation();
    const accessToken = useAuthStore((state) => state.accessToken);
    return (
        accessToken
            ? <Outlet /> // Renderiza las rutas hijas si está autenticado
            : <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default ProtectedRoute;
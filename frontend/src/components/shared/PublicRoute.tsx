import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export const PublicRoute = () => {
    const accessToken = useAuthStore((state) => state.accessToken);

    return accessToken ? <Navigate to="/" replace /> : <Outlet />;
};
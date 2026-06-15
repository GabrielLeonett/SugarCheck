// components/shared/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export const PublicRoute = () => {
    const user = useAuthStore((state) => state.user);

    return user ? <Navigate to="/" replace /> : <Outlet />;
};
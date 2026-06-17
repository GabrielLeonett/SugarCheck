import { Button, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import type { NavItem } from "../../types/types";

export default function NavBarItem({ item }: { item: NavItem }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === item.href;
    return (
        <Button
            key={item.name}
            component="a"
            onClick={() => item.href && navigate(item.href)}
            startIcon={item.icon}
            sx={{
                bgcolor: isActive ? "primary.main" : "primary.light",
                color: "text.primary",
                borderRadius: "4px",
                px: 2,
                py: 1,
                textTransform: "none",
                "&:hover": {
                    bgcolor: "primary.main", // Ajusta el color al pasar el mouse
                    opacity: 0.9
                }
            }}
        >
            <Typography variant="subtitle2" component="span">
                {item.name}
            </Typography>
        </Button>
    )
}
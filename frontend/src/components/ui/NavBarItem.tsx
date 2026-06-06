import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { NavItemWithSubmenu } from "../../types/types";

export default function NavBarItem({ item }: { item: NavItemWithSubmenu }) {
    const navigate = useNavigate();
    return (
        <Button
            key={item.name}
            component="a"
            onClick={() => item.href && navigate(item.href)}
            startIcon={item.icon}
            sx={{
                bgcolor: "primary.main",
                color: "text.primary",
                borderRadius: "4px",
                px: 2,
                py: 1,
                textTransform: "none",
                "&:hover": {
                    bgcolor: "primary.light", // Ajusta el color al pasar el mouse
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
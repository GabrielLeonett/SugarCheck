import { Box, Typography } from "@mui/material";
import Icon from "../../assets/icons/SugarCheck.svg";

export function LogoSugarCheck() {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
                component="img"
                src={Icon}
                alt="SugarCheck"
                sx={{ width: 34, height: "auto" }}
            />
            <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                SugarCheck
            </Typography>
        </Box>
    );
}

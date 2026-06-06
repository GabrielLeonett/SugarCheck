import { IconButton, List, ListItem, Box, Drawer, ListItemButton, ListItemText } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import type { NavItemType } from "../../../types/types";

interface DrawerAppBarProps {
    drawerOpen: boolean;
    handleDrawerToggle: () => void;
    handleNavClick: (href: string) => void;
    navItems: NavItemType[];
}

export default function DrawerAppBar({ drawerOpen, handleDrawerToggle, handleNavClick, navItems }: DrawerAppBarProps) {
    return (
        < Drawer
            anchor="right"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
                keepMounted: true,
            }
            }
            sx={{
                "& .MuiDrawer-paper": {
                    backgroundColor: "background.paper",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                },
            }}
        >
            <Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 3,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{ color: "text.primary" }}
                    >
                        <CancelIcon />
                    </IconButton>
                </Box>

                <List sx={{ px: 2 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => {
                                    handleNavClick(item.href);
                                    handleDrawerToggle();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={item.name}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer >)
}
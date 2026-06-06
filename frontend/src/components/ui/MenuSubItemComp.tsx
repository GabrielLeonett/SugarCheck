import * as React from "react";
import { Button, Menu, MenuItem, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { NavItemWithSubmenu } from "../../types/types";

export const MenuSubItemComp = ({ item }: { item: NavItemWithSubmenu }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<KeyboardArrowDownIcon />}
        sx={{ color: "text.primary", textTransform: "none", fontWeight: 500 }}
      >
        <Typography variant={"subtitle2"} color="text.primary">
          {item.name}
        </Typography>
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {item.submenu.map((sub) => (
          <MenuItem
            key={sub.name}
            component="a"
            href={sub.href}
            onClick={handleClose}
          >
            {sub.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
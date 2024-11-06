import { useContext, useState } from "react";
import { SidebarFooterProps } from "@toolpad/core";
import { Avatar, Box, Button, Divider, IconButton, Popover, Stack, Tooltip, Typography } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { AuthContext } from "../context/AuthContext";
import { getColorFromName } from "../helpers/colors";

const stringAvatar = (name: string) => {
  return {
    sx: {
      bgcolor: getColorFromName(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
};

const SidebarAvatar = ({ mini }: SidebarFooterProps) => {
  const { logout, user } = useContext(AuthContext)!;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Open the popover when the avatar is clicked
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "user-popover" : undefined;

  const handleLogout = () => {
    logout();
  };

  return (
    <Stack>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", p: 1.5, overflowX: "hidden" }}>
        {mini ? (
          <>
            <Tooltip title={user.name}>
              <Avatar {...stringAvatar(user.name)} onClick={handleAvatarClick} />
            </Tooltip>
            {/* Popover to display user details */}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "center",
                horizontal: "left",
              }}
              sx={{ width: 300 }}>
              <Stack>
                <Box sx={{ p: 2, display: "flex", direction: "row", gap: 2 }}>
                  <Avatar {...stringAvatar(user.name)} onClick={handleAvatarClick} />
                  <Box>
                    <Typography variant="body2">{user.name}</Typography>
                    <Typography variant="caption">{user.email}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 1, display: "flex", justifyContent: "end" }}>
                  <Button variant="outlined" size="small" onClick={handleLogout} startIcon={<LogoutRoundedIcon />}>
                    Sign Out
                  </Button>
                </Box>
              </Stack>
            </Popover>
          </>
        ) : (
          <>
            <Avatar {...stringAvatar(user.name)} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" noWrap>
                {user.email}
              </Typography>
            </Box>
            <IconButton size="small" color="default" onClick={handleLogout}>
              <LogoutRoundedIcon />
            </IconButton>
          </>
        )}
      </Box>
    </Stack>
  );
};

export default SidebarAvatar;

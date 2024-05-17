import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./headerStyles.module.css";
import Logout from "../Logout";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../auth/firebase";
import { useAppSelector } from "../../../hooks/useAppDispatch";
import MenuIcon from "@mui/icons-material/Menu";
import { AccountCircle } from "@mui/icons-material";

// Import your logo here
import yodaLogo from "./yoda.png";

const Header: React.FC = () => {
  const [user] = useAuthState(auth);
  const token = useAppSelector((state) => state.token.token);
  const navigate = useNavigate();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: "Home", link: "/" },
    { text: "Browse", link: "/calendars" },
    ...(token
      ? [{ text: "Create", link: "/panel" }] // Add 'Create' menu item for authenticated users
      : []),
    { text: "Favourites", link: "/favourites" },
    { text: "About", link: "/about" },
  ];

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 769);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  const drawerContent = (
    <div>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.link}
            onClick={() => navigate(item.link)}
            style={{ cursor: "pointer" }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
<AppBar position="static" sx={{ backgroundColor: "transparent", zIndex: 1 }}>
        <Toolbar>
        <Link to="/" style={{ textDecoration: "none" }}>
  <img src={yodaLogo} alt="Yoda Logo" style={{ height: "30px", marginRight: "10px", cursor: "pointer" }} />
</Link>
          <div className={`${styles.grow} ${styles.leftAlign}`}>
            {isMobileView && location.pathname !== "/panel" ? (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleDrawerOpen}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer
                  anchor="left"
                  open={openDrawer}
                  onClose={handleDrawerClose}
                >
                  {drawerContent}
                </Drawer>
              </>
            ) : (
              menuItems.map((item) => (
                <Link to={item.link} className={styles.navLink} key={item.link}>
                  <Button color="inherit">{item.text}</Button>
                </Link>
              ))
            )}
          </div>
          <div className={styles.rightAlign}>
            {token ? (
              <div>
                <IconButton
                  onClick={handleMenuOpen}
                  color="inherit"
                  aria-controls="menu"
                  aria-haspopup="true"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => navigate("/userinfo")}>
                    Hello, {user?.displayName ? user?.displayName : user?.email}
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/admin")}>Admin</MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Logout />
                  </MenuItem>
                </Menu>
              </div>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>
                  <Button color="inherit">Login</Button>
                </Link>
                <Link to="/register" className={styles.navLink}>
                  <Button color="inherit">Register</Button>
                </Link>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>
  );
};

export default Header;

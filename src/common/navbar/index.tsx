import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LunchHitchUser } from '../../auth';

export type NavbarProps = {
  user?: LunchHitchUser | null;
};

/**
 * Navigation Bar component
 */
export default function NavBar({ user }: NavbarProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [usernameText, setUsernameText] = React.useState('Login');

  React.useEffect(() => {
    setUsernameText(user ? user.displayName : 'Login');
  }, [user]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <AppBar position="static" style={{ background: '#50C878' }}>
      <Toolbar>
        { user
          ? (
            <Link href='http://localhost:3000/'>
              <Typography
                variant="h6"
                component="div"
                style={{ flexGrow: 1, textAlign: 'left' }}
              >
                Lunch Hitch
              </Typography>
            </Link>
          ) : (
            <Typography
              variant="h6"
              component="div"
              style={{ flexGrow: 1, textAlign: 'left' }}
            >
              Lunch Hitch
            </Typography>
          )
        }
        <div>
          <IconButton
            size="medium"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
            <text style={{
              paddingLeft: '5px',
            }}
            >
              {usernameText}
            </text>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            { user
              ? (
                <>
                  <MenuItem onClick={handleClose}>
                    <Link href="./profile">Profile</Link>
                  </MenuItem>
                  <MenuItem onClick={() => signOut({ redirect: false })}>
                    Log out
                  </MenuItem>
                </>
              )
              : (
                <>
                  <MenuItem>
                    <Link href="./auth/login">Log In</Link>
                  </MenuItem>
                  <MenuItem>
                    <Link href="./auth/signup">Sign Up</Link>
                  </MenuItem>
                </>
              )}
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}

NavBar.defaultProps = {
  user: undefined,
};

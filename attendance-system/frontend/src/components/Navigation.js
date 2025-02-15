import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AccountCircle, Notifications } from '@mui/icons-material';
import NotificationCenter from './NotificationCenter';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleClose();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/');
    };

    const getDashboardPath = () => {
        switch (user?.role) {
            case 'Admin':
                return '/admin';
            case 'Leader':
                return '/leader';
            case 'Member':
                return '/member';
            default:
                return '/';
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Attendance System
                </Typography>
                
                {user && (
                    <>
                        <Button 
                            color="inherit" 
                            onClick={() => navigate(getDashboardPath())}
                        >
                            Dashboard
                        </Button>
                        
                        {user.role === 'Leader' && (
                            <Button 
                                color="inherit" 
                                onClick={() => navigate('/mark-attendance')}
                            >
                                Mark Attendance
                            </Button>
                        )}

                        <NotificationCenter />

                        <IconButton
                            size="large"
                            color="inherit"
                        >
                            <Notifications />
                        </IconButton>

                        <Box sx={{ ml: 2 }}>
                            <IconButton
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    {user.name[0]}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 
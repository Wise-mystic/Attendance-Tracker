import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt_decode(token);
                // Fetch user details
                fetchUserDetails(decoded.id);
            } catch (error) {
                localStorage.removeItem('token');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const { token } = await response.json();
        localStorage.setItem('token', token);
        const decoded = jwt_decode(token);
        await fetchUserDetails(decoded.id);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 

const navigation = () => {
    const{user, logout} = useAuth();
    const navigate = useNavigate();
const [anchorEl, setAnchorEl] = React.useState(null);

const handleClick = (event) => {
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
    navigate('/login');
};

const getDashboardPath = () => {
    switch (user.role) {
        case 'Admin':
            return '/admin-dashboard';
        case 'Leader':
            return '/leader-dashboard';
            case 'Member':
                return '/member-dashboard';
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
               {
                user.role === 'leader' &&(
                    <Button
                    color="inherit"
                onclick = {() => navigate('/mark-attendance')}
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
                </>
            )}
        </Toolbar>
    </AppBar>
);
};

export default navigation;

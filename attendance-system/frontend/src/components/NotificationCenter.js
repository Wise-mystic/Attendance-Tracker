import React, { useState, useEffect } from 'react';
import {
    Popover,
    List,
    ListItem,
    ListItemText,
    Typography,
    Badge,
    IconButton,
    Divider,
    Box,
    Button
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const NotificationCenter = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationContent = (notification) => {
        switch (notification.type) {
            case 'attendance_reminder':
                return {
                    primary: 'Attendance Reminder',
                    secondary: `Please mark attendance for your group by ${notification.deadline}`
                };
            case 'absence_marked':
                return {
                    primary: 'Absence Recorded',
                    secondary: `You were marked absent for ${new Date(notification.date).toLocaleDateString()}`
                };
            case 'group_update':
                return {
                    primary: 'Group Update',
                    secondary: notification.message
                };
            default:
                return {
                    primary: 'System Notification',
                    secondary: notification.message
                };
        }
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-label={`${unreadCount} new notifications`}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ width: 360, maxHeight: 480 }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Notifications</Typography>
                        {unreadCount > 0 && (
                            <Button size="small" onClick={markAllAsRead}>
                                Mark all as read
                            </Button>
                        )}
                    </Box>
                    <Divider />
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {notifications.length === 0 ? (
                            <ListItem>
                                <ListItemText primary="No notifications" />
                            </ListItem>
                        ) : (
                            notifications.map((notification) => {
                                const content = getNotificationContent(notification);
                                return (
                                    <React.Fragment key={notification._id}>
                                        <ListItem
                                            button
                                            onClick={() => markAsRead(notification._id)}
                                            sx={{
                                                backgroundColor: notification.read ? 'inherit' : 'action.hover'
                                            }}
                                        >
                                            <ListItemText
                                                primary={content.primary}
                                                secondary={
                                                    <>
                                                        {content.secondary}
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            display="block"
                                                            color="text.secondary"
                                                        >
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                );
                            })
                        )}
                    </List>
                </Box>
            </Popover>
        </>
    );
};

export default NotificationCenter; 
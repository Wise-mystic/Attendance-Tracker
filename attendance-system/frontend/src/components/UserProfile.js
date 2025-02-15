import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import FormInput from './shared/FormInput';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        notifications: {
            email: true,
            sms: false,
            reminderTime: '6:30 PM'
        }
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const reminderTimeOptions = [
        { value: '5:00 PM', label: '5:00 PM' },
        { value: '6:00 PM', label: '6:00 PM' },
        { value: '7:00 PM', label: '7:00 PM' },
        { value: '8:00 PM', label: '8:00 PM' },
        { value: '9:00 PM', label: '9:00 PM' },
        { value: '10:00 PM', label: '10:00 PM' },
        { value: '11:00 PM', label: '11:00 PM' }
    ];

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name,
                email: user.email,
                phone: user.phone,
                notifications: user.notifications
            });
        }
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name.startsWith('notifications.')) {
            const notificationField = name.split('.')[1];
            setProfile(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [notificationField]: value
                }
            }));
        } else {
            setProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(profile)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                const updatedUser = await response.json();
                updateUser(updatedUser);
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while updating profile' });
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                User Profile
            </Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Profile Settings
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormInput
                                name="name"
                                label="Full Name"
                                value={profile.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormInput
                                type="email"
                                name="email"
                                label="Email"
                                value={profile.email}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormInput
                                name="phone"
                                label="Phone Number"
                                value={profile.phone}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormInput
                                type="select"
                                name="notifications.reminderTime"
                                label="Reminder Time"
                                value={profile.notifications.reminderTime}
                                onChange={handleChange}
                                options={reminderTimeOptions}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormInput
                                type="switch"
                                name="notifications.email"
                                label="Email Notifications"
                                value={profile.notifications.email}
                                onChange={(e) => handleChange({
                                    target: {
                                        name: 'notifications.email',
                                        value: e.target.checked
                                    }
                                })}
                            />
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default UserProfile; 
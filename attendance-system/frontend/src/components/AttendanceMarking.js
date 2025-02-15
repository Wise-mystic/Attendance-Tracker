import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Button,
    Alert,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import useApi from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import DataTable from './shared/DataTable';

const AttendanceMarking = () => {
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    const { loading, error, get, post, setError } = useApi();

    useEffect(() => {
        fetchUnmarkedAttendance();
    }, []);

    const fetchUnmarkedAttendance = async () => {
        try {
            const data = await get('/attendance/unmarked');
            setMembers(data.unmarkedMembers);
            
            // Initialize attendance state
            const initialAttendance = {};
            data.unmarkedMembers.forEach(member => {
                initialAttendance[member._id] = 'Present';
            });
            setAttendance(initialAttendance);
        } catch (error) {
            // Error is handled by useApi hook
            console.error('Error fetching members:', error);
        }
    };

    const handleAttendanceChange = (memberId, status) => {
        setAttendance(prev => ({
            ...prev,
            [memberId]: status
        }));
    };

    const handleSubmit = async () => {
        try {
            const attendanceData = Object.entries(attendance).map(([userId, status]) => ({
                userId,
                status
            }));

            await post('/attendance/mark', { attendanceData });
            setSuccess('Attendance marked successfully');
            fetchUnmarkedAttendance(); // Refresh the list
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'dayGroup', headerName: 'Day Group' },
        {
            field: 'status',
            headerName: 'Status',
            sortable: false,
            renderCell: (row) => (
                <FormControl fullWidth>
                    <Select
                        value={attendance[row._id] || 'Present'}
                        onChange={(e) => handleAttendanceChange(row._id, e.target.value)}
                    >
                        <MenuItem value="Present">Present</MenuItem>
                        <MenuItem value="Absent">Absent</MenuItem>
                    </Select>
                </FormControl>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Mark Attendance
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {loading ? (
                <LoadingSpinner message="Loading members..." />
            ) : (
                <>
                    <DataTable
                        title="Members"
                        columns={columns}
                        data={members}
                        searchable={true}
                        sortable={true}
                    />
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        Submit Attendance
                    </Button>
                </>
            )}
        </Box>
    );
};

export default AttendanceMarking; 
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AttendanceChart from './charts/AttendanceChart';
import DateRangePicker from './shared/DateRangePicker';
import DataTable from './shared/DataTable';

const MemberDashboard = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchAttendanceData();
    }, [dateRange]);

    const fetchAttendanceData = async () => {
        try {
            const response = await fetch(
                `/api/attendance/range?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const data = await response.json();
            setAttendanceData(data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    if (!attendanceData) return <Typography>Loading...</Typography>;

    const calculateAttendanceRate = () => {
        const totalDays = attendanceData.length;
        const presentDays = attendanceData.filter(record => record.status === 'Present').length;
        return totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    };

    const attendanceColumns = [
        { 
            field: 'date', 
            headerName: 'Date',
            renderCell: (row) => new Date(row.date).toLocaleDateString()
        },
        { 
            field: 'status', 
            headerName: 'Status',
            renderCell: (row) => (
                <Typography
                    color={row.status === 'Present' ? 'success.main' : 'error.main'}
                >
                    {row.status}
                </Typography>
            )
        },
        { 
            field: 'markedBy', 
            headerName: 'Marked By',
            renderCell: (row) => row.markedBy ? row.markedBy.name : 'System'
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Attendance Dashboard
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6">Personal Information</Typography>
                        <Typography>Name: {user?.name}</Typography>
                        <Typography>Day Group: {user?.dayGroup}</Typography>
                        <Typography>Overall Attendance Rate: {calculateAttendanceRate()}%</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <DateRangePicker
                        dateRange={dateRange}
                        onDateChange={setDateRange}
                    />
                </Grid>
            </Grid>

            <DataTable
                title="Attendance History"
                columns={attendanceColumns}
                data={attendanceData}
                searchable={true}
                sortable={true}
            />
        </Box>
    );
};

export default MemberDashboard; 
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button
} from '@mui/material';
import AttendanceChart from './charts/AttendanceChart';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DateRangePicker from './shared/DateRangePicker';
import DataTable from './shared/DataTable';
import useApi from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';

const LeaderDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    });
    const { user } = useAuth();
    const navigate = useNavigate();
    const { loading, error, get } = useApi();

    useEffect(() => {
        fetchLeaderAnalytics();
    }, [dateRange]);

    const fetchLeaderAnalytics = async () => {
        try {
            const data = await get(`/attendance/analytics/leader?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`);
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching leader analytics:', error);
        }
    };

    const memberColumns = [
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { 
            field: 'attendanceRate', 
            headerName: 'Attendance Rate',
            align: 'right',
            renderCell: (row) => `${row.attendanceRate?.toFixed(1)}%`
        }
    ];

    if (loading || !analytics) return <LoadingSpinner message="Loading analytics..." />;

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" gutterBottom>
                        {user?.dayGroup} Group Dashboard
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => navigate('/mark-attendance')}
                    >
                        Mark Today's Attendance
                    </Button>
                </Grid>
            </Grid>

            <DateRangePicker
                dateRange={dateRange}
                onDateChange={setDateRange}
                title="Analytics Period"
            />

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Weekly Attendance Trends
                </Typography>
                <Box sx={{ height: 400 }}>
                    <AttendanceChart
                        data={analytics.weeklyTrends}
                        title="Weekly Attendance Rate"
                    />
                </Box>
            </Paper>

            <DataTable
                title="Member Attendance Rates"
                columns={memberColumns}
                data={analytics.memberAttendance}
                searchable={true}
                sortable={true}
            />
        </Box>
    );
};

export default LeaderDashboard; 
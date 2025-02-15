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
    const [groupData, setGroupData] = useState(null);
    const { get } = useApi();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroupData();
    }, []);

    const fetchGroupData = async () => {
        try {
            const data = await get('/analytics/leader');
            setGroupData(data);
        } catch (error) {
            console.error('Error fetching group data:', error);
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

    if (!groupData) return <LoadingSpinner message="Loading group data..." />;

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
            Mark Today's Attendance
            <DateRangePicker
                dateRange={groupData.dateRange}
                onDateChange={(newDateRange) => {
                    setGroupData(prevState => ({
                        ...prevState,
                        dateRange: newDateRange
                    }));
                    fetchGroupData();
                }}
                title="Analytics Period"
            />

            title="Analytics Period"
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Weekly Attendance Trends
                </Typography>
                <Box sx={{ height: 400 }}>
                    <AttendanceChart
                        data={groupData.weeklyTrends}
                        title="Weekly Attendance Rate"
                    />
                </Box>
            </Paper>

            <DataTable
                title="Member Attendance Rates"
                columns={memberColumns}
                data={groupData.memberAttendance}
                searchable={true}
                sortable={true}
            />
        </Box>
    );
};

export default LeaderDashboard; 
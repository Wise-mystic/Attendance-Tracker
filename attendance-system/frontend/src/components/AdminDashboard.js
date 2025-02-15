import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import AttendanceChart from './charts/AttendanceChart';
import DateRangePicker from './shared/DateRangePicker';
import DataTable from './shared/DataTable';
import useApi from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    });
    const [selectedGroup, setSelectedGroup] = useState('all');
    const { loading, error, get } = useApi();

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, selectedGroup]);

    const fetchAnalytics = async () => {
        try {
            const data = await get('/analytics/admin');
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const absenteeColumns = [
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'dayGroup', headerName: 'Day Group' },
        { field: 'absenceCount', headerName: 'Absences', align: 'right' }
    ];

    if (loading || !analytics) return <LoadingSpinner message="Loading analytics..." />;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Group</InputLabel>
                        <Select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                        >
                            <MenuItem value="all">All Groups</MenuItem>
                            <MenuItem value="Monday">Monday</MenuItem>
                            <MenuItem value="Tuesday">Tuesday</MenuItem>
                            <MenuItem value="Wednesday">Wednesday</MenuItem>
                            <MenuItem value="Thursday">Thursday</MenuItem>
                            <MenuItem value="Friday">Friday</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                    <DateRangePicker
                        dateRange={dateRange}
                        onDateChange={setDateRange}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Overall Attendance Rate</Typography>
                        <Typography variant="h4">{analytics.overallRate}%</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Group Comparison</Typography>
                <Box sx={{ height: 400 }}>
                    <AttendanceChart
                        data={analytics.groupComparison}
                        title="Attendance Rate by Group"
                    />
                </Box>
            </Paper>

            <DataTable
                title="Frequent Absentees (3+ absences)"
                columns={absenteeColumns}
                data={analytics.frequentAbsentees}
                searchable={true}
                sortable={true}
            />
        </Box>
    );
};

export default AdminDashboard; 
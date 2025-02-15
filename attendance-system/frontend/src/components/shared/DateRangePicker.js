import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

const DateRangePicker = ({ 
    dateRange, 
    onDateChange, 
    title = 'Date Range',
    fullWidth = true 
}) => {
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            {title && (
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
            )}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <DatePicker
                        label="Start Date"
                        value={dateRange.startDate}
                        onChange={(newValue) => onDateChange({ 
                            ...dateRange, 
                            startDate: newValue 
                        })}
                        fullWidth={fullWidth}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DatePicker
                        label="End Date"
                        value={dateRange.endDate}
                        onChange={(newValue) => onDateChange({ 
                            ...dateRange, 
                            endDate: newValue 
                        })}
                        fullWidth={fullWidth}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default DateRangePicker; 
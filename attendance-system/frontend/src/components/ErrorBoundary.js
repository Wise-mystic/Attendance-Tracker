import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryFallback extends React.Component {
    state = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        
        // Log error to your error tracking service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ error }) => {
    const navigate = useNavigate();

    const handleRetry = () => {
        window.location.reload();
    };

    const handleNavigateHome = () => {
        navigate('/');
        window.location.reload();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                p: 3
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 500,
                    textAlign: 'center'
                }}
            >
                <Typography variant="h4" color="error" gutterBottom>
                    Oops! Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {error?.message || 'An unexpected error occurred'}
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="contained" onClick={handleRetry}>
                        Try Again
                    </Button>
                    <Button variant="outlined" onClick={handleNavigateHome}>
                        Go to Home
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ErrorBoundaryFallback; 
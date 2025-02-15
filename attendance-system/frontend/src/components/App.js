import React from 'react';  
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserProfile from './components/UserProfile';
import UserAttendance from './components/UserAttendance';
import { AuthProvider } from '../contexts/AuthContext';
import AttendanceMarking from './AttendanceMarking';
import LeaderDashboard from './LeaderDashboard';
import PrivateRoute from './PrivateRoute';
import MemberDashboard from './components/MemberDashboard';
import Navigation from './Navigation';
import ErrorBoundaryFallback from './ErrorBoundary';

const App = () => {
    return (
        <ErrorBoundaryFallback>
            <AuthProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Router>
                        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                            <Navigation />
                            <Container sx={{ flex: 1, py: 3 }}>
                                <Routes>
                                    <Route path="/" element={<LoginForm />} />
                                    <Route path="/register" element={<RegisterForm />} />
                                    <Route
                                        path="/admin"
                                        element={
                                            <PrivateRoute role="Admin">
                                                <AdminDashboard />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/leader"
                                        element={
                                            <PrivateRoute role="Leader">
                                                <LeaderDashboard />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/member"
                                        element={
                                            <PrivateRoute role="Member">
                                                <MemberDashboard />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/mark-attendance"
                                        element={
                                            <PrivateRoute role="Leader">
                                                <AttendanceMarking />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/profile"
                                        element={
                                            <PrivateRoute>
                                                <UserProfile />
                                            </PrivateRoute>
                                        }
                                    />
                                </Routes>
                            </Container>
                        </Box>
                    </Router>
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundaryFallback>
    );
};

export default App;

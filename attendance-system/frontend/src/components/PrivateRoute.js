import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    if (role && user.role !== role) {
        return <Navigate to={`/${user.role.toLowerCase()}`} />;
    }

    return children;
};

export default PrivateRoute; 
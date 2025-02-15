import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleRequest = useCallback(async (
        endpoint,
        options = {},
        successCallback = null,
        errorCallback = null
    ) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            };

            const response = await fetch(`/api${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle authentication errors
                if (response.status === 401) {
                    logout();
                    navigate('/');
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'An error occurred');
            }

            if (successCallback) {
                successCallback(data);
            }

            return data;
        } catch (err) {
            setError(err.message);
            if (errorCallback) {
                errorCallback(err);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [navigate, logout]);

    const get = useCallback((endpoint, options = {}, successCallback = null, errorCallback = null) => {
        return handleRequest(endpoint, { ...options, method: 'GET' }, successCallback, errorCallback);
    }, [handleRequest]);

    const post = useCallback((endpoint, body, options = {}, successCallback = null, errorCallback = null) => {
        return handleRequest(
            endpoint,
            {
                ...options,
                method: 'POST',
                body: JSON.stringify(body)
            },
            successCallback,
            errorCallback
        );
    }, [handleRequest]);

    const put = useCallback((endpoint, body, options = {}, successCallback = null, errorCallback = null) => {
        return handleRequest(
            endpoint,
            {
                ...options,
                method: 'PUT',
                body: JSON.stringify(body)
            },
            successCallback,
            errorCallback
        );
    }, [handleRequest]);

    const del = useCallback((endpoint, options = {}, successCallback = null, errorCallback = null) => {
        return handleRequest(
            endpoint,
            { ...options, method: 'DELETE' },
            successCallback,
            errorCallback
        );
    }, [handleRequest]);

    return {
        loading,
        error,
        get,
        post,
        put,
        delete: del,
        setError
    };
};

export default useApi; 
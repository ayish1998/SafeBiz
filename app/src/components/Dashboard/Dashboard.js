import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/css/dashboard.css'; 

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async (token) => {
            try {
                const response = await fetch('http://127.0.0.1:8000/auth/user/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    // If token is invalid, redirect to login
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };

        // Check if user data exists in state, else fetch from local storage or redirect to login
        if (location.state && location.state.user) {
            setUserData(location.state.user);
        } else {
            // Try to fetch user data with access token from local storage
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                fetchUserData(accessToken);
            } else {
                // If no token found, redirect to login
                navigate('/login');
            }
        }
    }, [location.state, navigate]); // dependencies

    const handleLogout = () => {
        // Clear tokens and user data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUserData(null);
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome to the Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            {userData ? (
                <div className="user-info">
                    <h2>User Information</h2>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Username:</strong> {userData.username}</p>
                    {/* Add more user fields as needed */}
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default Dashboard;

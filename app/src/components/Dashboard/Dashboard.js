import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../../assets/css/assessment.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async (token) => {
            try {
                const response = await fetch('https://sentribiz-8az3.onrender.com/auth/user/', {
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
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };

        if (location.state && location.state.user) {
            setUserData(location.state.user);
        } else {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                fetchUserData(accessToken);
            } else {
                navigate('/login');
            }
        }
    }, [location.state, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUserData(null);
        navigate('/login');
    };

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className="bg-light border-end" id="sidebar-wrapper">
                <div className="sidebar-heading">Dashboard</div>
                <div className="list-group list-group-flush">
                    <Link to="/" className="list-group-item list-group-item-action bg-light">Home</Link>
                    <Link to="/assessment/recommendations" className="list-group-item list-group-item-action bg-light">Recommendations</Link>
                    <Link to="/settings" className="list-group-item list-group-item-action bg-light">Settings</Link>
                    <Link to="/reports" className="list-group-item list-group-item-action bg-light">Reports</Link>
                    <Link to="/help" className="list-group-item list-group-item-action bg-light">Help</Link>
                    <button onClick={handleLogout} className="list-group-item list-group-item-action bg-light">Logout</button>
                </div>
            </div>

            {/* Page content */}
            <div className="container-fluid p-4">
                <h1 className="mt-4">Welcome to the Dashboard</h1>

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
        </div>
    );
};

export default Dashboard;

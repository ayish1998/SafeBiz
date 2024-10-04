import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/assets/css/assessment.css'; 

const Assessment = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Fetch user data if authenticated
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            fetchUserData(accessToken);
        }

        // Handle clicks outside of the dropdown to close it
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Function to fetch user data
    const fetchUserData = async (token) => {
        try {
            const response = await fetch('/api/get_user/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            if (data.username) {
                setUserName(data.username); // Set the user's name from response
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Handler to navigate when the 'Start Assessment' button is clicked
    const handleTakeAssessment = () => {
        const accessToken = localStorage.getItem('accessToken');
    
        if (accessToken) {
            // User is authenticated, navigate to the assessment start page
            navigate('/assessment/start');
        } else {
            // User is not authenticated, redirect to login page with a message and redirectTo path
            navigate('/login', { 
                state: { 
                    message: 'Please log in to start the assessment.',
                    redirectTo: '/assessment/start'  // Pass the intended path after login
                }
            });
        }
    };
    
    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken'); // Optional: remove refresh token if used
        setUserName(''); // Clear user name on logout
        navigate('/'); // Redirect to home or login page after logout
    };

    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('accessToken');

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="assessment-container">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow">
                <div className="container">
                    <div className="navbar-logo">
                        <img src="/Images/logo.png" alt="Logo" />
                    </div>

                    {/* Toggle button for small screens */}
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMenu">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navbar links (no collapse on larger screens) */}
                    <div className="collapse navbar-collapse" id="navbarMenu">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="/">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/assessment">Take Assessment</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/resources">Resources</a>
                            </li>
                        </ul>

                        {/* Conditional rendering of the user's name dropdown */}
                        {isAuthenticated ? (
                            <div className="dropdown" ref={dropdownRef}>
                                <span 
                                    className="nav-link dropdown-toggle" 
                                    onClick={toggleDropdown} 
                                    style={{ fontWeight: 'bold', cursor: 'pointer' }} // Style for bold text
                                >
                                    {userName || 'User'} {/* Fallback name */}
                                </span>
                                {dropdownOpen && (
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <button className="dropdown-item" onClick={handleLogout}>Sign Out</button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <a href="/login" className="btn btn-primary">Sign In</a>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="container text-center mt-5">
                <h1 className="display-4">Is Your Business Cyber Secure?</h1>
                <p className="lead">Get personalized cybersecurity recommendations with SentriBiz. Take our quick assessment and protect your business today.</p>

                <button onClick={handleTakeAssessment} className="btn btn-primary btn-lg mt-4">
                    Start Assessment
                </button>
            </div>
        </div>
    );
};

export default Assessment;

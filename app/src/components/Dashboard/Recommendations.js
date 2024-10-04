import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../assets/css/assessment.css'; 

const Recommendations = () => {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            navigate('/login', {
                state: {
                    message: 'Please log in to view your recommendations.',
                    redirectTo: '/dashboard/recommendations'  // Redirect after login
                }
            });
        } else {
            fetchRecommendations(accessToken);
        }
    }, [navigate]);

    const fetchRecommendations = async (token) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/assessment/recommendations/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }

            const data = await response.json();
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setErrorMessage('Failed to load recommendations.');
        }
    };

    return (
        <div className="recommendations-container">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow">
                <div className="container">
                    <div className="navbar-logo">
                        <img src="/Images/logo.png" alt="Logo" />
                    </div>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMenu">
                        <span className="navbar-toggler-icon"></span>
                    </button>
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
                        <a href="/login" className="btn btn-primary">Sign In</a>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="container text-center mt-5">
                <h1>Your Personalized Recommendations</h1>
                <p className="lead">Based on your assessment, here are your tailored cybersecurity recommendations.</p>

                {errorMessage ? (
                    <p className="text-danger">{errorMessage}</p>
                ) : (
                    recommendations ? (
                        <div className="recommendations-list">
                            {recommendations.map((recommendation, index) => (
                                <div key={index} className="recommendation-item">
                                    <h5>{recommendation.title}</h5>
                                    <p>{recommendation.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Loading recommendations...</p>
                    )
                )}
            </div>
        </div>
    );
};

export default Recommendations;

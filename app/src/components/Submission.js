// Submission.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/assessment.css'; 

const Submission = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            navigate('/login', { 
                state: { 
                    message: 'Please log in to view your recommendations.',
                    redirectTo: '/assessments/submission'  // Redirect after login
                }
            });
        } else {
            // Start AI analysis after navigating to the submission page
            startAnalysis();
        }
    }, [navigate]);

    // Simulate AI analysis process
    const startAnalysis = () => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsAnalysisComplete(true);
                    return 100;
                }
                return prev + 10; // Increase progress every second
            });
        }, 1000);
    };

    // Function to handle sign out
    const signOut = () => {
        localStorage.removeItem('accessToken');
        navigate('/login'); // Redirect to login page after signing out
    };

    // Redirect to recommendations after analysis is complete
    useEffect(() => {
        if (isAnalysisComplete) {
            navigate('/assessments/recommendations');
        }
    }, [isAnalysisComplete, navigate]);

    return (
        <div className="submission-page">
            <nav className="navbar">
                <div className="navbar-logo">
                    <img src="/Images/logo.png" alt="Logo" />
                </div>
                <button className="signout-button" onClick={signOut}>Sign Out</button>
            </nav>
            <div className="container">
                <h2>Thank You for Your Submission!</h2>
                <p>Your responses are being analyzed. Please wait a moment...</p>
                <div className="progress-bar" style={{ width: `${progress}%` }}>
                    {progress}%
                </div>
                {isAnalysisComplete && <p>Analysis complete! Redirecting to your recommendations...</p>}
            </div>
        </div>
    );
};

export default Submission;

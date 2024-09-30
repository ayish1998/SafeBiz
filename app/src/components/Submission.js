import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/assets/css/assessment.css'; 

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

    useEffect(() => {
        // Once analysis is complete, redirect to recommendations page
        if (isAnalysisComplete) {
            setTimeout(() => {
                navigate('/dashboard/recommendations');
            }, 1500); // Wait a bit before redirecting
        }
    }, [isAnalysisComplete, navigate]);

    return (
        <div className="submission-container">
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
                        </ul>
                        <a href="/login" className="btn btn-primary">Sign In</a>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="container text-center mt-5">
                <h1>Thank You for Your Submission!</h1>
                <p className="lead">Your responses have been submitted successfully. Our AI is now analyzing your data to generate personalized security recommendations tailored to your business needs.</p>

                {/* Progress bar */}
                <div className="progress mt-5" style={{ height: '30px' }}>
                    <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {progress}%
                    </div>
                </div>

                {/* Conditional message when analysis is complete */}
                {isAnalysisComplete && <p className="text-success mt-3">Analysis complete! Redirecting...</p>}
            </div>
        </div>
    );
};

export default Submission;

import React from 'react';
import { useLocation } from 'react-router-dom';
import './assets/css/home.css';

function Home() {
    const location = useLocation();

    return (
        <div>
            {/* Navbar starts here */}
            {location.pathname === '/' && (
                <nav>
                    <div className="navbar navbar-light bg-white shadow">
                        <div className="navbar-logo">
                            <img src="/Images/logo.png" alt="Logo" />
                        </div>
                        <div className="hamburger" id="hamburger">&#9776;</div>
                        <div className="navbar-menu" id="navbar-menu">
                            <ul className="navbar-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/assessment">Take Assessment</a></li>
                            </ul>
                            <a href="/login" className="navbar-button">Sign In</a>
                        </div>
                    </div>
                </nav>
            )}
            {/* Navbar ends here */}

            {/* Main content */}
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-6" id='main-col'>
                        <h1 className="main-heading">
                            Welcome to SentriBiz, Your Security Partner
                        </h1>
                        <p className="main-paragraph">
                            Join us on a journey towards robust security solutions that empower
                            your business to thrive in the digital age. Our commitment is to
                            safeguard your business with innovative, tailored strategies.
                        </p>
                        <div className="input-group">
                            <a href="/register" target='_blank' className="main-button">
                                Get Started
                            </a>
                        </div>

                    </div>
                    <div className="col-md-6 text-center" id='main-col'>
                        <img
                            src="/Images/home image.png"
                            alt="HomeImage"
                            className="home-image"
                        />
                    </div>
                </div>
            </div>

            {/* Features Section Starts Here */}
            <div className="features-section container-fluid">
                <div className="row align-items-center">
                    <div className="col-md-4 d-flex justify-content-center" style={{ width: '50%' }}>
                        <h3 className="feature-heading first-feature-heading">
                            Innovate Securely, Thrive Confidently
                        </h3>
                    </div>

                    <div className="col-md-4 d-flex justify-content-center feature-box">
                        <div className="feature-icon-container">
                            <img
                                src="/Images/icon1.png" // Adjusted path for the image
                                alt="Data Protection Icon"
                                className="feature-icon"
                            />
                        </div>
                        <h3 className="feature-heading">Enhanced Data Protection</h3>
                    </div>

                    <div className="col-md-4 d-flex justify-content-center feature-box">
                        <div className="feature-icon-container">
                            <img
                                src="/Images/icon2.png" // Adjusted path for the image
                                alt="Threat Detection Icon"
                                className="feature-icon"
                            />
                        </div>
                        <h3 className="feature-heading">Real-time Threat Detection</h3>
                    </div>
                </div>
            </div>
            {/* Features Section Ends Here */}

            {/* Expert Solutions Section */}
            <div className="expert-solutions-section">
                <h2 className="section-title">Expert Solutions</h2>
                <div className="container">
                    <div className="row justify-content-center" style={{ gap: '10%' }}>
                        <div className="col-md-4 solution-box">
                            <img
                                src="/Images/image4.png" // Adjusted path for the image
                                alt="Custom Cybersecurity Solutions"
                                className="solution-image"
                            />
                            <h3 className="solution-heading">Custom Cybersecurity Solutions</h3>
                            <p className="solution-description">
                                Personalized solutions tailored to your needs.
                            </p>
                        </div>

                        <div className="col-md-4 solution-box">
                            <img
                                src="/Images/image5.png" // Adjusted path for the image
                                alt="Actionable Threat Alerts"
                                className="solution-image"
                            />
                            <h3 className="solution-heading">Actionable Threat Alerts</h3>
                            <p className="solution-description">
                                Stay informed with timely threat alerts.
                            </p>
                        </div>
                    </div>

                    <div className="row" id='main-comprehensive'>
                        <div className="col-md-12 solution-box">
                            <img
                                src="/Images/Image3.png" // Adjusted path for the image
                                alt="Comprehensive Security Evaluations"
                                className="solution-image"
                            />
                            <h3 className="solution-heading">Comprehensive Security Evaluations</h3>
                            <p className="solution-description">
                                Thorough assessments to enhance your security posture.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Expert Solutions Section Ends Here */}

            {/* Comprehensive Security Assessment Section */}
            <div className="assessment-section">
                <h2 className="assessment-title">Comprehensive Security Assessment</h2>

                <div className="assessment-container">
                    <div className="left-column">
                        <img
                            src="/Images/image9.png" // Adjusted path for the image
                            alt="Small AssessmentImage 1"
                            className="small-assessment-image"
                        />
                        <img
                            src="/Images/image8.png" // Adjusted path for the image
                            alt="Large AssessmentImage"
                            className="large-assessment-image"
                        />
                    </div>

                    <div className="middle-column">
                        <h3 className="recommendation-title">Tailored <br /> Recommendations</h3>
                        <div className='main-text'>
                            <p className="recommendation-text">
                                Our security assessment analyzes your business's current practices
                                and provides tailored recommendations to enhance your cybersecurity
                                posture effectively.
                                <br />Track your progress over time for continued
                                improvement.
                            </p>
                        </div>
                        <a href="/assessment" className="assessment-button">Take Assessment</a>
                    </div>

                    <div className="right-column">
                        <img
                            src="/Images/image7.png" // Adjusted path for the image
                            alt="Right AssessmentImage"
                            className="right-assessment-image"
                        />
                    </div>
                </div>
            </div>
            {/* Comprehensive Security Assessment Section Ends Here */}

            {/* Footer Section */}
            {location.pathname === '/' && (
                <footer className="footer-section">
                    <div className="footer-container">
                        <div className="footer-left">
                            <img
                                src="/Images/logo.png"
                                alt="SentriBiz Logo"
                                className="footer-logo"
                            />
                        </div>

                        <div className="footer-right">
                            <p className="footer-contact">
                                support@sentribiz.com &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; +230
                                123 567 345
                            </p>
                            <p className="footer-rights">
                                &copy; 2024 SentriBiz. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default Home;
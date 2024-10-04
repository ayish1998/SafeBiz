import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/css/login.css';  

/*************  ✨ Codeium Command ⭐  *************/
/**
 * Handles user login by sending a POST request to the backend's login endpoint.
 *
 * Fetches the user's data after a successful login and stores the access token and
 * user data in local storage. Redirects to the /dashboard route with the user's data
 * in the location state.
 *
 * If a location.state object is passed with a message, it will be displayed as an
 * info message above the form.
 *
 * @return {React.ReactElement} The Login component's JSX.
 */
/******  6d02ab38-2cef-484b-97d8-edfcca0aff57  *******/const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Check for state message when component mounts
    useEffect(() => {
        if (location.state && location.state.message) {
            setInfoMessage(location.state.message); // Set the info message if present
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setInfoMessage('');

        try {
            // Login request
            const response = await fetch('http://localhost:8000/auth/login/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const accessToken = data.access; // Assuming JWT token is returned as 'access'
                const refreshToken = data.refresh;

                // Save tokens to localStorage
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Fetch the authenticated user's data with the token
                const userResponse = await fetch('http://localhost:8000/auth/user/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                   // console.log('User Data:', userData);

                    // Clear form fields after successful login
                    setEmail('');
                    setPassword('');

                    // Check if there's a redirectTo path in location.state, otherwise redirect to dashboard
                    const redirectTo = location.state?.redirectTo || '/dashboard';

                    // Redirect to the intended path or dashboard
                    navigate(redirectTo, { state: { user: userData } });
                } else {
                    setErrorMessage('Failed to fetch user data.');
                }
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div>
            <div className="login-page">
                <div className="login-container">
                    {/* Left Section with Image */}
                    <div className="login-image-section">
                        <img
                            src="/Images/loginImage.png"
                            alt="SecurityImage"
                            className="login-image"
                        />
                    </div>

                    {/* Right Section with Login Form */}
                    <div className="login-form-section">
                        <div className="login-logo">
                            <a href="/">
                                <img
                                    src="/Images/logo.png"
                                    alt="SentriBiz Logo"
                                    className="form-logo"
                                />
                            </a>
                        </div>

                        {/* Login Form */}
                        <form className="login-form" onSubmit={handleSubmit}>
                            <h2 className="form-heading">Sign In</h2>

                            {/* Display info message if present */}
                            {infoMessage && <p className="info-message">{infoMessage}</p>}

                            {/* Display error message if present */}
                            {errorMessage && <p className="error-message">{errorMessage}</p>}

                            {/* Email Input */}
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="input-field"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="input-field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Forgot Password Link */}
                            <p className="forgot-password">
                                <a href="/">Forgot?</a>
                            </p>

                            {/* Sign In Button */}
                            <button type="submit" className="sign-in-btn">Sign In</button>

                            {/* Sign Up Link */}
                            <p className="sign-up-link">
                                Don't have an account? <a href="/register">Sign Up</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;



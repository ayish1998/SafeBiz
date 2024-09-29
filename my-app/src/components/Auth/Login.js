import React, { useState } from 'react';
import '../../assets/css/login.css';  

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login submitted:', { email, password });
    };

    return (
        <div>

            {/* Login Page */}
            <div className="login-page">
                <div className="login-container">
                    {/* Left Section with Image */}
                    <div className="login-image-section">
                        <img
                            src="/Images/loginImage.png"
                            alt="Security Image"
                            className="login-image"
                        />
                    </div>

                    {/* Right Section with Login Form */}
                    <div className="login-form-section">
                        {/* Logo */}
                        <div className="login-logo">
                            <a href="/"> {/* Link to the desired page */}
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
                                <a href="#">Forgot?</a>
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

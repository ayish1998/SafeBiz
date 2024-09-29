import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import '../../assets/css/register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate(); // Initialize the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== repeatPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/authentication/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          repeat_password: repeatPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setSuccess('User registered successfully!');
        setName('');
        setEmail('');
        setPassword('');
        setRepeatPassword('');

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again later.');
    }
  };

  const evaluatePasswordStrength = (pwd) => {
    let strength = '';
    if (pwd.length >= 8) {
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[@$!%*?&]/.test(pwd)) {
        strength = 'Strong';
      } else if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd) || /\d/.test(pwd) || /[@$!%*?&]/.test(pwd)) {
        strength = 'Medium';
      } else {
        strength = 'Weak';
      }
    } else {
      strength = 'Too short';
    }
    setPasswordStrength(strength);
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
          {/* Left Section with Image */}
          <div className="registration-image-section">
            <img
              src="/Images/loginImage.png"
              alt="SecurityImage"
              className="registration-image"
            />
          </div>

        <div className="registration-form-section">
            {/* Logo */}
            <div className="registration-logo">
              <a href="/">
                <img
                  src="/Images/logo.png"
                  alt="SentriBiz Logo"
                  className="form-logo"
                />
              </a>
            </div>
            
          <form className="registration-form" onSubmit={handleSubmit}>
            <h2 className="form-heading">Sign Up</h2>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="input-group">
              <input
                type="text"
                placeholder="Your Name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  evaluatePasswordStrength(e.target.value);
                }}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Repeat Password"
                className="input-field"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
            </div>

            <div className="password-strength">
              <p className="password-strength-text">
                Password Strength: {passwordStrength}
              </p>
            </div>

            <button type="submit" className="sign-up-btn">Sign Up</button>

            <p className="sign-in-link">
              <a href="/login">Sign In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

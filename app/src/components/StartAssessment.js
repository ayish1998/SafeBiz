// StartAssessment.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/assessment.css';

const StartAssessment = () => {
    const [questions, setQuestions] = useState([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            navigate('/login');
        } else {
            fetchAssessmentQuestions();
        }
    }, [navigate]);

    const fetchAssessmentQuestions = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/assessment/questions/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch questions');
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setErrorMessage('Failed to load assessment questions.');
        }
    };

    const handleChange = (questionId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions[currentSectionIndex].questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (currentSectionIndex < questions.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            setCurrentQuestionIndex(0);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
            setCurrentQuestionIndex(questions[currentSectionIndex - 1].questions.length - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/assessment/submit/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    answers: answers,
                    questions: questions, // Add the questions being answered
                }),
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                // Redirect to the Submission page
                navigate('/assessments/submission');
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.error || 'Failed to submit answers.');
            }
        } catch (error) {
            console.error('Error submitting answers:', error);
            setErrorMessage('An error occurred while submitting.');
        }
    };
    

    const handleSignOut = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    const currentSection = questions[currentSectionIndex];
    const currentQuestion = currentSection ? currentSection.questions[currentQuestionIndex] : null;

    // Calculate total number of questions
    const totalQuestions = questions.reduce((total, section) => total + section.questions.length, 0);
    const currentQuestionNumber = currentSectionIndex === 0 
        ? currentQuestionIndex + 1 
        : questions.slice(0, currentSectionIndex).reduce((total, section) => total + section.questions.length, 0) + currentQuestionIndex + 1;

    return (
        <div className="assessment-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-logo">
                    <img src="/Images/logo.png" alt="Logo" />
                </div>
                <button className="signout-button" onClick={handleSignOut}>Sign Out</button>
            </nav>

            {/* Main Assessment Content */}
            <div className="questions-container container">
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {currentSection && (
                    <div className="section-container">
                        {/* Render Back button */}
                        {(currentQuestionIndex > 0 || currentSectionIndex > 0) && (
                            <button onClick={handleBack} className="back-button">Back</button>
                        )}
                        <h3 className="progress-indicator">{currentQuestionNumber}/{totalQuestions}</h3>
                        <h3 className="section-title">{currentSection.section}</h3>
                        {currentQuestion && (
                            <div className="question-container">
                                <label className="question-text">{currentQuestion.text}</label>

                                {/* Render text input */}
                                {currentQuestion.type === 'text' && (
                                    <input
                                        type="text"
                                        className="input-field"
                                        onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                                    />
                                )}

                                {/* Render single-choice options */}
                                {currentQuestion.type === 'single-choice' && currentQuestion.options.map(option => (
                                    <div key={option}>
                                        <input
                                            type="radio"
                                            value={option}
                                            name={`question-${currentQuestion.id}`}
                                            onChange={() => {
                                                handleChange(currentQuestion.id, option);
                                                if (option !== 'Other') {
                                                    handleChange(`${currentQuestion.id}_other`, ''); // Clear "Other" text
                                                }
                                            }}
                                        />
                                        {option}
                                        {option === 'Other' && answers[currentQuestion.id] === option && (
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Please specify"
                                                onChange={(e) => handleChange(`${currentQuestion.id}_other`, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* Render multiple-choice options */}
                                {currentQuestion.type === 'multiple-choice' && currentQuestion.options.map(option => (
                                    <div key={option}>
                                        <input
                                            type="checkbox"
                                            value={option}
                                            onChange={(e) => {
                                                const newValue = e.target.checked
                                                    ? [...(answers[currentQuestion.id] || []), option]
                                                    : (answers[currentQuestion.id] || []).filter(o => o !== option);
                                                handleChange(currentQuestion.id, newValue);
                                                if (option === 'Other' && !e.target.checked) {
                                                    handleChange(`${currentQuestion.id}_other`, ''); // Clear "Other" text
                                                }
                                            }}
                                        />
                                        {option}
                                        {option === 'Other' && answers[currentQuestion.id]?.includes(option) && (
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Please specify"
                                                onChange={(e) => handleChange(`${currentQuestion.id}_other`, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}

                                <div className="navigation-buttons">
                                    {/* Render Next/Submit button */}
                                    <button onClick={handleNext}>
                                        {currentSectionIndex === questions.length - 1 && currentQuestionIndex === currentSection.questions.length - 1
                                            ? 'Submit'
                                            : 'Next'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StartAssessment;

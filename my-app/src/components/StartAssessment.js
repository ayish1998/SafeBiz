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
            navigate('/login'); // Redirect to login if not authenticated
        } else {
            fetchAssessmentQuestions();
        }
    }, [navigate]);

    const fetchAssessmentQuestions = async () => {
        try {
            const response = await fetch('/api/assessment/questions');
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

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/assessment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(answers),
            });
            if (response.ok) {
                const result = await response.json();
                // Handle the response from the AI integration (e.g., navigate to results page)
                console.log(result);
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.error || 'Failed to submit answers.');
            }
        } catch (error) {
            console.error('Error submitting answers:', error);
            setErrorMessage('An error occurred while submitting.');
        }
    };

    const currentSection = questions[currentSectionIndex];
    const currentQuestion = currentSection ? currentSection.questions[currentQuestionIndex] : null;

    return (
        <div className="assessment-container">
            <h2 className="assessment-title">Security Assessment</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {currentSection && (
                <div className="section-container">
                    <h3 className="section-title">{currentSection.section}</h3>
                    {currentQuestion && (
                        <div className="question-container">
                            <label className="question-text">{currentQuestion.text}</label>
                            {currentQuestion.type === 'text' && (
                                <input
                                    type="text"
                                    className="input-field"
                                    onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                                />
                            )}
                            {currentQuestion.type === 'single-choice' && currentQuestion.options.map(option => (
                                <div key={option}>
                                    <input
                                        type="radio"
                                        value={option}
                                        name={`question-${currentQuestion.id}`}
                                        onChange={() => {
                                            handleChange(currentQuestion.id, option);
                                            // Clear other input if not the "Other" option
                                            if (option !== 'Other') {
                                                handleChange(currentQuestion.id + '_other', ''); // Clear other input
                                            }
                                        }}
                                    />
                                    {option}
                                    {option === 'Other' && answers[currentQuestion.id] === option && (
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Please specify"
                                            onChange={(e) => handleChange(currentQuestion.id + '_other', e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
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

                                            // Clear other input if not the "Other" option
                                            if (option === 'Other' && e.target.checked) {
                                                handleChange(currentQuestion.id + '_other', ''); // Clear other input
                                            }
                                        }}
                                    />
                                    {option}
                                    {option === 'Other' && answers[currentQuestion.id]?.includes(option) && (
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Please specify"
                                            onChange={(e) => handleChange(currentQuestion.id + '_other', e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                            <button onClick={handleNext}>
                                {currentSectionIndex === questions.length - 1 && currentQuestionIndex === currentSection.questions.length - 1
                                    ? 'Submit'
                                    : 'Next'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StartAssessment;

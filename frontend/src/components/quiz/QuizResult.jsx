import React from "react";
import "./quiz.css";

const QuizResult = ({
    result,
    onBackToSummary,
    onBackToTutor,
    onGenerateNewQuiz,
}) => {
    if (!result) return null;

    // const {

    //     score = 0,

    //     total = 0,

    //     correct = 0,

    //     incorrect = 0,

    //     accuracy = 0,

    //     weak_topics = [],

    //     recommendation = []

    // } = result;
    const {

        score = 0,

        total = 0,

        results = [],

        mistakes = []

    } = result;

    const correct = score;

    const incorrect = total - score;

    const accuracy =
        total > 0
            ? Math.round((score / total) * 100)
            : 0;

    return (

        <div className="quiz-result">

            <div className="result-header">

                <h2>Quiz Completed</h2>

                <p>

                    Great job! Here is your performance report.

                </p>

            </div>

            <div className="result-cards">

                <div className="result-card">

                    <h3>{score}</h3>

                    <span>Score</span>

                </div>

                <div className="result-card">

                    <h3>{correct}</h3>

                    <span>Correct</span>

                </div>

                <div className="result-card">

                    <h3>{incorrect}</h3>

                    <span>Incorrect</span>

                </div>

                <div className="result-card">

                    <h3>{accuracy}%</h3>

                    <span>Accuracy</span>

                </div>

            </div>

            <div className="result-section">

                <h3>📚 Weak Topics</h3>

                <div className="topics-grid">

                    {

                        // weak_topics.length

                        //     ?

                        // weak_topics.map((topic,index)=>(

                        //     <span

                        //         key={index}

                        //         className="topic-chip"

                        //     >

                        //         {topic}

                        //     </span>

                        // ))

                        // :

                        // <span>No weak topics 🎉</span>
                        mistakes.length ?

                            mistakes.map((item, index) => (

                                <div
                                    key={index}
                                    className="topic-chip"
                                >

                                    {item}

                                </div>

                            ))

                            :

                            <span>

                                No mistakes 🎉

                            </span>

                    }

                </div>

            </div>

            <div className="result-section">

                {/* <h3>💡 AI Recommendation</h3> */}

                {/* <ul>

                    {

                        recommendation.length

                            ?

                            recommendation.map((item, index) => (

                                <li key={index}>

                                    {item}

                                </li>

                            ))

                            :

                            <li>

                                Keep practicing consistently.

                            </li>

                    }

                </ul> */}
                <ul>

                    {

                        accuracy >= 80 ?

                            <li>

                                Excellent performance. Keep practicing.

                            </li>

                            :

                            accuracy >= 50 ?

                                <li>

                                    Revise your weak concepts and attempt another quiz.

                                </li>

                                :

                                <li>

                                    Spend more time with the AI Tutor before retrying.

                                </li>

                    }

                </ul>

            </div>

            <div className="result-actions">
                {onBackToTutor && (
                    <button type="button" className="previous-btn" onClick={onBackToTutor}>
                        Back to Tutor
                    </button>
                )}

                {onBackToSummary && (
                    <button type="button" className="previous-btn" onClick={onBackToSummary}>
                        Back to Analysis
                    </button>
                )}

                {onGenerateNewQuiz && (
                    <button type="button" onClick={onGenerateNewQuiz}>
                        Generate New Quiz
                    </button>
                )}
            </div>

        </div>

    );

};

export default QuizResult;
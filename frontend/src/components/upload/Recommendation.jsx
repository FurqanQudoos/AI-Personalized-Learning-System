import React from "react";
import "./upload.css";

const Recommendation = ({ analysis, onStartTeaching }) => {

    const questions = analysis?.data || [];

    const weakTopics = [

        ...new Set(

            questions

                .filter((q) => q.status === "Incorrect")

                .map((q) => q.weakness_topic)

                .filter(Boolean)

        )

    ];

    const recommendations = [

        `Revise ${weakTopics[0] || "your weak topics"}`,

        "Practice similar MCQs",

        "Start an AI tutoring session",

        "Attempt an AI-generated quiz"

    ];

    return (

        <div className="recommendation-card">

            <div className="recommendation-header">

                <h2>🧠 AI Recommendation</h2>

                <p>

                    Personalized recommendations generated from your analysis.

                </p>

            </div>

            <div className="recommendation-list">

                {

                    recommendations.map((item, index) => (

                        <div

                            key={index}

                            className="recommendation-item"

                        >

                            <span className="recommendation-icon">

                                ✔

                            </span>

                            <span>

                                {item}

                            </span>

                        </div>

                    ))

                }

            </div>

            <button

                className="teach-btn"

                onClick={onStartTeaching}

            >

                🎓 Start AI Tutor

            </button>

        </div>

    );

};

export default Recommendation;
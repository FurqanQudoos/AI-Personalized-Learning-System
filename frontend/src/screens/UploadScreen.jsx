import React, { useState, useEffect } from "react";

import UploadSection from "../components/upload/UploadSection";
import SummaryCards from "../components/upload/SummaryCards";
import WeakTopics from "../components/upload/WeakTopics";
import Recommendation from "../components/upload/Recommendation";
import TutorPanel from "../components/tutor/TutorPanel";
import QuizPanel from "../components/quiz/QuizPanel";
import {
  clearQuizSession,
  hasAttemptedQuiz,
} from "../components/quiz/quizSession";

const UploadScreen = () => {
  const [analysis, setAnalysis] = useState(() => {
    const saved = sessionStorage.getItem("analysis");
    return saved ? JSON.parse(saved) : null;
  });

  const [learningMode, setLearningMode] = useState(() => {
    return sessionStorage.getItem("learningMode") === "true";
  });

  const [quizMode, setQuizMode] = useState(() => {
    return sessionStorage.getItem("quizMode") === "true";
  });

  // "view" = show saved result | "generate" = create a new quiz
  const [quizIntent, setQuizIntent] = useState(() => {
    return sessionStorage.getItem("quizIntent") || "generate";
  });

  const [quizKey, setQuizKey] = useState(0);
  const [quizAttempted, setQuizAttempted] = useState(() => hasAttemptedQuiz());

  useEffect(() => {
    if (analysis) {
      sessionStorage.setItem("analysis", JSON.stringify(analysis));
    } else {
      sessionStorage.removeItem("analysis");
    }
  }, [analysis]);

  const handleAnalysisComplete = (data) => {
    clearQuizSession();
    sessionStorage.removeItem("teachChat");
    sessionStorage.removeItem("quizIntent");
    setQuizAttempted(false);
    setQuizIntent("generate");
    setQuizKey((key) => key + 1);

    setAnalysis(data);
    setLearningMode(false);
    setQuizMode(false);

    sessionStorage.setItem("analysis", JSON.stringify(data));
    sessionStorage.setItem("learningMode", "false");
    sessionStorage.setItem("quizMode", "false");
  };

  const openTutor = () => {
    setLearningMode(true);
    setQuizMode(false);
    sessionStorage.setItem("learningMode", "true");
    sessionStorage.setItem("quizMode", "false");
    window.scrollTo(0, 0);
  };

  const viewQuizResult = () => {
    setQuizIntent("view");
    sessionStorage.setItem("quizIntent", "view");
    setQuizMode(true);
    setLearningMode(false);
    setQuizKey((key) => key + 1);
    sessionStorage.setItem("quizMode", "true");
    sessionStorage.setItem("learningMode", "false");
    window.scrollTo(0, 0);
  };

  const generateNewQuiz = () => {
    // Clear previous attempt so a brand-new quiz is created
    clearQuizSession();
    setQuizAttempted(false);
    setQuizIntent("generate");
    sessionStorage.setItem("quizIntent", "generate");
    setQuizMode(true);
    setLearningMode(false);
    setQuizKey((key) => key + 1);
    sessionStorage.setItem("quizMode", "true");
    sessionStorage.setItem("learningMode", "false");
    window.scrollTo(0, 0);
  };

  const backToTutor = () => {
    setQuizMode(false);
    setLearningMode(true);
    sessionStorage.setItem("quizMode", "false");
    sessionStorage.setItem("learningMode", "true");
    window.scrollTo(0, 0);
  };

  const backToSummary = () => {
    setQuizMode(false);
    setLearningMode(false);
    sessionStorage.setItem("quizMode", "false");
    sessionStorage.setItem("learningMode", "false");
    window.scrollTo(0, 0);
  };

  return (
    <div className="upload-page">
      {!learningMode && !quizMode && (
        <UploadSection onAnalysisComplete={handleAnalysisComplete} />
      )}

      {analysis && !learningMode && !quizMode && (
        <>
          <SummaryCards analysis={analysis} />
          <WeakTopics analysis={analysis} />
          <Recommendation onStartTeaching={openTutor} />

          {quizAttempted && (
            <div className="quiz-attempted-banner">
              <p>You already completed a practice quiz for this analysis.</p>
              <div className="quiz-attempted-actions">
                <button
                  type="button"
                  className="quiz-btn secondary-banner-btn"
                  onClick={viewQuizResult}
                >
                  View Quiz Result
                </button>
                <button
                  type="button"
                  className="quiz-btn"
                  onClick={generateNewQuiz}
                >
                  Generate New Quiz
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {learningMode && !quizMode && (
        <TutorPanel
          analysis={analysis}
          quizAttempted={quizAttempted}
          onStartQuiz={generateNewQuiz}
          onViewQuizResult={viewQuizResult}
          onBackToSummary={backToSummary}
        />
      )}

      {quizMode && (
        <QuizPanel
          key={`${quizKey}-${quizIntent}`}
          analysis={analysis}
          intent={quizIntent}
          onQuizCompleted={() => setQuizAttempted(true)}
          onBackToSummary={backToSummary}
          onBackToTutor={backToTutor}
          onGenerateNewQuiz={generateNewQuiz}
        />
      )}
    </div>
  );
};

export default UploadScreen;

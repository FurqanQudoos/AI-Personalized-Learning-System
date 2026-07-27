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
    // New analysis = fresh learning path; clear any previous quiz attempt
    clearQuizSession();
    sessionStorage.removeItem("teachChat");
    setQuizAttempted(false);
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

  const openQuiz = () => {
    // If already attempted: show saved result only (do not generate a new quiz)
    // If not attempted: QuizPanel will generate when user opened this via Generate Quiz
    setQuizMode(true);
    setLearningMode(false);
    setQuizKey((key) => key + 1);
    sessionStorage.setItem("quizMode", "true");
    sessionStorage.setItem("learningMode", "false");
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
      {/* Keep upload visible until tutor/quiz starts */}
      {!learningMode && !quizMode && (
        <UploadSection onAnalysisComplete={handleAnalysisComplete} />
      )}

      {/* After analyze: summary + start tutor (only if not in tutor/quiz) */}
      {analysis && !learningMode && !quizMode && (
        <>
          <SummaryCards analysis={analysis} />
          <WeakTopics analysis={analysis} />
          <Recommendation onStartTeaching={openTutor} />

          {quizAttempted && (
            <div className="quiz-attempted-banner">
              <p>You already completed a practice quiz for this analysis.</p>
              <button type="button" className="quiz-btn" onClick={openQuiz}>
                View Quiz Result
              </button>
            </div>
          )}
        </>
      )}

      {learningMode && !quizMode && (
        <TutorPanel
          analysis={analysis}
          quizAttempted={quizAttempted}
          onStartQuiz={openQuiz}
          onBackToSummary={backToSummary}
        />
      )}

      {quizMode && (
        <QuizPanel
          key={quizKey}
          analysis={analysis}
          onQuizCompleted={() => setQuizAttempted(true)}
          onBackToSummary={backToSummary}
        />
      )}
    </div>
  );
};

export default UploadScreen;

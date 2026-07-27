import React, { useState, useEffect } from "react";

import UploadSection from "../components/upload/UploadSection";
import SummaryCards from "../components/upload/SummaryCards";
import WeakTopics from "../components/upload/WeakTopics";
import Recommendation from "../components/upload/Recommendation";
import TutorPanel from "../components/tutor/TutorPanel";
import QuizPanel from "../components/quiz/QuizPanel";
import { clearQuizSession } from "../components/quiz/quizSession";

const UploadScreen = () => {
  
  // const [analysis, setAnalysis] = useState(null);

  // const [learningMode, setLearningMode] = useState(false);

  // const [quizMode, setQuizMode] = useState(false);
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
  useEffect(() => {

  if (analysis) {

    sessionStorage.setItem(
      "analysis",
      JSON.stringify(analysis)
    );

  } else {

    sessionStorage.removeItem("analysis");

  }

}, [analysis]);
  const handleAnalysisComplete = (data) => {

    setAnalysis(data);

    setLearningMode(false);

    setQuizMode(false);
    clearQuizSession();
    setQuizKey((key) => key + 1);

    sessionStorage.setItem(
      "analysis",
      JSON.stringify(data)
    );

    sessionStorage.setItem(
      "learningMode",
      "false"
    );

    sessionStorage.setItem(
      "quizMode",
      "false"
    );

  };
  return (

    <div className="upload-page">

      <UploadSection
        onAnalysisComplete={handleAnalysisComplete}
      />

      {

        analysis && !learningMode && !quizMode && (
          <>

        <SummaryCards
          analysis={analysis}
        />

        <WeakTopics
          analysis={analysis}
        />

        <Recommendation
          onStartTeaching={() => {

            setLearningMode(true);
            setQuizMode(false); // close quiz if open


            sessionStorage.setItem(
              "learningMode",
              "true"
            );
            sessionStorage.setItem("quizMode", "false");
            window.scrollTo(0, 0);

          }}
        />
        </>

      )}

      {

        learningMode && !quizMode && (

        <TutorPanel

          analysis={analysis}

          onStartQuiz={() => {

          clearQuizSession();
          setQuizKey((key) => key + 1);
          setQuizMode(true);
          setLearningMode(false);

          sessionStorage.setItem("quizMode", "true");
          sessionStorage.setItem("learningMode", "false");
          window.scrollTo(0, 0);

          }}

        />

      )}

      {

        quizMode &&

        <QuizPanel
          key={quizKey}
          analysis={analysis}
        />

      }

    </div>

  );

};

export default UploadScreen;
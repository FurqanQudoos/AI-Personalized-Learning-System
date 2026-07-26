import React, { useState, useEffect } from "react";

import UploadSection from "../components/upload/UploadSection";
import SummaryCards from "../components/upload/SummaryCards";
import WeakTopics from "../components/upload/WeakTopics";
import Recommendation from "../components/upload/Recommendation";
import TutorPanel from "../components/tutor/TutorPanel";
import QuizPanel from "../components/quiz/QuizPanel";

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

        analysis &&

        <SummaryCards
          analysis={analysis}
        />

      }

      {

        analysis &&

        <WeakTopics
          analysis={analysis}
        />

      }

      {

        analysis &&

        <Recommendation
          onStartTeaching={() => {

            setLearningMode(true);

            sessionStorage.setItem(
              "learningMode",
              "true"
            );

          }}
        />

      }

      {

        learningMode &&

        <TutorPanel

          analysis={analysis}

          onStartQuiz={() => {

    setQuizMode(true);

    sessionStorage.setItem(
        "quizMode",
        "true"
    );

}}

        />

      }

      {

        quizMode &&

        <QuizPanel
          analysis={analysis}
        />

      }

    </div>

  );

};

export default UploadScreen;
// import React from "react";

// const SummaryCards = ({ analysis }) => {

//   const questions = analysis?.data || [];

//   const totalQuestions = questions.length;

//   const correctAnswers = questions.filter(
//     (q) => q.status === "Correct"
//   ).length;

//   const incorrectAnswers = totalQuestions - correctAnswers;

//   const score =
//     totalQuestions > 0
//       ? Math.round((correctAnswers / totalQuestions) * 100)
//       : 0;

//   return (

//     <div className="summary-cards">

//       <div className="summary-card">

//         <h5>Total Questions</h5>

//         <h2>{totalQuestions}</h2>

//       </div>

//       <div className="summary-card success">

//         <h5>Correct</h5>

//         <h2>{correctAnswers}</h2>

//       </div>

//       <div className="summary-card danger">

//         <h5>Incorrect</h5>

//         <h2>{incorrectAnswers}</h2>

//       </div>

//       <div className="summary-card score">

//         <h5>Overall Score</h5>

//         <h2>{score}%</h2>

//       </div>

//     </div>

//   );

// };

// export default SummaryCards;
import React from "react";

const SummaryCards = ({ analysis }) => {

    const summary = analysis?.summary || {};

    const totalQuestions = summary.total_questions || 0;

    const correctAnswers = summary.correct || 0;

    const incorrectAnswers = summary.incorrect || 0;

    const score =
    totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    return (

        <div className="summary-cards">

            <div className="summary-card">

                <h5>Total Questions</h5>

                <h2>{totalQuestions}</h2>

            </div>

            <div className="summary-card success">

                <h5>Correct</h5>

                <h2>{correctAnswers}</h2>

            </div>

            <div className="summary-card danger">

                <h5>Incorrect</h5>

                <h2>{incorrectAnswers}</h2>

            </div>

            <div className="summary-card score">

                <h5>Overall Score</h5>

                <h2>{score}%</h2>

            </div>

        </div>

    );

};

export default SummaryCards;
// import "../App.css";

// const InsightsScreen = () => {
//   return (
//     <div className="insights-page">
//       <div className="insights-container">

//         {/* PERFORMANCE */}
//         <div className="insight-card">
//           <h3>Performance Level</h3>

//           <div className="performance-badge">
//             STRONG ⭐
//           </div>

//           <p className="small-text">Previous Score 65% (85%)</p>

//           {/* Fake graph */}
//           <div className="graph">
//             <span></span>
//             <span></span>
//             <span></span>
//             <span className="active"></span>
//           </div>

//           <p className="small-text">Previous Score (88%)</p>
//         </div>

//         {/* WEAK + RECOMMEND */}
//         <div className="insight-middle">

//           <div className="insight-card">
//             <h3>Weak Topics List</h3>
//             <ul className="icon-list">
//               <li>📘 Fractions & Decimals</li>
//               <li>📖 Literary Analysis</li>
//               <li>⚙ Thermodynamics</li>
//             </ul>
//           </div>

//           <div className="insight-card">
//             <h3>Recommendations</h3>
//             <ul className="icon-list">
//               <li>👥 Join study group for literature</li>
//               <li>🎥 Watch physics lectures on Coursera</li>
//             </ul>
//           </div>

//         </div>

//         {/* AI INSIGHTS */}
//         <div className="insight-card">
//           <h3>AI Insights</h3>

//           <div className="pie-chart">
//             <div className="slice strong"></div>
//           </div>

//           <div className="pie-legend">
//             <p>Strong (70%)</p>
//             <p>Average (20%)</p>
//             <p>Weak (10%)</p>
//           </div>

//           <p className="ai-text">
//             Great job! Keep reviewing Ai Learning Companion.
//             <br />
//             Your physics is weak areas.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InsightsScreen;

import React, { useEffect, useState } from "react";
import { API_URL } from "../config";
import "../App.css";

const InsightsScreen = () => {

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [data, setData] = useState(null);

  useEffect(() => {

    fetchInsights();

  }, []);

  const fetchInsights = async () => {

    try {

      const userInfo = JSON.parse(
        localStorage.getItem("userInfo")
      );

      const res = await fetch(
    `${API_URL}/api/insights`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        }
      );

      const result = await res.json();

      if (!res.ok) {

        throw new Error(
          result.message || "Failed to load insights."
        );

      }

      setData(result);

    }

    catch (err) {

      setError(err.message);

    }

    finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <div className="insights-page">

        <div className="insights-container">

          <h2>Loading Insights...</h2>

        </div>

      </div>

    );

  }

  if (error) {

    return (

      <div className="insights-page">

        <div className="insights-container">

          <h2>{error}</h2>

        </div>

      </div>

    );

  }

  const performance = data.performance;

  const weakTopics = data.weakTopics;

  const recommendations = data.recommendations;

  const aiInsights = data.aiInsights;

  return (<div className="insights-page">
    <div className="insights-container">

      {/* PERFORMANCE */}
      <div className="insight-card">
        <h3>Performance Level</h3>

        <div className="performance-badge">
          {performance.level}
        </div>

        <p className="small-text">
          Average Score {performance.averageScore}
        </p>

        <div className="graph">
          <span className={performance.totalQuizzes >= 1 ? "active" : ""}></span>
          <span className={performance.totalQuizzes >= 2 ? "active" : ""}></span>
          <span className={performance.totalQuizzes >= 3 ? "active" : ""}></span>
          <span className="active"></span>
        </div>

        <p className="small-text">
          Latest Score {performance.latestScore}

          {performance.improvement > 0 && (
            <> (+{performance.improvement})</>
          )}

          {performance.improvement < 0 && (
            <> ({performance.improvement})</>
          )}
        </p>

      </div>

      {/* WEAK + RECOMMEND */}
      <div className="insight-middle">

        <div className="insight-card">

          <h3>Weak Topics List</h3>

          <ul className="icon-list">

            {
              weakTopics.length > 0 ?

                weakTopics.map((item, index) => (

                  <li key={index}>

                    📘 {item.topic} ({item.mistakes} mistakes)

                  </li>

                ))

                :

                <li>No weak topics 🎉</li>

            }

          </ul>

        </div>

        <div className="insight-card">

          <h3>Recommendations</h3>

          <ul className="icon-list">

            {

              recommendations.map((item, index) => (

                <li key={index}>

                  ✅ {item}

                </li>

              ))

            }

          </ul>

        </div>

      </div>

      {/* AI INSIGHTS */}

      <div className="insight-card">

        <h3>AI Insights</h3>

        <div className="pie-chart">

          <div
            className="slice strong"
            style={{
              transform: `rotate(${performance.percentage * 3.6}deg)`
            }}
          ></div>

        </div>

        <div className="pie-legend">

          <p>
            Performance ({performance.percentage}%)
          </p>

          <p>
            Best Score ({performance.bestScore})
          </p>

          <p>
            Total Quizzes ({performance.totalQuizzes})
          </p>

        </div>

        <p className="ai-text">

          {aiInsights}

        </p>

      </div>

    </div>

  </div>
  );

};

export default InsightsScreen;

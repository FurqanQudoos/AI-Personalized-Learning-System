import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { API_URL } from "../config";
import "../App.css";

const InsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const res = await fetch(`${API_URL}/api/insights`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load insights.");
      }

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!data) return;

    setDownloading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const performance = data.performance || {};
      const weakTopics = data.weakTopics || [];
      const recommendations = data.recommendations || [];
      const progressHistory = data.progressHistory || [];
      const aiInsights = data.aiInsights || "";

      const doc = new jsPDF();
      const margin = 14;
      let y = 18;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;

      const addLine = (text, options = {}) => {
        const {
          size = 11,
          style = "normal",
          gap = 7,
          color = [30, 41, 59],
        } = options;

        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(String(text || ""), maxWidth);

        lines.forEach((line) => {
          if (y > 280) {
            doc.addPage();
            y = 18;
          }
          doc.text(line, margin, y);
          y += gap;
        });
      };

      addLine("AI Learning Companion - Insights Report", {
        size: 16,
        style: "bold",
        gap: 9,
        color: [37, 99, 235],
      });

      addLine(`Student: ${userInfo.name || "User"}`, { size: 11, gap: 6 });
      addLine(`Email: ${userInfo.email || "-"}`, { size: 11, gap: 6 });
      addLine(`Generated: ${new Date().toLocaleString()}`, {
        size: 10,
        gap: 10,
        color: [100, 116, 139],
      });

      addLine("Performance Summary", {
        size: 13,
        style: "bold",
        gap: 8,
        color: [15, 23, 42],
      });
      addLine(`Level: ${performance.level || "N/A"}`);
      addLine(`Total Quizzes: ${performance.totalQuizzes ?? 0}`);
      addLine(`Average Score: ${performance.averageScore ?? 0}`);
      addLine(`Latest Score: ${performance.latestScore ?? 0}`);
      addLine(`Best Score: ${performance.bestScore ?? 0}`);
      addLine(`Performance %: ${performance.percentage ?? 0}%`);
      addLine(`Improvement: ${performance.improvement ?? 0}`, { gap: 10 });

      addLine("Learning Progress History", {
        size: 13,
        style: "bold",
        gap: 8,
        color: [15, 23, 42],
      });

      if (!progressHistory.length) {
        addLine("No quiz history available.", { gap: 10 });
      } else {
        progressHistory.forEach((item) => {
          addLine(
            `${item.label || `Quiz ${item.quiz}`}: ${item.percentage}% (${item.score}/${item.totalQuestions})${item.topic ? ` - ${item.topic}` : ""}`
          );
        });
        y += 4;
      }

      addLine("Weak Topics", {
        size: 13,
        style: "bold",
        gap: 8,
        color: [15, 23, 42],
      });

      if (!weakTopics.length) {
        addLine("No weak topics.", { gap: 10 });
      } else {
        weakTopics.forEach((item, index) => {
          addLine(`${index + 1}. ${item.topic} (${item.mistakes} mistakes)`);
        });
        y += 4;
      }

      addLine("Recommendations", {
        size: 13,
        style: "bold",
        gap: 8,
        color: [15, 23, 42],
      });

      recommendations.forEach((item, index) => {
        addLine(`${index + 1}. ${item}`);
      });
      y += 4;

      addLine("AI Insights", {
        size: 13,
        style: "bold",
        gap: 8,
        color: [15, 23, 42],
      });
      addLine(aiInsights || "No AI insights available.");

      const fileName = `insights-report-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
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
  const progressHistory = data.progressHistory || [];

  return (
    <div className="insights-page">
      <div className="insights-toolbar">
        <h2>Your Learning Insights</h2>
        <button
          type="button"
          className="download-pdf-btn"
          onClick={downloadPdf}
          disabled={downloading}
        >
          {downloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>

      <div className="insights-container">
        <div className="insight-card">
          <h3>Performance Level</h3>

          <div className="performance-badge">{performance.level}</div>

          <p className="small-text">Average Score {performance.averageScore}</p>

          <div className="graph">
            <span className={performance.totalQuizzes >= 1 ? "active" : ""}></span>
            <span className={performance.totalQuizzes >= 2 ? "active" : ""}></span>
            <span className={performance.totalQuizzes >= 3 ? "active" : ""}></span>
            <span className="active"></span>
          </div>

          <p className="small-text">
            Latest Score {performance.latestScore}
            {performance.improvement > 0 && <> (+{performance.improvement})</>}
            {performance.improvement < 0 && <> ({performance.improvement})</>}
          </p>

          {progressHistory.length > 0 && (
            <div className="insight-progress-mini">
              <p className="small-text">Score trend</p>
              <div className="insight-progress-bars">
                {progressHistory.map((item) => (
                  <div key={item.quiz} className="insight-progress-bar-item">
                    <div
                      className="insight-progress-bar-fill"
                      style={{ height: `${Math.max(8, item.percentage)}%` }}
                      title={`${item.label}: ${item.percentage}%`}
                    />
                    <span>Q{item.quiz}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="insight-middle">
          <div className="insight-card">
            <h3>Weak Topics List</h3>
            <ul className="icon-list">
              {weakTopics.length > 0 ? (
                weakTopics.map((item, index) => (
                  <li key={index}>
                    📘 {item.topic} ({item.mistakes} mistakes)
                  </li>
                ))
              ) : (
                <li>No weak topics 🎉</li>
              )}
            </ul>
          </div>

          <div className="insight-card">
            <h3>Recommendations</h3>
            <ul className="icon-list">
              {recommendations.map((item, index) => (
                <li key={index}>✅ {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="insight-card">
          <h3>AI Insights</h3>

          <div className="pie-chart">
            <div
              className="slice strong"
              style={{
                transform: `rotate(${performance.percentage * 3.6}deg)`,
              }}
            ></div>
          </div>

          <div className="pie-legend">
            <p>Performance ({performance.percentage}%)</p>
            <p>Best Score ({performance.bestScore})</p>
            <p>Total Quizzes ({performance.totalQuizzes})</p>
          </div>

          <p className="ai-text">{aiInsights}</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsScreen;

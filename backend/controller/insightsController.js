const axios = require("axios");
const QuizResult = require("../models/QuizResult");

exports.getInsights = async (req, res) => {
    try {

        const results = await QuizResult.find({
            user: req.user._id
        }).sort({ createdAt: 1 });

        if (results.length === 0) {

            return res.json({

                success: true,

                performance: {
                    level: "No Data",
                    averageScore: 0,
                    improvement: 0,
                    totalQuizzes: 0,
                    bestScore: 0,
                    latestScore: 0,
                    percentage: 0
                },

                weakTopics: [],

                recommendations: [
                    "Complete your first quiz to generate insights."
                ],

                aiInsights: "No learning history available."

            });

        }

        // =====================================
        // BASIC STATS
        // =====================================

        const totalQuizzes = results.length;

        let totalScore = 0;
        let bestScore = 0;

        const topicMap = {};

        results.forEach(result => {

            totalScore += result.score;

            if (result.score > bestScore)
                bestScore = result.score;

            if (result.weakTopics) {

                result.weakTopics.forEach(item => {

                    if (!topicMap[item.topic]) {

                        topicMap[item.topic] = 0;

                    }

                    topicMap[item.topic] += item.mistakes;

                });

            }

        });

        // =====================================
        // SCORES
        // =====================================

        const averageScore =
            Number((totalScore / totalQuizzes).toFixed(1));

        const latestQuiz =
            results[results.length - 1];

        const previousQuiz =
            results.length > 1
                ? results[results.length - 2]
                : null;

        const latestScore = latestQuiz.score;

        const previousScore =
            previousQuiz
                ? previousQuiz.score
                : latestScore;

        const improvement =
            latestScore - previousScore;

        // =====================================
        // PERFORMANCE LEVEL
        // =====================================

        const percentage =
            Math.round(
                (averageScore / latestQuiz.totalQuestions) * 100
            );

        let level = "Needs Improvement";

        if (percentage >= 85)
            level = "Excellent";

        else if (percentage >= 70)
            level = "Good";

        else if (percentage >= 50)
            level = "Average";

        // =====================================
        // WEAK TOPICS
        // =====================================

        const weakTopics =
            Object.entries(topicMap)
                .map(([topic, mistakes]) => ({
                    topic,
                    mistakes
                }))
                .sort((a, b) => b.mistakes - a.mistakes);

        // =====================================
        // RECOMMENDATIONS
        // =====================================

        const recommendations = [];

        if (percentage < 70) {

            recommendations.push(
                "Revise your weak topics before attempting another quiz."
            );

        }

        if (weakTopics.length) {

            recommendations.push(
                `Spend extra time on "${weakTopics[0].topic}".`
            );

        }

        if (improvement > 0) {

            recommendations.push(
                "Great improvement! Keep practicing consistently."
            );

        } else if (improvement < 0) {

            recommendations.push(
                "Your latest score dropped. Review previous mistakes carefully."
            );

        }

        if (!recommendations.length) {

            recommendations.push(
                "Keep solving quizzes regularly to maintain your performance."
            );

        }

        // =====================================
        // AI SUMMARY
        // =====================================

        let aiInsights =
            "Unable to generate AI insights.";

        try {

            const pythonApi =
                process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

            const aiResponse = await axios.post(

                `${pythonApi}/insights`,

                {
                    totalQuizzes,
                    averageScore,
                    latestScore,
                    previousScore,
                    improvement,
                    bestScore,
                    performanceLevel: level,
                    percentage,
                    weakTopics
                }

            );

            if (aiResponse.data.success) {

                aiInsights = aiResponse.data.aiInsights;

            }

        }
        catch (err) {

            console.log("FastAPI Insights Error:", err.message);

        }

        // =====================================
        // FINAL RESPONSE
        // =====================================

        return res.json({

            success: true,

            performance: {

                totalQuizzes,

                averageScore,

                latestScore,

                previousScore,

                improvement,

                bestScore,

                level,

                percentage

            },

            weakTopics,

            recommendations,

            aiInsights

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Failed to generate insights."

        });

    }

};
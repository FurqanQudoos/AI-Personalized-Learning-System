const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const QuizResult = require("../models/QuizResult");
const Quiz = require("../models/Quiz");

const PYTHON_API = "http://127.0.0.1:8000";

// ==========================================
// ANALYZE PAPER
// ==========================================

exports.analyzePaper = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No image uploaded."
            });
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path));

        const response = await axios.post(
            `${PYTHON_API}/analyze`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 300000,
            }
        );

        return res.json(response.data);

    } catch (error) {

        console.error(error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            error:
                error.response?.data?.error ||
                error.message ||
                "AI analysis failed."
        });

    } finally {

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, () => { });
        }

    }
};

// ==========================================
// START AI TUTOR
// ==========================================

exports.teachStudent = async (req, res) => {
    try {
        // const weakTopics = req.body.weak_topics || [];
        // const topic = req.body.topic;

        // const weakQuestions = req.body.weak_questions || [];

        const payload = {
            weak_topics: req.body.weak_topics || {}
        };


        // const payload = {
        //     topic: req.body.topic || weakTopics[0] || "General",
        //     weak_questions: weakTopics,
        // };

        const response = await axios.post(
            `${PYTHON_API}/teach`,
            payload,
            {
                timeout: 300000,
            }
        );

        return res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);

        return res.status(500).json({
            success: false,
            message: "Tutor failed.",
        });
    }
};

// ==========================================
// CHAT WITH AI
// ==========================================

exports.chatWithTutor = async (req, res) => {
    try {
        // const weakTopics = req.body.weak_topics || [];

        const payload = {
            weak_topics: req.body.weak_topics || {},
            student_message: req.body.student_message
        };

        const response = await axios.post(
            `${PYTHON_API}/chat`,
            payload,
            {
                timeout: 300000,
            }
        );

        return res.json({
            success: true,
            intent: response.data.intent,
            message: response.data.reply || response.data.message,
        });
    } catch (err) {
        console.error(err.response?.data || err.message);

        return res.status(500).json({
            success: false,
            message: "Chat failed.",
        });
    }
};

// ==========================================
// GENERATE QUIZ
// ==========================================

// exports.generateQuiz = async (req, res) => {
//     try {
//         // const weakTopics = req.body.weak_topics || [];

//         const payload = {
//             weak_topics: req.body.weak_topics || {}
//         };

//         const response = await axios.post(
//             `${PYTHON_API}/quiz`,
//             payload,
//             {
//                 timeout: 300000,
//             }
//         );

//         const data = response.data;

//         if (data.success && Array.isArray(data.questions)) {
//             data.questions = data.questions.map((q) => ({
//                 question: q.question,
//                 options: [
//                     q.A,
//                     q.B,
//                     q.C,
//                     q.D,
//                 ],
//             }));
//         }

//         return res.json(data);
//     } catch (err) {
//         console.error(err.response?.data || err.message);

//         return res.status(500).json({
//             success: false,
//             message: "Quiz generation failed.",
//         });
//     }
// };
exports.generateQuiz = async (req, res) => {

    try {

        const payload = {
            weak_topics: req.body.weak_topics || {}
        };

        const response = await axios.post(
            `${PYTHON_API}/quiz`,
            payload,
            {
                timeout: 300000
            }
        );

        const data = response.data;
        const originalQuiz = data.original_quiz;

        if (!data.success) {
            return res.status(400).json(data);
        }

        // ===============================
        // SAVE ORIGINAL QUIZ IN DATABASE
        // ===============================

        await Quiz.findOneAndUpdate(

            {
                quizId: data.quiz_id
            },

            {
                quizId: data.quiz_id,

                user: req.user._id,

                topic: data.topic,

                questions: originalQuiz
            },

            {
                upsert: true,
                new: true
            }

        );
        const savedQuiz = await Quiz.findOne({ quizId: data.quiz_id });
        // ===============================
        // CONVERT FOR FRONTEND
        // ===============================

        data.questions = data.questions.map((q) => ({

            question: q.question,

            options: [
                q.A,
                q.B,
                q.C,
                q.D
            ]

        }));

        return res.json(data);

    }

    catch (err) {

        console.error(err.response?.data || err);

        return res.status(500).json({

            success: false,

            message: "Quiz generation failed."

        });

    }

};
exports.submitQuiz = async (req, res) => {

    try {

        // ==========================
        // GET QUIZ FROM DATABASE
        // ==========================

        const quiz = await Quiz.findOne({
            quizId: req.body.quiz_id,
            user: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz not found."
            });
        }

        // ==========================
        // SEND ORIGINAL QUIZ TO PYTHON
        // ==========================

        const payload = {

            quiz_id: req.body.quiz_id,

            quiz: quiz.questions,

            topic: quiz.topic,

            answers: req.body.answers

        };
        const response = await axios.post(
            `${PYTHON_API}/submit-quiz`,
            payload,
            {
                timeout: 300000
            }
        );

        const data = response.data;
        // const originalQuiz = response.data.original_quiz;

        if (!data.success) {
            return res.status(400).json(data);
        }

        // ==========================
        // SAVE RESULT
        // ==========================

        await QuizResult.create({

            user: req.user._id,

            score: data.score,

            totalQuestions: data.total,

            correctAnswers: data.score,

            wrongAnswers: data.total - data.score,

            topic: data.topic,

            // ==========================
            // INSIGHTS DATA
            // ==========================
            weakTopics: data.topic
                .split(",")
                .map(topic => ({
                    topic: topic.trim(),
                    mistakes: data.total - data.score
                })),

            // ==========================
            // QUIZ DETAILS
            // ==========================
            mistakes: data.mistakes || [],

            results: data.results || [],

            finalTutorNote: data.final_tutor_note || ""

        });

        // Optional: quiz delete after successful submission
        await Quiz.deleteOne({
            quizId: req.body.quiz_id
        });

        return res.json(data);

    }

    catch (err) {

        console.error(err.response?.data || err);

        return res.status(500).json({

            success: false,

            message: "Quiz submission failed."

        });

    }

};
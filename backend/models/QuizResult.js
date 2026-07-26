const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        score: {
            type: Number,
            required: true
        },

        totalQuestions: {
            type: Number,
            required: true
        },

        correctAnswers: {
            type: Number,
            required: true
        },

        wrongAnswers: {
            type: Number,
            required: true
        },

        topic: {
            type: String,
            default: ""
        },

        // ==========================
        // FOR INSIGHTS ANALYTICS
        // ==========================
        weakTopics: [
            {
                topic: {
                    type: String
                },

                mistakes: {
                    type: Number,
                    default: 0
                }
            }
        ],

        // ==========================
        // WRONG QUESTIONS
        // ==========================
        mistakes: [
            {
                type: String
            }
        ],

        // ==========================
        // QUESTION RESULTS
        // ==========================
        results: [
            {
                type: Object
            }
        ],

        // ==========================
        // FINAL AI FEEDBACK
        // ==========================
        finalTutorNote: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "QuizResult",
    quizResultSchema
);
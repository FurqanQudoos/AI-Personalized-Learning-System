const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
    {
        quizId: {
            type: String,
            required: true,
            unique: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        topic: {
            type: String,
            default: ""
        },

        questions: [
            {
                question: String,
                A: String,
                B: String,
                C: String,
                D: String,
                correct_option: String,
                explanation: String
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Quiz", QuizSchema);
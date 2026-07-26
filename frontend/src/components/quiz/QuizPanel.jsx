import React, {
    useEffect,
    useState
} from "react";
import QuizResult from "./QuizResult";
import "./quiz.css";

import axios from "axios";

const QuizPanel = ({

    analysis,

    onQuizCompleted

}) => {


    const [loading, setLoading] = useState(false);

    const [questions, setQuestions] = useState([]);

    const [current, setCurrent] = useState(0);

    const [answers, setAnswers] = useState(() => {

        const saved = sessionStorage.getItem("quizAnswers");

        return saved ? JSON.parse(saved) : {};

    });

    const [submitted, setSubmitted] = useState(false);

    const [result, setResult] = useState(null);

    const [timeLeft, setTimeLeft] = useState(900);
    const [quizId, setQuizId] = useState("");

    // const questionData = analysis?.report || [];
    const weakTopics = Object.keys(
        analysis?.weak_topics || {}
    );
    // const weakTopics = [

    //     ...new Set(

    //         questionData

    //             .filter(q => q.status === "Incorrect")

    //             .map(q => q.weakness_topic)

    //             .filter(Boolean)

    //     )

    // ];
    const loadQuiz = async () => {

        // Prevent duplicate requests
        if (sessionStorage.getItem("quizQuestions")) {
            return;
        }

        if (!weakTopics.length) {
            return;
        }

        setLoading(true);

        try {

            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.token;

            const res = await axios.post(
                "http://localhost:5000/api/ai/quiz",
                {
                    weak_topics: analysis.weak_topics
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {

                setQuizId(res.data.quiz_id || "");

                setQuestions(res.data.questions || []);
                sessionStorage.setItem(

                    "quizQuestions",

                    JSON.stringify(res.data.questions)

                );

                sessionStorage.setItem(

                    "quizId",

                    res.data.quiz_id

                );

            }

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };
    useEffect(() => {

        const savedQuestions = sessionStorage.getItem("quizQuestions");
        const savedQuizId = sessionStorage.getItem("quizId");

        if (savedQuestions) {
            setQuestions(JSON.parse(savedQuestions));
        }

        if (savedQuizId) {
            setQuizId(savedQuizId);
        }

    }, []);

    useEffect(() => {

        if (analysis && questions.length === 0) {

            loadQuiz();

        }

    }, [analysis]);

    useEffect(() => {

        if (submitted) return;

        if (timeLeft <= 0) {

            submitQuiz();

            return;

        }

        const timer = setInterval(() => {

            setTimeLeft(prev => prev - 1);

        }, 1000);

        return () => clearInterval(timer);

    }, [timeLeft, submitted]);



    const selectOption = (questionIndex, option) => {

        setAnswers(prev => {

            const updated = {

                ...prev,

                [questionIndex]: option

            };

            sessionStorage.setItem(

                "quizAnswers",

                JSON.stringify(updated)

            );

            return updated;

        });

    };

    const nextQuestion = () => {

        if (current < questions.length - 1) {

            setCurrent(current + 1);

        }

    };

    const previousQuestion = () => {

        if (current > 0) {

            setCurrent(current - 1);

        }

    };

    const jumpToQuestion = (index) => {

        setCurrent(index);

    };


    const submitQuiz = async () => {

        if (submitted) return;

        setLoading(true);

        try {

            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.token;

            const savedQuizId = sessionStorage.getItem("quizId");

            const savedQuestions = JSON.parse(
                sessionStorage.getItem("quizQuestions") || "[]"
            );

            const answersArray = savedQuestions.map((_, index) => {
                return answers[index] || "";
            });
            const res = await axios.post(
                "http://localhost:5000/api/ai/submit-quiz",
                {
                    quiz_id: savedQuizId,
                    answers: answersArray
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResult(res.data);
            setSubmitted(true);

            if (onQuizCompleted) {

                onQuizCompleted(res.data);

            }

        }

        catch (err) {

            alert(
                err.response?.data?.message ||
                "Quiz submission failed."
            );

        }

        finally {

            setLoading(false);

        }

    };

    const formatTime = () => {

        const min = Math.floor(timeLeft / 60);

        const sec = timeLeft % 60;

        return `${min}:${sec.toString().padStart(2, "0")}`;

    };

    const progress = ((current + 1) / Math.max(questions.length, 1)) * 100;
    if (loading && !submitted && questions.length === 0) {

        return (

            <div className="quiz-loading">

                <div className="spinner"></div>

                <h3>Generating Your Personalized Quiz...</h3>

                <p>Please wait while AI prepares questions based on your weak topics.</p>

            </div>

        );

    }

    if (submitted && result) {

        return (

            <QuizResult

                result={result}

            />

        );

    }

    const currentQuestion = questions[current];

    return (

        <div className="quiz-panel">

            <div className="quiz-header">

                <div>

                    <h2>📝 AI Practice Quiz</h2>

                    <p>

                        Practice questions generated from your weak topics

                    </p>

                </div>

                <div

                    className={`timer

                    ${timeLeft <= 60

                            ? "danger"

                            : timeLeft <= 300

                                ? "warning"

                                : ""

                        }`}

                >

                    ⏱ {formatTime()}

                </div>

            </div>

            <div className="progress-section">

                <div className="progress-info">

                    <span>

                        Question {current + 1} of {questions.length}

                    </span>

                    <span>

                        {Math.round(progress)}%

                    </span>

                </div>

                <div className="progress-bar">

                    <div

                        className="progress-fill"

                        style={{

                            width: `${progress}%`

                        }}

                    ></div>

                </div>

            </div>

            <div className="question-navigation">

                {

                    questions.map((q, index) => (

                        <button

                            key={index}

                            className={`nav-circle

                                ${current === index ? "active" : ""}

                                ${answers[index] ? "answered" : ""}

                            `}

                            onClick={() => jumpToQuestion(index)}

                        >

                            {index + 1}

                        </button>

                    ))

                }

            </div>

            {
                currentQuestion && (

                    <div className="question-card">

                        <div className="question-title">
                            <h3>{currentQuestion.question}</h3>
                        </div>

                        <div className="options-list">

                            {currentQuestion.options.map((option, index) => {

                                const letter = String.fromCharCode(65 + index);

                                return (

                                    <label
                                        key={index}
                                        className={`option-card ${answers[current] === letter ? "selected" : ""
                                            }`}
                                    >

                                        <input
                                            type="radio"
                                            name={`q-${current}`}
                                            value={letter}
                                            checked={answers[current] === letter}
                                            onChange={() => selectOption(current, letter)}
                                        />

                                        <div className="option-letter">
                                            {letter}
                                        </div>

                                        <div className="option-text">
                                            {option}
                                        </div>

                                    </label>

                                );

                            })}

                        </div>

                    </div>

                )
            }

            <div className="quiz-footer">

                <button

                    className="previous-btn"

                    disabled={current === 0}

                    onClick={previousQuestion}

                >

                    ← Previous

                </button>

                {

                    current < questions.length - 1

                        ?

                        (

                            <button

                                className="next-btn"

                                onClick={nextQuestion}

                            >

                                Next →

                            </button>

                        )

                        :

                        (

                            <button

                                className="submit-btn"

                                onClick={submitQuiz}

                            >

                                Submit Quiz

                            </button>

                        )

                }

            </div>

        </div>

    );

};

export default QuizPanel;
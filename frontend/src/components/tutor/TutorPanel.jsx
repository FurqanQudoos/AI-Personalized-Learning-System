import React, {
    useEffect,
    useRef,
    useState
} from "react";
import { API_URL } from "../../config";

import axios from "axios";
import "./tutor.css";

const TutorPanel = ({

    analysis,

    onStartQuiz

}) => {
    

    const [started, setStarted] = useState(() => {

        const saved = sessionStorage.getItem("teachChat");

        return saved ? JSON.parse(saved).length > 0 : false;

    });

    const [loading, setLoading] = useState(false);

    const [typing, setTyping] = useState(false);

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState(() => {

        const saved = sessionStorage.getItem("teachChat");

        return saved ? JSON.parse(saved) : [];

    });

    const bottomRef = useRef(null);

    //   const questions = analysis?.data || [];
    // const weakTopics = Object.keys(
    //     analysis?.weak_topics || {}
    // );

    //   const weakTopics = [

    //     ...new Set(

    //       questions

    //         .filter(q => q.status === "Incorrect")

    //         .map(q => q.weakness_topic)

    //         .filter(Boolean)

    //     )

    //   ];

    useEffect(() => {

        bottomRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages, typing]);
    const weakTopics = Object.keys(analysis?.weak_topics || {});

    const currentTopic = weakTopics[0];

    const weakQuestions = analysis?.weak_topics?.[currentTopic] || [];

    // const startTeaching = async () => {

    //     setStarted(true);

    //     setLoading(true);

    //     try {

    //         const response = await axios.post(

    //             `${API_URL}/api/ai/teach`,

    //             {

    //                 weak_topics: weakTopics

    //             }

    //         );

    //         setMessages([

    //             {

    //                 sender: "ai",

    //                 text: response.data.message ||

    //                     "Hello 👋 Let's begin today's lesson."

    //             }

    //         ]);

    //     }

    //     catch (err) {

    //         setMessages([

    //             {

    //                 sender: "ai",

    //                 text: "Hello 👋 Let's begin today's lesson."

    //             }

    //         ]);

    //     }

    //     finally {

    //         setLoading(false);

    //     }

    // };
    const startTeaching = async () => {
        setStarted(true);
        setTyping(true);
        setLoading(true);

        try {

            // const response = await axios.post(

            //     `${API_URL}/api/ai/teach`,

            //     {

            //         weak_topics: weakTopics

            //     }

            // );

            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.token;

            const response = await axios.post(
                `${API_URL}/api/teach`,
                {
                    weak_topics: analysis.weak_topics
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // const response = await axios.post(...);

            if (response.data.success) {

                const firstMessage = [
                    {
                        sender: "ai",
                        text: response.data.message
                    }
                ];

                setMessages(firstMessage);

                sessionStorage.setItem(
                    "teachChat",
                    JSON.stringify(firstMessage)
                );

                setStarted(true);

            }

            // setMessages([

            //     {

            //         sender: "ai",

            //         text: response.data.message ||

            //             "Hello 👋 Let's begin today's lesson."

            //     }

            // ]);

            // API success ke baad chat open karo
            // setStarted(true);

        }

        // catch (err) {

        //     setMessages([

        //         {

        //             sender: "ai",

        //             text: "Sorry, AI Tutor is unavailable."

        //         }

        //     ]);

        // }
        catch (err) {

            setStarted(true);

            const firstMessage = [
                {
                    sender: "ai",
                    text: "Sorry, AI Tutor is unavailable.",

                }
            ];

            setMessages(firstMessage);
            {
                messages.length > 0 &&
                    messages[messages.length - 1].text === "Sorry, AI Tutor is unavailable." && (

                        <div className="retry-container">
                            <button
                                className="retry-btn"
                                onClick={startTeaching}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="retry-spinner"></span>
                                        Retrying...
                                    </>
                                ) : (
                                    <>
                                        🔄 Retry AI Tutor
                                    </>
                                )}
                            </button>
                        </div>

                    )
            }
            sessionStorage.setItem(
                "teachChat",
                JSON.stringify(firstMessage)
            );

        }
        finally {
            setTyping(false);
            setLoading(false);

        }

    };


    // const sendMessage = async () => {

    //     if (!message.trim()) return;

    //     const studentMessage = message;

    //     setMessages(prev => [

    //         ...prev,

    //         {

    //             sender: "user",

    //             text: studentMessage

    //         }

    //     ]);


    //     setMessage("");

    //     setTyping(true);

    //     try {

    //         const response = await axios.post(

    //             `${API_URL}/api/ai/chat`,

    //             {

    //                 message: studentMessage,

    //                 weak_topics: weakTopics

    //             }

    //         );


    //         // ⭐ Ye add karo
    //         if (response.data.intent === "GENERATE_QUIZ") {

    //             onStartQuiz();

    //             return;

    //         }
    //         setMessages(prev => [

    //             ...prev,

    //             {

    //                 sender: "ai",

    //                 text: response.data.message

    //             }

    //         ]);

    //     }

    //     catch (err) {


    //         setMessages(prev => [

    //             ...prev,

    //             {

    //                 sender: "ai",

    //                 text:

    //                     "Sorry, something went wrong."

    //             }

    //         ]);

    //     }
    //     finally {

    //         setTyping(false);

    //     }

    // };
    const sendMessage = async () => {

        if (!message.trim()) return;

        const studentMessage = message;

        // setMessages(prev => [

        //     ...prev,

        //     {

        //         sender: "user",

        //         text: studentMessage

        //     }

        // ]);
        const userMessage = {

            sender: "user",

            text: studentMessage

        };

        setMessages(prev => {

            const updated = [

                ...prev,

                userMessage

            ];

            sessionStorage.setItem(

                "teachChat",

                JSON.stringify(updated)

            );

            return updated;

        });

        setMessage("");

        setTyping(true);

        try {

            // const response = await axios.post(

            //     `${API_URL}/api/ai/chat`,

            //     {

            //         message: studentMessage,

            //         weak_topics: weakTopics

            //     }

            // );
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.token;

            const response = await axios.post(
                `${API_URL}/api/chat`,
                {
                    weak_topics: analysis.weak_topics,
                    student_message: studentMessage
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.intent === "GENERATE_QUIZ") {

                onStartQuiz({
                    weak_topics: analysis.weak_topics
                });

                return;

            }

            if (response.data.success) {

                setMessages(prev => {

                    const updated = [

                        ...prev,

                        {

                            sender: "ai",

                            text: response.data.message

                        }

                    ];

                    sessionStorage.setItem(

                        "teachChat",

                        JSON.stringify(updated)

                    );

                    return updated;

                });

            }

        }

        catch (err) {

            setMessages(prev => {

                const updated = [

                    ...prev,

                    {

                        sender: "ai",

                        text: "Sorry, something went wrong."

                    }

                ];

                sessionStorage.setItem(

                    "teachChat",

                    JSON.stringify(updated)

                );

                return updated;

            });

        }

        finally {

            setTyping(false);

        }

    };
    return (

        <div className="tutor-panel">

            <div className="tutor-top">

                <div>

                    <h2>🤖 AI Tutor</h2>

                    <p>

                        Personalized learning assistant

                    </p>

                </div>

                <button

                    className="quiz-btn"

                    disabled={!messages.length}

                    onClick={() => {

                        if (messages.length) {

                            onStartQuiz();

                        }

                    }}
                >

                    Generate Quiz

                </button>

            </div>

            {

                !started ? (

                    <div className="tutor-start">

                        <div className="tutor-start-icon">

                            🎓

                        </div>

                        <h3>

                            Ready to learn?

                        </h3>

                        <p>

                            Your weak topics have been identified.

                            Click below to begin your personalized lesson.

                        </p>

                        <button

                            className="start-btn"

                            onClick={startTeaching}

                            disabled={loading}

                        >

                            {

                                loading

                                    ? "Starting..."

                                    : "Start Learning"

                            }

                        </button>

                    </div>

                )

                    :

                    (

                        <>

                            <div className="chat-container">

                                {

                                    messages.map((msg, index) => (

                                        <div

                                            key={index}

                                            className={`message-row ${msg.sender}`}

                                        >

                                            {

                                                msg.sender === "ai"

                                                &&

                                                <div className="avatar">

                                                    🤖

                                                </div>

                                            }

                                            <div className="message-box">

                                                <div className="sender">

                                                    {

                                                        msg.sender === "ai"

                                                            ? "AI Tutor"

                                                            : "You"

                                                    }

                                                </div>

                                                <div className="message">

                                                    {msg.text}

                                                </div>

                                            </div>

                                            {

                                                msg.sender === "user"

                                                &&

                                                <div className="avatar">

                                                    🙂

                                                </div>

                                            }

                                        </div>

                                    ))

                                }

                                {

                                    typing && (

                                        <div className="message-row ai">

                                            <div className="avatar">

                                                🤖

                                            </div>

                                            <div className="typing-box">

                                                <span></span>

                                                <span></span>

                                                <span></span>

                                            </div>

                                        </div>

                                    )

                                }

                                <div ref={bottomRef}></div>

                            </div>
                            {
                                messages.length > 0 &&
                                messages[messages.length - 1].text ===
                                "Sorry, AI Tutor is unavailable." && (

                                    <div className="retry-container">

                                        <button
                                            className="retry-btn"
                                            onClick={startTeaching}
                                            disabled={loading}
                                        >
                                            {
                                                loading
                                                    ? "Retrying..."
                                                    : "Retry AI Tutor"
                                            }
                                        </button>

                                    </div>

                                )
                            }

                            <div className="chat-input-area">

                                <input

                                    type="text"
                                    disabled={typing}

                                    placeholder="Ask anything..."

                                    value={message}

                                    onChange={(e) => setMessage(e.target.value)}

                                    onKeyDown={(e) => {

                                        if (e.key === "Enter") {

                                            sendMessage();

                                        }

                                    }}

                                />

                                <button

                                    onClick={sendMessage}

                                    disabled={typing}

                                >

                                    {

                                        typing ?

                                            "Thinking..."

                                            :

                                            "Send"

                                    }

                                </button>

                            </div>

                        </>

                    )

            }

        </div>


    );

};

export default TutorPanel;
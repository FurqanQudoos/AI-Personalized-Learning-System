// import React from "react";
// import "./upload.css";

// const WeakTopics = ({ analysis }) => {

//     const questions = analysis?.data || [];

//     const weakTopics = [

//         ...new Set(

//             questions

//                 .filter((q) => q.status === "Incorrect")

//                 .map((q) => q.weakness_topic)

//                 .filter(Boolean)

//         )

//     ];

//     if (weakTopics.length === 0) return null;

//     return (

//         <div className="weak-topics-card">

//             <div className="section-header">

//                 <h2>⚠ Weak Topics</h2>

//                 <p>

//                     These are the concepts where you need more practice.

//                 </p>

//             </div>

//             <div className="topics-grid">

//                 {

//                     weakTopics.map((topic, index) => (

//                         <div

//                             key={index}

//                             className="topic-item"

//                         >

//                             <div className="topic-icon">

//                                 📘

//                             </div>

//                             <span>

//                                 {topic}

//                             </span>

//                         </div>

//                     ))

//                 }

//             </div>

//         </div>

//     );

// };

// export default WeakTopics;
import React from "react";
import "./upload.css";

const WeakTopics = ({ analysis }) => {

    const weakTopics = analysis?.weak_topics || {};

    const topics = Object.keys(weakTopics);

    if (topics.length === 0) return null;

    return (

        <div className="weak-topics-card">

            <div className="section-header">

                <h2>⚠ Weak Topics</h2>

                <p>

                    These are the concepts where you need more practice.

                </p>

            </div>

            <div className="topics-grid">

                {

                    topics.map((topic,index)=>(

                        <div

                            key={index}

                            className="topic-item"

                        >

                            <div className="topic-icon">

                                📘

                            </div>

                            <div>

                                <strong>{topic}</strong>

                                <p>

                                    {weakTopics[topic].join(", ")}

                                </p>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

};

export default WeakTopics;
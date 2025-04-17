import React from "react";

const SingleQuestion = (props) => {
    const question = props.question ?? {};

    return (
        <div className="question-container">
            <h2>{question.title}</h2>
            <p>{question.description}</p>
            <p>Answer: {question.answer}</p>
        </div>
    );
};

export default SingleQuestion;
import { useState, useEffect } from 'react';
import { Header, Segment, Radio, Button, Message } from 'semantic-ui-react';

function Questionnaire(params: any) {
    const [data, setData] = useState<any>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [message, setMessage] = useState({ show: false, success: false, content: '' });

    const user_id = localStorage.getItem("user_id");

    useEffect(() => {
        // Fetch the questionnaire data when the component mounts
        fetch('http://localhost:3000/questionnaires/1')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => {
                console.error('Error fetching questionnaire:', error);
                setMessage({ show: true, success: false, content: 'Error fetching data' });
            });
    }, []);

    const handleSubmit = () => {
        const answersArray = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
            question_id: parseInt(questionId),
            answer_id: answerId
        }));

        const payload = {
            user_id,
            answers: answersArray
        };

        // Post the data to the backend
        fetch('http://localhost:3000/submit-all-answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(result => {
                console.log('Submitted:', result);
                setMessage({ show: true, success: true, content: 'Answers submitted successfully!' });
            })
            .catch(error => {
                console.error('Error submitting answers:', error);
                setMessage({ show: true, success: false, content: 'Error submitting answers' });
            });
    };

    if (!data) { return <Segment placeholder loading />; }

    return (
        <Segment>
            <Header as='h3'>{data.title}</Header>
            <p>{data.description}</p>
            {data.Questions.map((question: any) => (
                <Segment key={question.id}>
                    <Header as='h4'>{question.question_text}</Header>
                    {question.Answers.map((answer: any) => (
                        <div key={answer.id}>
                            <Radio
                                label={answer.answer_text}
                                name={`question-${question.id}`}
                                value={answer.id}
                                checked={selectedAnswers[question.id] === answer.id}
                                onChange={() => setSelectedAnswers(prev => ({ ...prev, [question.id]: answer.id }))}
                            />
                        </div>
                    ))}
                </Segment>
            ))}
            <Button positive onClick={handleSubmit}>Submit</Button>
            {message.show && (
                <Message
                    success={message.success}
                    error={!message.success}
                    content={message.content}
                />
            )}
        </Segment>
    );
}

export default Questionnaire;

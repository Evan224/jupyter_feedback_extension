import { useState, useEffect } from 'react';



function Questionnaire(params:any) {
  const [data, setData] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    // Fetch the questionnaire data when the component mounts
    fetch('http://localhost:3000/questionnaires/1')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching questionnaire:', error));
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
    .then(result => console.log('Submitted:', result))
    .catch(error => console.error('Error submitting answers:', error));
  };

  if (!data) {return <div>Loading...</div>;}

  return (
    <div>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      {data.Questions.map((question: any) => (
        <div key={question.id}>
          <p>{question.question_text}</p>
          {question.Answers.map((answer: any) => (
            <div key={answer.id}>
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                value={answer.id}
                onChange={() => setSelectedAnswers(prev => ({ ...prev, [question.id]: answer.id }))}
              />
              <label>{answer.answer_text}</label>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Questionnaire;

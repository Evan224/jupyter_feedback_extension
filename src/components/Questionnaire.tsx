import { useState } from 'react';

interface IQuestionnaireProps {
  onSubmit: (answers: string[]) => void;
}

function Questionnaire({ onSubmit }: IQuestionnaireProps) {
  const [answers, setAnswers] = useState<string[]>(['', '', '']); // Assuming 3 questions for simplicity

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div>
      <h3>Questionnaire</h3>
      {answers.map((answer, index) => (
        <div key={index}>
          <label>Question {index + 1}:</label>
          <input 
            type="text" 
            value={answer} 
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[index] = e.target.value;
              setAnswers(newAnswers);
            }}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Questionnaire;

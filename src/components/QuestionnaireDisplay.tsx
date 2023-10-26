import { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';

interface IQuestionnaireDisplayProps {
  questionnaireId: number;
}

function QuestionnaireDisplay({ questionnaireId }: IQuestionnaireDisplayProps) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Fetch the questionnaire data when the component mounts
    fetch(`http://localhost:3000/questionnaires/${questionnaireId}`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching questionnaire:', error));
  }, [questionnaireId]);

  const renderAnswerStats = (question: any) => {
    // Assume there's a 'StudentAnswers' field in the question data
    // which contains the student answers for each question
    const answerCounts: { [key: number]: number } = {};

    question.StudentAnswers.forEach((studentAnswer: any) => {
        const answerId = studentAnswer.answer_id;
        answerCounts[answerId] = (answerCounts[answerId] || 0) + 1;
    });

    return question.Answers.map((answer: any) => (
        <div key={answer.id}>
            {answer.answer_text}: {answerCounts[answer.id] || 0}
        </div>
    ));
};


  if (!data) { return <div>Loading...</div>; }
  console.log(data,'-------------data---------------')

  return (
    <div>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      {data.Questions?.map((question: any) => (
        <div key={question.id}>
          <p>{question.question_text}</p>
          {renderAnswerStats(question)}
        </div>
      ))}
    </div>
  );
}


class QuestionnaireDisplayWidget extends ReactWidget {
    onSubmit: (answers: string[]) => void;
  
    constructor(onSubmit: (answers: string[]) => void) {
      super();
      this.onSubmit = onSubmit;
    }
  
    render() {
      return <QuestionnaireDisplay questionnaireId={1}/>;
    }
  }
  
  export default QuestionnaireDisplayWidget;

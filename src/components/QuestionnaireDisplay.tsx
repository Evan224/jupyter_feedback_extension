import { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Card, Header, Segment, List, Label } from 'semantic-ui-react';

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

    question?.StudentAnswers?.forEach((studentAnswer: any) => {
        const answerId = studentAnswer.answer_id;
        answerCounts[answerId] = (answerCounts[answerId] || 0) + 1;
    });

    return question?.Answers?.map((answer: any) => (
        <Label key={answer.id}>
            {answer.answer_text}: {answerCounts[answer.id] || 0}
        </Label>
    ));
  };

  if (!data) { return <Segment loading />; }  // Show loading indicator

  return (
    <Segment style={{ height: '100%', overflowY: 'auto' }}>
      <Header as='h3'>{data.title}</Header>
      <p>{data.description}</p>
      {data.Questions?.map((question: any) => (
        <Segment key={question.id}>
          <Header as='h4'>{question.question_text}</Header>
          <List>
            {renderAnswerStats(question)}
          </List>
        </Segment>
      ))}
    </Segment>
  );
}

class QuestionnaireDisplayWidget extends ReactWidget {
    params: any;

    constructor(params:any) {
      super();
      this.params = params;
    }

    updateParams(params:any){
      this.params = params;
      this.update();
    }

    render() {
      return <QuestionnaireDisplay questionnaireId={1}/>;
    }
}

export default QuestionnaireDisplayWidget;

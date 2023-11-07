import React, { useState,useEffect} from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Segment, Header, Statistic, Card,List,Tab } from 'semantic-ui-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const generateMockQuestionnaireData = () => {
  const questions = [
    {
      id: 1,
      question_text: "How satisfied are you with our product?",
      Answers: [
        { id: 1, answer_text: "Very Satisfied" },
        { id: 2, answer_text: "Satisfied" },
        { id: 3, answer_text: "Neutral" },
        { id: 4, answer_text: "Unsatisfied" },
        { id: 5, answer_text: "Very Unsatisfied" }
      ],
      StudentAnswers: Array.from({ length: 200 }, () => ({ answer_id: Math.floor(Math.random() * 5) + 1 }))
    },
    // 可以添加更多问题和回答
  ];
  return { title: "Student Feedback", description: "Feedback on our product", Questions: questions };
};



function QuestionnaireDisplay(params:any) {
  const [localData, setLocalData] = useState(generateMockQuestionnaireData());
  const [globalData, setGlobalData] = useState<any>(null);



  useEffect(() => {
    // Generate local data (existing code)
    setLocalData(generateMockQuestionnaireData());

    // Generate global data for all questionnaires
    const globalMockData = generateGlobalMockQuestionnaireData(10); // Assuming we have 10 questionnaires
    setGlobalData(globalMockData);
  }, []);

  const panes = [
    { menuItem: 'Local View', render: () => <Tab.Pane>{renderLocalView(localData)}</Tab.Pane> },
    { menuItem: 'Global View', render: () => <Tab.Pane>{renderGlobalView(globalData)}</Tab.Pane> },
  ];

  return (
    <Segment style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 20px)' }}>
      <Header as='h2'>Questionnaire Results</Header>
      <Tab panes={panes} />
    </Segment>
  );


}

function renderLocalView(localData: any) {
  const data=localData;
  const generateChartData = (question:any) => {
    const answerCounts = question.Answers.map((answer:any) => {
      return question.StudentAnswers.filter((sa:any) => sa.answer_id === answer.id).length;
    });

    return {
      labels: question.Answers.map((a:any) => a.answer_text),
      datasets: [{
        label: question.question_text,
        data: answerCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  };
  // Existing rendering logic for local questionnaire view
  return (
    <Segment>
      <Header as='h2'>{data.title}</Header>
      <p>{data.description}</p>
      {data.Questions.map((question:any) => (
        <Card fluid key={question.id}>
          <Card.Content>
            <Card.Header>{question.question_text}</Card.Header>
            <Bar data={generateChartData(question)} />
            <List>
              {question.Answers.map((answer:any) => (
                <List.Item key={answer.id}>
                  {answer.answer_text}: {question.StudentAnswers.filter((sa:any) => sa.answer_id === answer.id).length}
                </List.Item>
              ))}
            </List>
          </Card.Content>
        </Card>
      ))}
    </Segment>
  );
}

function renderGlobalView(globalData: GlobalQuestionnaireData) {
  if (!globalData || !globalData.cellSummaries) {
    return <Segment loading />;
  }

  return (
    <Segment>
      <Header as='h3'>Global Questionnaire Overview</Header>
      {globalData.cellSummaries.map((cellSummary, cellIndex) => (
        <div key={cellIndex}>
          <Header as='h4'>Cell {cellSummary.cellId}</Header>
          {cellSummary.questionSummaries.map((questionSummary, questionIndex) => {
            const chartData = {
              labels: Object.keys(questionSummary.answerCounts).map(key => `Answer ${key}`),
              datasets: [{
                label: questionSummary.questionText,
                data: Object.values(questionSummary.answerCounts),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              }]
            };
            return (
              <Bar key={questionIndex} data={chartData} />
            );
          })}
        </div>
      ))}
    </Segment>
  );
}



interface AnswerCount {
  [key: number]: number;
}

interface QuestionSummary {
  questionText: string;
  answerCounts: AnswerCount;
}

interface GlobalQuestionnaireData {
  cellSummaries: CellSummary[];
}

interface CellSummary {
  cellId: number;
  questionSummaries: QuestionSummary[];
}

function generateGlobalMockQuestionnaireData(cellCount: number) {
  const sampleQuestionnaire = generateMockQuestionnaireData();
  const globalData = {
    cellSummaries: Array.from({ length: cellCount }, (_, cellIndex) => {
      const cellSummary = {
        cellId: cellIndex + 1,
        questionSummaries: sampleQuestionnaire.Questions.map(question => {
          const answerCounts:any = {};
          question.Answers.forEach(answer => {
            // Randomly generate answer counts for each cell
            answerCounts[answer.id] = Math.floor(Math.random() * 50); // Assuming up to 50 responses per answer, per cell
          });

          return {
            questionText: question.question_text,
            answerCounts
          };
        })
      };

      return cellSummary;
    })
  };

  return globalData;
}





class QuestionnaireDisplayWidget extends ReactWidget {
  params:any;
  
  constructor(params:any) {
    super();
    this.params = params;
    this.id = 'questionnaire-widget';  // 确保每个 widget 实例都有一个唯一的 ID
    this.title.label = 'Questionnaire';  // 设置标题
    this.title.closable = true;  // 允许用户关闭此 widget
  }

  updateParams(params:any){
    this.params = params;
    this.update();
  }

  render() {
    return <QuestionnaireDisplay params={this.params}/>;
  }
}

export default QuestionnaireDisplayWidget;

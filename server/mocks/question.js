// mockData.js

exports.questionnaireData = {
    title: "Sample Questionnaire",
    description: "This is a sample questionnaire for testing purposes."
  };
  
  exports.questionsData = [
    {
      question_text: "What is your favorite color?",
    },
    {
      question_text: "How do you feel today?",
    }
  ];
  
  exports.answersData = [
    {
      question_id: 1, // Assuming the first question's ID is 1
      answer_text: "Red"
    },
    {
      question_id: 1,
      answer_text: "Blue"
    },
    {
      question_id: 2,
      answer_text: "Happy"
    },
    {
      question_id: 2,
      answer_text: "Sad"
    }
  ];
  
// controllers/seedController.js

const { Questionnaire, Question, Answer } = require('../models');
const { questionnaireData, questionsData, answersData } = require('../mocks/question');

exports.seedMockData = async (req, res) => {
  try {
    let questionnaire;
    
    // 检查是否已存在questionnaire_id为1的记录
    const existingQuestionnaire = await Questionnaire.findByPk(1);
    
    if (existingQuestionnaire) {
      // 如果存在，使用现有的记录
      questionnaire = existingQuestionnaire;
    } else {
      // 如果不存在，创建新的记录
      questionnaire = await Questionnaire.create(questionnaireData);
    }
    
    // 为新的或现有的问卷创建问题
    const questions = await Question.bulkCreate(questionsData.map(q => ({
      ...q,
      questionnaire_id: questionnaire.id  // 这里的id将是1，无论是新记录还是现有记录
    })));
    
    // 创建回答并与问题关联
    await Answer.bulkCreate(answersData);
    
    res.status(201).json({ message: "Mock data seeded successfully!" });
  } catch (error) { 
    res.status(500).json({ error: error.message });
  }
};

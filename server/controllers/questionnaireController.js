// controllers/questionnaireController.js

const { Questionnaire, Question, Answer } = require('../models');

exports.getAllQuestionnaires = async (req, res) => {
  try {
    const questionnaires = await Questionnaire.findAll();
    res.status(200).json(questionnaires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionnaireById = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByPk(req.params.id, {
      include: [
        {
          model: Question,
          as: 'Questions',
          include: [
            {
              model: Answer,
              as: 'Answers'
            }
          ]
        }
      ]
    });
    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    res.status(200).json(questionnaire);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

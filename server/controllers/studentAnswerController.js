// controllers/studentAnswerController.js

const { StudentAnswer } = require('../models');

exports.submitStudentAnswer = async (req, res) => {
  try {
    const { user_id, question_id, answer_id } = req.body;
    const studentAnswer = await StudentAnswer.create({
      user_id,
      question_id,
      answer_id
    });
    res.status(201).json(studentAnswer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitAllAnswers = async (req, res) => {
  try {
    const { user_id, answers } = req.body; // answers should be an array of { question_id, answer_id }
    const studentAnswers = await StudentAnswer.bulkCreate(answers.map(answer => ({
      user_id,
      ...answer
    })));
    res.status(201).json(studentAnswers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
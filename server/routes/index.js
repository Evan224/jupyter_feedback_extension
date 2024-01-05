// routes/index.js

const express = require('express');
const router = express.Router();

const questionnaireController = require('../controllers/questionnaireController');
const studentAnswerController = require('../controllers/studentAnswerController');
const seedController = require('../controllers/seedController'); // Import the seed controller

// Questionnaire routes
router.get('/questionnaires', questionnaireController.getAllQuestionnaires);
router.get('/questionnaires/:id', questionnaireController.getQuestionnaireById);

// StudentAnswer routes
router.post('/submit-answer', studentAnswerController.submitStudentAnswer);
router.post('/submit-all-answers', studentAnswerController.submitAllAnswers); // New route
// Seed mock data
router.post('/seed-mock-data', seedController.seedMockData); // Add this route

module.exports = router;

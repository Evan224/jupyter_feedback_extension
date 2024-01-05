'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Each question belongs to a specific questionnaire
      Question.belongsTo(models.Questionnaire, { foreignKey: 'questionnaire_id' });
      // A question can have multiple answers
      Question.hasMany(models.Answer, { foreignKey: 'question_id' });
    }
  }

  Question.init({
    questionnaire_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questionnaires',
        key: 'id'
      }
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Question',
  });

  return Question;
};

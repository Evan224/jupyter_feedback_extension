'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      // Each answer is associated with a specific question
      Answer.belongsTo(models.Question, { foreignKey: 'question_id' });
    }
  }

  Answer.init({
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      }
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Answer',
  });

  return Answer;
};

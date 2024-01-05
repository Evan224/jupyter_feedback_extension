'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StudentAnswer extends Model {
    static associate(models) {
      // Each student answer is associated with a specific user (student)
      StudentAnswer.belongsTo(models.User, { foreignKey: 'user_id' });
      // Each student answer is associated with a specific question
      StudentAnswer.belongsTo(models.Question, { foreignKey: 'question_id' });
      // Each student answer is associated with a specific answer (from the Answer model)
      StudentAnswer.belongsTo(models.Answer, { foreignKey: 'answer_id' });
    }
  }

  StudentAnswer.init({
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      }
    },
    answer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Answers',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'StudentAnswer',
  });

  return StudentAnswer;
};

'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Questionnaire extends Model {
    static associate(models) {
      // A questionnaire can have multiple questions
      Questionnaire.hasMany(models.Question, { foreignKey: 'questionnaire_id' });
    }
  }

  Questionnaire.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Questionnaire',
  });

  return Questionnaire;
};

'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      // Here, you can define associations if needed.
      // For example, if you want to associate an event with a user:
      // Event.belongsTo(models.User, { foreignKey: 'user_id' });
      Event.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Event.init({
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
  }  
  }, {
    sequelize,
    modelName: 'Event',
  });

  return Event;
};

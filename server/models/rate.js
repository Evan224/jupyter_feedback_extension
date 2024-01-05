// File: models/rate.js

'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rate extends Model {
    static associate(models) {
      Rate.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Rate.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    cell_number: {
      type: DataTypes.INTEGER||DataTypes.STRING,
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Rate',
  });

  return Rate;
};

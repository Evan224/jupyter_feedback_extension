'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Comment.init({
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    cell_number: {
      type: DataTypes.INTEGER||DataTypes.STRING,
      allowNull: true,
      defaultValue: -1 
    },
    start_line: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1,
    },
    end_line: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1,
    },
    start_column: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1,
    },
    end_column: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1,
    },
    selected_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: -1,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "none"
    }
  }, {
    sequelize,
    modelName: 'Comment',
  });

  return Comment;
};

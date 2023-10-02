'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {

    static associate(models) {
      Membership.belongsTo(models.Attendance, {
        foreignKey: 'userId',
      })

      Membership.belongsTo(models.Group, {
        foreignKey: 'groupId',
      })
    }
  }
  Membership.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupId: DataTypes.INTEGER,
    status: DataTypes.ENUM("co-host","member","pending"),
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};

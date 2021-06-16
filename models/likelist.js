'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class likeList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  likeList.init({
    userId: DataTypes.INTEGER,
    roomId: DataTypes.INTEGER,
    likeNum: DataTypes.INTEGER,
    likeStatus: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'likeList',
  });
  return likeList;
};
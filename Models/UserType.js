const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const userType = sequelize.define('UserType', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        index: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        index: true
    },
    des: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'usertype'
});

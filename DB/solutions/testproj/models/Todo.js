const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Todo = sequelize.define('Todo', {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'active',
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    user_id : {
        type : DataTypes.INTEGER,
        allowNull: false,
    },
},
{
    tableName: 'todos',
    timestamps: false,
});

module.exports = Todo;
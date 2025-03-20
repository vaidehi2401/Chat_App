const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./userModel'); // Import User model

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT, // Stores the message text
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true // Stores createdAt and updatedAt
});

// Define association
User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

module.exports = Message;

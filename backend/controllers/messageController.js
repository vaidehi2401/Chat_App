const Message = require('../models/messageModel');
const Users = require('../models/userModel');
const sequelize = require('../util/database');
exports.postMessage = async (req, res) => {
    try {
        // Extract message and userId from the request
        const { message } = req.body;
        const userId = req.user.dataValues.id;

        // Validate input
        if (!message || !userId) {
            return res.status(400).json({ error: "Message content and user ID are required." });
        }

        // Save the message to the database
        const newMessage = await Message.create({
            content: message,
            userId: userId
        });

        // Return success response
        res.status(201).json({
            message: "Message successfully saved.",
            data: newMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};
//const sequelize = require('../util/database'); // Import Sequelize instance

exports.getMessages = async (req, res) => {
    const userId = req.user.dataValues.id; // Get the current user's ID

    try {
        const messages = await sequelize.query(
            `SELECT u.id AS senderId, u.name AS sender, m.content, m.createdAt
            FROM users u
            JOIN messages m ON u.id = m.userId
            ORDER BY m.createdAt ASC`,
            { type: sequelize.QueryTypes.SELECT }
        );

        // Transforming the messages array to modify sender names
        const formattedMessages = messages.map(msg => ({
            sender: msg.senderId === userId ? "You" : msg.sender, // If the userId matches, replace with "You"
            content: msg.content,
            createdAt: msg.createdAt
        }));

        res.status(200).json({ messages: formattedMessages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

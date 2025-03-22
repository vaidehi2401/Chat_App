const Message = require('../models/messageModel');
const Users = require('../models/userModel');
const sequelize = require('../util/database');
exports.postMessage = async (req, res) => {
    try {
        // Extract message and userId from the request
        const  message  = req.body.message;
        const groupId = req.body.groupId;
        const userId = req.user.dataValues.id;
       console.log(">.>>>>>>>>>>>>>>>>>>>>>>>sending", message, userId)
        // Validate input
        if (!message || !userId) {
            return res.status(400).json({ error: "Message content and user ID are required." });
        }

        // Save the message to the database
        const newMessage = await Message.create({
            content: message,
            userId: userId,
            groupId:groupId
        });

        // Return success response
        res.status(201).json({
            message: "Message successfully saved.",
            data: newMessage
        });
        console.log("sent>>>>>>>>>>>>>>>>>>>>")
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};
//const sequelize = require('../util/database'); // Import Sequelize instance

exports.getMessages = async (req, res) => {
    const userId = req.user.dataValues.id;
    const lastId = req.params.lastId;
    const groupId = req.params.groupId;
    console.log(">>>>>>>>>>>>>getting", groupId)

    try {
        let query, replacements;

        if (groupId === 'null') {
            // Fetch messages that don't belong to any group
            query = `
                SELECT u.id AS senderId, u.name AS sender, m.id, m.content, m.createdAt
                FROM users u
                JOIN messages m ON u.id = m.userId
                WHERE m.id > ? AND m.groupId IS NULL
                ORDER BY m.createdAt ASC
            `;
            replacements = [lastId];
        } else {
            // Fetch messages that belong to a specific group
            query = `
                SELECT u.id AS senderId, u.name AS sender, m.id, m.content, m.createdAt
                FROM users u
                JOIN messages m ON u.id = m.userId
                WHERE m.id > ? AND m.groupId = ?
                ORDER BY m.createdAt ASC
            `;
            replacements = [lastId, groupId];
        }

        const messages = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
            replacements
        });

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            sender: msg.senderId === userId ? "You" : msg.sender,
            content: msg.content,
            createdAt: msg.createdAt
        }));

        res.status(200).json({ messages: formattedMessages });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

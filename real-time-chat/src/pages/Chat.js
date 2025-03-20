import React, { useState, useEffect } from "react";
import "./Chat.css"; // Import CSS for styling
import axios from "axios";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  
  // Retrieve lastId from localStorage or default to -1
  const getLastId = () => Number(localStorage.getItem("lastId")) || -1;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const lastId = getLastId(); // Get last stored message ID

        const response = await axios.get(`http://localhost:3004/users/messages/${lastId}`, {
          headers: { Authorization: token },
        });

        const newMessages = response.data.messages;
        if (newMessages.length > 0) {
          const updatedMessages = [...messages, ...newMessages]; // Append new messages

          // Store only the first 100 messages
          const limitedMessages = updatedMessages.slice(-5);
          setMessages(limitedMessages);

          // Store messages & lastId in localStorage
          localStorage.setItem("messages", JSON.stringify(limitedMessages));
          localStorage.setItem("lastId", newMessages[newMessages.length - 1].id); // Update lastId
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3004/users/message",
        { message },
        { headers: { Authorization: token } }
      );

      setMessages([...messages, { content: message, sender: "You" }]); // Add message locally
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="chat-container">
      {/* Left Side - Chat Messages */}
      <div className="chat-box">
        <h2>Chat</h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Online Users */}
      <div className="user-list">
        <h2>Online Users</h2>
        <ul>
          <li>User 1</li>
          <li>User 2</li>
        </ul>
      </div>

      {/* Bottom Input Section */}
      <div className="input-container">
        <input type="text" placeholder="Type a message..." value={message} onChange={handleInputChange} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;

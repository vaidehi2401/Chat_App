import React, { useState } from "react";
import "./Chat.css"; // Import CSS for styling
import axios from 'axios';
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([])
  const  handleInputChange = (e)=>{
    setMessage(e.target.value);
  }
  const handleSendMessage = async ()=>{
    if(!message.trim())return;
    try{
      const token = localStorage.getItem("token"); 
      const response = await axios.post(`http://localhost:3004/users/message`, {message}, {
        headers: { Authorization: token }
      });
      console.log(response)
    }
    catch(error){
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  }
  return (
    <div className="chat-container">
      {/* Left Side - Chat Messages */}
      <div className="chat-box">
        <h2>Chat</h2>
        <div className="messages">
          <div className="message"><strong>User:</strong> Sample message</div>
          <div className="message"><strong>You:</strong> Another message</div>
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
        <input type="text" placeholder="Type a message..."
        onChange={handleInputChange}
         />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;

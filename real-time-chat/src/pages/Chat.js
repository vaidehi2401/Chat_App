import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import axios from "axios";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState(null);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [groupNames, setGroupNames] = useState([]);
  const [groupmessages, setGroupMessages] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
const [activeGroupName, setActiveGroupName] = useState("");
const [isGroupChat, setIsGroupChat] = useState(false);
const [showMembers, setShowMembers] = useState(false);
const [members, setMembers] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [currentUserId, setCurrentUserId] = useState(null);
const [selectedMember, setSelectedMember] = useState(null);
const [actionType, setActionType] = useState(null); // 'makeAdmin' or 'remove'
const [showActionPopup, setShowActionPopup] = useState(false);
const [showConfirmPopup, setShowConfirmPopup] = useState(false);


// Replace handleGroupClick

// Update handleSendMessage

  const popupRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3004/users/messages/lastId/${activeGroupId}`, {
          headers: { Authorization: token },
        });
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    // Call once immediately
    fetchMessages();
  
    // Set interval to call every second
   // const intervalId = setInterval(fetchMessages, 1000);
  
    // Cleanup interval on unmount or dependency change
    //return () => clearInterval(intervalId);
  }, [activeGroupId]); // Add activeGroupId as a dependency if it can change
  

  // ✅ Fetch group names
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3004/group/userGroups", {
          headers: { Authorization: token },
        });
  
        // Map to cleaner structure
       const formattedGroups = response.data.groups.map(group => ({
          id: group.groupId,
          name: group.Group.name,
        }));
  console.log(response)
        setGroupNames(formattedGroups);
      } catch (error) {
        console.error("Error fetching group names:", error);
      }
    };
  
    fetchGroups();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showPopup]);

  const handleInputChange = (e) => setMessage(e.target.value);
  const handleGroupClick = async (groupId, name) => {
    setActiveGroupId(groupId);
    setActiveGroupName(name);
    setIsGroupChat(true);
    setShowMembers(false);
  
    try {
      const token = localStorage.getItem("token");
      const [msgRes, roleRes] = await Promise.all([
        axios.get(`http://localhost:3004/users/messages/lastId/${groupId}`, {
          headers: { Authorization: token },
        }),
        axios.get(`http://localhost:3004/group/members/${groupId}`, {
          headers: { Authorization: token },
        }),
      ]);
  console.log(roleRes)
      const memberList = roleRes.data.members.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role
      }));
  
      setGroupMessages(msgRes.data.messages);
     setMembers(memberList);
     const currentUserId = roleRes.data.userId;
     setCurrentUserId(currentUserId)
     const userRole = memberList.find(m => m.id === parseInt(currentUserId)); // assuming userId stored
      setIsAdmin(userRole?.role === 'admin');
      console.log(userRole)
      console.log(isAdmin)
    } catch (error) {
      console.error("Error fetching group messages or members:", error);
    }
  };
  
  useEffect(() => {
    let intervalId;
  
    if (isGroupChat && activeGroupId) {
      const fetchGroupMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`http://localhost:3004/users/messages/lastId/${activeGroupId}`, {
            headers: { Authorization: token },
          });
          setGroupMessages(response.data.messages);
        } catch (error) {
          console.error("Polling error:", error);
        }
      };
  
      // Fetch immediately and then set interval
      fetchGroupMessages();
   //   intervalId = setInterval(fetchGroupMessages, 1000);
    }
      
  
  //  return () => {
   //   if (intervalId) clearInterval(intervalId);
  //  };
  }, [isGroupChat, activeGroupId]);
  
  const handleJoinLinkClick = (messageContent) => {
    const match = messageContent.match(/\/group\/joinGroup\/(\d+)/);
    if (match) {
      setJoinGroupId(match[1]);
      setShowJoinPopup(true);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
  
    try {
      const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:3004/users/message/`,
          { message,  groupId: activeGroupId },
          { headers: { Authorization: token } }
        );
      setMessages([...messages, { content: message, sender: "You" }]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  const handleCreateGroup = () => {
    setShowPopup(true);
  };

  const handleInviteUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:3004/group/createGroup`,
        { groupName },
        { headers: { Authorization: token } }
      );

      const groupId = response.data.group.id || response.data.groupId;

      const inviteMessage = `Join my group "${groupName}": http://localhost:3004/group/joinGroup/${groupId}`;
      await axios.post(
        `http://localhost:3004/users/message`,
        { message: inviteMessage },
        { headers: { Authorization: token } }
      );

      setMessage(inviteMessage);
      handleSendMessage();
      setMessage("");
    } catch (err) {
      console.log(err);
    }

    setShowPopup(false);
    setGroupName("");
  };

  // ✅ Handle clicking on a group name
  
  return (

    <div className="chat-container">
      <div className="chat-box">
      <div className="chat-header">
  <h2
    style={{ cursor: isAdmin ? "pointer" : "default" }}
    onClick={() => isAdmin && setShowMembers(!showMembers)}
  >
    {isGroupChat ? `Group: ${activeGroupName}` : "Chat"}
  </h2>
  {isGroupChat && (
    <button
      onClick={() => {
        setIsGroupChat(false);
        setActiveGroupId(null);
        setActiveGroupName("");
        setShowMembers(false);
      }}
      className="back-button"
    >
      ⬅ Back
    </button>
  )}
</div>
{showMembers && isAdmin && (
  <div className="group-members">
    <input
      type="text"
      placeholder="Search members..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
    <ul className="member-list">
  {members
    .filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((member) => (
<li
  key={member.id}
  onClick={() => {
    setSelectedMember(member);
    setShowActionPopup(true);
  }}
>
  {member.name} <span style={{ color: "#ccc", fontSize: "12px" }}>({member.role})</span>
</li>
 
    ))}
</ul>

  </div>
)}

    
        <div className="messages">
        {(isGroupChat ? groupmessages : messages).map((msg, index) => {
  const isInvite = msg.content.includes("http://localhost:3004/group/joinGroup/");
  return (
    <div key={index} className="message">
      <strong>{msg.sender}:</strong>{" "}
      {isInvite ? (
        <span
          className="invite-link"
          onClick={() => handleJoinLinkClick(msg.content)}
          style={{ color: "#7DF9FF", cursor: "pointer", textDecoration: "underline" }}
        >
          {msg.content}
        </span>
      ) : (
        msg.content
      )}
    </div>
  );
})}
        </div>
      </div>

      <div className="user-list">
        <h2>Online Users</h2>
        <ul>
          <li>User 1</li>
          <li>User 2</li>
        </ul>
      </div>

      <div className="group-list">
        <h2>Groups</h2>
        <ul>
          {groupNames.map((group) => (
            <li
              key={group.id}
              onClick={() => handleGroupClick(group.id, group.name)}
              style={{ cursor: "pointer", color: "#7DF9FF", textDecoration: "underline" }}
            >
              {group.name}
            </li>
          ))}
        </ul>
        <button className="create-group-btn" onClick={handleCreateGroup}>
          Create Group
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup" ref={popupRef}>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button onClick={handleInviteUsers}>Invite Users</button>
          </div>
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>

      {showJoinPopup && (
        <div className="popup-overlay">
          <div className="popup" ref={popupRef}>
            <p className="groupjoinpara">Do you want to join this group?</p>
            <button
              className="joinGroup"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  await axios.post(
                    `http://localhost:3004/group/joinGroup/${joinGroupId}`,
                    {},
                    { headers: { Authorization: token } }
                  );
                  alert("You joined the group!");
                } catch (error) {
                  console.error("Error joining group:", error);
                  alert("Failed to join the group.");
                }
                setShowJoinPopup(false);
                setJoinGroupId(null);
              }}
            >
              Yes
            </button>
            <button onClick={() => setShowJoinPopup(false)}>No</button>
          </div>
        </div>
      )}
      {showActionPopup && selectedMember && (
  <div className="popup-overlay">
    <div className="popup" ref={popupRef}>
      <h4>Manage Member: {selectedMember.name}</h4>
      <button
        onClick={() => {
          setActionType("makeAdmin");
          setShowActionPopup(false);
          setShowConfirmPopup(true);
        }}
      >
        Make Admin
      </button>
      <button
        onClick={() => {
          setActionType("remove");
          setShowActionPopup(false);
          setShowConfirmPopup(true);
        }}
      >
        Remove from Group
      </button>
      <button onClick={() => setShowActionPopup(false)}>Cancel</button>
    </div>
  </div>
)}
{showConfirmPopup && selectedMember && (
  <div className="popup-overlay">
    <div className="popup" ref={popupRef}>
      <p>Are you sure you want to {actionType === "makeAdmin" ? "make this user an admin" : "remove this user from the group"}?</p>
      <button onClick={async () => {
        const token = localStorage.getItem("token");
        try {
          if (actionType === "makeAdmin") {
            await axios.post("http://localhost:3004/group/make-admin", {
              groupId: activeGroupId,
              userId: selectedMember.id
            }, {
              headers: { Authorization: token }
            });
            alert(`${selectedMember.name} is now an admin.`);
          } else if (actionType === "remove") {
            await axios.post("http://localhost:3004/group/remove-user", {
              groupId: activeGroupId,
              userId: selectedMember.id
            }, {
              headers: { Authorization: token }
            });
            alert(`${selectedMember.name} was removed from the group.`);
          }
          // Optionally, refresh member list
          const response = await axios.get(`http://localhost:3004/group/members/${activeGroupId}`, {
            headers: { Authorization: token },
          });
          const updatedMembers = response.data.members.map(m => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role
          }));
          setMembers(updatedMembers);
        } catch (err) {
          console.error(err);
          alert("Action failed.");
        } finally {
          setShowConfirmPopup(false);
          setSelectedMember(null);
          setActionType(null);
        }
      }}>
        Yes, Confirm
      </button>
      <button onClick={() => setShowConfirmPopup(false)}>Cancel</button>
    </div>
  </div>
)}

     
    </div>
  );
};

export default Chat;

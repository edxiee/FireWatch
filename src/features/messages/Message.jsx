import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from "../../services/firebase.js"; 
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import UserNavBar from "../../components/navigation/UserNavBar.jsx"; 
import './Message.css';

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in as:", user.uid);
        setCurrentUser(user);
      } else {
        console.log("No user logged in.");
        setCurrentUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;

    console.log("Listening to path: chats/" + currentUser.uid + "/messages");

    const q = query(
      collection(db, "chats", currentUser.uid, "messages"), 
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Messages found in DB for user:", snapshot.size);
      const msgs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setMessages(msgs);
    }, (error) => {
      console.error("Firestore Error:", error.message);
      if (error.message.includes("permissions")) {
        alert("Permission Denied: Make sure your Firestore Rules are updated!");
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser) return;
    
    const textToSend = inputText;
    setInputText(""); 

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      await setDoc(doc(db, "chats", currentUser.uid), {
        userEmail: currentUser.email,
        firstName: userData.firstName || "User",
        lastName: userData.lastName || "",
        lastMessage: textToSend,
        updatedAt: serverTimestamp(),
        unread: true 
      }, { merge: true });

      await addDoc(collection(db, "chats", currentUser.uid, "messages"), {
        text: textToSend,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        status: "sent" 
      });

    } catch (error) { 
      console.error("Error sending message:", error); 
    }
  };

  return (
    <div className="chat-layout-wrapper">
      <header className="top-bar">
        <img className="top-logo" src="/Logo.png" alt="Logo" />
        <span className="top-title">Chat Support</span>
      </header>

      <main className="chat-content-area">
        <div className="messages-container">
          {messages.length === 0 && <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>No messages yet. Say hello!</p>}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-wrapper ${msg.senderId === currentUser?.uid ? "sent" : "received"}`}
            >
              <div className="chat-bubble">
                <span className="bubble-text">{msg.text}</span>
                <div className="message-info">
                  <span className="message-time">
                    {/* SAFE TIMESTAMP CHECK: Prevents crash if timestamp is null */}
                    {msg.timestamp && typeof msg.timestamp.toDate === 'function' 
                      ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : "..."}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="chat-footer-group">
        <div className="chat-input-row">
          <input 
            type="text" 
            placeholder="Type Message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} type="button">âž¤</button>
        </div>
        <div className="navbar-fixed-container">
          <UserNavBar />
        </div>
      </footer>
    </div>
  );
};

export default Message;

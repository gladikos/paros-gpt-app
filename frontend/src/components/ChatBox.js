// ...imports stay the same
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import { PiMicrophoneFill } from "react-icons/pi";
import { MdAttachFile, MdClear } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import "./ChatBox.css";

const ChatBox = forwardRef((props, ref) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("paros_chat");
    return stored
      ? JSON.parse(stored)
      : [{ role: "assistant", content: "👋 Welcome to ParosGPT! Ask me anything — I’m your smart local assistant." }];
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleNewChat = () => {
    const welcome = {
      role: "assistant",
      content: "👋 Welcome to ParosGPT! Ask me anything — I’m your smart local assistant.",
    };
    setMessages([welcome]);
    localStorage.removeItem("paros_chat");
  };

  useImperativeHandle(ref, () => ({
    newChat: handleNewChat,
  }));

  const askQuestion = async (customQuestion = null) => {
    const q = customQuestion || question;
    if (!q.trim()) return;
    setLoading(true);

    const newMessage = {
      role: "user",
      content: q,
      file: selectedFile ? selectedFile.name : null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setQuestion("");

    try {
      const formData = new FormData();
      formData.append("question", q);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await axios.post("http://127.0.0.1:8000/ask", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const reply = { role: "assistant", content: res.data.answer };
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      const errMsg = {
        role: "assistant",
        content: "Something went wrong. Please try again later.",
      };
      setMessages((prev) => [...prev, errMsg]);
      console.error(error);
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    localStorage.setItem("paros_chat", JSON.stringify(messages));
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion((prev) => prev + " " + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
  };

  return (
    <div className="chatbox-wrapper">
      <div className="chatbox-container">
        <div className="chatbox-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              {msg.role === "assistant" && <div className="chat-avatar"><IoChatboxEllipsesOutline size={20}/></div>}
              <div className="chat-bubble">
                {msg.role === "assistant" ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
                {msg.role === "user" && msg.file && (
                  <div className="file-inline-preview">📎 {msg.file}</div>
                )}
              </div>
              {msg.role === "user" && <div className="chat-avatar"><CiUser size={20}/></div>}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble">ParosGPT is typing...</div>
          )}
          <div ref={chatEndRef} />
        </div>

        {!loading && (
          <div className="chat-suggestions">
            <span onClick={() => askQuestion("What’s a romantic dinner spot in Paros?")}>🌅 Romantic dinner</span>
            <span onClick={() => askQuestion("Where should I swim if it’s windy?")}>🏖️ Windy beach</span>
            <span onClick={() => askQuestion("Give me a 3-day itinerary.")}>📆 3-day plan</span>
          </div>
        )}

        <div className="chat-input">
          <div className="chat-tooltip-wrapper" data-tooltip="Voice input">
            <button className="voice-btn" onClick={handleVoiceInput} title="Voice input">
              <PiMicrophoneFill size={20} />
            </button>
          </div>

          <div className="chat-tooltip-wrapper" data-tooltip="Attach a file">
            <button className="attach-btn" onClick={handleFileAttach} title="Attach a file">
              <MdAttachFile size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <textarea
            rows="1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about Paros..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                askQuestion();
              }
            }}
          />
          <button className="ask-btn" onClick={() => askQuestion()}>
            {loading ? "..." : "Ask"}
          </button>
        </div>

        {selectedFile && (
          <div className="file-preview">
            📎 <span>{selectedFile.name}</span>
            <button title="Clear file" className="clear-file-btn" onClick={() => setSelectedFile(null)}>
              <MdClear size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatBox;

import React, { useRef } from "react";
import ChatBox from "../components/ChatBox";
import "./ParosGPT.css";

function ParosGPT() {
  const chatRef = useRef();

  return (
    <div className="parosgpt-wrapper">
      <div className="parosgpt-header-container">
        <div className="parosgpt-header">
          <div className="parosgpt-header-left">
            <img src="/parosgpt-logo-correct.png" alt="ParosGPT" className="parosgpt-logo" />
            <h1 className="parosgpt-title">ParosGPT Concierge</h1>
          </div>
          <button
            className="new-chat-header-button"
            onClick={() => chatRef.current?.newChat()}
          >
            + New Chat
          </button>
        </div>
      </div>

      <div className="parosgpt-chatbox-container">
        <ChatBox ref={chatRef} />
      </div>
    </div>
  );
}

export default ParosGPT;

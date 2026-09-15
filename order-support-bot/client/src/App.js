import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:3001/api/query/stream";

function cleanText(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ""))
    .replace(/^\s*[-*+]\s/gm, "  • ")
    .trim();
}

function formatMessage(text) {
  const cleaned = cleanText(text);
  const lines = cleaned.split("\n");
  const elements = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<br key={i} />);
    } else if (trimmed.startsWith("  • ")) {
      elements.push(
        <div key={i} className="msg-list-item">
          {trimmed.replace("  • ", "")}
        </div>
      );
    } else {
      elements.push(
        <span key={i}>
          {trimmed}
          {i < lines.length - 1 && <br />}
        </span>
      );
    }
  });

  return elements;
}

function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am your Order Support Assistant. How can I help you today?",
      from: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg = { id: Date.now(), text: question, from: "user" };
    const botMsg = { id: Date.now() + 1, text: "", from: "bot" };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.token) {
            botText += data.token;
            setMessages((prev) => {
              const updated = [...prev];
              const lastBot = updated[updated.length - 1];
              if (lastBot.from === "bot") {
                updated[updated.length - 1] = { ...lastBot, text: botText };
              }
              return updated;
            });
          }

          if (data.error) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: "Sorry, something went wrong. Please try again.",
              };
              return updated;
            });
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: "Could not connect to the server.",
        };
        return updated;
      });
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-left">
            <div className="header-avatar">OS</div>
            <div>
              <h1 className="header-title">Order Support</h1>
              <span className="header-status">
                <span className="status-dot" /> Online
              </span>
            </div>
          </div>
        </header>

        <div className="messages-area">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.from === "user" ? "user-row" : "bot-row"}`}
            >
              {msg.from === "bot" && <div className="avatar bot-avatar">AI</div>}
              <div
                className={`message-bubble ${msg.from === "user" ? "user-bubble" : "bot-bubble"}`}
              >
                {msg.text ? (
                  <div className="message-text">{formatMessage(msg.text)}</div>
                ) : (
                  <TypingIndicator />
                )}
              </div>
              {msg.from === "user" && <div className="avatar user-avatar">You</div>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your order..."
              rows={1}
              disabled={loading}
            />
            <button
              className={`send-btn ${input.trim() && !loading ? "active" : ""}`}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <p className="input-hint">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}

export default App;

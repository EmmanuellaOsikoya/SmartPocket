import React, { useState } from "react";

// Define the structure of a chat message
type Message = {
  role: "user" | "assistant"; // Who sent the message
  content: string; // The message text
};

// FianceChat component provides a simple chat UI for budgeting advice
const FinanceChat: React.FC = () => {
  // State variables to hold the chat messages, user input, and loading status
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // When a suggested prompt is clicked, fill in the input field
  const handlePromptClick = (prompt: string) => {
  setInput(prompt);
};

  // Send message to backend and receive response
  const sendMessage = async () => {
    // Prevent sendind empty messages
    if (!input.trim()) return;

    // Create user message object
    const userMessage: Message = {
      role: "user",
      content: input,
    };

    // Add user message to the chat and clear input
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    // Set loading state while waiting for response
    setLoading(true);

    try {
      // Send request to backend API
      const res = await fetch("http://127.0.0.1:8000/finance-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // Send user iD and message content
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          message: userMessage.content,
        }),
      });

      // Parse response JSON
      const data = await res.json();

      // Create assistant (bot) response message object
      const botMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      // Add bot message to the chat
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      // Handle errors by showing a fallback message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-4">
        SmartPocket Budget Assistant
      </h1>

      {/* CHAT WINDOW */}
      <div className="flex-1 bg-white rounded shadow p-4 overflow-y-auto mb-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-10">
            Ask me anything about budgeting, saving, or spending.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 ${
              m.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          "Why did I overspend last month?",
          "How can I reduce my food spending?",
          "Am I improving financially?",
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handlePromptClick(prompt)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-full text-sm"
          >
            {prompt}
          </button>
        ))}
      </div>        

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-4 py-2"
          placeholder="Ask for budgeting advice..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-purple-600 text-white px-6 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default FinanceChat;

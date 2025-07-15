import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';

// Renamed to AIChatMessage to avoid conflicts with projectChatService.ChatMessage
export interface AIChatMessage {
  sender: 'user' | 'ai';
  message: string;
}

interface AIChatProps {
  chatType: 'estimating' | 'admin';
  chatMessages: AIChatMessage[];
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: (messageType: 'estimating' | 'admin') => void;
}

const AIChat: React.FC<AIChatProps> = ({
  chatType,
  chatMessages,
  message,
  setMessage,
  handleSendMessage
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(chatType);
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <h2>{chatType === 'estimating' ? 'Estimating AI Assistant' : 'Admin AI Assistant'}</h2>
      </div>
      
      <div className="ai-chat-messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`ai-message ${msg.sender === 'user' ? 'user-message' : 'ai-response'}`}>
            <div className="message-avatar">
              {msg.sender === 'user' ? 'You' : 'AI'}
            </div>
            <div className="message-content">
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      
      <form className="ai-chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={`Ask the ${chatType} AI assistant...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!message.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default AIChat;

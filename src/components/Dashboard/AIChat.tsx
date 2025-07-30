import React from 'react';

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

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <h2>{chatType === 'estimating' ? 'Estimating AI Assistant' : 'Admin AI Assistant'}</h2>
      </div>
      
      <div className="ai-chat-messages">
        {/* Chat messages removed */}
      </div>
      
      {/* Chat input form removed */}
    </div>
  );
};

export default AIChat;

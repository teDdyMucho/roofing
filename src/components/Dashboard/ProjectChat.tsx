import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { ChatMessage } from '../../services/projectChatService';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectChatProps {
  projectMessages: ChatMessage[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendProjectMessage: (e: React.FormEvent) => void;
  isSendingMessage: boolean;
}

const ProjectChat: React.FC<ProjectChatProps> = ({
  projectMessages,
  newMessage,
  setNewMessage,
  handleSendProjectMessage,
  isSendingMessage
}) => {
  const { currentUser } = useAuth();

  return (
    <div className="project-chat-section">
      <div className="project-chat-messages">
        {projectMessages.length === 0 ? (
          <div className="empty-chat-message">No messages yet. Start the conversation!</div>
        ) : (
          <>
            <div className="chat-day-divider">Today</div>
            {projectMessages.map(message => (
              <div key={message.id} className={`project-message ${message.user_id === currentUser?.id ? 'own-message' : ''}`}>
                <div className="message-avatar">
                  {message.user?.first_name?.[0]}{message.user?.last_name?.[0] || ''}
                </div>
                <div className="message-content-wrapper">
                  <div className="message-header">
                    <span className="message-sender">{message.user?.first_name || 'User'} {message.user?.last_name || ''}</span>
                    <span className="message-role">{message.user?.role || 'Member'}</span>
                    <span className="message-time">{new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="message-body">{message.message}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      <form className="project-chat-input" onSubmit={handleSendProjectMessage}>
        <input 
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSendingMessage}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isSendingMessage || !newMessage.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ProjectChat;

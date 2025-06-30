import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import '../styles/ProjectChat.css';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

interface ProjectChatProps {
  projectId: string;
  projectName: string;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId, projectName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock data for demonstration
  useEffect(() => {
    // This would be replaced with an API call to fetch messages
    const mockMessages = [
      {
        id: '1',
        sender: {
          id: '101',
          name: 'Sarah Johnson',
          role: 'Project Manager',
        },
        content: 'Good morning team! Just wanted to check in on the progress for the shingle installation.',
        timestamp: '2025-06-30T08:30:00',
      },
      {
        id: '2',
        sender: {
          id: '102',
          name: 'Michael Chen',
          role: 'Roofing Specialist',
        },
        content: 'We\'ve completed about 60% of the shingle installation. Should be done by tomorrow afternoon if weather permits.',
        timestamp: '2025-06-30T08:45:00',
      },
      {
        id: '3',
        sender: {
          id: '103',
          name: 'David Rodriguez',
          role: 'Estimator',
        },
        content: 'The client called asking about adding gutter guards. I\'ve prepared an additional estimate for that work.',
        timestamp: '2025-06-30T09:15:00',
        attachments: [
          {
            name: 'GutterGuard_Estimate.pdf',
            url: '#',
            type: 'pdf'
          }
        ]
      },
      {
        id: '4',
        sender: {
          id: '101',
          name: 'Sarah Johnson',
          role: 'Project Manager',
        },
        content: 'Thanks David. I\'ll review and send it to the client today. @Michael - do we have enough materials for the remaining work?',
        timestamp: '2025-06-30T09:30:00',
      },
      {
        id: '5',
        sender: {
          id: '102',
          name: 'Michael Chen',
          role: 'Roofing Specialist',
        },
        content: 'Yes, we have sufficient materials to complete the job. We might need more if we add the gutter guards though.',
        timestamp: '2025-06-30T09:45:00',
      }
    ];
    
    setMessages(mockMessages);
  }, [projectId]);
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    // In a real app, this would send the message to an API
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: {
        id: '101', // Current user ID
        name: 'Sarah Johnson', // Current user name
        role: 'Project Manager',
      },
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  
  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="project-chat">
      <div className="chat-header">
        <h3>{projectName} - Project Chat</h3>
      </div>
      
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className="message">
            <div className="message-avatar">
              {message.sender.avatar ? (
                <img src={message.sender.avatar} alt={message.sender.name} />
              ) : (
                <div className="avatar-placeholder">
                  {message.sender.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">{message.sender.name}</span>
                <span className="sender-role">{message.sender.role}</span>
                <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
              </div>
              <div className="message-text">{message.content}</div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                  {message.attachments.map((attachment, index) => (
                    <a key={index} href={attachment.url} className="attachment">
                      <FaPaperclip /> {attachment.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="button" className="attach-button">
          <FaPaperclip />
        </button>
        <button type="submit" className="send-button">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ProjectChat;

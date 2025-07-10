import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { FaPaperPlane, FaPaperclip, FaTimes, FaImage } from 'react-icons/fa';
import { fetchProjectMessages, sendProjectMessage, subscribeToProjectMessages, ChatMessage as ServiceChatMessage, ChatAttachment } from '../services/projectChatService';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../services/userService';
import '../styles/ProjectChat.css';

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  isImage: boolean;
}

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
  attachments?: Attachment[];
}

interface ProjectChatProps {
  projectId: string;
  projectName: string;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId, projectName }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<{file: File, preview: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch messages from the API
  useEffect(() => {
    const loadMessages = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const chatMessages = await fetchProjectMessages(projectId);
        
        // Convert service messages to component messages
        const formattedMessages = chatMessages.map(msg => ({
          id: msg.id,
          sender: {
            id: msg.user_id,
            name: msg.user ? `${msg.user.first_name} ${msg.user.last_name}` : 'Unknown User',
            role: msg.user?.role || 'User',
          },
          content: msg.message,
          timestamp: msg.created_at,
          attachments: msg.attachments?.map(att => ({
            id: att.id,
            name: att.file_name,
            url: att.file_url,
            type: att.file_type,
            isImage: att.is_image
          }))
        }));
        
        setMessages(formattedMessages);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
    
    // Set up real-time subscription for new messages
    const unsubscribe = subscribeToProjectMessages(projectId, (newMessage) => {
      // Convert the new message to our component format
      const formattedMessage = {
        id: newMessage.id,
        sender: {
          id: newMessage.user_id,
          name: newMessage.user ? `${newMessage.user.first_name} ${newMessage.user.last_name}` : 'Unknown User',
          role: newMessage.user?.role || 'User',
        },
        content: newMessage.message,
        timestamp: newMessage.created_at,
        attachments: newMessage.attachments?.map(att => ({
          id: att.id,
          name: att.file_name,
          url: att.file_url,
          type: att.file_type,
          isImage: att.is_image
        }))
      };
      
      setMessages(prev => [...prev, formattedMessage]);
    });
    
    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, [projectId]);
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limit file size to 5MB
      const validFiles = filesArray.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 5MB.`);
          return false;
        }
        return true;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Create previews for image files
      const newPreviews = validFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          file,
          preview: URL.createObjectURL(file)
        }));
      
      console.log('Created previews for', newPreviews.length, 'images');
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };
  
  // Remove a selected file
  const removeSelectedFile = (fileToRemove: File) => {
    setSelectedFiles(selectedFiles.filter(file => file !== fileToRemove));
    
    // Also remove preview if it's an image
    const previewToRemove = previewImages.find(item => item.file === fileToRemove);
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.preview);
      setPreviewImages(previewImages.filter(item => item.file !== fileToRemove));
    }
  };
  
  // Trigger file input click
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle sending a message with attachments
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || (newMessage.trim() === '' && selectedFiles.length === 0)) return;
    
    setIsUploading(true);
    setError(null); // Clear any previous errors
    
    try {
      console.log('Sending message with', selectedFiles.length, 'files');
      
      // Prepare the message data
      const messageData = {
        project_id: projectId,
        user_id: currentUser.id,
        message: newMessage.trim(),
      };
      
      // Send the message with files
      await sendProjectMessage(messageData, selectedFiles.length > 0 ? selectedFiles : undefined);
      console.log('Message sent successfully');
      
      // Clear the input
      setNewMessage('');
      
      // Clean up file previews
      setSelectedFiles([]);
      previewImages.forEach(item => URL.revokeObjectURL(item.preview));
      setPreviewImages([]);
      
      // Note: We don't need to update the messages state here
      // The real-time subscription will handle that
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
        {isLoading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : messages.map(message => (
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
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-container">
                      {attachment.isImage ? (
                        <div className="image-attachment">
                          <img 
                            src={attachment.url} 
                            alt={attachment.name} 
                            className="message-image"
                            onClick={() => window.open(attachment.url, '_blank')}
                            onError={(e) => {
                              console.log('Image failed to load:', attachment.url);
                              // Fallback to a placeholder if image fails to load
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Image+Unavailable';
                            }}
                          />
                          <span className="image-name">{attachment.name}</span>
                        </div>
                      ) : (
                        <a href={attachment.url} className="attachment" target="_blank" rel="noopener noreferrer">
                          <FaPaperclip /> {attachment.name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-input-container" onSubmit={handleSendMessage}>
        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            {previewImages.map((item, index) => (
              <div key={index} className="image-preview-container">
                <img 
                  src={item.preview} 
                  alt={`Preview ${index}`} 
                  className="image-preview" 
                />
                <button 
                  type="button" 
                  className="remove-file-button"
                  onClick={() => removeSelectedFile(item.file)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            
            {selectedFiles
              .filter(file => !file.type.startsWith('image/'))
              .map((file, index) => (
                <div key={`file-${index}`} className="file-preview">
                  <FaPaperclip />
                  <span className="file-name">{file.name}</span>
                  <button 
                    type="button" 
                    className="remove-file-button"
                    onClick={() => removeSelectedFile(file)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        
        {/* Message input */}
        <div className="message-input-row">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isUploading}
          />
          <button 
            type="button" 
            className="attach-button"
            onClick={openFileSelector}
            disabled={isUploading}
          >
            <FaImage />
          </button>
          <button 
            type="button" 
            className="attach-button"
            onClick={openFileSelector}
            disabled={isUploading}
          >
            <FaPaperclip />
          </button>
          <button 
            type="submit" 
            className="send-button"
            disabled={isUploading || (newMessage.trim() === '' && selectedFiles.length === 0)}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectChat;

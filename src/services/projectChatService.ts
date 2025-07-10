import { supabase } from '../lib/supabase';
import { User } from './userService';
import { v4 as uuidv4 } from 'uuid';

export interface ChatAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  is_image: boolean;
}

export interface ChatMessage {
  id: string;
  created_at: string;
  project_id: string;
  user_id: string;
  message: string;
  user?: User; // Joined user data
  attachments?: ChatAttachment[];
}

export interface NewChatMessage {
  project_id: string;
  user_id: string;
  message: string;
  attachments?: ChatAttachment[];
}

/**
 * Fetch chat messages for a specific project
 */
export const fetchProjectMessages = async (projectId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        users(id, email, first_name, last_name, role)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
      
    // Map the results to include user property
    const messagesWithUser = data?.map(message => {
      const { users, ...messageData } = message;
      return {
        ...messageData,
        user: users
      };
    }) || [];
    
    if (error) {
      console.error('Error fetching project messages:', error);
      throw error;
    }
    
    return messagesWithUser;
  } catch (error) {
    console.error('Error in fetchProjectMessages:', error);
    throw error;
  }
};

/**
 * Upload a file attachment for a chat message
 */
export const uploadChatAttachment = async (
  file: File,
  projectId: string
): Promise<ChatAttachment> => {
  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop() || '';
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = `project-chats/${projectId}/${fileName}`;
    
    // For images, create a blob URL for immediate preview while uploading
    let localUrl = '';
    if (file.type.startsWith('image/')) {
      localUrl = URL.createObjectURL(file);
    }
    
    console.log('Uploading file:', file.name, 'to path:', filePath);
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    console.log('Upload successful, data:', data);
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);
    
    console.log('Public URL:', urlData.publicUrl);
    
    // Determine if the file is an image
    const isImage = file.type.startsWith('image/');
    
    // For immediate display of images, use the local blob URL temporarily
    // This will be replaced by the actual URL when the message is fetched again
    const fileUrl = isImage && localUrl ? localUrl : urlData.publicUrl;
    
    return {
      id: uniqueId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: fileUrl,
      is_image: isImage
    };
  } catch (error) {
    console.error('Error uploading chat attachment:', error);
    throw error;
  }
};

/**
 * Send a new message in a project chat
 */
export const sendProjectMessage = async (message: NewChatMessage, files?: File[]): Promise<ChatMessage> => {
  try {
    let attachments: ChatAttachment[] = message.attachments || [];
    
    // Upload any files if provided
    if (files && files.length > 0) {
      // Upload each file and get attachment data
      const uploadPromises = files.map(file => uploadChatAttachment(file, message.project_id));
      const uploadedAttachments = await Promise.all(uploadPromises);
      
      // Add the uploaded attachments to the message
      attachments = [...attachments, ...uploadedAttachments];
    }
    
    // Create the message with attachments
    const messageToSend = {
      ...message,
      attachments: attachments.length > 0 ? attachments : undefined
    };
    
    // Insert the message into the database
    const { data, error } = await supabase
      .from('project_messages')
      .insert([messageToSend])
      .select(`
        *,
        users(id, email, first_name, last_name, role)
      `)
      .single();
    
    if (error) {
      console.error('Error sending project message:', error);
      throw error;
    }
    
    if (data) {
      const { users, ...messageData } = data;
      return {
        ...messageData,
        user: users
      };
    }
    throw new Error('No data returned from insert operation');
  } catch (error) {
    console.error('Error in sendProjectMessage:', error);
    throw error;
  }
};

/**
 * Set up real-time subscription for new messages in a project chat
 */
export const subscribeToProjectMessages = (
  projectId: string, 
  callback: (message: ChatMessage) => void
) => {
  const subscription = supabase
    .channel(`project_messages:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        // Fetch the complete message with user data
        fetchMessageWithUser(payload.new.id).then(message => {
          if (message) {
            callback(message);
          }
        });
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Helper function to fetch a single message with user data
 */
export const fetchMessageWithUser = async (messageId: string): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        users(id, email, first_name, last_name, role)
      `)
      .eq('id', messageId)
      .single();
    
    if (error) {
      console.error('Error fetching message with user:', error);
      throw error;
    }
    
    if (data) {
      const { users, ...messageData } = data;
      return {
        ...messageData,
        user: users
      };
    }
    return null;
  } catch (error) {
    console.error('Error in fetchMessageWithUser:', error);
    return null;
  }
};

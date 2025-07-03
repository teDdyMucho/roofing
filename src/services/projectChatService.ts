import { supabase } from '../lib/supabase';
import { User } from './userService';

export interface ChatMessage {
  id: string;
  created_at: string;
  project_id: string;
  user_id: string;
  message: string;
  user?: User; // Joined user data
}

export interface NewChatMessage {
  project_id: string;
  user_id: string;
  message: string;
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
 * Send a new message in a project chat
 */
export const sendProjectMessage = async (message: NewChatMessage): Promise<ChatMessage> => {
  try {
    const { data, error } = await supabase
      .from('project_messages')
      .insert([message])
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

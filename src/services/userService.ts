import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * User interface representing a user in the system
 */
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar_url?: string;
  last_sign_in?: string;
  created_at?: string;
}

/**
 * TeamMember interface representing a team member in the system
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  project_id?: string;
  last_active?: string;
}

/**
 * Service response interface for handling API responses
 */
interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * User service for handling user-related operations
 */
export const userService = {
  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },
  
  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },
  
  // Create a new user
  async createUser(user: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },
  
  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },
  
  // Update user's last sign in time
  async updateLastSignIn(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error updating last sign in:', error);
      return null;
    }
  },
  
  // Get all team members
  async getAllTeamMembers(): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) throw error;
      return data as TeamMember[];
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  },
  
  // Get team members by project ID
  async getTeamMembersByProject(projectId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data as TeamMember[];
    } catch (error) {
      console.error('Error fetching team members by project:', error);
      return [];
    }
  },
  
  // Update team member status
  async updateTeamMemberStatus(
    memberId: string, 
    status: 'online' | 'away' | 'offline'
  ): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({ 
          status,
          last_active: status !== 'online' ? new Date().toISOString() : null 
        })
        .eq('id', memberId)
        .select()
        .single();
      
      if (error) throw error;
      return data as TeamMember;
    } catch (error) {
      console.error('Error updating team member status:', error);
      return null;
    }
  }
};

export default userService;

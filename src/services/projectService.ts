import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  created_at: string;
  name: string;
  client: string;
  address: string;
  status: 'Estimate' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  start_date: string | null;
  end_date: string | null;
  value: number | null;
}

export interface NewProject {
  name: string;
  client: string;
  address: string;
  status?: 'Estimate' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  start_date?: string | null;
  end_date?: string | null;
  value?: number | null;
}

/**
 * Fetch all projects from the database
 */
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchProjects:', error);
    throw error;
  }
};

/**
 * Fetch a single project by ID
 */
export const fetchProjectById = async (id: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchProjectById:', error);
    throw error;
  }
};

/**
 * Create a new project
 */
export const createProject = async (project: NewProject): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
};

/**
 * Update an existing project
 */
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateProject:', error);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProject:', error);
    throw error;
  }
};

/**
 * Format currency value for display
 */
export const formatCurrency = (value: number | null): string => {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

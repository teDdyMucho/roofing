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
  // Chat Details fields
  phone: string | null;
  email: string | null;
  mailing: string | null;
  billing: string | null;
  category: string | null;
  workType: string | null;
  trade: string | null;
  leadSource: string | null;
}

export interface NewProject {
  name: string;
  client: string;
  address: string;
  status?: 'Estimate' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  start_date?: string | null;
  end_date?: string | null;
  value?: number | null;
  // Chat Details fields - all optional with null defaults
  phone?: string | null;
  email?: string | null;
  mailing?: string | null;
  billing?: string | null;
  category?: string | null;
  workType?: string | null;
  trade?: string | null;
  leadSource?: string | null;
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
    // Ensure all Chat Details fields are set to null by default
    const projectWithDefaults = {
      ...project,
      // Set default values for Chat Details fields if not provided
      phone: project.phone ?? null,
      email: project.email ?? null,
      mailing: project.mailing ?? null,
      billing: project.billing ?? null,
      category: project.category ?? null,
      workType: project.workType ?? null,
      trade: project.trade ?? null,
      leadSource: project.leadSource ?? null
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([projectWithDefaults])
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
 * Get a single project by ID
 */
export const getProjectById = async (id: string): Promise<Project> => {
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
    console.error('Error in getProjectById:', error);
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
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Format date with time in a user-friendly format (e.g., "May 28, 2025, at 9am")
 */
export const formatDateWithTime = (dateTimeString: string | null): string => {
  if (!dateTimeString || dateTimeString.trim() === '') return 'Click to select date and time';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return 'Click to select date and time';
  
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Format hours to 12-hour format with am/pm
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Only show minutes if they're not zero
  const timeStr = minutes > 0 ? 
    `${hours}:${minutes.toString().padStart(2, '0')}${ampm}` : 
    `${hours}${ampm}`;
  
  return `${month} ${day}, ${year}, at ${timeStr}`;
};

/**
 * Update a project with index form data
 */
export const updateProjectIndex = async (id: string, indexData: any): Promise<Project> => {
  try {
    // Map form fields directly to database columns
    const dbData: Record<string, any> = {};
    
    // Direct mapping of form fields to database columns
    const fieldMappings: Record<string, string> = {
      // Form field name -> Database column name
      'id': 'id',
      'nameOfProject': 'name',
      'addressOfProject': 'address',
      'ownerOfTheProject': 'client',
      'ownerEntityAddress': 'ownerEntityAddress',
      'department': 'department',
      'preBidConferenceDt': 'preBidConferenceDt',
      'preBidConferenceLocation': 'preBidConferenceLocation',
      'rfiDue': 'rfiDue',
      'rfsDue': 'rfsDue',
      'bidDue': 'bidDue',
      'typeOfBidSubmission': 'typeOfBidSubmission',
      'website': 'website',
      'bidDeliveryDetails': 'bidDeliveryDetails',
      'bidDeliveryAttention': 'bidDeliveryAttention',
      'bidDeliveryDepartment': 'bidDeliveryDepartment',
      'bidDeliveryEntityName': 'bidDeliveryEntityName',
      'startDate': 'start_date',
      'estimatedProjectCost': 'value'
    };
    
    // Map form fields to database columns
    Object.entries(indexData).forEach(([key, value]) => {
      // Use the mapping if available, otherwise convert camelCase to snake_case
      const dbColumn = fieldMappings[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Handle date fields - ensure they're in the right format
      if (['start_date', 'end_date', 'preBidConference', 'rfiDue', 'rfsDue', 'bidDue'].includes(dbColumn)) {
        // If the value is a valid date string, format it properly
        if (value && typeof value === 'string' && value.trim() !== '') {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              dbData[dbColumn] = date.toISOString();
            } else {
              dbData[dbColumn] = value; // Keep original if parsing fails
            }
          } catch (e) {
            dbData[dbColumn] = value; // Keep original if parsing fails
          }
        } else {
          dbData[dbColumn] = value;
        }
      } 
      // Handle numeric fields
      else if (dbColumn === 'value' && typeof value === 'string') {
        // Remove currency symbols and commas, then convert to number
        const numericValue = value.replace(/[^0-9.-]+/g, '');
        dbData[dbColumn] = numericValue ? parseFloat(numericValue) : null;
      } 
      else {
        dbData[dbColumn] = value;
      }
    });
    
    console.log('Updating project with data:', dbData);
    
    // Update the project with the index form data directly in the projects table
    const { data, error } = await supabase
      .from('projects')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project index data:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateProjectIndex:', error);
    throw error;
  }
};


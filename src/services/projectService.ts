import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  created_at: string;
  name: string;
  client: string;
  owner_projects: string | null;
  address: string;
  status: 'Estimate' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  start_date: string | null;
  end_date: string | null;
  value: number | null;
  // Project Owner fields
  phone: string | null;
  email: string | null;
  representative: string | null;
  // General Contractor fields
  contractor_name: string | null;
  contractor_address: string | null;
  contractor_phone: string | null;
  contractor_email: string | null;
  contractor_representative: string | null;
  // Project date fields
  preBidConferenceDt: string | null;
  bidDue: string | null;
  rfiDue: string | null;
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
}

/**
 * Fetch all projects from the database
 */
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL ? 'Defined' : 'Undefined');
    console.log('Supabase connection status:', supabase ? 'Connected' : 'Not connected');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Supabase query executed');
    
    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    
    console.log('Projects data received:', data ? `${data.length} records` : 'No data');
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
    console.log('Fetching project by ID:', id);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
    
    console.log('Project data retrieved:', data);
    console.log('Project owner_projects field:', data?.owner_projects);
    console.log('Project client field:', data?.client);
    
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
    console.log('Creating project with data:', project);
    // Only include fields that exist in the database schema
    const projectWithDefaults = {
      ...project,
      // Set default values for Chat Details fields if not provided
      phone: project.phone ?? null,
      email: project.email ?? null,
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
 * Update an existing project and its associated general contractor
 */
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  try {
    // Extract general contractor fields from updates
    const contractorUpdates = {
      name: updates.contractor_name,
      address: updates.contractor_address,
      phone: updates.contractor_phone,
      email: updates.contractor_email,
      representative: updates.contractor_representative
    };
    
    // Extract project owner fields from updates and handle numeric fields
    const projectUpdates: Record<string, any> = {
      name: updates.name,
      client: updates.client,
      address: updates.address,
      phone: updates.phone,
      email: updates.email,
      representative: updates.representative
    };
    
    // Handle numeric fields - ensure value is properly converted if it exists in updates
    if ('value' in updates) {
      const valueUpdate = updates.value;
      // Use type checking to handle different possible types
      if (valueUpdate === null || valueUpdate === undefined) {
        projectUpdates.value = null;
      } else if (typeof valueUpdate === 'string' && valueUpdate === '') {
        projectUpdates.value = null;
      } else {
        projectUpdates.value = valueUpdate;
      }
    }
    
    // Start a transaction to update both tables
    const { data, error } = await supabase
      .from('projects')
      .update(projectUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    
    // Check if general contractor exists for this project
    const { data: existingContractor } = await supabase
      .from('general_contractors')
      .select('*')
      .eq('project_id', id)
      .single();
    
    let contractorOperationError = null;
    
    if (existingContractor) {
      // Update existing contractor
      const { error: updateError } = await supabase
        .from('general_contractors')
        .update(contractorUpdates)
        .eq('project_id', id);
      
      contractorOperationError = updateError;
    } else {
      // Insert new contractor
      const { error: insertError } = await supabase
        .from('general_contractors')
        .insert({
          ...contractorUpdates,
          project_id: id
        });
      
      contractorOperationError = insertError;
    }
    
    if (contractorOperationError) {
      console.error('Error updating general contractor:', contractorOperationError);
      // Don't throw here, we still want to return the updated project
    }
    
    // Fetch the complete project with general contractor data
    const { data: completeProject, error: fetchCompleteError } = await supabase
      .from('projects')
      .select(`
        *,
        general_contractors:general_contractors!project_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (fetchCompleteError) {
      console.error('Error fetching complete project:', fetchCompleteError);
      return data; // Return partial data if we can't fetch the complete project
    }
    
    // Map the nested general_contractors data to the flat Project structure
    const contractor = completeProject.general_contractors;
    const result: Project = {
      ...completeProject,
      contractor_name: contractor ? contractor.name : null,
      contractor_address: contractor ? contractor.address : null,
      contractor_phone: contractor ? contractor.phone : null,
      contractor_email: contractor ? contractor.email : null,
      contractor_representative: contractor ? contractor.representative : null,
    };
    
    // Remove the nested general_contractors property
    delete (result as any).general_contractors;
    
    return result;
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
      'ownerOfTheProject': 'owner_projects', // Changed from client to owner_projects
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


import { supabase } from '../lib/supabase';

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  content_type: string;
  category?: string;
  description?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  file_content?: string; // For storing base64 encoded file content
}

export interface NewProjectFile {
  project_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  content_type: string;
  category?: string;
  description?: string;
  uploaded_by?: string;
  file_content?: string; // For storing base64 encoded file content
}

/**
 * Convert a File object to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Upload a file to the project_files table
 */
export const uploadProjectFile = async (
  projectId: string,
  file: File,
  category?: string,
  description?: string
): Promise<ProjectFile> => {
  try {
    // Check if the file is a CSV file (causing the 400 error)
    if (file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('CSV files are not supported. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
    }
    
    // For files larger than 1MB, show a warning
    if (file.size > 1024 * 1024) {
      console.warn('File is larger than 1MB. Consider using a file hosting service for large files.');
    }
    
    // Convert file to base64 for storage in the database
    const base64File = await fileToBase64(file);
    
    // Create a record in the project_files table with the base64 content
    const fileRecord: NewProjectFile = {
      project_id: projectId,
      file_name: file.name,
      file_path: `projects/${projectId}/${file.name}`,
      file_type: file.name.split('.').pop() || '',
      file_size: file.size,
      content_type: file.type,
      category,
      description,
      file_content: base64File // Store the file content directly in the database
    };

    const { data: fileData, error: fileError } = await supabase
      .from('project_files')
      .insert([fileRecord])
      .select()
      .single();

    if (fileError) {
      console.error('Error creating file record:', fileError);
      throw fileError;
    }

    return fileData;
  } catch (error) {
    console.error('Error in uploadProjectFile:', error);
    throw error;
  }
};

/**
 * Get the data URL for a file (for direct download from database)
 */
export const getFileUrl = async (fileId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('project_files')
      .select('file_content, file_name')
      .eq('id', fileId)
      .single();
    
    if (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
    
    // Return the base64 content directly
    return data.file_content || '';
  } catch (error) {
    console.error('Error in getFileUrl:', error);
    throw error;
  }
};

/**
 * Fetch all files for a specific project
 */
export const fetchProjectFiles = async (projectId: string): Promise<ProjectFile[]> => {
  try {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching project files:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchProjectFiles:', error);
    throw error;
  }
};

/**
 * Delete a file record from the database
 */
export const deleteProjectFile = async (fileId: string): Promise<void> => {
  try {
    // Delete the file record from the database
    const { error: deleteError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);
    
    if (deleteError) {
      console.error('Error deleting file record:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('Error in deleteProjectFile:', error);
    throw error;
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

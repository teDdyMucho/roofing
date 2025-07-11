import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const WEBHOOK_URL = 'https://southlandroofing.app.n8n.cloud/webhook/cf37f131-2041-426d-add5-1dbb8a96640b';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Interface representing a document with its extracted keywords and fields
 * Used for storing and retrieving document analysis results
 */
export interface DocumentKeywords {
  /** Unique identifier (auto-generated by Supabase) */
  id?: string;
  /** Original filename of the uploaded document */
  document_name: string;
  /** Associated project identifier */
  project_id: string;
  /** Array of extracted keywords from document content */
  keywords: string[];
  /** Key-value pairs of extracted structured data fields */
  extracted_fields: Record<string, string>;
  /** User ID of the person who uploaded the document */
  uploaded_by: string;
  /** Timestamp when the document was uploaded */
  uploaded_at: Date;
}

/**
 * Upload a document to the webhook for keyword extraction and store results in database
 * 
 * @param file - The document file to upload and analyze
 * @param projectId - The project ID associated with the document
 * @param userId - The user ID who uploaded the document
 * @returns Promise with the stored document keywords and extracted fields
 * @throws Error if document upload, processing, or storage fails
 */
export const uploadDocumentForKeywordExtraction = async (
  file: File,
  projectId: string,
  userId: string
): Promise<DocumentKeywords> => {
  try {
    // Validate inputs
    if (!file) throw new Error('No file provided');
    if (!projectId) throw new Error('Project ID is required');
    if (!userId) throw new Error('User ID is required');
    
    // Create FormData for the API request
    const formData = new FormData();
    formData.append('document', file);
    formData.append('projectId', projectId);
    formData.append('userId', userId);

    // Send the file to the webhook for processing
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Document processing failed (${response.status}): ${errorText}`);
    }

    // Parse the webhook response
    const data = await response.json();
    if (!data.keywords || !Array.isArray(data.keywords)) {
      throw new Error('Invalid response: missing or invalid keywords array');
    }
    // Optionally validate extracted_fields...
    return data;
    // Validate response data
    if (!data.keywords || !Array.isArray(data.keywords)) {
      throw new Error('Invalid response: missing or invalid keywords array');
    }
    
    // Prepare document record for database
    const documentKeywords: DocumentKeywords = {
      document_name: file.name,
      project_id: projectId,
      keywords: data.keywords,
      extracted_fields: data.extracted_fields || {},
      uploaded_by: userId,
      uploaded_at: new Date(),
    };
  } catch (error) {
    console.error('Document processing failed:', error);
    throw error instanceof Error ? error : new Error('Unknown error during document processing');
  }
};

/**
 * Retrieve all document keywords and extracted fields for a specific project
 * 
 * @param projectId - The project ID to fetch document data for
 * @returns Promise with an array of document keywords objects
 * @throws Error if database query fails
 */
export const getDocumentKeywords = async (projectId: string): Promise<DocumentKeywords[]> => {
  try {
    // Validate input
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Query the database for document keywords
    const { data, error } = await supabase
      .from('document_keywords')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch document keywords: ${error.message}`);
    }

    return data as DocumentKeywords[] || [];
  } catch (error) {
    console.error('Document keyword retrieval failed:', error);
    throw error instanceof Error ? error : new Error('Unknown error retrieving document keywords');
  }
};

import React, { useState, useEffect, useCallback } from 'react';
import EstimatingAIAssistant from '../EstimatingAI/EstimatingAIAssistant';
import DebugPanel from '../DebugPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Services
import { Project, fetchProjects, fetchProjectById, createProject, deleteProject, updateProjectIndex } from '../../services/projectService';
import { ChatMessage, fetchProjectMessages, sendProjectMessage, subscribeToProjectMessages } from '../../services/projectChatService';
import { uploadDocumentForKeywordExtraction } from '../../services/documentService';

// Components
import CalendarPage from '../Calendar/CalendarPage';
import WeatherTabContent from '../Weather/WeatherTabContent';
import {
  Sidebar,
  DashboardHeader,
  CreateProjectModal,
  IndexModal,
  ProjectList,
  ProjectDetails,
  ProjectChat,
  AIChat,
  OverviewContent,
  ProjectStatusTabs
} from './';

// Types
import type { IndexModalProps } from './IndexModal';
import type { AIChatMessage } from './AIChat';

// Styles
import '../../styles/Dashboard.css';

// Types
interface Appointment {
  id: number;
  client: string;
  address: string;
  type: string;
  date: string;
  time: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
}

interface NewProjectForm {
  name: string;
  client: string;
  address: string;
  start_date: string;
  end_date: string;
  value: string;
}

// Constants
const API_TO_FORM_FIELD_MAPPING: Record<string, string> = {
  'id': 'id',
  'bid_number': 'bidNumber',
  'name_of_project': 'nameOfProject',
  'address_of_project': 'addressOfProject',
  'owner_of_the_project': 'ownerOfTheProject',
  'owner_entity_address': 'ownerEntityAddress',
  'department': 'department',
  'pre_bid_conference_dt': 'preBidConferenceDt',
  'pre_bid_conference_location': 'preBidConferenceLocation',
  'rfi_due': 'rfiDue',
  'rfs_due': 'rfsDue',
  'bid_due': 'bidDue',
  'type_of_bid_submission': 'typeOfBidSubmission',
  'website': 'website',
  'bid_delivery_details': 'bidDeliveryDetails',
  'estimated_project_cost': 'estimatedProjectCost',
  'start_date': 'startDate',
  'duration': 'duration',
  'liquidated_damage': 'liquidatedDamage',
  'labor_warranty': 'laborWarranty'
};



const INITIAL_AI_MESSAGES = {
  admin: 'Welcome! I\'m your Admin AI assistant. I can help with scheduling, customer management, and business analytics.'
};

const MainDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Navigation and UI state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('All');
  const [showProjectList, setShowProjectList] = useState<boolean>(true);
  // Loading states - these are used internally but flagged as unused by linter
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  
  // Modal state
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  
  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Event listener for toggle project list button
  useEffect(() => {
    const handleToggleProjectList = () => {
      setShowProjectList(prevState => !prevState);
    };
    
    document.addEventListener('toggleProjectList', handleToggleProjectList);
    
    return () => {
      document.removeEventListener('toggleProjectList', handleToggleProjectList);
    };
  }, []);
  
  // New project form state
  const [newProject, setNewProject] = useState<NewProjectForm>({
    name: '',
    client: '',
    address: '',
    start_date: '',
    end_date: '',
    value: ''
  });
  
  // Project chat state
  const [projectMessages, setProjectMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // State for index form data
  const [indexFormData, setIndexFormData] = useState({
    // General Details
    bidNumber: '',
    nameOfProject: '',
    addressOfProject: '',
    
    // Project Owner Info
    ownerOfTheProject: '',
    ownerEntityAddress: '',
    department: '',
    
    // Bid Deadlines
    preBidConferenceDt: '',
    preBidConferenceLocation: '',
    rfiDue: '',
    rfsDue: '',
    bidDue: '',
    
    // Submission Type
    typeOfBidSubmission: '',
    website: '',
    bidDeliveryDetails: '',
    bidDeliveryAttention: '',
    bidDeliveryDepartment: '',
    bidDeliveryEntityName: '',
    
    // Bid Bond Request
    estimatedProjectCost: '',
    startDate: '',
    duration: '',
    liquidatedDamage: '',
    laborWarranty: ''
  });
  
  // Document processing state
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [documentKeywords, setDocumentKeywords] = useState<string[]>([]);
  // Used in document processing functions
  const [, setExtractedFields] = useState<Record<string, string>>({});
  const [documentError, setDocumentError] = useState<string | null>(null);
  
  // AI chat interface state
  const [adminAiMessage, setAdminAiMessage] = useState('');
  const [adminAiChat, setAdminAiChat] = useState<AIChatMessage[]>([
    { sender: 'ai', message: INITIAL_AI_MESSAGES.admin }
  ]);
  
  // Logout functionality is handled by the Sidebar component
  
  /**
   * Handle new project form input changes
   * @param e - Input change event
   */
  const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Fallback project data in case API fails
  const FALLBACK_PROJECTS: Project[] = [
    {
      id: '1',
      created_at: '2025-07-01T10:00:00Z',
      name: 'Thompson Residence Roof Repair',
      client: 'John Thompson',
      address: '234 Elm St, Springfield',
      status: 'In Progress',
      start_date: '2025-07-05',
      end_date: '2025-07-15',
      value: 8500,
      phone: '555-123-4567',
      email: 'john@example.com',
      mailing: '234 Elm St, Springfield',
      billing: '234 Elm St, Springfield',
      category: 'Residential',
      workType: 'Repair',
      trade: 'Roofing',
      leadSource: 'Referral',
      preBidConferenceDt: null,
      bidDue: null,
      rfiDue: null
    }
  ];

  // Load projects from the database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // These state updates are kept for consistency with the API flow
        setIsLoading(true);
        setError(null);
        
        // Try to fetch from API, but use fallback data if it fails
        try {
          const data = await fetchProjects();
          if (data && data.length > 0) {
            setProjects(data);
            console.log('Loaded projects from API:', data);
          } else {
            // Use fallback data if API returns empty array
            setProjects(FALLBACK_PROJECTS);
            console.log('Using fallback project data:', FALLBACK_PROJECTS);
          }
        } catch (apiError) {
          console.error('API error, using fallback data instead:', apiError);
          setProjects(FALLBACK_PROJECTS);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again later.');
        // Fallback to sample data even in case of error
        setProjects(FALLBACK_PROJECTS);
      } finally {
        // Complete loading
        setIsLoading(false);
      }
    };
    
    loadProjects();
    // FALLBACK_PROJECTS is defined outside the effect and doesn't change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update selectedProject when selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedProject(null);
      return;
    }
    
    const project = projects.find(p => p.id === selectedProjectId);
    setSelectedProject(project || null);
  }, [selectedProjectId, projects]);
  
  // Back button functionality is now handled by the ProjectDetails component
  
  // Load project messages when a project is selected and add keyboard shortcut for debug panel (Ctrl+Shift+D)
  useEffect(() => {
    if (currentUser) {
      // Project data is already being fetched in the previous useEffect
    } else {
      navigate('/login');
    }
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDebugPanel(prev => !prev);
        console.log('Debug panel toggled:', !showDebugPanel);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, navigate, showDebugPanel]);
  
  // Load project messages when a project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setProjectMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      try {
        const messages = await fetchProjectMessages(selectedProjectId);
        setProjectMessages(messages);
      } catch (err) {
        console.error('Failed to load project messages:', err);
      }
    };
    
    loadMessages();
    
    // Subscribe to new messages
    const unsubscribe = subscribeToProjectMessages(selectedProjectId, (message) => {
      setProjectMessages(prev => [...prev, message]);
    });
    
    // Cleanup subscription on unmount or when project changes
    return () => {
      unsubscribe();
    };
  }, [selectedProjectId]);
  
  // Handle sending a new message
  const handleSendProjectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProjectId || !newMessage.trim() || !currentUser) return;
    
    try {
      setIsSendingMessage(true);
      
      await sendProjectMessage({
        project_id: selectedProjectId,
        user_id: currentUser.id,
        message: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  // Handle new project form submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse value to number
      const valueNumber = newProject.value ? parseFloat(newProject.value.replace(/[^0-9.]/g, '')) : null;
      
      // Create a new project with the form data
      const projectData = {
        name: newProject.name,
        client: newProject.client,
        address: newProject.address,
        status: 'Estimate' as const,
        start_date: newProject.start_date || null,
        end_date: newProject.end_date || null,
        value: valueNumber,
        // Add Chat Details fields with null values
        phone: null,
        email: null,
        mailing: null,
        billing: null,
        category: null,
        workType: null,
        trade: null,
        leadSource: null
      };
      
      // Send to database
      const createdProject = await createProject(projectData);
      
      // Add the new project to the list
      setProjects(prev => [createdProject, ...prev]);
      
      // Set the selected project to the newly created one
      setSelectedProjectId(createdProject.id);
      
      // Reset form and close modal
      setNewProject({
        name: '',
        client: '',
        address: '',
        start_date: '',
        end_date: '',
        value: ''
      });
      setShowCreateProjectForm(false);
      
      // Switch to the Projects tab to show the new project
      setActiveTab('projects');
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project. Please try again.');
    }
  };
  
  /**
   * Handle project click to view project details
   * @param projectId - ID of the project to view
   */
  const handleProjectClick = (projectId: string): void => {
    setSelectedProjectId(projectId);
    setActiveTab('projects');
  };
  
  // Handle project deletion
  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent triggering project selection
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(projectId);
        // Remove the project from the local state
        setProjects(projects.filter(p => p.id !== projectId));
        
        // If the deleted project was selected, clear the selection
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete the project. Please try again.');
      }
    }
  };
  
  // Sample data for UI components
  const upcomingAppointments: Appointment[] = [
    {
      id: 1,
      client: 'Robert Johnson',
      address: '123 Pine St, Springfield',
      type: 'Roof Inspection',
      date: '2025-07-20',
      time: '10:00 AM'
    },
    {
      id: 2,
      client: 'Sarah Williams',
      address: '456 Oak Ave, Springfield',
      type: 'Estimate',
      date: '2025-07-22',
      time: '2:30 PM'
    }
  ];

  const notificationItems: Notification[] = [
    {
      id: 1,
      message: 'New estimate request from Thompson Residence',
      time: '2 hours ago'
    },
    {
      id: 2,
      message: 'Wilson Commercial Building project status updated to "In Progress"',
      time: '5 hours ago'
    }
  ];
  
  /**
   * Handle index form input changes
   * @param e - Input change event
   * @param field - Form field to update
   */
  const handleIndexFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof IndexModalProps['indexFormData']): void => {
    setIndexFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  // Load project data into index form when modal is opened or project selection changes
  useEffect(() => {
    // Include indexFormData in dependencies to avoid lint warning
    if (showIndexModal && selectedProjectId) {
      const loadProjectIndexData = async () => {
        try {
          const project = await fetchProjectById(selectedProjectId);
          if (project) {
            // Map database fields to form fields
            const updatedFormData = { ...indexFormData };
            
            // Map specific fields from project to form
            if (project.name) updatedFormData.nameOfProject = project.name;
            if (project.address) updatedFormData.addressOfProject = project.address;
            if (project.client) updatedFormData.ownerOfTheProject = project.client;
            if (project.start_date) updatedFormData.startDate = project.start_date;
            if (project.value) updatedFormData.estimatedProjectCost = project.value.toString();
            
            // Map additional fields if they exist in the project object
            Object.entries(project).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                // Handle specific mappings
                if (key === 'ownerEntityAddress') updatedFormData.ownerEntityAddress = value as string;
                if (key === 'department') updatedFormData.department = value as string;
                
                // Handle date fields - ensure they're in the correct format
                if (key === 'preBidConferenceDt') {
                  // If value is not already in ISO format, convert it
                  if (typeof value === 'string' && value.trim() !== '') {
                    try {
                      // Try to create a valid date object
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        // Format as ISO string for datetime-local input
                        updatedFormData.preBidConferenceDt = date.toISOString().slice(0, 16);
                      } else {
                        updatedFormData.preBidConferenceDt = value as string;
                      }
                    } catch (e) {
                      updatedFormData.preBidConferenceDt = value as string;
                    }
                  } else {
                    updatedFormData.preBidConferenceDt = value as string;
                  }
                }
                
                if (key === 'rfiDue') {
                  // If value is not already in ISO format, convert it
                  if (typeof value === 'string' && value.trim() !== '') {
                    try {
                      // Try to create a valid date object
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        // Format as ISO string for datetime-local input
                        updatedFormData.rfiDue = date.toISOString().slice(0, 16);
                      } else {
                        updatedFormData.rfiDue = value as string;
                      }
                    } catch (e) {
                      updatedFormData.rfiDue = value as string;
                    }
                  } else {
                    updatedFormData.rfiDue = value as string;
                  }
                }
                
                if (key === 'rfsDue') {
                  // If value is not already in ISO format, convert it
                  if (typeof value === 'string' && value.trim() !== '') {
                    try {
                      // Try to create a valid date object
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        // Format as ISO string for datetime-local input
                        updatedFormData.rfsDue = date.toISOString().slice(0, 16);
                      } else {
                        updatedFormData.rfsDue = value as string;
                      }
                    } catch (e) {
                      updatedFormData.rfsDue = value as string;
                    }
                  } else {
                    updatedFormData.rfsDue = value as string;
                  }
                }
                
                if (key === 'bidDue') {
                  // If value is not already in ISO format, convert it
                  if (typeof value === 'string' && value.trim() !== '') {
                    try {
                      // Try to create a valid date object
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        // Format as ISO string for datetime-local input
                        updatedFormData.bidDue = date.toISOString().slice(0, 16);
                      } else {
                        updatedFormData.bidDue = value as string;
                      }
                    } catch (e) {
                      updatedFormData.bidDue = value as string;
                    }
                  } else {
                    updatedFormData.bidDue = value as string;
                  }
                }
                
                if (key === 'preBidConferenceLocation') updatedFormData.preBidConferenceLocation = value as string;
                if (key === 'typeOfBidSubmission') updatedFormData.typeOfBidSubmission = value as string;
                if (key === 'website') updatedFormData.website = value as string;
                if (key === 'bidDeliveryDetails') updatedFormData.bidDeliveryDetails = value as string;
                if (key === 'bidDeliveryAttention') updatedFormData.bidDeliveryAttention = value as string;
                if (key === 'bidDeliveryDepartment') updatedFormData.bidDeliveryDepartment = value as string;
                if (key === 'bidDeliveryEntityName') updatedFormData.bidDeliveryEntityName = value as string;
                if (key === 'duration') updatedFormData.duration = value as string;
                if (key === 'liquidatedDamage') updatedFormData.liquidatedDamage = value as string;
                if (key === 'laborWarranty') updatedFormData.laborWarranty = value as string;
              }
            });
            
            setIndexFormData(updatedFormData);
            console.log('Loaded project data into index form:', updatedFormData);
          }
        } catch (error) {
          console.error('Error loading project data for index form:', error);
        }
      };
      
      loadProjectIndexData();
    }
    // indexFormData is used but doesn't need to trigger the effect when it changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIndexModal, selectedProjectId]);
  
  // Handle document upload and keyword extraction
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedDocument(file);
      setDocumentError(null);
      
      // Only process the document if we have a selected project
      if (selectedProjectId && currentUser) {
        setIsProcessingDocument(true);
        try {
          console.log(`Processing document: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`);
          
          const result = await uploadDocumentForKeywordExtraction(
            file,
            selectedProjectId,
            currentUser.id
          );
          
          console.log('Document processed successfully with keywords:', result.keywords.length);
          setDocumentKeywords(result.keywords);
          setExtractedFields(result.extracted_fields || {});
          
          // Update the form data with extracted fields
          if (result.extracted_fields) {
            // Create a new form data object with the extracted fields
            const updatedFormData = { ...indexFormData };
            
            // Populate form fields with extracted data
            Object.entries(result.extracted_fields).forEach(([apiField, value]) => {
              const formField = API_TO_FORM_FIELD_MAPPING[apiField] as keyof typeof indexFormData;
              if (formField && value) {
                updatedFormData[formField] = value;
              }
            });
            
            // Update the form data
            setIndexFormData(updatedFormData);
          }
        } catch (error) {
          console.error('Error processing document:', error);
          
          // Provide more specific error messages based on the error type
          let errorMessage = 'Failed to process document. Please try again.';
          
          if (error instanceof Error) {
            // Check for specific error conditions
            if (error.message.includes('timed out')) {
              errorMessage = 'Document processing timed out. The server might be busy or the file is too large.';
            } else if (error.message.includes('network')) {
              errorMessage = 'Network error while uploading document. Please check your internet connection.';
            } else if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
              errorMessage = 'Document is too large. Please try a smaller file (under 10MB).';
            } else if (error.message.includes('format') || error.message.includes('invalid')) {
              errorMessage = 'Document format error. The system couldn\'t process this file format.';
            } else if (error.message.includes('CORS')) {
              errorMessage = 'Server connection error. Please try again later.';
            } else if (file.size > 10 * 1024 * 1024) {
              errorMessage = 'Document may be too large. Try a smaller file (under 10MB).';
            }
            
            // Include part of the original error for debugging
            console.log('Detailed error:', error.message);
          }
          
          setDocumentError(errorMessage);
        } finally {
          setIsProcessingDocument(false);
        }
      } else {
        // If no project is selected, we'll just store the file and process it when saving
        console.log('Document will be processed when saving with project context');
      }
    }
  };
  
  // Handle saving index form data
  const handleSaveIndexForm = async () => {
    if (!selectedProjectId) {
      alert('No project selected. Please select a project first.');
      return;
    }
    
    // No validation needed since we're only updating edited fields

    // Process document if it exists and wasn't processed yet
    if (uploadedDocument && documentKeywords.length === 0 && selectedProjectId && currentUser) {
      setIsProcessingDocument(true);
      try {
        const result = await uploadDocumentForKeywordExtraction(
          uploadedDocument,
          selectedProjectId,
          currentUser.id
        );
        
        setDocumentKeywords(Array.isArray(result.keywords) ? result.keywords : []);
        setExtractedFields(result.extracted_fields || {});
        
        // Update the form data with extracted fields before saving
        if (result.extracted_fields) {
          // Create a new form data object with the extracted fields
          const updatedFormData = { ...indexFormData };
          
          // Populate form fields with extracted data
          Object.entries(result.extracted_fields).forEach(([apiField, value]) => {
            const formField = API_TO_FORM_FIELD_MAPPING[apiField] as keyof typeof indexFormData;
            if (formField && value) {
              updatedFormData[formField] = value;
            }
          });
          
          // Update the form data
          setIndexFormData(updatedFormData);
        }
      } catch (error) {
        console.error('Error processing document:', error);
        setDocumentError('Failed to process document. Saving form data only.');
      } finally {
        setIsProcessingDocument(false);
      }
    }

    try {
      // Only include fields that have been edited (non-empty values)
      const editedFields: Record<string, any> = {};
      
      // Filter out empty fields and undefined values
      Object.entries(indexFormData).forEach(([key, value]) => {
        // Include the field if it has a non-empty value
        if (value !== '' && value !== null && value !== undefined) {
          editedFields[key] = value;
        }
      });
      
      // Log the data being sent to help with debugging
      console.log('Saving edited index form fields:', editedFields);
      
      // Only proceed if there are fields to update
      if (Object.keys(editedFields).length === 0) {
        alert('No changes detected. Nothing to save.');
        return;
      }
      
      // Save only the edited fields to the projects table in Supabase
      await updateProjectIndex(selectedProjectId, editedFields);
      
      // Update the local projects state with the updated project
      const updatedProject = await fetchProjectById(selectedProjectId);
      if (updatedProject) {
        setProjects(prevProjects => 
          prevProjects.map(p => p.id === selectedProjectId ? updatedProject : p)
        );
      }
      
      // Close the modal
      setShowIndexModal(false);
      
      // Show a success message
      alert('Index data saved successfully!');
      
      // Reset document states for next time
      setUploadedDocument(null);
      setDocumentKeywords([]);
      setExtractedFields({});
      setDocumentError(null);
    } catch (error: any) {
      // More detailed error logging with specific error information
      console.error('Failed to save index data:', {
        message: error?.message || 'Unknown error',
        details: error?.details || {},
        code: error?.code || 'UNKNOWN',
        hint: error?.hint || '',
        statusCode: error?.statusCode || '',
        projectId: selectedProjectId
      });
      
      // More informative user message based on error type
      let errorMessage = 'Failed to save index data. ';
      
      if (error?.code === '42P01') {
        errorMessage += 'The table might not exist in the database.';
      } else if (error?.code === '42501') {
        errorMessage += 'Permission denied. Please check your database permissions.';
      } else if (error?.code === '23505') {
        errorMessage += 'A record with this information already exists.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }
      
      alert(errorMessage);
    }
  };



  /**
   * Handle sending messages to Admin AI assistant
   */
  const handleSendMessage = useCallback(() => {
    const message = adminAiMessage;
    
    if (!message.trim()) return;
    
    // Add user message to chat
    setAdminAiChat(prev => [...prev, { sender: 'user', message }]);
    
    // Clear input field
    setAdminAiMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = "I've analyzed your schedule and found optimal times for the team meeting. Would Tuesday at 10am or Thursday at 2pm work better?";
      
      setAdminAiChat(prev => [...prev, { sender: 'ai', message: aiResponse }]);
    }, 1000);
  }, [adminAiMessage]);
  
  // User profile click is now handled by the DashboardHeader component

  return (
    <div className="dashboard-container">
      {/* Use our new components */}
      <CreateProjectModal 
        showModal={showCreateProjectForm}
        setShowModal={setShowCreateProjectForm}
        newProject={newProject}
        handleNewProjectChange={handleNewProjectChange}
        handleCreateProject={handleCreateProject}
      />
      
      <IndexModal 
        showModal={showIndexModal}
        setShowModal={setShowIndexModal}
        indexFormData={indexFormData}
        handleIndexFormChange={handleIndexFormChange}
        handleDocumentUpload={handleDocumentUpload}
        handleSaveIndexForm={handleSaveIndexForm}
        uploadedDocument={uploadedDocument}
        isProcessingDocument={isProcessingDocument}
        documentKeywords={documentKeywords}
        documentError={documentError}
        selectedProjectId={selectedProjectId}
        projects={projects}
        handleDeleteProject={handleDeleteProject}
      />
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="main-content">
        <DashboardHeader notifications={notificationItems} />

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <OverviewContent 
              projects={projects}
              handleProjectClick={handleProjectClick}
              setActiveTab={setActiveTab}
              upcomingAppointments={upcomingAppointments}
              notifications={notificationItems}
            />
          )}
          
          {/* Projects Tab Content */}
          {activeTab === 'projects' && (
            <div className="projects-container">
              <ProjectStatusTabs 
                projectStatusFilter={projectStatusFilter}
                setProjectStatusFilter={setProjectStatusFilter}
                selectedProject={selectedProject}
              />
              
              <div className="projects-content-wrapper">
  {/* Left side: Projects Navigation */}
  <div className={`projects-sidebar${selectedProjectId && !showProjectList ? ' slide-out' : ''}`}>
    <ProjectList 
      projects={projects}
      selectedProjectId={selectedProjectId}
      projectStatusFilter={projectStatusFilter}
      handleProjectClick={handleProjectClick}
      handleDeleteProject={handleDeleteProject}
      setShowCreateProjectForm={setShowCreateProjectForm}
    />
  </div>

  {/* Right side: Combined Project Details and Chat */}
  <div className={`project-combined-panel${selectedProjectId && !showProjectList ? ' expand-full' : ''}`}>
    {selectedProjectId && (
      <>
        <ProjectDetails 
          selectedProjectId={selectedProjectId}
          projects={projects}
          setShowIndexModal={setShowIndexModal}
          setSelectedProjectId={setSelectedProjectId}
          indexFormData={indexFormData}
          handleIndexFormChange={handleIndexFormChange}
          handleDocumentUpload={handleDocumentUpload}
          handleSaveIndexForm={handleSaveIndexForm}
          uploadedDocument={uploadedDocument}
          isProcessingDocument={isProcessingDocument}
          documentKeywords={documentKeywords}
          documentError={documentError}
          handleDeleteProject={handleDeleteProject}
        />
        <ProjectChat 
          projectMessages={projectMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendProjectMessage={handleSendProjectMessage}
          isSendingMessage={isSendingMessage}
        />
      </>
    )}
  </div>
</div>
            </div>
          )}
          
          {/* Calendar Tab Content */}
          {activeTab === 'calendar' && (
            <CalendarPage />
          )}
          
          {/* Weather Tab Content */}
          {activeTab === 'weather' && (
            <WeatherTabContent 
              projectLocation={selectedProject?.address}
              projects={projects}
            />
          )}
          
          {/* AI Estimating Assistant Tab Content */}
          {activeTab === 'ai-estimating' && (
            <EstimatingAIAssistant />
          )}
          
          {/* AI Admin Assistant Tab Content */}
          {activeTab === 'ai-admin' && (
            <AIChat 
              chatType="admin"
              chatMessages={adminAiChat}
              message={adminAiMessage}
              setMessage={setAdminAiMessage}
              handleSendMessage={() => handleSendMessage()}
            />
          )}
          
          {/* Other tabs would go here */}
        </div>
      </main>
      
      {/* Debug Panel - Toggle with Ctrl+Shift+D */}
      <DebugPanel isVisible={showDebugPanel} />
    </div>
  );
};

export default MainDashboard;

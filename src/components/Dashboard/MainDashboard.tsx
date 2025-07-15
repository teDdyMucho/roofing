import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Project, fetchProjects, createProject, deleteProject } from '../../services/projectService';
import { ChatMessage, fetchProjectMessages, sendProjectMessage, subscribeToProjectMessages } from '../../services/projectChatService';
import { uploadDocumentForKeywordExtraction } from '../../services/documentService';
import CalendarPage from '../Calendar/CalendarPage';
import '../../styles/Dashboard.css';

// Import our new components
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

// Import component types
import type { IndexModalProps } from './IndexModal';
import type { AIChatMessage } from './AIChat';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = () => {
    logout()
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/', { replace: true }));
  };
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  
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
    
    // Bid Bond Request
    estimatedProjectCost: '',
    startDate: '',
    duration: '',
    liquidatedDamage: '',
    laborWarranty: ''
  });
  
  // State for document upload and processing
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [documentKeywords, setDocumentKeywords] = useState<string[]>([]);
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [documentError, setDocumentError] = useState<string | null>(null);
  
  // State for active index tab
  const [activeIndexTab, setActiveIndexTab] = useState('generalDetails');
  
  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    address: '',
    start_date: '',
    end_date: '',
    value: ''
  });
  
  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);
  // State for project status filter
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('Bidding');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Project chat state
  const [projectMessages, setProjectMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Handle new project form input changes
  const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Load projects from the database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Handle back button click to return to projects list
  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };
  
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
        value: valueNumber
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
  
  // Handle project click to view project details
  const handleProjectClick = (projectId: string) => {
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
  
  // Mock data for upcoming appointments
  const upcomingAppointments = [
    { id: 1, client: 'Thompson Residence', address: '234 Elm St', type: 'Inspection', date: '2025-07-01', time: '10:00 AM' },
    { id: 2, client: 'Wilson Property', address: '567 Cedar Ln', type: 'Estimate', date: '2025-07-02', time: '1:30 PM' },
    { id: 3, client: 'Martinez Home', address: '890 Birch Ave', type: 'Repair', date: '2025-07-03', time: '9:00 AM' }
  ];
  
  // Notification data
  const notificationItems = [
    { id: 1, message: 'New estimate request from Lee Residence', time: '2 hours ago' },
    { id: 2, message: 'Material delivery scheduled for Smith project', time: '5 hours ago' },
    { id: 3, message: 'Weather alert: Rain expected tomorrow', time: '1 day ago' }
  ];
  
  // Handle index form input changes
  const handleIndexFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof IndexModalProps['indexFormData']) => void = (e, field) => {
    setIndexFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
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
          const result = await uploadDocumentForKeywordExtraction(
            file,
            selectedProjectId,
            currentUser.id
          );
          
          setDocumentKeywords(result.keywords);
          setExtractedFields(result.extracted_fields || {});
          
          // Update the form data with extracted fields
          if (result.extracted_fields) {
            // Create a mapping between API field names and form field names
            const fieldMapping: Record<string, keyof typeof indexFormData> = {
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
            
            // Create a new form data object with the extracted fields
            const updatedFormData = { ...indexFormData };
            
            // Populate form fields with extracted data
            Object.entries(result.extracted_fields).forEach(([apiField, value]) => {
              const formField = fieldMapping[apiField];
              if (formField && value) {
                updatedFormData[formField] = value;
              }
            });
            
            // Update the form data
            setIndexFormData(updatedFormData);
          }
        } catch (error) {
          console.error('Error processing document:', error);
          setDocumentError('Failed to process document. Please try again.');
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
          // Create a mapping between API field names and form field names
          const fieldMapping: Record<string, keyof typeof indexFormData> = {
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
          
          // Create a new form data object with the extracted fields
          const updatedFormData = { ...indexFormData };
          
          // Populate form fields with extracted data
          Object.entries(result.extracted_fields).forEach(([apiField, value]) => {
            const formField = fieldMapping[apiField];
            if (formField && value) {
              updatedFormData[formField] = value;
            }
          });
          
          // Update the form data
          setIndexFormData(updatedFormData);
        }
        
        // Here you would typically send the form data and document keywords to your backend
        console.log('Form data and keywords ready for saving:', {
          formData: indexFormData,
          document: uploadedDocument.name,
          keywords: result.keywords,
          extractedFields: result.extracted_fields
        });
        
      } catch (error) {
        console.error('Error processing document:', error);
        setDocumentError('Failed to process document. Saving form data only.');
        
        // Still save the form data even if document processing failed
        console.log('Saving form data only:', indexFormData);
      } finally {
        setIsProcessingDocument(false);
      }
    } else {
      // If no document or already processed, just save the form data
      console.log('Saving form data:', indexFormData);
      if (documentKeywords.length > 0) {
        console.log('With previously extracted keywords:', documentKeywords);
        console.log('With previously extracted fields:', extractedFields);
      }
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
  };

  // Auth functions are already declared at the top of the component

  const handleUserProfileClick = () => {
    navigate('/user-settings');
  };

  // AI chat interface state
  const [estimatingAiMessage, setEstimatingAiMessage] = useState('');
  const [adminAiMessage, setAdminAiMessage] = useState('');
  
  // Initial AI chat messages
  const [estimatingAiChat, setEstimatingAiChat] = useState<AIChatMessage[]>([
    { 
      sender: 'ai', 
      message: 'Hello! I\'m your Estimating AI assistant. How can I help you create roofing estimates today?' 
    }
  ]);
  
  const [adminAiChat, setAdminAiChat] = useState<AIChatMessage[]>([
    { 
      sender: 'ai', 
      message: 'Welcome! I\'m your Admin AI assistant. I can help with scheduling, customer management, and business analytics.' 
    }
  ]);

  // Handle sending messages to AI assistants
  const handleSendMessage = useCallback((messageType: 'estimating' | 'admin') => {
    if (messageType === 'estimating' && estimatingAiMessage.trim()) {
      // Add user message to chat
      setEstimatingAiChat(prev => [...prev, { 
        sender: 'user' as const, 
        message: estimatingAiMessage 
      }]);
      
      // Clear input field
      setEstimatingAiMessage('');
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        setEstimatingAiChat(prev => [
          ...prev, 
          { 
            sender: 'ai' as const, 
            message: `Based on your roof dimensions, I estimate you'll need approximately 24 squares of shingles and 10 rolls of underlayment.` 
          }
        ]);
      }, 1000);
    } else if (messageType === 'admin' && adminAiMessage.trim()) {
      // Add user message to chat
      setAdminAiChat(prev => [...prev, { 
        sender: 'user' as const, 
        message: adminAiMessage 
      }]);
      
      // Clear input field
      setAdminAiMessage('');
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        setAdminAiChat(prev => [
          ...prev, 
          { 
            sender: 'ai' as const, 
            message: `I've analyzed your schedule and found optimal times for the team meeting. Would Tuesday at 10am or Thursday at 2pm work better?` 
          }
        ]);
      }, 1000);
    }
  }, [estimatingAiMessage, adminAiMessage]);

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
              />
              
              <div className="projects-content-wrapper">
                {/* Left side: Projects Navigation */}
                <ProjectList 
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  projectStatusFilter={projectStatusFilter}
                  handleProjectClick={handleProjectClick}
                  handleDeleteProject={handleDeleteProject}
                  setShowCreateProjectForm={setShowCreateProjectForm}
                />
                
                {/* Right side: Combined Project Details and Chat */}
                {selectedProjectId && (
                  <div className="project-combined-panel">
                    <ProjectDetails 
                      selectedProjectId={selectedProjectId}
                      projects={projects}
                      setShowIndexModal={setShowIndexModal}
                    />
                    
                    <ProjectChat 
                      projectMessages={projectMessages}
                      newMessage={newMessage}
                      setNewMessage={setNewMessage}
                      handleSendProjectMessage={handleSendProjectMessage}
                      isSendingMessage={isSendingMessage}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Calendar Tab Content */}
          {activeTab === 'calendar' && (
            <CalendarPage />
          )}
          
          {/* AI Estimating Assistant Tab Content */}
          {activeTab === 'ai-estimating' && (
            <AIChat 
              chatType="estimating"
              chatMessages={estimatingAiChat}
              message={estimatingAiMessage}
              setMessage={setEstimatingAiMessage}
              handleSendMessage={handleSendMessage}
            />
          )}
          
          {/* AI Admin Assistant Tab Content */}
          {activeTab === 'ai-admin' && (
            <AIChat 
              chatType="admin"
              chatMessages={adminAiChat}
              message={adminAiMessage}
              setMessage={setAdminAiMessage}
              handleSendMessage={handleSendMessage}
            />
          )}
          
          {/* Other tabs would go here */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

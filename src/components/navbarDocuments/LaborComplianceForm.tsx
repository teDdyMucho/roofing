import React, { useState, useRef, useCallback, useEffect } from 'react';
import formStyles from '../Dashboard/FormStyles.module.css';
import { FaTimes, FaFileUpload, FaFile, FaDownload, FaTrash } from 'react-icons/fa';
import { uploadProjectFile, fetchProjectFiles, deleteProjectFile, getFileUrl, ProjectFile, formatFileSize } from '../../services/fileService';

interface LaborComplianceFormProps {
  projectId: string;
  onSave?: () => void;
}

const LaborComplianceForm: React.FC<LaborComplianceFormProps> = ({ projectId, onSave }) => {
  // State for file upload and management

  // State for file upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileDescription, setFileDescription] = useState('');
  const [fileCategory, setFileCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  
  // Fetch project files when component mounts
  useEffect(() => {
    const loadProjectFiles = async () => {
      setIsLoading(true);
      try {
        const files = await fetchProjectFiles(projectId);
        setProjectFiles(files);
      } catch (error) {
        console.error('Error fetching project files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjectFiles();
  }, [projectId]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave();
  };

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveFiles = async () => {
    if (uploadedFiles.length === 0) return;
    if (!fileCategory) {
      setUploadError('Please select a document category');
      return;
    }
    if (!fileDescription) {
      setUploadError('Please enter a document description');
      return;
    }
    
    const category = fileCategory;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Upload each file to Supabase with the selected category
      const uploadPromises = uploadedFiles.map(file => 
        uploadProjectFile(projectId, file, category, fileDescription)
      );
      
      const newFiles = await Promise.all(uploadPromises);
      
      // Update local state with the new files
      setProjectFiles(prev => [...newFiles, ...prev]);
      
      // Clear the uploaded files list and form fields
      setUploadedFiles([]);
      setFileDescription('');
      setFileCategory('');
      
      // Close the modal
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await deleteProjectFile(fileId);
      // Remove the file from the local state
      setProjectFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete the file. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.formWrapper}>
      {/* Upload Button and Files Display */}
      <div className={formStyles['document-section']}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Labor Compliance Documents</h3>
          <button 
            type="button" 
            className={formStyles['btn'] + ' ' + formStyles['btn-primary']}
            onClick={() => setShowUploadModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaFileUpload /> Upload Documents
          </button>
        </div>
        
        {/* Project Files List */}
        {isLoading ? (
          <p>Loading files...</p>
        ) : (
          ['Apprentice', 'DAS 140/142', 'CAC Monthly Training Funds', 'Weekly eCPRs'].map(category => {
            const sectionFiles = projectFiles.filter(file => file.category === category);

            return (
              <div key={category} className={formStyles['document-section']}>
                <h3>{category}</h3>

                {sectionFiles.length > 0 ? (
                  <div className={formStyles['document-list']}>
                    {sectionFiles.map(file => (
                      <div key={file.id} className={formStyles['document-item']}>
                        <div className={formStyles['document-icon']}><FaFile /></div>
                        <div className={formStyles['document-info']}>
                          <div className={formStyles['document-name']}>
                            {file.file_name}
                            <span className={formStyles['document-category']}>{file.category}</span>
                          </div>
                          <div className={formStyles['document-meta']}>
                            {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                            {file.description && (
                              <div className={formStyles['document-description']} >{file.description}</div>
                            )}
                          </div>
                        </div>
                        <div className={formStyles['document-actions']}>
                          <button 
                            onClick={async () => {
                              try {
                                const fileContent = await getFileUrl(file.id);
                                const link = document.createElement('a');
                                link.href = fileContent;
                                link.download = file.file_name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } catch (error) {
                                console.error('Error downloading file:', error);
                                alert('Failed to download file. Please try again.');
                              }
                            }}
                            className={formStyles['document-action-btn']}
                            title="Download"
                          >
                            <FaDownload />
                          </button>
                          <button 
                            type="button" 
                            className={formStyles['document-action-btn']}
                            onClick={() => handleDeleteFile(file.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No files in this category.</p>
                )}
              </div>
            );
          })
        )}

              </div>

      {/* File Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Upload Documents</h2>
              <button 
                onClick={() => setShowUploadModal(false)} 
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: '#6b7280'
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body" style={{
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div className={formStyles['form-group']}>
                <label htmlFor="fileCategory" className={formStyles['form-label']}>Document Category *</label>
                <select
                  className={formStyles['form-control']}
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Apprentice">Apprentice</option>
                  <option value="DAS 140/142">DAS 140/142</option>
                  <option value="CAC Monthly Training Funds">CAC Monthly Training Funds</option>
                  <option value="Weekly eCPRs">Weekly eCPRs</option>
                </select>
              </div>
              
              <div className={formStyles['form-group']}>
                <label htmlFor="fileDescription" className={formStyles['form-label']}>Document Description *</label>
                <input
                  type="text"
                  id="fileDescription"
                  className={formStyles['form-input']}
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Enter a description for this document"
                  required
                />
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                multiple
              />
              
              <div 
                className={formStyles['document-upload-area']}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={formStyles['upload-icon']}>
                  <FaFileUpload size={24} />
                </div>
                <div className={formStyles['upload-text']}>
                  <p>Drag & drop files here or click to browse</p>
                  <p className={formStyles['upload-hint']}>Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
                </div>
              </div>
              
              {/* File list */}
              {uploadedFiles.length > 0 && (
                <div className={formStyles['document-list']} style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>Selected Files</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className={formStyles['document-item']}>
                      <div className={formStyles['document-icon']}>
                        <FaFile />
                      </div>
                      <div className={formStyles['document-info']}>
                        <div className={formStyles['document-name']}>{file.name}</div>
                        <div className={formStyles['document-meta']}>
                          {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                        </div>
                      </div>
                      <div className={formStyles['document-actions']}>
                        <button 
                          type="button" 
                          className={formStyles['document-action-btn']}
                          onClick={() => handleRemoveFile(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '1.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e5e7eb',
              gap: '0.75rem'
            }}>
              {uploadError && (
                <div style={{ color: '#ef4444', marginRight: 'auto', fontSize: '0.875rem' }}>
                  {uploadError}
                </div>
              )}
              <button 
                type="button" 
                className={formStyles['btn'] + ' ' + formStyles['btn-secondary']}
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={formStyles['btn'] + ' ' + formStyles['btn-primary']}
                onClick={handleSaveFiles}
                disabled={uploadedFiles.length === 0 || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default LaborComplianceForm;
  
import React, { useState, useEffect } from 'react';
import { EstimatingAIService, EstimatingAIData } from '../../services/estimatingAIService';
import MaterialDetailsScreen, {
  MaterialCategoryScreen,
  ImageModal,
  WelcomeScreen,
  StartScreen,
  LoadingState,
  ErrorState,
  Breadcrumb,
  MaterialType,
  CategoryType,
  sendToWebhook
} from './MaterialDetailsScreen';
import './EstimatingAIAssistant.css';

const EstimatingAIAssistant: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showFlashingWelcomeScreen, setShowFlashingWelcomeScreen] = useState(false);
  const [showCopingWelcomeScreen, setShowCopingWelcomeScreen] = useState(false);
  const [showMaterialCategories, setShowMaterialCategories] = useState(false);
  const [showRoofingMaterials, setShowRoofingMaterials] = useState(false);
  const [showFlashingMaterials, setShowFlashingMaterials] = useState(false);
  const [showCopingMaterials, setShowCopingMaterials] = useState(false);
  const [showInsulationDetails, setShowInsulationDetails] = useState(false);
  const [showCoverboardDetails, setShowCoverboardDetails] = useState(false);
  const [showBaseLayersDetails, setShowBaseLayersDetails] = useState(false);
  const [showBondingAgentDetails, setShowBondingAgentDetails] = useState(false);
  const [showMembraneDetails, setShowMembraneDetails] = useState(false);
  const [showCoatingDetails, setShowCoatingDetails] = useState(false);
  const [showChimneyFlashingDetails, setShowChimneyFlashingDetails] = useState(false);
  const [showVentFlashingDetails, setShowVentFlashingDetails] = useState(false);
  const [showDripEdgeDetails, setShowDripEdgeDetails] = useState(false);
  const [showCounterFlashingDetails, setShowCounterFlashingDetails] = useState(false);
  const [showMetalCopingDetails, setShowMetalCopingDetails] = useState(false);
  const [showPrecasterCopingDetails, setShowPrecasterCopingDetails] = useState(false);
  const [showStoneCopingDetails, setShowStoneCopingDetails] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string} | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  // Dynamic data state
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [currentMaterials, setCurrentMaterials] = useState<MaterialType[]>([]);
  const [currentStepConfig, setCurrentStepConfig] = useState<EstimatingAIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // These state variables are used in loadMaterialsForSubcategory to track the current category and subcategory
  const [currentCategory, setCurrentCategory] = useState<string>('roofing');
  const [currentSubcategory, setCurrentSubcategory] = useState<string>('');
  
  // Persistent selected items state
  interface SelectedMaterialItem {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    type: string; // For displaying labels like "Polyiso - Insulation"
  }
  
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
  
  // State for tracking materials with coverage numbers - moved to parent component to persist across navigation
  const [materialsWithCoverage, setMaterialsWithCoverage] = useState<{[key: string]: number | null}>({});
  // State to track which material is currently being edited
  const [editingCoverage, setEditingCoverage] = useState<string | null>(null);

  // Load categories and restore saved coverage values on component mount
  useEffect(() => {
    loadCategories();
    
    // Restore coverage values from localStorage if available
    try {
      const savedCoverage = localStorage.getItem('roofingMaterialsCoverage');
      if (savedCoverage) {
        setMaterialsWithCoverage(JSON.parse(savedCoverage));
      }
    } catch (error) {
      console.error('Failed to restore coverage values from localStorage:', error);
    }
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await EstimatingAIService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
      // Fallback to default category
      setCategories([{ id: 'materials', label: 'Material Estimation', icon: '🏗️' }]);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterialsForSubcategory = async (category: string, subcategory: string) => {
    try {
      setLoading(true);
      setCurrentCategory(category);
      setCurrentSubcategory(subcategory);
      
      const [materialsData, stepConfig] = await Promise.all([
        EstimatingAIService.getMaterialsBySubcategory(category, subcategory),
        EstimatingAIService.getStepConfig(category, subcategory)
      ]);
      
      const transformedMaterials = EstimatingAIService.transformMaterialsForDisplay(materialsData);
      setCurrentMaterials(transformedMaterials);
      setCurrentStepConfig(stepConfig);
    } catch (err) {
      setError(`Failed to load ${subcategory} materials`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClick = () => {
    setIsStarted(true);
    setBreadcrumb(['Material Estimation']);
  };

  // These will be loaded dynamically from Supabase
  const [materials, setMaterials] = useState<CategoryType[]>([]);
  const [roofingMaterials, setRoofingMaterials] = useState<CategoryType[]>([]);
  const [flashingMaterials, setFlashingMaterials] = useState<CategoryType[]>([]);
  const [copingMaterials, setCopingMaterials] = useState<CategoryType[]>([]);
  
  // Load subcategories for each main category
  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        // Load subcategories for roofing, flashing, and coping
        const [roofingSubcategories, flashingSubcategories, copingSubcategories] = await Promise.all([
          EstimatingAIService.getSubcategories('roofing'),
          EstimatingAIService.getSubcategories('flashing'),
          EstimatingAIService.getSubcategories('coping')
        ]);
        
        setRoofingMaterials(roofingSubcategories);
        setFlashingMaterials(flashingSubcategories);
        setCopingMaterials(copingSubcategories);
        
        // Set main categories
        setMaterials([
          { id: 'roofing', label: 'Roofing', icon: '🏠' },
          { id: 'flashing', label: 'Flashing', icon: '⚡' },
          { id: 'coping', label: 'Coping', icon: '🔲' },
        ]);
      } catch (err) {
        setError('Failed to load subcategories');
        console.error(err);
      }
    };
    
    loadSubcategories();
  }, []);
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'materials') {
      setShowWelcomeScreen(true);
      setBreadcrumb(['Material Estimation', 'Step 1: Welcome']);
    }
  };

  const handleLetsStartClick = async () => {
    setShowWelcomeScreen(false);
    setShowInsulationDetails(true);
    setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Insulation Types']);
    
    // Load insulation data dynamically
    await loadMaterialsForSubcategory('roofing', 'insulation');
  };

  const handleFlashingStartClick = async () => {
    setShowFlashingWelcomeScreen(false);
    setShowChimneyFlashingDetails(true);
    setBreadcrumb(['Material Estimation', 'Step 2: Flashing Materials', 'Chimney Flashing Types']);
    
    // Load chimney flashing data dynamically
    await loadMaterialsForSubcategory('flashing', 'chimney-flashing');
  };

  const handleCopingStartClick = async () => {
    setShowCopingWelcomeScreen(false);
    setShowMetalCopingDetails(true);
    setBreadcrumb(['Material Estimation', 'Step 3: Coping Materials', 'Metal Coping Types']);
    
    // Load metal coping data dynamically
    await loadMaterialsForSubcategory('coping', 'metal-coping');
  };

  const handleMaterialSelect = (materialId: string) => {
    if (materialId === 'roofing') {
      setShowMaterialCategories(false);
      setShowRoofingMaterials(true);
      setShowFlashingMaterials(false);
      setShowCopingMaterials(false);
      setBreadcrumb(['Material Estimation', 'Roofing Materials']);
    } else if (materialId === 'flashing') {
      setShowMaterialCategories(false);
      setShowFlashingMaterials(true);
      setShowRoofingMaterials(false);
      setShowCopingMaterials(false);
      setBreadcrumb(['Material Estimation', 'Flashing Materials']);
    } else if (materialId === 'coping') {
      setShowMaterialCategories(false);
      setShowCopingMaterials(true);
      setShowRoofingMaterials(false);
      setShowFlashingMaterials(false);
      setBreadcrumb(['Material Estimation', 'Coping Materials']);
    } else {
      console.log(`Selected material: ${materialId}`);
      setShowMaterialCategories(false);
      // Add your material selection logic here
    }
  };

  const handleRoofingMaterialSelect = (materialId: string) => {
    const selectedMaterial = roofingMaterials.find(m => m.id === materialId);
    if (selectedMaterial) {
      setBreadcrumb(['Material Estimation', 'Roofing Materials', selectedMaterial.label]);
    }
    
    if (materialId === 'insulation') {
      setShowRoofingMaterials(false);
      setShowInsulationDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Insulation Types']);
    } else if (materialId === 'coverboard') {
      setShowRoofingMaterials(false);
      setShowCoverboardDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coverboard Types']);
    } else if (materialId === 'base-layers') {
      setShowRoofingMaterials(false);
      setShowBaseLayersDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Base Layers Types']);
    } else if (materialId === 'bonding-agent') {
      setShowRoofingMaterials(false);
      setShowBondingAgentDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Bonding Agent Types']);
    } else if (materialId === 'membrane') {
      setShowRoofingMaterials(false);
      setShowMembraneDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Membrane Types']);
    } else if (materialId === 'coating') {
      setShowRoofingMaterials(false);
      setShowCoatingDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coating Types']);
    } else {
      console.log(`Selected roofing material: ${materialId}`);
      // Add your roofing material selection logic here
    }
  };

  const handleFlashingMaterialSelect = (materialId: string) => {
    const selectedMaterial = flashingMaterials.find(m => m.id === materialId);
    if (selectedMaterial) {
      setBreadcrumb(['Material Estimation', 'Flashing Materials', selectedMaterial.label]);
    }
    console.log(`Selected flashing material: ${materialId}`);
    // Add your flashing material selection logic here
  };

  const handleCopingMaterialSelect = (materialId: string) => {
    const selectedMaterial = copingMaterials.find(m => m.id === materialId);
    if (selectedMaterial) {
      setBreadcrumb(['Material Estimation', 'Coping Materials', selectedMaterial.label]);
    }
    console.log(`Selected coping material: ${materialId}`);
    // Add your coping material selection logic here
  };

  const handleBackClick = async () => {
    if (showInsulationDetails) {
      // Go back to welcome screen
      setShowInsulationDetails(false);
      setShowWelcomeScreen(true);
      setBreadcrumb(['Material Estimation', 'Step 1: Welcome']);
    } else if (showWelcomeScreen) {
      // Go back to start
      setShowWelcomeScreen(false);
      setIsStarted(false);
      setBreadcrumb([]);
    } else if (showCoverboardDetails) {
      // Go back to Insulation
      setShowCoverboardDetails(false);
      setShowInsulationDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Insulation Types']);
      // Reload insulation data
      await loadMaterialsForSubcategory('roofing', 'insulation');
    } else if (showBaseLayersDetails) {
      // Go back to Coverboard
      setShowBaseLayersDetails(false);
      setShowCoverboardDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coverboard Types']);
      // Reload coverboard data
      await loadMaterialsForSubcategory('roofing', 'coverboard');
    } else if (showBondingAgentDetails) {
      // Go back to Base Layers
      setShowBondingAgentDetails(false);
      setShowBaseLayersDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Base Layers Types']);
      // Reload base layers data
      await loadMaterialsForSubcategory('roofing', 'base-layers');
    } else if (showMembraneDetails) {
      // Go back to Bonding Agent
      setShowMembraneDetails(false);
      setShowBondingAgentDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Bonding Agent Types']);
      // Reload bonding agent data
      await loadMaterialsForSubcategory('roofing', 'bonding-agent');
    } else if (showCoatingDetails) {
      // Go back to Membrane
      setShowCoatingDetails(false);
      setShowMembraneDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Membrane Types']);
      // Reload membrane data
      await loadMaterialsForSubcategory('roofing', 'membrane');
    } else if (showChimneyFlashingDetails) {
      // Go back to Coating (last roofing material)
      setShowChimneyFlashingDetails(false);
      setShowCoatingDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coating Types']);
      // Reload coating data
      await loadMaterialsForSubcategory('roofing', 'coating');
    } else if (showVentFlashingDetails) {
      // Go back to Chimney Flashing
      setShowVentFlashingDetails(false);
      setShowChimneyFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Chimney Flashing Types']);
      // Reload chimney flashing data
      await loadMaterialsForSubcategory('flashing', 'chimney-flashing');
    } else if (showDripEdgeDetails) {
      // Go back to Vent Flashing
      setShowDripEdgeDetails(false);
      setShowVentFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Vent Flashing Types']);
      // Reload vent flashing data
      await loadMaterialsForSubcategory('flashing', 'vent-flashing');
    } else if (showCounterFlashingDetails) {
      // Go back to Drip Edge
      setShowCounterFlashingDetails(false);
      setShowDripEdgeDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Drip Edge Types']);
      // Reload drip edge data
      await loadMaterialsForSubcategory('flashing', 'drip-edge');
    } else if (showMetalCopingDetails) {
      // Go back to Counter Flashing (last flashing material)
      setShowMetalCopingDetails(false);
      setShowCounterFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Counter Flashing Types']);
      // Reload counter flashing data
      await loadMaterialsForSubcategory('flashing', 'counter-flashing');
    } else if (showPrecasterCopingDetails) {
      // Go back to Metal Coping
      setShowPrecasterCopingDetails(false);
      setShowMetalCopingDetails(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials', 'Metal Coping Types']);
      // Reload metal coping data
      await loadMaterialsForSubcategory('coping', 'metal-coping');
    } else if (showStoneCopingDetails) {
      // Go back to Precast Coping
      setShowStoneCopingDetails(false);
      setShowPrecasterCopingDetails(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials', 'Precast Coping Types']);
      // Reload precast coping data
      await loadMaterialsForSubcategory('coping', 'precast-coping');
    } else if (showCopingMaterials) {
      // Go back to flashing materials
      setShowCopingMaterials(false);
      setShowFlashingMaterials(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials']);
    } else if (showFlashingMaterials) {
      // Go back to roofing materials
      setShowFlashingMaterials(false);
      setShowRoofingMaterials(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials']);
    } else if (showRoofingMaterials) {
      // Go back to start
      setShowRoofingMaterials(false);
      setIsStarted(false);
      setBreadcrumb([]);
    } else if (showMaterialCategories) {
      // Go back to main category
      setShowMaterialCategories(false);
      setBreadcrumb(['Material Estimation']);
    } else if (isStarted) {
      // Go back to start screen
      setIsStarted(false);
      setBreadcrumb([]);
    }
  };

  const handleImageClick = (src: string, alt: string) => {
    setSelectedImage({ src, alt });
    setShowImageModal(true);
  };

  // Function to save coverage values to localStorage
  const saveCoverageToLocalStorage = (coverage: {[key: string]: number | null}) => {
    try {
      localStorage.setItem('roofingMaterialsCoverage', JSON.stringify(coverage));
    } catch (error) {
      console.error('Failed to save coverage values to localStorage:', error);
    }
  };
  
  // Handler for managing selected materials across all steps
  const handleMaterialItemSelect = (itemId: string, itemName: string) => {
    // Get current material details
    const selectedMaterial = currentMaterials.find(material => material.id === itemId);
    if (!selectedMaterial) return;
    
    // Check if this material is already selected
    const isAlreadySelected = selectedMaterials.some(item => item.id === itemId);
    
    if (isAlreadySelected) {
      // Remove from selected items
      setSelectedMaterials(selectedMaterials.filter(item => item.id !== itemId));
      console.log(`Removed material: ${itemName}`);
      
      // Note: We intentionally DO NOT remove coverage values when an item is deselected
      // This ensures coverage values persist even if items are toggled on/off
    } else {
      // Create a user-friendly type label based on category and subcategory
      let typeLabel = '';
      
      // Map subcategories to user-friendly names
      const subcategoryLabels: {[key: string]: string} = {
        'insulation': 'Insulation',
        'coverboard': 'Coverboard',
        'base-layers': 'Base Layer',
        'bonding-agent': 'Bonding Agent',
        'membrane': 'Membrane',
        'coating': 'Coating',
        'chimney-flashing': 'Chimney Flashing',
        'vent-flashing': 'Vent Flashing',
        'drip-edge': 'Drip Edge',
        'counter-flashing': 'Counter Flashing',
        'metal-coping': 'Metal Coping',
        'precast-coping': 'Precast Coping',
        'stone-coping': 'Stone Coping'
      };
      
      // Create type label in format "Material Name - Category"
      typeLabel = subcategoryLabels[currentSubcategory] || currentSubcategory;
      
      // Add to selected items
      setSelectedMaterials([
        ...selectedMaterials, 
        { 
          id: itemId, 
          name: itemName, 
          category: currentCategory, 
          subcategory: currentSubcategory,
          type: typeLabel
        }
      ]);
      
      // Send webhook for analytics
      sendToWebhook({
        action: 'material_selected',
        material_id: itemId,
        material_name: itemName,
        category: currentCategory,
        subcategory: currentSubcategory,
        type: typeLabel
      }).catch(error => {
        console.error('Failed to track material selection:', error);
      });
      
      // Save current coverage values to localStorage to ensure persistence
      // This ensures coverage values are maintained even when navigating between steps
      saveCoverageToLocalStorage(materialsWithCoverage);
    }
  };

  const handleNextRoofingMaterial = async () => {
    if (showInsulationDetails) {
      // Move to Coverboard
      setShowInsulationDetails(false);
      setShowCoverboardDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coverboard Types']);
      await loadMaterialsForSubcategory('roofing', 'coverboard');
    } else if (showCoverboardDetails) {
      // Move to Base Layers
      setShowCoverboardDetails(false);
      setShowBaseLayersDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Base Layers Types']);
      await loadMaterialsForSubcategory('roofing', 'base-layers');
    } else if (showBaseLayersDetails) {
      // Move to Bonding Agent
      setShowBaseLayersDetails(false);
      setShowBondingAgentDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Bonding Agent Types']);
      await loadMaterialsForSubcategory('roofing', 'bonding-agent');
    } else if (showBondingAgentDetails) {
      // Move to Membrane
      setShowBondingAgentDetails(false);
      setShowMembraneDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Membrane Types']);
      await loadMaterialsForSubcategory('roofing', 'membrane');
    } else if (showMembraneDetails) {
      // Move to Coating
      setShowMembraneDetails(false);
      setShowCoatingDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coating Types']);
      await loadMaterialsForSubcategory('roofing', 'coating');
    } else if (showCoatingDetails) {
      // Move to Flashing Welcome Screen (Step 2)
      setShowCoatingDetails(false);
      setShowFlashingWelcomeScreen(true);
      setBreadcrumb(['Material Estimation', 'Step 2: Flashing Materials']);
    }
  };

  const handleNextFlashingMaterial = async () => {
    if (showChimneyFlashingDetails) {
      // Move to Vent Flashing
      setShowChimneyFlashingDetails(false);
      setShowVentFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Vent Flashing Types']);
      await loadMaterialsForSubcategory('flashing', 'vent-flashing');
    } else if (showVentFlashingDetails) {
      // Move to Drip Edge
      setShowVentFlashingDetails(false);
      setShowDripEdgeDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Drip Edge Types']);
      await loadMaterialsForSubcategory('flashing', 'drip-edge');
    } else if (showDripEdgeDetails) {
      // Move to Counter Flashing
      setShowDripEdgeDetails(false);
      setShowCounterFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Counter Flashing Types']);
      await loadMaterialsForSubcategory('flashing', 'counter-flashing');
    } else if (showCounterFlashingDetails) {
      // Move to Coping Welcome Screen (Step 3)
      setShowCounterFlashingDetails(false);
      setShowCopingWelcomeScreen(true);
      setBreadcrumb(['Material Estimation', 'Step 3: Coping Materials']);
    }
  };

  const handleNextCopingMaterial = async () => {
    if (showMetalCopingDetails) {
      // Move to Precast Coping
      setShowMetalCopingDetails(false);
      setShowPrecasterCopingDetails(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials', 'Precast Coping Types']);
      await loadMaterialsForSubcategory('coping', 'precast-coping');
    } else if (showPrecasterCopingDetails) {
      // Move to Stone Coping
      setShowPrecasterCopingDetails(false);
      setShowStoneCopingDetails(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials', 'Stone Coping Types']);
      await loadMaterialsForSubcategory('coping', 'stone-coping');
    } else if (showStoneCopingDetails) {
      // Complete all materials
      setShowStoneCopingDetails(false);
      setIsStarted(false);
      setBreadcrumb([]);
      // Optionally show completion message or redirect
    }
  };

  const handleNextSection = () => {
    if (showFlashingMaterials) {
      // Move from Flashing to Coping
      setShowFlashingMaterials(false);
      setShowCopingMaterials(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials']);
    } else if (showCopingMaterials) {
      // Completed all sections - could show summary or completion
      console.log('All sections completed!');
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Event listener for image clicks from MaterialDetailsScreen
  useEffect(() => {
    const handleMaterialImageClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { src, alt } = customEvent.detail;
        setSelectedImage({ src, alt });
        setShowImageModal(true);
      }
    };
    
    window.addEventListener('materialImageClick', handleMaterialImageClick);
    
    return () => {
      window.removeEventListener('materialImageClick', handleMaterialImageClick);
    };
  }, []);

  // Selected Materials Sidebar Component
  const SelectedMaterialsSidebar: React.FC = () => {
    // State for submission loading status
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Handle coverage button click to show input field
    const handleCoverageButtonClick = (materialId: string) => {
      setEditingCoverage(materialId);
    };
    
    // Handle coverage input change
    const handleCoverageChange = (materialId: string, value: string) => {
      const numValue = value === '' ? null : parseFloat(value);
      const updatedCoverage = {
        ...materialsWithCoverage,
        [materialId]: numValue
      };
      
      // Update state
      setMaterialsWithCoverage(updatedCoverage);
      
      // Persist to localStorage
      try {
        localStorage.setItem('roofingMaterialsCoverage', JSON.stringify(updatedCoverage));
      } catch (error) {
        console.error('Failed to save coverage values to localStorage:', error);
      }
    };
    
    // Handle coverage input blur (when user clicks away)
    const handleCoverageBlur = (materialId: string) => {
      setEditingCoverage(null);
      
      // Sync with database via webhook
      if (materialsWithCoverage[materialId] !== undefined) {
        sendToWebhook({
          action: 'update_coverage',
          material_id: materialId,
          coverage_number: materialsWithCoverage[materialId]
        }).catch(error => {
          console.error('Failed to update coverage number:', error);
        });
      }
    };

    const handleRoofingSubmit = async () => {
      setIsSubmitting(true);
      // Filter roofing items that have coverage values
      const roofingItems = selectedMaterials.filter(item => item.category === 'roofing');
      const itemsWithCoverage = roofingItems.filter(item => {
        const coverage = materialsWithCoverage[item.id];
        return coverage !== undefined && coverage !== null;
      });
      
      // Only proceed if there are items with coverage
      if (itemsWithCoverage.length === 0) {
        alert('Please add coverage values to at least one material before submitting.');
        setIsSubmitting(false);
        return;
      }
      
      // Create a simplified payload with only necessary information
      const finalPayload = {
        total_items_with_coverage: itemsWithCoverage.length,
        items: itemsWithCoverage.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          coverage: materialsWithCoverage[item.id]
        }))
      };
      
      // Save the current state of coverage values before submission
      saveCoverageToLocalStorage(materialsWithCoverage);
    
      try {
        // Only send data when Total button is clicked
        await sendToWebhook({
          action: 'submit_roofing_estimate',
          coverage_count: itemsWithCoverage.length,
          estimate: finalPayload
        });
        alert(`Roofing estimate with ${itemsWithCoverage.length} items submitted successfully!`);
      } catch (error) {
        console.error('Failed to submit roofing estimate:', error);
        alert('An error occurred while submitting the roofing estimate. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };
    
    return (
      <div className="selected-items-sidebar">
        <div className="selected-items-container">
          <h3>Selected Materials</h3>
          {selectedMaterials.length === 0 ? (
            <div className="no-items-message">No materials selected yet</div>
          ) : (
            <div className="selected-items-list">
              {selectedMaterials.map((item) => (
                <div key={item.id} className="selected-item">
                  <div className="selected-item-name">
                  {item.name}
                    <div className="selected-item-type">{item.type}</div>
                  </div>
                    {editingCoverage === item.id ? (
                      <input 
                        type="number" 
                        className="coverage-input"
                        value={materialsWithCoverage[item.id] === null ? '' : materialsWithCoverage[item.id] || ''}
                        onChange={(e) => handleCoverageChange(item.id, e.target.value)}
                        onBlur={() => handleCoverageBlur(item.id)}
                        autoFocus
                        placeholder="Enter coverage"
                      />
                    ) : (
                      <button 
                        className="coverage-button"
                        onClick={() => handleCoverageButtonClick(item.id)}
                        title="Add coverage number"
                      >
                        {materialsWithCoverage[item.id] !== undefined && materialsWithCoverage[item.id] !== null 
                          ? materialsWithCoverage[item.id] 
                          : 'Add Coverage'}
                      </button>
                    )}
                  <button
                    className="remove-item-button"
                    onClick={() => handleMaterialItemSelect(item.id, item.name)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="sidebar-actions">
            <button className="action-button">
              <label>List of Roofing Materials Total Estimate</label>
            </button>
            <button 
              className="total-button" 
              onClick={handleRoofingSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Total'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="estimating-ai-container">
      <div className="material-details-screen-container">
        <div className="material-details-main">
          <div className="estimating-ai-header">
            <h2>Estimating AI Assistant</h2>
            <Breadcrumb items={breadcrumb} />
          </div>
          <div className="estimating-ai-messages">
        {/* Loading state */}
        {loading && <LoadingState />}
        
        {/* Error state */}
        <ErrorState message={error} onDismiss={() => setError(null)} />
        
        {!isStarted ? (
          <StartScreen 
            onStart={handleStartClick}
            subtitle="Click to begin your roofing estimation"
          />
        ) : showWelcomeScreen ? (
          <WelcomeScreen 
            onStart={handleLetsStartClick}
            introMessage="🏗️ <strong>Step 1: Roofing Materials</strong><br/>Perfect! Let's start with your roofing system. I'll guide you through each component step-by-step. First, let's explore the roofing materials – these form the core of your roof structure."
            buttonText="Let's Start"
          />
        ) : showFlashingWelcomeScreen ? (
          <WelcomeScreen 
            onStart={handleFlashingStartClick}
            introMessage="⚡ <strong>Step 2: Flashing Materials</strong><br/>Great job reaching Step 2! Ready to explore the right flashing materials for your roofing system? These critical components prevent water infiltration at roof penetrations and transitions."
            buttonText="Continue to Flashing Materials"
          />
        ) : showCopingWelcomeScreen ? (
          <WelcomeScreen 
            onStart={handleCopingStartClick}
            introMessage="🏘 <strong>Step 3: Coping Materials</strong><br/>You're doing great! Step 3 is all about choosing the best coping materials for your project. These components cap and protect your roof edges, providing the finishing touch to your roofing system."
            buttonText="Continue to Coping Materials"
          />
        ) : showInsulationDetails ? (
          <MaterialDetailsScreen 
            title="Insulation Types"
            subtitle={currentStepConfig?.subtitle || "Let's begin with insulation - the foundation of energy efficiency. Here are the main types of roofing insulation:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Coverboard →"}
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore coverboard materials for structural support"}
            showIntroMessage={true}              
           />
        ) : showCoverboardDetails ? (
          <MaterialDetailsScreen 
            title="Coverboard Types"
            subtitle={currentStepConfig?.subtitle || "Great! Now let's look at coverboard options - these provide a solid substrate for your membrane. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Base Layers →"}
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore base layer materials for your roofing foundation"}
            showIntroMessage={false}
            introMessage=""
          />
        ) : showBaseLayersDetails ? (
          <MaterialDetailsScreen 
            title="Base Layers Types"
            subtitle={currentStepConfig?.subtitle || "Excellent! Now let's look at base layer materials - these provide the foundation for multi-ply roofing systems. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Bonding Agent →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore bonding agents for secure material adhesion"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showBondingAgentDetails ? (
          <MaterialDetailsScreen 
            title="Bonding Agent Types"
            subtitle={currentStepConfig?.subtitle || "Perfect! Now let's explore bonding agents - these ensure secure adhesion between roofing layers. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Membrane →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore membrane materials for waterproofing"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showMembraneDetails ? (
          <MaterialDetailsScreen 
            title="Membrane Types"
            subtitle={currentStepConfig?.subtitle || "Outstanding! Now let's look at membrane materials - the heart of your waterproofing system. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Coating →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore coating materials for protection and longevity"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showCoatingDetails ? (
          <MaterialDetailsScreen 
            title="Coating Types"
            subtitle={currentStepConfig?.subtitle || "Fantastic! Finally, let's explore coating materials - these provide the final protective layer. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "End of Roofing Material →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll move on to flashing materials for weatherproofing"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showChimneyFlashingDetails ? (
          <MaterialDetailsScreen 
            title="Chimney Flashing Types"
            subtitle={currentStepConfig?.subtitle || "Excellent! Now let's explore chimney flashing - these protect roof-wall intersections around chimneys. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextFlashingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Vent Flashing →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore vent flashing for pipe penetrations"}
            showIntroMessage={true}
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showVentFlashingDetails ? (
          <MaterialDetailsScreen 
            title="Vent Flashing Types"
            subtitle={currentStepConfig?.subtitle || "Perfect! Now let's look at vent flashing - these seal around pipe and vent penetrations. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextFlashingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Drip Edge →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore drip edge for roof edge protection"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showDripEdgeDetails ? (
          <MaterialDetailsScreen 
            title="Drip Edge Types"
            subtitle={currentStepConfig?.subtitle || "Great! Now let's explore drip edge materials - these direct water away from roof edges. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextFlashingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Counter Flashing →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore counter flashing for wall intersections"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showCounterFlashingDetails ? (
          <MaterialDetailsScreen 
            title="Counter Flashing Types"
            subtitle={currentStepConfig?.subtitle || "Excellent! Finally, let's look at counter flashing - these provide secondary protection at wall intersections. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextFlashingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Complete Flashing - Continue to Coping →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll move on to coping materials for roof edge finishing"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showMetalCopingDetails ? (
          <MaterialDetailsScreen 
            title="Metal Coping Types"
            subtitle={currentStepConfig?.subtitle || "Perfect! Now let's explore metal coping - these provide durable, weather-resistant roof edge protection. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextCopingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Precast Coping →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore precast coping for architectural appeal"}
            showIntroMessage={true}
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
            />
        ) : showPrecasterCopingDetails ? (
          <MaterialDetailsScreen 
            title="Precast Coping Types"
            subtitle={currentStepConfig?.subtitle || "Excellent! Now let's look at precast coping - these combine durability with architectural beauty. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextCopingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Stone Coping →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore stone coping for premium finishes"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showStoneCopingDetails ? (
          <MaterialDetailsScreen 
            title="Stone Coping Types"
            subtitle={currentStepConfig?.subtitle || "Outstanding! Finally, let's explore stone coping - the premium choice for timeless elegance. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextCopingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "✅ Complete All Materials"}
            progressText={currentStepConfig?.progress_text || "Congratulations! You've explored all roofing material categories"}
            showIntroMessage={false}
            introMessage=""
            onItemSelect={handleMaterialItemSelect}
            selectedMaterialIds={selectedMaterials.map(item => item.id)}
          />
        ) : showRoofingMaterials ? (
          <MaterialCategoryScreen
            title="🏗️ Step 1: Roofing Materials"
            subtitle="Perfect! Let's start with your roofing system. I'll guide you through each component step-by-step. First, let's explore the roofing materials - these form the core of your roof structure:"
            materials={roofingMaterials}
            onBack={handleBackClick}
            onMaterialSelect={handleRoofingMaterialSelect}
            onNext={handleNextSection}
            nextButtonText="Continue to Flashing Materials →"
            progressText="Next: We'll explore flashing materials to seal roof penetrations"
            buttonClassName="roofing-material-button"
          />
        ) : showFlashingMaterials ? (
          <MaterialCategoryScreen
            title="⚡ Step 2: Flashing Materials"
            subtitle="Excellent progress! Now let's focus on flashing materials. These are crucial for waterproofing around roof penetrations, edges, and transitions. I'll help you choose the right flashing solutions:"
            materials={flashingMaterials}
            onBack={handleBackClick}
            onMaterialSelect={handleFlashingMaterialSelect}
            onNext={handleNextSection}
            nextButtonText="Continue to Coping Materials →"
            progressText="Next: We'll explore coping materials to cap and protect roof edges"
            buttonClassName="flashing-material-button"
          />
        ) : showCopingMaterials ? (
          <MaterialCategoryScreen
            title="🏢 Step 3: Coping Materials"
            subtitle="Great work! We're now at the final step - coping materials. These cap and protect your roof edges, providing the finishing touch to your roofing system. Let me help you select the perfect coping solution:"
            materials={copingMaterials}
            onBack={handleBackClick}
            onMaterialSelect={handleCopingMaterialSelect}
            onNext={handleNextSection}
            nextButtonText="✅ Complete Material Estimation"
            progressText="Congratulations! You've explored all roofing material categories"
            buttonClassName="coping-material-button"
          />
        ) : showMaterialCategories ? (
          <MaterialCategoryScreen
            title="Material Categories"
            subtitle="Which material would you like me to assist you with so I can help you?"
            materials={materials}
            onBack={handleBackClick}
            onMaterialSelect={handleMaterialSelect}
            buttonClassName="material-category-button"
          />
        ) : (
          <div className="categories-screen">
            <div className="ai-greeting">
              <p>Hello! I'm your AI roofing assistant. What would you like help with today?</p>
            </div>
            <div className="categories-grid">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="category-button"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
          </div>
        </div>
        {/* Selected Materials Sidebar - only shown when materials are selected */}
        {isStarted && selectedMaterials.length > 0 && <SelectedMaterialsSidebar />}
      </div>
      {/* Image Modal */}
      <ImageModal 
        image={selectedImage}
        onClose={closeImageModal}
        isOpen={showImageModal}
      />
    </div>
  );
};
export default EstimatingAIAssistant;

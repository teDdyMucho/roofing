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
  CategoryType
} from './MaterialDetailsScreen';
import './EstimatingAIAssistant.css';

const EstimatingAIAssistant: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
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

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
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

  const handleBackClick = () => {
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
    } else if (showBaseLayersDetails) {
      // Go back to Coverboard
      setShowBaseLayersDetails(false);
      setShowCoverboardDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coverboard Types']);
    } else if (showBondingAgentDetails) {
      // Go back to Base Layers
      setShowBondingAgentDetails(false);
      setShowBaseLayersDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Base Layers Types']);
    } else if (showMembraneDetails) {
      // Go back to Bonding Agent
      setShowMembraneDetails(false);
      setShowBondingAgentDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Bonding Agent Types']);
    } else if (showCoatingDetails) {
      // Go back to Membrane
      setShowCoatingDetails(false);
      setShowMembraneDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Membrane Types']);
    } else if (showChimneyFlashingDetails) {
      // Go back to Coating (last roofing material)
      setShowChimneyFlashingDetails(false);
      setShowCoatingDetails(true);
      setBreadcrumb(['Material Estimation', 'Roofing Materials', 'Coating Types']);
    } else if (showVentFlashingDetails) {
      // Go back to Chimney Flashing
      setShowVentFlashingDetails(false);
      setShowChimneyFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Chimney Flashing Types']);
    } else if (showDripEdgeDetails) {
      // Go back to Vent Flashing
      setShowDripEdgeDetails(false);
      setShowVentFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Vent Flashing Types']);
    } else if (showCounterFlashingDetails) {
      // Go back to Drip Edge
      setShowCounterFlashingDetails(false);
      setShowDripEdgeDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Drip Edge Types']);
    } else if (showMetalCopingDetails) {
      // Go back to Counter Flashing (last flashing material)
      setShowMetalCopingDetails(false);
      setShowCounterFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Counter Flashing Types']);
    } else if (showPrecasterCopingDetails) {
      // Go back to Metal Coping
      setShowPrecasterCopingDetails(false);
      setShowMetalCopingDetails(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials', 'Metal Coping Types']);
    } else if (showStoneCopingDetails) {
      // Go back to Precast Coping
      setShowStoneCopingDetails(false);
      setShowPrecasterCopingDetails(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials', 'Precast Coping Types']);
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

  // This function is now handled implicitly by the MaterialCategoryScreen component
  // which shows the back button automatically

  // This function is now handled via the event listener for MaterialDetailsScreen
  // but we keep it for other components that might need it directly
  const handleImageClick = (src: string, alt: string) => {
    setSelectedImage({src, alt});
    setShowImageModal(true);
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
      // Move to Flashing (Step 2)
      setShowCoatingDetails(false);
      setShowChimneyFlashingDetails(true);
      setBreadcrumb(['Material Estimation', 'Flashing Materials', 'Chimney Flashing Types']);
      await loadMaterialsForSubcategory('flashing', 'chimney-flashing');
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
      // Move to Coping (Step 3)
      setShowCounterFlashingDetails(false);
      setShowMetalCopingDetails(true);
      setBreadcrumb(['Material Estimation', 'Coping Materials', 'Metal Coping Types']);
      await loadMaterialsForSubcategory('coping', 'metal-coping');
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



  return (
    <div className="estimating-ai-container">
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
        ) : showInsulationDetails ? (
          <MaterialDetailsScreen 
            title="Insulation Types"
            subtitle={currentStepConfig?.subtitle || "Let's begin with insulation - the foundation of energy efficiency. Here are the main types of roofing insulation:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Coverboard →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll explore coverboard materials for structural support"}
            showIntroMessage={true}              
           />
        ) : showCoverboardDetails ? (
          <MaterialDetailsScreen 
            title="Coverboard Types"
            subtitle={currentStepConfig?.subtitle || "Great progress! Now let's explore coverboard materials - these provide structural support and protection. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Continue to Base Layers →"}
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
          />
        ) : showCoatingDetails ? (
          <MaterialDetailsScreen 
            title="Coating Types"
            subtitle={currentStepConfig?.subtitle || "Fantastic! Finally, let's explore coating materials - these provide the final protective layer. Here are the main types:"}
            materials={currentMaterials}
            onBack={handleBackClick}
            onNext={handleNextRoofingMaterial}
            nextButtonText={currentStepConfig?.next_button_text || "Complete Roofing - Continue to Flashing →"}
            progressText={currentStepConfig?.progress_text || "Next: We'll move on to flashing materials for weatherproofing"}
            showIntroMessage={false}
            introMessage=""
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
            introMessage={currentStepConfig?.intro_message || "🔥 Step 2: Flashing Materials - Great progress! Now we're moving to flashing materials. These critical components prevent water infiltration at roof penetrations and transitions. Let me guide you through each flashing type."}
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
            introMessage={currentStepConfig?.intro_message || "🏢 Step 3: Coping Materials - Great work! We're now at the final step - coping materials. These cap and protect your roof edges, providing the finishing touch to your roofing system. Let me help you select the perfect coping solution."}
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

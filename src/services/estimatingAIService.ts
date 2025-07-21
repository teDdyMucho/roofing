import { supabase } from '../lib/supabase';

// Types for our data structure
export interface EstimatingAIData {
  id: string;
  category: string;
  subcategory: string;
  step_number: number;
  sub_step_number: number;
  material_id: string;
  name: string;
  description: string;
  image_url?: string;
  icon?: string;
  features?: string[];
  brands?: string[];
  examples?: string[];
  subtitle?: string;
  intro_message?: string;
  next_button_text?: string;
  progress_text?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Material type for UI components (transformed from EstimatingAIData)
export interface MaterialType {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  brands?: string[];
  examples?: string[];
}

// Category/Subcategory type for navigation
export interface CategoryType {
  id: string;
  label: string;
  icon: string;
}

export class EstimatingAIService {
  // Fetch all materials for a specific category and subcategory
  static async getMaterialsBySubcategory(category: string, subcategory: string): Promise<EstimatingAIData[]> {
    try {
      const { data, error } = await supabase
        .from('estimating_ai')
        .select('*')
        .eq('category', category)
        .eq('subcategory', subcategory)
        .eq('is_active', true)
        .order('sub_step_number', { ascending: true });

      if (error) {
        console.error('Error fetching materials:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Service error fetching materials:', error);
      throw error;
    }
  }

  // Fetch step configuration (intro messages, etc.) for a specific subcategory
  static async getStepConfig(category: string, subcategory: string): Promise<EstimatingAIData | null> {
    try {
      const { data, error } = await supabase
        .from('estimating_ai')
        .select('*')
        .eq('category', category)
        .eq('subcategory', subcategory)
        .eq('is_active', true)
        .not('subtitle', 'is', null)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching step config:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Service error fetching step config:', error);
      return null;
    }
  }

  // Fetch all main categories
  static async getCategories(): Promise<CategoryType[]> {
    try {
      const { data, error } = await supabase
        .from('estimating_ai')
        .select('category, icon')
        .eq('is_active', true)
        .eq('step_number', 1)
        .limit(1);

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Transform to match existing format
      return data?.map(item => ({
        id: item.category,
        label: item.category === 'materials' ? 'Material Estimation' : 
               item.category.charAt(0).toUpperCase() + item.category.slice(1),
        icon: item.icon || '🏗️'
      })) || [{ id: 'materials', label: 'Material Estimation', icon: '🏗️' }];
    } catch (error) {
      console.error('Service error fetching categories:', error);
      // Return default category if database fails
      return [{ id: 'materials', label: 'Material Estimation', icon: '🏗️' }];
    }
  }

  // Fetch subcategories for a specific category
  static async getSubcategories(category: string): Promise<CategoryType[]> {
    try {
      if (!category) {
        console.warn('getSubcategories called with empty category');
        return [];
      }

      const { data, error } = await supabase
        .from('estimating_ai')
        .select('subcategory, icon')
        .eq('category', category)
        .eq('is_active', true)
      if (error) {
        console.error('Error fetching subcategories:', error);
        // Log the error but don't throw it - return empty array instead
        return [];
      }

      if (!data || data.length === 0) {
        console.warn(`No subcategories found for category: ${category}`);
        return [];
      }

      // Remove duplicates and transform
      const unique = data.filter((item, index, self) => 
        index === self.findIndex(t => t.subcategory === item.subcategory)
      );

      return unique.map(item => ({
        id: item.subcategory || '',
        label: item.subcategory ? 
               item.subcategory.charAt(0).toUpperCase() + 
               item.subcategory.slice(1).replace(/-/g, ' ') : 
               'Unknown',
        icon: item.icon || '🏠'
      }));
    } catch (error) {
      console.error('Service error fetching subcategories:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Transform EstimatingAIData to MaterialType for UI components
  static transformMaterialsForDisplay(materials: EstimatingAIData[]): MaterialType[] {
    return materials.map(material => ({
      id: material.material_id,
      name: material.name,
      description: material.description,
      image: material.image_url || '',
      features: material.features || [],
      brands: material.brands || [],
      examples: material.examples || []
    }));
  }

  // Get the sequential flow order for roofing materials
  static getRoofingSequence(): string[] {
    return ['insulation', 'coverboard', 'base-layers', 'bonding-agent', 'membrane', 'coating'];
  }

  // Get the sequential flow order for flashing materials
  static getFlashingSequence(): string[] {
    return ['chimney-flashing', 'vent-flashing', 'drip-edge', 'counter-flashing'];
  }

  // Get the sequential flow order for coping materials
  static getCopingSequence(): string[] {
    return ['metal-coping', 'precast-coping', 'stone-coping'];
  }

  // Get next subcategory in sequence
  static getNextSubcategory(category: string, currentSubcategory: string): string | null {
    let sequence: string[] = [];
    
    switch (category) {
      case 'roofing':
        sequence = this.getRoofingSequence();
        break;
      case 'flashing':
        sequence = this.getFlashingSequence();
        break;
      case 'coping':
        sequence = this.getCopingSequence();
        break;
      default:
        return null;
    }

    const currentIndex = sequence.indexOf(currentSubcategory);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      return sequence[currentIndex + 1];
    }
    
    return null;
  }

  // Get previous subcategory in sequence
  static getPreviousSubcategory(category: string, currentSubcategory: string): string | null {
    let sequence: string[] = [];
    
    switch (category) {
      case 'roofing':
        sequence = this.getRoofingSequence();
        break;
      case 'flashing':
        sequence = this.getFlashingSequence();
        break;
      case 'coping':
        sequence = this.getCopingSequence();
        break;
      default:
        return null;
    }

    const currentIndex = sequence.indexOf(currentSubcategory);
    if (currentIndex > 0) {
      return sequence[currentIndex - 1];
    }
    
    return null;
  }
}

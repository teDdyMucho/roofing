import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { userService, User as AppUser } from '../services/userService';

// Authentication Context Type Definition
interface AuthContextType {
  /** Current authenticated user or null if not authenticated */
  currentUser: AppUser | null;
  
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
  
  /** Login with email and password or directly with user data */
  login: (email: string, password: string | null, userData?: AppUser | null) => Promise<boolean>;
  
  /** Register a new user */
  signup: (email: string, password: string, username: string, firstName: string, lastName: string, role?: string) => Promise<boolean>;
  
  /** Log out the current user */
  logout: () => Promise<void>;
  
  /** Whether authentication is in progress */
  loading: boolean;
  
  /** Update the current user's profile */
  updateUserProfile: (updates: Partial<AppUser>) => Promise<AppUser | null>;
}

// Default context value
const defaultAuthContext: AuthContextType = {
  currentUser: null,
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  loading: false,
  updateUserProfile: async () => null
};

// The Authentication Context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Custom hook to access the authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  // Context will never be undefined now because we provided a default value
  return context;
};

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State for the current authenticated user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // Loading state for authentication operations
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in by checking localStorage
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        // Check if we have a stored user ID in localStorage
        const storedUserId = localStorage.getItem('userId');
        
        if (storedUserId) {
          // Fetch the user from the database
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', storedUserId)
            .single();
          
          if (user && !error) {
            // User found, set as current user
            setCurrentUser(user);
          } else {
            // User not found or error, clear localStorage
            localStorage.removeItem('userId');
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error checking logged in user:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedInUser();
  }, []);



  // Signup with email and password - directly to the users table
  const signup = async (email: string, password: string, username: string, firstName: string, lastName: string, role: string = 'user'): Promise<boolean> => {
    if (!email || !password || !username) {
      console.error('Signup validation failed: Missing required fields');
      return false;
    }
    
    setLoading(true);
    
    try {
      // Use the correct enum values for the user_role type
      const validRole = role === 'admin' ? 'admin' : 'user';
      
      console.log('Attempting signup with:', { email, username, firstName, lastName, role: validRole });
      
      // Check if user with this email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        console.error('User with this email already exists');
        return false;
      }
      
      // Generate a UUID for the user
      const userId = crypto.randomUUID();
      
      // Create the user directly in the users table
      const newUser = {
        id: userId,
        email: email,
        password: password, // In a real app, you should hash this password
        username: username,
        first_name: firstName,
        last_name: lastName,
        role: validRole,
        avatar_url: '',
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString()
      };
      
      // Insert the user into the users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);
        
      if (insertError) {
        console.error('Failed to create user in database:', insertError);
        return false;
      }
      
      console.log('User profile created successfully in database');
      
      // User will need to log in explicitly after registration
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password or directly with user data
  const login = async (email: string, password: string | null, userData?: AppUser | null): Promise<boolean> => {
    try {
      setLoading(true);
      
      // If userData is provided, use it directly (already authenticated)
      if (userData) {
        console.log('Using provided user data for login');
        // Update last sign in time
        const timestamp = new Date().toISOString();
        try {
          const { error: updateError } = await supabase
            .from('users')
            .update({ last_sign_in: timestamp })
            .eq('id', userData.id);
            
          if (updateError) {
            console.warn('Failed to update last sign in time:', updateError);
          }
        } catch (error) {
          console.warn('Failed to update last sign in time:', error);
        }
        
        // Set the current user in the application state
        setCurrentUser(userData);
        
        // Store user ID in localStorage to persist login across page refreshes
        localStorage.setItem('userId', userData.id);
        
        return true;
      }
      
      // Otherwise, authenticate with email and password
      if (!email || !password) {
        console.error('Login validation failed: Missing email or password');
        return false;
      }
      
      // Query the users table directly for the user with matching email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !user) {
        console.error('User not found:', userError || 'No user with this email');
        return false;
      }
      
      // Verify password (in a real app, you'd compare hashed passwords)
      if (user.password !== password) {
        console.error('Password mismatch');
        return false;
      }
      
      // Update last sign in time
      const timestamp = new Date().toISOString();
      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_sign_in: timestamp })
          .eq('id', user.id);
          
        if (updateError) {
          console.warn('Failed to update last sign in time:', updateError);
        }
      } catch (error) {
        console.warn('Failed to update last sign in time:', error);
      }
      
      // Set the current user in the application state
      setCurrentUser(user);
      
      // Store user ID in localStorage to persist login across page refreshes
      localStorage.setItem('userId', user.id);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<AppUser>): Promise<AppUser | null> => {
    if (!currentUser) return null;
    
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(currentUser.id, updates);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout function - simplified since we're not using Supabase Auth
  const logout = async () => {
    try {
      console.log('Logging out user...');
      
      // Clear the local user state
      setCurrentUser(null);
      
      // Remove user ID from localStorage
      localStorage.removeItem('userId');
      
      // No need to sign out from Supabase Auth since we're not using it
    } catch (error) {
      console.warn('Error during logout:', error);
      // Even if there's an error, we've already cleared the local state
    }
  };

  // Ensure isAuthenticated is always a boolean value based on currentUser
  const isAuthenticated = !!currentUser;

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
    loading,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

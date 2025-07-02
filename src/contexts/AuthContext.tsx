import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { userService, User as AppUser } from '../services/userService';

interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, firstName: string, lastName: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile: (updates: Partial<AppUser>) => Promise<AppUser | null>;
}

// Create a default context value to avoid undefined errors
const defaultAuthContext: AuthContextType = {
  currentUser: null,
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  loading: false,
  updateUserProfile: async () => null
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  // Context will never be undefined now because we provided a default value
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount and set up auth listener
  useEffect(() => {
    // Function to handle session state
    const handleSession = async (session: Session | null) => {
      if (session?.user) {
        // Set basic user data immediately
        const userData: AppUser = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || '',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          role: session.user.user_metadata?.role || 'User',
          avatar_url: session.user.user_metadata?.avatar_url,
          last_sign_in: session.user.last_sign_in_at,
          created_at: session.user.created_at
        };
        setCurrentUser(userData);
        
        // Fetch full profile in background
        fetchUserProfile(session.user.id).catch(console.error);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };
    
    // Get the current session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        handleSession(session);
      })
      .catch(error => {
        setLoading(false);
      });

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });
    
    // Cleanup function
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile data from the users table or create a minimal profile from auth data
  const fetchUserProfile = async (userId: string) => {
    try {
      // First try to get the user from the database
      const user = await userService.getUserById(userId).catch(() => null);
      
      if (user) {
        // If user exists in the database, use that profile
        setCurrentUser(user);
      } else {
        // If user doesn't exist in the database, create a minimal profile from auth data
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const minimalUser = {
            id: authUser.id,
            email: authUser.email || '',
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
            role: authUser.user_metadata?.role || 'User',
            avatar_url: authUser.user_metadata?.avatar_url || '',
            created_at: new Date().toISOString(),
            last_sign_in: new Date().toISOString()
          };
          
          // Try to create the user in the database, but don't block if it fails
          userService.createUser(minimalUser).catch(console.warn);
          
          setCurrentUser(minimalUser);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.warn('Error fetching user profile:', error);
      // Try to proceed with minimal auth data if possible
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setCurrentUser({
            id: authUser.id,
            email: authUser.email || '',
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
            first_name: '',
            last_name: '',
            role: authUser.user_metadata?.role || 'User',
            avatar_url: '',
            created_at: new Date().toISOString(),
            last_sign_in: new Date().toISOString()
          });
        } else {
          setCurrentUser(null);
        }
      } catch (authError) {
        console.error('Failed to get auth user:', authError);
        setCurrentUser(null);
      }
    } finally {
      // Always set loading to false regardless of outcome
      setLoading(false);
    }
  };

  // Signup with email and password
  const signup = async (email: string, password: string, username: string, firstName: string, lastName: string, role: string = 'User'): Promise<boolean> => {
    if (!email || !password || !username) {
      console.error('Signup validation failed: Missing required fields');
      return false;
    }
    
    setLoading(true);
    
    try {
      // Ensure role is one of the valid enum values from the database
      const validRole = role === 'Administrator' ? 'Administrator' : 'User';
      
      console.log('Attempting signup with:', { email, username, firstName, lastName, role: validRole });
      
      // Step 1: Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name: firstName,
            last_name: lastName,
            role: validRole,
            avatar_url: '' // Provide a default empty value
          }
        }
      });
      
      if (authError) {
        console.error('Auth error during signup:', authError);
        console.error('Error details:', authError.message);
        console.error('Error code:', authError.code);
        console.error('Error status:', authError.status);
        console.error('Full error object:', JSON.stringify(authError, null, 2));
        return false;
      }
      
      if (!authData || !authData.user) {
        console.error('Signup failed: No user data returned');
        return false;
      }
      
      console.log('Auth user created successfully:', authData.user.id);
      console.log('User metadata:', authData.user.user_metadata);
      
      // Let the database trigger handle the creation of the user in public.users
      console.log('Auth user created successfully. Relying on database trigger to create user profile.');
      
      // No manual insertion into public.users - the database trigger will handle this
      
      if (authData.user && !authData.user.confirmed_at) {
        console.log('Email confirmation required. Check your email to confirm your account.');
      }
      
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

  /**
   * Login with email and password
   * Handles authentication without requiring a record in public.users table
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    // Validate inputs
    if (!email || !password) {
      return false;
    }

    try {
      setLoading(true);
      
      // Step 1: Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Handle authentication errors
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      // Verify user data was returned
      if (!data.user) {
        console.error('No user data returned from auth');
        return false;
      }
      
      // Create a minimal user object from auth data
      // This doesn't require the public.users table
      const userProfile = {
        id: data.user.id,
        email: data.user.email || email,
        username: data.user.user_metadata?.username || email.split('@')[0],
        first_name: data.user.user_metadata?.first_name || '',
        last_name: data.user.user_metadata?.last_name || '',
        role: data.user.user_metadata?.role || 'User',
        avatar_url: data.user.user_metadata?.avatar_url || '',
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString()
      };
      
      // Try to update/create user profile in the database if possible
      // But don't block login if this fails
      try {
        // First try to get the user to see if they exist
        const existingUser = await userService.getUserById(data.user.id).catch(() => null);
        
        if (existingUser) {
          // Update last sign in time if user exists
          await userService.updateLastSignIn(data.user.id).catch(console.warn);
        } else {
          // Try to create the user if they don't exist
          await userService.createUser(userProfile).catch(console.warn);
        }
      } catch (dbError) {
        console.warn('Database operation during login failed, continuing with auth:', dbError);
        // Continue with login even if database operations fail
      }
      
      // Update application state with our user object
      setCurrentUser(userProfile);
      
      // Force a refresh of the auth state
      await supabase.auth.getSession();
      
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

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        throw error;
      }
      
      // Clear user state
      setCurrentUser(null);
      console.log('User logged out successfully');
      
      return;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still clear the local state
      setCurrentUser(null);
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

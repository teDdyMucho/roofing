/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { userService, User as AppUser } from '../services/userService';

/**
 * Authentication Context Type Definition
 */
interface AuthContextType {
  /** Current authenticated user or null if not authenticated */
  currentUser: AppUser | null;
  
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
  
  /** Login with email and password */
  login: (email: string, password: string) => Promise<boolean>;
  
  /** Register a new user */
  signup: (email: string, password: string, username: string, firstName: string, lastName: string, role?: string) => Promise<boolean>;
  
  /** Log out the current user */
  logout: () => Promise<void>;
  
  /** Whether authentication is in progress */
  loading: boolean;
  
  /** Update the current user's profile */
  updateUserProfile: (updates: Partial<AppUser>) => Promise<AppUser | null>;
}

/**
 * Default context value to avoid undefined errors
 * This ensures components can safely use the context even before the provider is initialized
 */
const defaultAuthContext: AuthContextType = {
  currentUser: null,
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  loading: false,
  updateUserProfile: async () => null
};

/** The Authentication Context */
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

/**
 * Custom hook to access the authentication context
 * @returns The authentication context value
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  // Context will never be undefined now because we provided a default value
  return context;
};

/** Props for the AuthProvider component */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to the application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State for the current authenticated user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // Loading state for authentication operations
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
  const signup = async (email: string, password: string, username: string, firstName: string, lastName: string, role: string = 'user'): Promise<boolean> => {
    if (!email || !password || !username) {
      console.error('Signup validation failed: Missing required fields');
      return false;
    }
    
    setLoading(true);
    
    try {
      // Use the correct enum values for the user_role type
      // The database is now using a proper enum type with 'admin' and 'user' values
      const validRole = role === 'admin' ? 'admin' : 'user';
      
      console.log('Attempting signup with:', { email, username, firstName, lastName, role: validRole });
      
      // Step 1: Create the auth user with email/password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
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
        console.log('Signup result:', { authData, authError });
        console.error('Auth error during signup:', authError);
        console.error('Error details:', authError.message);
        console.error('Error code:', authError.code);
        console.error('Error status:', authError.status);
        return false;
      }
      
      if (!authData || !authData.user) {
        console.error('Signup failed: No user data returned');
        return false;
      }
      
      console.log('Auth user created successfully:', authData.user.id);
      
      // Manually create the user in the users table instead of relying on a trigger
      try {
        const newUser = {
          id: authData.user.id,
          email: email,
          username: username,
          first_name: firstName,
          last_name: lastName,
          // Use a plain string for role instead of trying to use an enum type
          // This avoids the 'user_role does not exist' error
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
          console.warn('Failed to create user profile in database, but auth user was created:', insertError);
          // Continue with signup even if database insert fails
          // The user can still log in and we'll create their profile on first login
        } else {
          console.log('User profile created successfully in database');
        }
      } catch (dbError) {
        console.warn('Error creating user profile, but auth user was created:', dbError);
        // Continue with signup even if database operations fail
      }
      
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
      
      // First clear the local user state to ensure UI updates immediately
      setCurrentUser(null);
      
      // Then attempt to sign out from Supabase
      // Use a try-catch inside to handle potential session errors
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('Non-critical error during logout:', error);
          // Continue with logout process despite the error
        }
      } catch (signOutError) {
        // Log but don't rethrow - we've already cleared the local state
        console.warn('Error during supabase.auth.signOut():', signOutError);
        // This catches AuthSessionMissingError and other auth-related errors
      }
      
      console.log('User logged out successfully');
      return;
    } catch (error) {
      console.error('Unexpected error in logout function:', error);
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

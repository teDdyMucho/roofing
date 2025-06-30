import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import userService, { User } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, firstName: string, lastName: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount and set up auth listener
  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile data from the users table
  const fetchUserProfile = async (userId: string) => {
    try {
      const user = await userService.getUserById(userId);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Signup with email and password
  const signup = async (email: string, password: string, username: string, firstName: string, lastName: string, role: string = 'User'): Promise<boolean> => {
    if (!email || !password || !username) {
      return false;
    }
    
    setLoading(true);
    
    try {
      // Ensure role is one of the valid enum values from the database
      const validRole = role === 'Administrator' ? 'Administrator' : 'User';
      
      // Create the auth user with metadata - the database trigger will handle creating the user profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name: firstName,
            last_name: lastName,
            role: validRole
          }
        }
      });
      
      if (authError) {
        console.error('Auth error during signup:', authError);
        return false;
      }
      
      if (authData.user) {
        console.log('User created successfully:', authData.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      return false;
    }

    try {
      setLoading(true);
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Update last sign in time
      if (data.user) {
        await userService.updateUser(data.user.id, {
          last_sign_in: new Date().toISOString()
        });
      }
      
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>): Promise<User | null> => {
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
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
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

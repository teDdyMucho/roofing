import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Simple query to test connection
        const { data, error } = await supabase.from('projects').select('id').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setErrorMessage(error.message);
          return;
        }
        
        console.log('Supabase connection successful:', data);
        setConnectionStatus('success');
      } catch (err) {
        console.error('Unexpected error:', err);
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Supabase Connection Test</h2>
      
      {connectionStatus === 'testing' && (
        <p>Testing connection to Supabase...</p>
      )}
      
      {connectionStatus === 'success' && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          ✅ Connection successful! Your Supabase configuration is working.
        </p>
      )}
      
      {connectionStatus === 'error' && (
        <div>
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            ❌ Connection failed! There's an issue with your Supabase configuration.
          </p>
          {errorMessage && (
            <div style={{ backgroundColor: '#ffeeee', padding: '10px', borderRadius: '4px' }}>
              <p><strong>Error:</strong> {errorMessage}</p>
              <p>Check your .env file to ensure your Supabase URL and anonymous key are correct.</p>
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Environment Variables:</h3>
        <p>REACT_APP_SUPABASE_URL: {process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>REACT_APP_SUPABASE_ANON_KEY: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        <p><small>Note: For security reasons, the actual values are not displayed.</small></p>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;

import { useState } from 'react';
import { fetchUrlMetadata } from '../firebase/functions';

export default function useUrlMetadata() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches metadata for a given URL using Firebase Cloud Functions
   * @param {string} url - The URL to fetch metadata for
   * @returns {Promise<Object|null>} - The metadata object or null if failed
   */
  const getUrlMetadata = async (url) => {
    if (!url) return null;
    
    // Reset state
    setLoading(true);
    setError(null);
    
    try {
      // Call the Firebase Function
      const response = await fetchUrlMetadata(url);
      
      if (response.success && response.metadata) {
        return response.metadata;
      } else {
        setError('Failed to fetch URL metadata');
        return null;
      }
    } catch (err) {
      console.error('Error fetching URL metadata:', err);
      setError(err.message || 'Failed to fetch URL metadata');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getUrlMetadata,
    loading,
    error
  };
}
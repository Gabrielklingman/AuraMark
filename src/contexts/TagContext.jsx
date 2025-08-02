import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

// Create context
const TagContext = createContext();

// Custom hook to use the context
export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};

// Provider component
export const TagProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();

  // Get all unique tags from user's bookmarks
  useEffect(() => {
    if (!currentUser) {
      setTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Reference to the bookmarks collection
    const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
    
    // Set up real-time listener for all bookmarks (we'll extract tags from them)
    const unsubscribe = onSnapshot(
      query(bookmarksRef),
      (snapshot) => {
        // Extract all tags from all bookmarks
        const allTags = [];
        
        snapshot.docs.forEach(doc => {
          const bookmarkData = doc.data();
          // Only include tags from non-trashed bookmarks
          if (!bookmarkData.isTrashed && bookmarkData.tags && Array.isArray(bookmarkData.tags)) {
            bookmarkData.tags.forEach(tag => {
              if (tag && !allTags.includes(tag)) {
                allTags.push(tag);
              }
            });
          }
        });
        
        // Sort tags alphabetically
        allTags.sort();
        
        // Create tag objects with color assignments
        const tagObjects = allTags.map(tag => {
          return {
            id: tag,
            name: tag,
            color: generateTagColor(tag)
          };
        });
        
        setTags(tagObjects);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [currentUser]);

  // Helper function to generate a consistent color for a tag
  const generateTagColor = (tagName) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-red-100 text-red-600',
      'bg-orange-100 text-orange-600',
      'bg-teal-100 text-teal-600',
      'bg-cyan-100 text-cyan-600'
    ];
    
    // Use the sum of char codes to determine a consistent color
    const sum = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };
  
  // Value to be provided to consumers
  const value = {
    tags,
    loading,
    error,
    getTagColor: generateTagColor
  };
  
  return (
    <TagContext.Provider value={value}>
      {children}
    </TagContext.Provider>
  );
};
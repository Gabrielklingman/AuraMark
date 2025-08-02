import React, { createContext, useContext, useState } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Create context
const SelectionContext = createContext();

// Custom hook to use the context
export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

// Provider component
export const SelectionProvider = ({ children }) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      // Clear selection when exiting selection mode
      setSelectedBookmarks([]);
    }
  };

  // Toggle bookmark selection
  const toggleBookmarkSelection = (bookmark) => {
    setSelectedBookmarks(prev => {
      const isSelected = prev.some(b => b.id === bookmark.id);
      if (isSelected) {
        return prev.filter(b => b.id !== bookmark.id);
      } else {
        return [...prev, bookmark];
      }
    });
  };

  // Check if a bookmark is selected
  const isBookmarkSelected = (bookmarkId) => {
    return selectedBookmarks.some(bookmark => bookmark.id === bookmarkId);
  };

  // Select all bookmarks from a list
  const selectAll = (bookmarks) => {
    setSelectedBookmarks(bookmarks);
  };

  // Deselect all bookmarks
  const deselectAll = () => {
    setSelectedBookmarks([]);
  };

  // Bulk action: Move to folder
  const bulkMoveToFolder = async (folderId) => {
    if (!currentUser || selectedBookmarks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const batch = writeBatch(db);
      
      selectedBookmarks.forEach(bookmark => {
        const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmark.id}`);
        batch.update(bookmarkRef, {
          folderId,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      setSelectedBookmarks([]);
      return true;
    } catch (err) {
      console.error('Error moving bookmarks to folder:', err);
      setError('Failed to move bookmarks. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Bulk action: Move to trash
  const bulkMoveToTrash = async () => {
    if (!currentUser || selectedBookmarks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const batch = writeBatch(db);
      
      selectedBookmarks.forEach(bookmark => {
        const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmark.id}`);
        batch.update(bookmarkRef, {
          isTrashed: true,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      setSelectedBookmarks([]);
      return true;
    } catch (err) {
      console.error('Error moving bookmarks to trash:', err);
      setError('Failed to trash bookmarks. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Bulk action: Add tags
  const bulkAddTags = async (tags) => {
    if (!currentUser || selectedBookmarks.length === 0 || !tags || tags.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const batch = writeBatch(db);
      
      selectedBookmarks.forEach(bookmark => {
        const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmark.id}`);
        
        // Merge existing tags with new tags, removing duplicates
        const existingTags = bookmark.tags || [];
        const mergedTags = [...new Set([...existingTags, ...tags])];
        
        batch.update(bookmarkRef, {
          tags: mergedTags,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      return true;
    } catch (err) {
      console.error('Error adding tags to bookmarks:', err);
      setError('Failed to add tags to bookmarks. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Bulk action: Toggle read status
  const bulkToggleReadStatus = async (isRead) => {
    if (!currentUser || selectedBookmarks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const batch = writeBatch(db);
      
      selectedBookmarks.forEach(bookmark => {
        const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmark.id}`);
        batch.update(bookmarkRef, {
          isRead,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      return true;
    } catch (err) {
      console.error('Error updating read status for bookmarks:', err);
      setError('Failed to update read status. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided to consumers
  const value = {
    isSelectionMode,
    toggleSelectionMode,
    selectedBookmarks,
    toggleBookmarkSelection,
    isBookmarkSelected,
    selectAll,
    deselectAll,
    bulkMoveToFolder,
    bulkMoveToTrash,
    bulkAddTags,
    bulkToggleReadStatus,
    loading,
    error
  };
  
  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};
import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { fetchUrlMetadata } from '../firebase/functions';

export default function useBookmarkOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch metadata for a URL
  const fetchMetadata = async (url) => {
    if (!url) return null;
    
    setLoading(true);
    setError(null);
    
    try {
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

  // Move bookmark to a specific folder
  const moveBookmarkToFolder = async (bookmarkId, folderId) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
      await updateDoc(bookmarkRef, {
        folderId,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      console.error('Error moving bookmark to folder:', err);
      setError('Failed to move bookmark. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (bookmarkId, isFavorite) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
      await updateDoc(bookmarkRef, {
        isFavorite,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      console.error('Error updating favorite status:', err);
      setError('Failed to update favorite status. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle read status
  const toggleReadStatus = async (bookmarkId, isRead) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
      await updateDoc(bookmarkRef, {
        isRead,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      console.error('Error updating read status:', err);
      setError('Failed to update read status. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Move bookmark to trash
  const trashBookmark = async (bookmarkId) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
      await updateDoc(bookmarkRef, {
        isTrashed: true,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      console.error('Error moving bookmark to trash:', err);
      setError('Failed to trash bookmark. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Restore bookmark from trash
  const restoreBookmark = async (bookmarkId) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
      await updateDoc(bookmarkRef, {
        isTrashed: false,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      console.error('Error restoring bookmark:', err);
      setError('Failed to restore bookmark. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Permanently delete bookmark
  const deleteBookmark = async (bookmarkId) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
      await deleteDoc(bookmarkRef);
      return true;
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError('Failed to delete bookmark. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchMetadata,
    moveBookmarkToFolder,
    toggleFavorite,
    toggleReadStatus,
    trashBookmark,
    restoreBookmark,
    deleteBookmark,
    loading,
    error
  };
}
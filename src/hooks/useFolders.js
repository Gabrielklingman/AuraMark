import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// Helper function to assign folder colors consistently
const getFolderColor = (folderId) => {
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
  ];
  
  // Generate a deterministic index based on the folder ID
  let sum = 0;
  for (let i = 0; i < folderId.length; i++) {
    sum += folderId.charCodeAt(i);
  }
  
  return colors[sum % colors.length];
};

// Helper function to organize folders in hierarchical structure
const organizeFoldersHierarchy = (folders) => {
  // First pass: Create a map of all folders
  const folderMap = new Map();
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      ...folder,
      children: [],
      level: 0
    });
  });
  
  // Second pass: Build hierarchy
  const rootFolders = [];
  folderMap.forEach(folder => {
    if (folder.parentId && folderMap.has(folder.parentId)) {
      // Add as child to parent
      const parent = folderMap.get(folder.parentId);
      parent.children.push(folder);
      // Calculate nesting level
      folder.level = parent.level + 1;
    } else {
      // Top-level folder
      rootFolders.push(folder);
    }
  });
  
  // Third pass: Flatten the hierarchy with proper ordering
  const result = [];
  
  // Recursive function to add folders in display order
  const addFolderToResult = (folder) => {
    result.push(folder);
    folder.children
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(child => addFolderToResult(child));
  };
  
  // Start with root folders
  rootFolders
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(folder => addFolderToResult(folder));
  
  return result;
};

export default function useFolders() {
  const [foldersRaw, setFoldersRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  
  // Process folders to include hierarchy information
  const folders = useMemo(() => {
    return organizeFoldersHierarchy(foldersRaw);
  }, [foldersRaw]);

  useEffect(() => {
    if (!currentUser) {
      setFoldersRaw([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const foldersRef = collection(db, `users/${currentUser.uid}/folders`);
    const foldersQuery = query(foldersRef, orderBy('createdAt', 'asc'));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(foldersQuery, 
      (snapshot) => {
        const fetchedFolders = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            parentId: data.parentId || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            color: getFolderColor(doc.id) // Assign a color based on folder ID
          };
        });
        
        // Filter out deleted folders
        const activeFolders = fetchedFolders.filter(folder => !folder.isDeleted);
        setFoldersRaw(activeFolders);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching folders:', err);
        setError('Failed to load folders. Please try again later.');
        setLoading(false);
      }
    );
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [currentUser]);
  
  // Get the count of bookmarks in a folder
  const getBookmarkCount = async (folderId) => {
    if (!currentUser) return 0;
    
    try {
      const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
      const bookmarksQuery = query(bookmarksRef, where('folderId', '==', folderId));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      
      return bookmarksSnapshot.size;
    } catch (err) {
      console.error('Error getting bookmark count:', err);
      return 0;
    }
  };
  
  // Delete a folder and handle its bookmarks
  const deleteFolder = async (folderId, bookmarkAction) => {
    if (!currentUser) return false;
    
    try {
      // Get reference to the folder
      const folderRef = doc(db, `users/${currentUser.uid}/folders/${folderId}`);
      
      // Get all bookmarks in this folder
      const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
      const bookmarksQuery = query(bookmarksRef, where('folderId', '==', folderId));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      
      // Create a batch for efficient writes
      const batch = writeBatch(db);
      
      // Process bookmarks based on selected action
      bookmarksSnapshot.docs.forEach(bookmarkDoc => {
        const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkDoc.id}`);
        
        switch (bookmarkAction) {
          case 'trash':
            // Move bookmarks to trash
            batch.update(bookmarkRef, { 
              isTrashed: true,
              updatedAt: new Date()
            });
            break;
          
          case 'root':
            // Move bookmarks to root folder
            batch.update(bookmarkRef, { 
              folderId: 'root',
              updatedAt: new Date()
            });
            break;
          
          case 'delete':
            // Delete bookmarks permanently
            batch.delete(bookmarkRef);
            break;
            
          default:
            break;
        }
      });
      
      // Delete the folder
      batch.delete(folderRef);
      
      // Execute the batch
      await batch.commit();
      
      return true;
    } catch (err) {
      console.error('Error deleting folder:', err);
      return false;
    }
  };

  return { 
    folders, 
    loading, 
    error,
    getBookmarkCount,
    deleteFolder
  };
}
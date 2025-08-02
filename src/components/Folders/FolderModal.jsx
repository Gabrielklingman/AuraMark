import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import { FiFolder, FiX } from 'react-icons/fi';
import useFolders from '../../hooks/useFolders';

const FolderModal = ({ isOpen, onClose, folderToEdit }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedParentFolder, setSelectedParentFolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const { folders } = useFolders();
  
  // Reset form when opening the modal
  useEffect(() => {
    if (isOpen) {
      if (folderToEdit) {
        setFolderName(folderToEdit.name || '');
        setSelectedParentFolder(folderToEdit.parentId || '');
      } else {
        setFolderName('');
        setSelectedParentFolder('');
      }
      setError('');
    }
  }, [isOpen, folderToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      if (!currentUser) throw new Error('You must be signed in');
      
      // Check for duplicate folder names at the same level
      const folderRef = collection(db, `users/${currentUser.uid}/folders`);
      let duplicateQuery;
      
      if (folderToEdit) {
        // When editing, check for duplicates excluding the current folder
        duplicateQuery = query(
          folderRef, 
          where('name', '==', folderName.trim()),
          where('parentId', '==', selectedParentFolder || null)
        );
      } else {
        // When creating, check for any duplicate at the same level
        duplicateQuery = query(
          folderRef, 
          where('name', '==', folderName.trim()),
          where('parentId', '==', selectedParentFolder || null)
        );
      }
      
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      // Check if there's a duplicate, excluding the folder being edited
      const hasDuplicate = duplicateSnapshot.docs.some(doc => 
        !folderToEdit || doc.id !== folderToEdit.id
      );
      
      if (hasDuplicate) {
        setError('A folder with this name already exists at this level');
        setIsSubmitting(false);
        return;
      }
      
      // Check for circular references when setting a parent
      if (selectedParentFolder && folderToEdit) {
        // Can't set a folder as its own parent
        if (selectedParentFolder === folderToEdit.id) {
          setError("A folder cannot be its own parent");
          setIsSubmitting(false);
          return;
        }
        
        // Can't set a child folder as the parent (would create a circular reference)
        let currentFolder = folders.find(f => f.id === selectedParentFolder);
        while (currentFolder && currentFolder.parentId) {
          if (currentFolder.parentId === folderToEdit.id) {
            setError("This would create a circular folder structure");
            setIsSubmitting(false);
            return;
          }
          currentFolder = folders.find(f => f.id === currentFolder.parentId);
        }
      }
      
      if (folderToEdit) {
        // Update existing folder
        const folderDocRef = doc(db, `users/${currentUser.uid}/folders/${folderToEdit.id}`);
        await updateDoc(folderDocRef, {
          name: folderName.trim(),
          parentId: selectedParentFolder || null,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new folder
        await addDoc(collection(db, `users/${currentUser.uid}/folders`), {
          name: folderName.trim(),
          parentId: selectedParentFolder || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isDeleted: false
        });
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving folder:', err);
      setError('Failed to save folder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  // Filter out the current folder and its children from parent folder options
  const getAvailableParentFolders = () => {
    if (!folderToEdit) return folders;
    
    // Helper function to check if a folder is a descendant of the current folder
    const isDescendant = (folderId, targetId) => {
      if (folderId === targetId) return true;
      
      const folder = folders.find(f => f.id === folderId);
      if (!folder || !folder.parentId) return false;
      
      return isDescendant(folder.parentId, targetId);
    };
    
    return folders.filter(folder => 
      folder.id !== folderToEdit.id && 
      !isDescendant(folder.id, folderToEdit.id)
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center">
                <SafeIcon icon={FiFolder} className="text-primary-500 w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {folderToEdit ? 'Edit Folder' : 'Create New Folder'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Folder Name */}
              <div>
                <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name
                </label>
                <input
                  id="folder-name"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
              
              {/* Parent Folder Selection */}
              <div>
                <label htmlFor="parent-folder" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Folder (Optional)
                </label>
                <select
                  id="parent-folder"
                  value={selectedParentFolder}
                  onChange={(e) => setSelectedParentFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">None (Root Level)</option>
                  {getAvailableParentFolders().map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.level > 0 ? '  '.repeat(folder.level) + '└ ' : ''}{folder.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : folderToEdit ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FolderModal;
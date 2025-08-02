import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useTags } from '../../contexts/TagContext';
import SafeIcon from '../../common/SafeIcon';
import { FiX, FiEdit2, FiTrash2, FiTag, FiSearch } from 'react-icons/fi';

const ManageTagsModal = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagToEdit, setTagToEdit] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [tagToDelete, setTagToDelete] = useState(null);
  
  const { currentUser } = useAuth();
  const { tags, loading: tagsLoading } = useTags();

  // Filter tags based on search term
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTagToEdit(null);
      setTagToDelete(null);
      setError(null);
    }
  }, [isOpen]);

  const handleRenameTag = async () => {
    if (!currentUser || !tagToEdit || !newTagName.trim()) return;
    
    // Check if new tag name already exists
    const tagExists = tags.some(tag => 
      tag.name.toLowerCase() === newTagName.trim().toLowerCase() && 
      tag.name !== tagToEdit.name
    );
    
    if (tagExists) {
      setError(`Tag "${newTagName.trim()}" already exists`);
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Find all bookmarks with this tag
      const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
      const bookmarksSnapshot = await getDocs(bookmarksRef);
      
      // Create a batch for efficient writes
      const batch = writeBatch(db);
      let updatedCount = 0;
      
      // Update each bookmark that contains the tag
      bookmarksSnapshot.docs.forEach(doc => {
        const bookmarkData = doc.data();
        
        if (bookmarkData.tags && Array.isArray(bookmarkData.tags) && 
            bookmarkData.tags.includes(tagToEdit.name)) {
          
          // Create new tags array with renamed tag
          const updatedTags = bookmarkData.tags.map(tag => 
            tag === tagToEdit.name ? newTagName.trim() : tag
          );
          
          // Update the bookmark
          batch.update(doc.ref, { 
            tags: updatedTags,
            updatedAt: new Date()
          });
          
          updatedCount++;
        }
      });
      
      // Execute the batch if there are updates
      if (updatedCount > 0) {
        await batch.commit();
      }
      
      setTagToEdit(null);
      setNewTagName('');
    } catch (err) {
      console.error('Error renaming tag:', err);
      setError('Failed to rename tag. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!currentUser || !tagToDelete) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Find all bookmarks with this tag
      const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
      const bookmarksSnapshot = await getDocs(bookmarksRef);
      
      // Create a batch for efficient writes
      const batch = writeBatch(db);
      let updatedCount = 0;
      
      // Update each bookmark that contains the tag
      bookmarksSnapshot.docs.forEach(doc => {
        const bookmarkData = doc.data();
        
        if (bookmarkData.tags && Array.isArray(bookmarkData.tags) && 
            bookmarkData.tags.includes(tagToDelete.name)) {
          
          // Filter out the deleted tag
          const updatedTags = bookmarkData.tags.filter(tag => tag !== tagToDelete.name);
          
          // Update the bookmark
          batch.update(doc.ref, { 
            tags: updatedTags,
            updatedAt: new Date()
          });
          
          updatedCount++;
        }
      });
      
      // Execute the batch if there are updates
      if (updatedCount > 0) {
        await batch.commit();
      }
      
      setTagToDelete(null);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError('Failed to delete tag. Please try again.');
    } finally {
      setIsProcessing(false);
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
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center">
                <SafeIcon icon={FiTag} className="text-primary-500 w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Manage Tags
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isProcessing}
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="p-5 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiSearch} className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Tags List */}
            <div className="flex-1 p-5 overflow-y-auto">
              {tagsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading tags...
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No tags match your search" : "No tags found"}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredTags.map(tag => (
                    <div 
                      key={tag.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className={`w-3 h-3 rounded-full ${tag.color.split(' ')[0]}`}></span>
                        <span className="text-gray-800 font-medium truncate">
                          {tag.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setTagToEdit(tag);
                            setNewTagName(tag.name);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-primary-600 transition-colors"
                          title="Rename Tag"
                          disabled={isProcessing}
                        >
                          <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTagToDelete(tag)}
                          className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete Tag"
                          disabled={isProcessing}
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="px-5 py-3 bg-red-50 text-sm text-red-600">
                {error}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Rename Tag Modal */}
      <AnimatePresence>
        {tagToEdit && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50"
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
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Rename Tag
                </h3>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <label htmlFor="new-tag-name" className="block text-sm font-medium text-gray-700 mb-1">
                    New Tag Name
                  </label>
                  <input
                    id="new-tag-name"
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter new tag name"
                    autoFocus
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setTagToEdit(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenameTag}
                    className="px-4 py-2 bg-primary-600 rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={isProcessing || !newTagName.trim() || newTagName === tagToEdit.name}
                  >
                    {isProcessing ? 'Renaming...' : 'Rename'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Tag Confirmation Modal */}
      <AnimatePresence>
        {tagToDelete && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50"
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
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center">
                  <SafeIcon icon={FiTrash2} className="text-red-500 w-5 h-5 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Delete Tag
                  </h3>
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-gray-700">
                  Are you sure you want to delete the tag <span className="font-medium">"{tagToDelete.name}"</span>? 
                  This will remove the tag from all bookmarks.
                </p>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setTagToDelete(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTag}
                    className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default ManageTagsModal;
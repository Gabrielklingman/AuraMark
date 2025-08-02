import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  doc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import { FiX, FiTrash2, FiFolder, FiAlertTriangle, FiBookmark } from 'react-icons/fi';

const DeleteFolderModal = ({ isOpen, onClose, folder, bookmarkCount }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const handleDeleteFolder = async (action) => {
    if (!currentUser || !folder) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Get reference to the folder
      const folderRef = doc(db, `users/${currentUser.uid}/folders/${folder.id}`);
      
      // Get all bookmarks in this folder
      const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
      const bookmarksQuery = query(bookmarksRef, where('folderId', '==', folder.id));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      
      // Create a batch for efficient writes
      const batch = writeBatch(db);
      
      // Process bookmarks based on selected action
      bookmarksSnapshot.docs.forEach(bookmarkDoc => {
        const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkDoc.id}`);
        
        switch (action) {
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
      
      onClose();
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('Failed to delete folder. Please try again.');
    } finally {
      setIsDeleting(false);
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
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center">
                <SafeIcon icon={FiTrash2} className="text-red-500 w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Delete Folder
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isDeleting}
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <SafeIcon icon={FiFolder} className={`${folder?.color?.split(' ')[1] || 'text-gray-500'} w-5 h-5`} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    Delete "{folder?.name || 'folder'}"?
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    This folder contains {bookmarkCount} {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}. 
                    What would you like to do with them?
                  </p>
                </div>
              </div>
              
              {/* Options as Cards */}
              <div className="grid grid-cols-1 gap-3 mt-4">
                {/* Move to Trash */}
                <button 
                  onClick={() => handleDeleteFolder('trash')}
                  disabled={isDeleting}
                  className="flex items-start p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="mr-3 mt-1">
                    <SafeIcon icon={FiTrash2} className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Move to Trash</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Bookmarks will be moved to trash and can be restored later.
                    </p>
                  </div>
                </button>
                
                {/* Move to All Bookmarks */}
                <button 
                  onClick={() => handleDeleteFolder('root')}
                  disabled={isDeleting}
                  className="flex items-start p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="mr-3 mt-1">
                    <SafeIcon icon={FiBookmark} className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Move to All Bookmarks</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Bookmarks will be moved to the root level (All Bookmarks).
                    </p>
                  </div>
                </button>
                
                {/* Delete Permanently */}
                <button 
                  onClick={() => handleDeleteFolder('delete')}
                  disabled={isDeleting}
                  className="flex items-start p-4 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left"
                >
                  <div className="mr-3 mt-1">
                    <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600">Delete Permanently</h4>
                    <p className="text-sm text-red-600 mt-1">
                      Warning: This will permanently delete all bookmarks in this folder. This action cannot be undone.
                    </p>
                  </div>
                </button>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 mt-3">
                  {error}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-5 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteFolderModal;
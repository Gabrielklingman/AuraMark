import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiFolder, FiTag, FiTrash2, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { useSelection } from '../../contexts/SelectionContext';
import FolderSelectionModal from './FolderSelectionModal';
import TagSelectionModal from './TagSelectionModal';

const SelectionActionBar = () => {
  const { 
    selectedBookmarks, 
    bulkMoveToFolder, 
    bulkMoveToTrash, 
    bulkAddTags, 
    bulkToggleReadStatus, 
    loading 
  } = useSelection();
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  
  // Determine if any selected bookmarks are unread (for toggle read/unread button)
  const hasUnreadBookmarks = selectedBookmarks.some(bookmark => !bookmark.isRead);

  // Handle move to folder
  const handleOpenFolderModal = () => {
    setIsFolderModalOpen(true);
  };

  // Handle add tags
  const handleOpenTagModal = () => {
    setIsTagModalOpen(true);
  };

  // Handle move to trash
  const handleMoveToTrash = async () => {
    if (confirm(`Move ${selectedBookmarks.length} bookmark${selectedBookmarks.length > 1 ? 's' : ''} to trash?`)) {
      await bulkMoveToTrash();
    }
  };

  // Handle mark as read/unread
  const handleToggleReadStatus = async () => {
    await bulkToggleReadStatus(hasUnreadBookmarks);
  };

  // Animation variants
  const barVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Only show the action bar if there are selected bookmarks
  if (selectedBookmarks.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="selection-bar"
          variants={barVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center space-x-2">
            {/* Move to folder button */}
            <button
              onClick={handleOpenFolderModal}
              disabled={loading}
              className="flex items-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={loading ? FiLoader : FiFolder} className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Move
            </button>
            
            {/* Add tags button */}
            <button
              onClick={handleOpenTagModal}
              disabled={loading}
              className="flex items-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={loading ? FiLoader : FiTag} className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Add Tags
            </button>
            
            {/* Mark as read/unread button */}
            <button
              onClick={handleToggleReadStatus}
              disabled={loading}
              className="flex items-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={loading ? FiLoader : FiCheck} className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Mark {hasUnreadBookmarks ? 'Read' : 'Unread'}
            </button>
            
            {/* Move to trash button */}
            <button
              onClick={handleMoveToTrash}
              disabled={loading}
              className="flex items-center px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={loading ? FiLoader : FiTrash2} className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Delete
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Folder selection modal */}
      <FolderSelectionModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onFolderSelect={async (folderId) => {
          await bulkMoveToFolder(folderId);
          setIsFolderModalOpen(false);
        }}
      />
      
      {/* Tag selection modal */}
      <TagSelectionModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onTagsSelect={async (tags) => {
          await bulkAddTags(tags);
          setIsTagModalOpen(false);
        }}
      />
    </>
  );
};

export default SelectionActionBar;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiX, FiFolder, FiSearch, FiLoader } from 'react-icons/fi';
import useFolders from '../../hooks/useFolders';
import { useSelection } from '../../contexts/SelectionContext';

const FolderSelectionModal = ({ isOpen, onClose, onFolderSelect }) => {
  const [folderSearch, setFolderSearch] = useState('');
  const { folders, loading: foldersLoading } = useFolders();
  const { selectedBookmarks, loading } = useSelection();
  
  // Filter folders based on search
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(folderSearch.toLowerCase())
  );
  
  // Modal animation variants
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: "easeIn"
      }
    }
  };

  // Backdrop animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };
  
  // Handle move to root (no folder)
  const handleMoveToRoot = async () => {
    await onFolderSelect(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Move to Folder</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                <p className="mb-4 text-sm text-gray-600">
                  Select a folder to move {selectedBookmarks.length} bookmark{selectedBookmarks.length > 1 ? 's' : ''}
                </p>
                
                {/* Folder Search */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiSearch} className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={folderSearch}
                    onChange={e => setFolderSearch(e.target.value)}
                    placeholder="Search folders..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                
                {/* Root folder option */}
                <button
                  onClick={handleMoveToRoot}
                  disabled={loading}
                  className="w-full flex items-center px-4 py-3 mb-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <SafeIcon icon={FiFolder} className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-gray-800 font-medium">No Folder (Root)</span>
                </button>
                
                {/* Folder List */}
                <div className="max-h-64 overflow-y-auto">
                  {foldersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <SafeIcon icon={FiLoader} className="w-5 h-5 text-primary-500 animate-spin" />
                      <span className="ml-2 text-gray-500">Loading folders...</span>
                    </div>
                  ) : filteredFolders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {folderSearch ? 'No matching folders found' : 'No folders available'}
                    </div>
                  ) : (
                    filteredFolders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => onFolderSelect(folder.id)}
                        disabled={loading}
                        className="w-full flex items-center px-4 py-3 mb-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${folder.color.split(' ')[0]}`}
                        >
                          <SafeIcon icon={FiFolder} className={`w-4 h-4 ${folder.color.split(' ')[1]}`} />
                        </div>
                        <span className="text-gray-800">{folder.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end px-6 py-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FolderSelectionModal;
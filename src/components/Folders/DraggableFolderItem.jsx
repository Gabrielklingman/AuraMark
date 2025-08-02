import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import SafeIcon from '../../common/SafeIcon';
import { FiFolder, FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import DeleteFolderModal from './DeleteFolderModal';
import { useAuth } from '../../contexts/AuthContext';
import useFolders from '../../hooks/useFolders';

const DraggableFolderItem = ({ 
  folder,
  isActive,
  isDragging,
  isDraggingFolder,
  onClick,
  level = 0 // Indentation level
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  
  const { currentUser } = useAuth();
  const { getBookmarkCount } = useFolders();
  
  // Make the folder both draggable and droppable
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging: isCurrentlyDragging } = useDraggable({
    id: `folder-${folder.id}`,
    data: {
      type: 'folder',
      folder
    }
  });
  
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
  });
  
  // Combine the refs
  const setNodeRef = (node) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  // Calculate indentation based on nesting level
  const indentationStyle = {
    paddingLeft: `${16 + (level * 12)}px` // Base padding + level-based indentation
  };
  
  // Open context menu
  const handleMoreClick = async (e) => {
    e.stopPropagation();
    
    // Get bookmark count before showing context menu
    if (currentUser) {
      const count = await getBookmarkCount(folder.id);
      setBookmarkCount(count);
    }
    
    setShowContextMenu(true);
  };
  
  // Close context menu when clicking outside
  const handleClickOutside = () => {
    setShowContextMenu(false);
  };
  
  // Handle delete folder action
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowContextMenu(false);
    setShowDeleteModal(true);
  };
  
  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        className={`
          relative flex items-center px-3 py-2 rounded-lg text-sm
          transition-all duration-150 hover:bg-gray-200 cursor-grab active:cursor-grabbing
          ${isActive ? 'text-primary-600 font-medium' : 'text-gray-600'}
          ${isOver && isDraggingFolder ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
          ${isCurrentlyDragging ? 'opacity-50 bg-gray-100 ring-2 ring-primary-300' : ''}
        `}
        style={indentationStyle}
        animate={{
          boxShadow: isCurrentlyDragging 
            ? '0 8px 16px rgba(0, 0, 0, 0.1)' 
            : isOver && isDraggingFolder 
              ? '0 0 0 2px rgba(99, 102, 241, 0.6)' 
              : 'none',
          backgroundColor: isOver && isDraggingFolder 
            ? 'rgba(237, 233, 254, 0.5)' 
            : isCurrentlyDragging
              ? 'rgba(243, 244, 246, 0.9)'
              : isActive 
                ? 'rgba(243, 244, 246, 0.8)' 
                : 'transparent',
          scale: isCurrentlyDragging ? 1.02 : 1,
          zIndex: isCurrentlyDragging ? 10 : 1
        }}
        {...attributes}
        {...listeners}
      >
        {/* Level indicator for nested folders */}
        {level > 0 && (
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8">
            <div className="border-l-2 border-gray-200 h-full mx-1.5"></div>
          </div>
        )}
        
        {/* Folder icon */}
        <div className="flex items-center mr-2">
          <SafeIcon icon={FiFolder} className={`${folder.color.split(' ')[1]} h-4 w-4`} />
        </div>
        
        {/* Folder name - clicking this area selects the folder */}
        <div 
          className="flex-grow truncate cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {folder.name}
        </div>
        
        {/* Context menu button */}
        <button
          onClick={handleMoreClick}
          className="p-1 rounded-full hover:bg-gray-300 text-gray-500 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <SafeIcon icon={FiMoreVertical} className="w-4 h-4" />
        </button>
        
        {/* Context menu */}
        {showContextMenu && (
          <>
            <div 
              className="fixed inset-0 z-20" 
              onClick={handleClickOutside}
            ></div>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-30 py-1 border border-gray-200">
              <button
                onClick={handleDeleteClick}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete Folder
              </button>
            </div>
          </>
        )}
        
        {/* Visual feedback when dragging over */}
        {isOver && isDraggingFolder && (
          <span className="ml-auto text-xs text-primary-600">Drop to nest</span>
        )}
      </motion.div>
      
      {/* Delete Folder Modal */}
      <DeleteFolderModal 
        isOpen={showDeleteModal} 
        onClose={closeDeleteModal} 
        folder={folder}
        bookmarkCount={bookmarkCount}
      />
    </>
  );
};

export default DraggableFolderItem;
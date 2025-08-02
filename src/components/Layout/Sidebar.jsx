import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import SafeIcon from '../../common/SafeIcon';
import { FiSearch, FiBookmark, FiStar, FiClock, FiTrash2, FiTag, FiChevronDown, FiChevronRight, FiLogOut, FiUser, FiPlus, FiFolder, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import useFolders from '../../hooks/useFolders';
import { useDragAndDrop } from '../../contexts/DragAndDropContext';
import { useBookmarkFilter } from '../../contexts/BookmarkFilterContext';
import { useTags } from '../../contexts/TagContext';
import FolderModal from '../Folders/FolderModal';
import DraggableFolderItem from '../Folders/DraggableFolderItem';
import ManageTagsModal from '../Tags/ManageTagsModal';

const Sidebar = ({ onNewBookmark }) => {
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [manageTagsModalOpen, setManageTagsModalOpen] = useState(false);
  const [showTagsContextMenu, setShowTagsContextMenu] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const { folders, loading: foldersLoading } = useFolders();
  const { tags, loading: tagsLoading } = useTags();
  const { isDragging, isDraggingFolder, activeBookmark, activeFolder: draggedFolder } = useDragAndDrop();
  const { activeFolder, setActiveFolder } = useBookmarkFilter();

  const handleFolderClick = (folderId) => {
    setActiveFolder(folderId);
  };

  const toggleTags = () => {
    setTagsExpanded(!tagsExpanded);
  };

  const toggleFolders = () => {
    setFoldersExpanded(!foldersExpanded);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const openFolderModal = () => {
    setFolderModalOpen(true);
  };

  const closeFolderModal = () => {
    setFolderModalOpen(false);
  };
  
  const openManageTagsModal = () => {
    setShowTagsContextMenu(false);
    setManageTagsModalOpen(true);
  };
  
  const closeManageTagsModal = () => {
    setManageTagsModalOpen(false);
  };
  
  const handleTagsMoreClick = (e) => {
    e.stopPropagation();
    setShowTagsContextMenu(true);
  };
  
  const handleClickOutside = () => {
    setShowTagsContextMenu(false);
  };

  // Droppable for trash folder
  const { setNodeRef: trashDropRef, isOver: isOverTrash } = useDroppable({
    id: 'trash',
  });

  return (
    <motion.aside
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="
        w-72 lg:w-80
        bg-gray-50 border-r border-gray-200
        rounded-r-xl lg:rounded-l-none
        shadow-medium lg:shadow-none
        flex flex-col
        h-screen sticky top-0
      "
    >
      <div className="flex-1 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              AuraMark
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiSearch} className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {currentUser.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                title="Logout"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {/* All Bookmarks */}
            <button
              onClick={() => handleFolderClick('all')}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 hover:bg-gray-200
                ${activeFolder === 'all' ? 'bg-gradient-to-r from-primary-50 to-white border-l-4 border-primary-600 pl-2' : ''}
              `}
            >
              <SafeIcon icon={FiBookmark} className={`mr-3 h-5 w-5 ${activeFolder === 'all' ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className={activeFolder === 'all' ? 'text-primary-800' : 'text-gray-700'}>All Bookmarks</span>
            </button>

            {/* Favorites */}
            <button
              onClick={() => handleFolderClick('favorites')}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 hover:bg-gray-200
                ${activeFolder === 'favorites' ? 'bg-gradient-to-r from-primary-50 to-white border-l-4 border-primary-600 pl-2' : ''}
              `}
            >
              <SafeIcon icon={FiStar} className={`mr-3 h-5 w-5 ${activeFolder === 'favorites' ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className={activeFolder === 'favorites' ? 'text-primary-800' : 'text-gray-700'}>Favorites</span>
            </button>

            {/* Recent */}
            <button
              onClick={() => handleFolderClick('recent')}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 hover:bg-gray-200
                ${activeFolder === 'recent' ? 'bg-gradient-to-r from-primary-50 to-white border-l-4 border-primary-600 pl-2' : ''}
              `}
            >
              <SafeIcon icon={FiClock} className={`mr-3 h-5 w-5 ${activeFolder === 'recent' ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className={activeFolder === 'recent' ? 'text-primary-800' : 'text-gray-700'}>Recent</span>
            </button>

            {/* Custom Folders */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={toggleFolders}
                  className={`
                    flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 hover:bg-gray-200
                  `}
                >
                  <div className="flex items-center">
                    <SafeIcon icon={FiFolder} className="mr-3 h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">Folders</span>
                  </div>
                  <SafeIcon
                    icon={foldersExpanded ? FiChevronDown : FiChevronRight}
                    className="h-4 w-4 text-gray-500"
                  />
                </button>
                
                <button 
                  onClick={openFolderModal}
                  className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-primary-600 transition-colors"
                  title="Add Folder"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                </button>
              </div>

              {/* Folders Submenu - Now with hierarchical display */}
              {foldersExpanded && (
                <div className="mt-1 ml-2 space-y-1">
                  {foldersLoading ? (
                    <div className="py-2 text-sm text-gray-500">Loading folders...</div>
                  ) : folders.length === 0 ? (
                    <div className="py-2 text-sm text-gray-500">No folders yet</div>
                  ) : (
                    folders.map(folder => (
                      <DraggableFolderItem
                        key={folder.id}
                        folder={folder}
                        level={folder.level || 0}
                        isActive={activeFolder === `folder-${folder.id}`}
                        isDragging={isDragging}
                        isDraggingFolder={isDraggingFolder}
                        onClick={() => handleFolderClick(`folder-${folder.id}`)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={toggleTags}
                  className={`
                    flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 hover:bg-gray-200
                  `}
                >
                  <div className="flex items-center">
                    <SafeIcon icon={FiTag} className="mr-3 h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">Tags</span>
                  </div>
                  <SafeIcon
                    icon={tagsExpanded ? FiChevronDown : FiChevronRight}
                    className="h-4 w-4 text-gray-500"
                  />
                </button>
                
                <button 
                  onClick={handleTagsMoreClick}
                  className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-primary-600 transition-colors"
                  title="Manage Tags"
                >
                  <SafeIcon icon={FiSettings} className="w-4 h-4" />
                </button>
              </div>
              
              {/* Tags Context Menu */}
              {showTagsContextMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={handleClickOutside}
                  ></div>
                  <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg z-30 py-1 border border-gray-200">
                    <button
                      onClick={openManageTagsModal}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Manage Tags
                    </button>
                  </div>
                </>
              )}

              {/* Tags Submenu - Dynamic based on actual tags */}
              {tagsExpanded && (
                <div className="mt-1 ml-8 space-y-1">
                  {tagsLoading ? (
                    <div className="py-2 text-xs text-gray-500">Loading tags...</div>
                  ) : tags.length === 0 ? (
                    <div className="py-2 text-xs text-gray-500">No tags yet</div>
                  ) : (
                    tags.map(tag => {
                      const isActive = activeFolder === `tag-${tag.name}`;
                      const [bgColorClass, textColorClass] = tag.color.split(' ');
                      
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleFolderClick(`tag-${tag.name}`)}
                          className={`
                            w-full flex items-center px-3 py-2 rounded-lg text-sm
                            transition-all duration-150 hover:bg-gray-200
                            ${isActive ? 'font-medium' : ''}
                          `}
                        >
                          <span className={`w-2 h-2 mr-2 rounded-full ${bgColorClass.replace('bg-', 'bg-')}`}></span>
                          <span className={isActive ? 'text-primary-600' : 'text-gray-600'}>
                            {tag.name}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Trash - Droppable */}
            <motion.button
              ref={trashDropRef}
              onClick={() => handleFolderClick('trash')}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 hover:bg-gray-200
                ${activeFolder === 'trash' ? 'bg-gradient-to-r from-primary-50 to-white border-l-4 border-primary-600 pl-2' : ''}
                ${isOverTrash && (isDragging || isDraggingFolder) ? 'ring-2 ring-red-500 bg-red-50' : ''}
              `}
              animate={{
                boxShadow: isOverTrash && (isDragging || isDraggingFolder) 
                  ? '0 0 0 2px rgba(239, 68, 68, 0.6)' 
                  : 'none',
                backgroundColor: isOverTrash && (isDragging || isDraggingFolder) 
                  ? 'rgba(254, 226, 226, 0.5)' 
                  : activeFolder === 'trash' 
                    ? 'rgba(243, 244, 246, 0.8)' 
                    : 'transparent'
              }}
            >
              <SafeIcon 
                icon={FiTrash2} 
                className={`mr-3 h-5 w-5 ${activeFolder === 'trash' 
                  ? 'text-primary-600' 
                  : isOverTrash && (isDragging || isDraggingFolder) 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`} 
              />
              <span className={
                activeFolder === 'trash' 
                  ? 'text-primary-800' 
                  : isOverTrash && (isDragging || isDraggingFolder) 
                    ? 'text-red-600' 
                    : 'text-gray-700'
              }>
                Trash
              </span>
              {isOverTrash && (isDragging || isDraggingFolder) && (
                <span className="ml-auto text-xs text-red-600">Drop to delete</span>
              )}
            </motion.button>
          </nav>
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            onClick={onNewBookmark}
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
            New Bookmark
          </button>
        </div>
      </div>
      
      {/* Folder Modal */}
      <FolderModal isOpen={folderModalOpen} onClose={closeFolderModal} />
      
      {/* Manage Tags Modal */}
      <ManageTagsModal isOpen={manageTagsModalOpen} onClose={closeManageTagsModal} />
    </motion.aside>
  );
};

export default Sidebar;
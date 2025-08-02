import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiStar, FiTag, FiCheck, FiExternalLink, FiFileText, FiTrash2, FiRefreshCw, FiMoreVertical } from 'react-icons/fi';
import useBookmarkOperations from '../../hooks/useBookmarkOperations';
import TagPill from './TagPill';
import { useSelection } from '../../contexts/SelectionContext';

const BookmarkListItem = ({ bookmark, isTrashView = false }) => {
  const { id, title, url, tags, type, isFavorite, isRead } = bookmark;
  const [showOptions, setShowOptions] = useState(false);
  
  const { toggleFavorite, restoreBookmark, deleteBookmark, loading } = useBookmarkOperations();
  const { isSelectionMode, toggleBookmarkSelection, isBookmarkSelected } = useSelection();
  
  const isSelected = isBookmarkSelected(id);
  
  // Helper function to generate a color based on the bookmark title
  const generateColor = (title) => {
    const colors = [
      'bg-blue-100 text-blue-500',
      'bg-green-100 text-green-500',
      'bg-yellow-100 text-yellow-500',
      'bg-purple-100 text-purple-500',
      'bg-pink-100 text-pink-500',
      'bg-indigo-100 text-indigo-500',
      'bg-red-100 text-red-500',
      'bg-orange-100 text-orange-500'
    ];
    
    // Use the sum of char codes to determine a consistent color
    const sum = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };
  
  // Split the color class into background and text color
  const colorClass = generateColor(title);
  const bgColor = colorClass.split(' ')[0];
  const textColor = colorClass.split(' ')[1];

  // Handle favorite toggle
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    await toggleFavorite(id, !isFavorite);
  };

  // Handle restore from trash
  const handleRestore = async (e) => {
    e.stopPropagation();
    await restoreBookmark(id);
  };

  // Handle permanent delete
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this bookmark?')) {
      await deleteBookmark(id);
    }
  };

  // Toggle options menu
  const toggleOptions = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // Hide options when clicking outside
  const hideOptions = () => {
    setShowOptions(false);
  };

  // Handle item click
  const handleItemClick = () => {
    if (isSelectionMode) {
      toggleBookmarkSelection(bookmark);
    } else {
      // Default item click behavior (open bookmark, etc.)
    }
  };

  return (
    <motion.div
      whileHover={{ 
        backgroundColor: '#f9fafb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
      transition={{ duration: 0.1 }}
      className={`
        bg-white border rounded-lg p-3 flex items-center relative cursor-pointer
        ${isSelected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-gray-100'}
      `}
      onMouseLeave={hideOptions}
      onClick={handleItemClick}
    >
      {/* Selection checkbox - only visible in selection mode */}
      {isSelectionMode && (
        <div className="mr-3">
          <div 
            className={`
              w-5 h-5 rounded-md flex items-center justify-center
              ${isSelected ? 'bg-primary-500' : 'bg-white border border-gray-300'}
            `}
          >
            {isSelected && <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" />}
          </div>
        </div>
      )}

      {/* Icon/Type indicator */}
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <SafeIcon 
          icon={type === 'link' ? FiExternalLink : FiFileText} 
          className={`w-5 h-5 ${textColor}`}
        />
      </div>
      
      {/* Content */}
      <div className="ml-3 flex-grow min-w-0">
        <h3 className="font-medium text-gray-900 mb-0.5 line-clamp-1">{title}</h3>
        
        {/* URL or metadata */}
        <div className="flex items-center text-xs text-gray-500 mb-1">
          {url ? (
            <span className="truncate max-w-sm">{url}</span>
          ) : (
            <span>Text note</span>
          )}
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag, index) => (
              <TagPill key={`${tag}-${index}`} tag={tag} size="xs" />
            ))}
          </div>
        )}
      </div>
      
      {/* Action buttons - only shown when not in selection mode */}
      {!isSelectionMode && (
        <div className="flex items-center ml-2 space-x-1">
          {isTrashView ? (
            <>
              <button 
                onClick={handleRestore}
                disabled={loading}
                className="p-1.5 rounded-md hover:bg-gray-100"
                aria-label="Restore bookmark"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4 text-green-500" />
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="p-1.5 rounded-md hover:bg-gray-100"
                aria-label="Delete permanently"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4 text-red-500" />
              </button>
            </>
          ) : (
            <>
              {type === 'link' && (
                <span className={`flex items-center text-xs ${isRead ? 'text-green-500' : 'text-gray-400'}`}>
                  <SafeIcon 
                    icon={FiCheck} 
                    className={`w-4 h-4 ${isRead ? 'text-green-500' : 'text-gray-400'}`}
                  />
                </span>
              )}
              <button 
                onClick={handleFavoriteToggle}
                disabled={loading}
                className="p-1.5 rounded-md hover:bg-gray-100"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <SafeIcon 
                  icon={FiStar} 
                  className={`w-4 h-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                />
              </button>
            </>
          )}
          
          <button
            onClick={toggleOptions}
            className="p-1.5 rounded-md hover:bg-gray-100"
            aria-label="More options"
          >
            <SafeIcon icon={FiMoreVertical} className="w-4 h-4 text-gray-500" />
          </button>
          
          {/* Options dropdown */}
          {showOptions && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
              {!isTrashView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle mark as read logic
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4 mr-2 text-gray-500" />
                  Mark as {isRead ? 'unread' : 'read'}
                </button>
              )}
              {isTrashView ? (
                <>
                  <button
                    onClick={handleRestore}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2 text-green-500" />
                    Restore
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                    Delete permanently
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Move to trash
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                  Move to trash
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BookmarkListItem;
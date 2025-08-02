import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import SafeIcon from '../../common/SafeIcon';
import { FiStar, FiCheck, FiMoreVertical, FiEdit, FiTrash2, FiFolder, FiLink, FiFileText, FiExternalLink, FiImage } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import useBookmarkOperations from '../../hooks/useBookmarkOperations';
import { useSelection } from '../../contexts/SelectionContext';

const BookmarkCard = ({ bookmark, isSelected, onSelect }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  
  const { toggleFavorite, toggleReadStatus, trashBookmark } = useBookmarkOperations();
  const { selectionMode } = useSelection();

  // Make the bookmark draggable
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `bookmark-${bookmark.id}`,
    data: {
      type: 'bookmark',
      bookmark
    },
    disabled: selectionMode // Disable dragging in selection mode
  });

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    await toggleFavorite(bookmark.id, !bookmark.isFavorite);
  };

  const handleReadClick = async (e) => {
    e.stopPropagation();
    await toggleReadStatus(bookmark.id, !bookmark.isRead);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowContextMenu(!showContextMenu);
  };

  const handleTrashClick = async (e) => {
    e.stopPropagation();
    setShowContextMenu(false);
    await trashBookmark(bookmark.id);
  };

  // Close context menu when clicking outside
  const handleClickOutside = () => {
    setShowContextMenu(false);
  };

  // Format the creation date
  const formattedDate = bookmark.createdAt 
    ? formatDistanceToNow(new Date(bookmark.createdAt.seconds * 1000), { addSuffix: true })
    : 'Recently';

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        relative flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden
        transition-all duration-200 h-full
        ${isDragging ? 'opacity-50 ring-2 ring-primary-300 shadow-md z-10' : ''}
        ${isSelected ? 'ring-2 ring-primary-500' : 'hover:shadow-md'}
        ${selectionMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
      `}
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.1)' : isSelected ? '0 0 0 2px rgba(99, 102, 241, 0.6)' : 'none'
      }}
      onClick={() => selectionMode && onSelect && onSelect(bookmark.id)}
      {...(selectionMode ? {} : { ...attributes, ...listeners })}
    >
      {/* Preview Image (if available) */}
      {bookmark.previewThumbnail && (
        <div className="relative h-32 bg-gray-100 overflow-hidden">
          <img 
            src={bookmark.previewThumbnail} 
            alt={bookmark.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide the image on error
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
              // Add a fallback icon
              const fallbackIcon = document.createElement('div');
              fallbackIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>`;
              e.target.parentElement.appendChild(fallbackIcon);
            }}
          />
        </div>
      )}
      
      {/* Card Content */}
      <div className="flex-1 p-4">
        {/* Type Badge */}
        <div className="flex items-center mb-2">
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
            ${bookmark.type === 'link' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
          `}>
            <SafeIcon 
              icon={bookmark.type === 'link' ? FiLink : FiFileText} 
              className="w-3 h-3 mr-1" 
            />
            {bookmark.type === 'link' ? 'Link' : 'Note'}
          </span>
          
          {/* Favorite Badge */}
          {bookmark.isFavorite && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              <SafeIcon icon={FiStar} className="w-3 h-3 mr-1 fill-amber-500" />
              Favorite
            </span>
          )}
          
          {/* Read Badge */}
          {bookmark.isRead && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              <SafeIcon icon={FiCheck} className="w-3 h-3 mr-1" />
              Read
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-1">
          {bookmark.title}
        </h3>
        
        {/* URL (for links) */}
        {bookmark.type === 'link' && bookmark.url && (
          <a 
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-primary-600 mb-2 block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {bookmark.url.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        )}
        
        {/* Description */}
        {bookmark.notes && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {bookmark.notes}
          </p>
        )}
        
        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {bookmark.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                #{tag}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        {/* Date */}
        <span className="text-xs text-gray-500">
          {formattedDate}
        </span>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`
              p-1.5 rounded-md transition-colors
              ${bookmark.isFavorite 
                ? 'text-amber-500 hover:bg-amber-50' 
                : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100'}
            `}
            title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <SafeIcon 
              icon={FiStar} 
              className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-amber-500' : ''}`} 
            />
          </button>
          
          {/* Read Button */}
          <button
            onClick={handleReadClick}
            className={`
              p-1.5 rounded-md transition-colors
              ${bookmark.isRead 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'}
            `}
            title={bookmark.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            <SafeIcon icon={FiCheck} className="w-4 h-4" />
          </button>
          
          {/* More Button */}
          <button
            onClick={handleMoreClick}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <SafeIcon icon={FiMoreVertical} className="w-4 h-4" />
          </button>
          
          {/* Context Menu */}
          {showContextMenu && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={handleClickOutside}
              ></div>
              <div className="absolute right-2 bottom-12 w-48 bg-white rounded-md shadow-lg z-30 py-1 border border-gray-200">
                <a 
                  href={bookmark.type === 'link' ? bookmark.url : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                    ${bookmark.type !== 'link' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={(e) => bookmark.type !== 'link' && e.preventDefault()}
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4 mr-3 text-gray-500" />
                  Open Link
                </a>
                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <SafeIcon icon={FiEdit} className="w-4 h-4 mr-3 text-gray-500" />
                  Edit
                </button>
                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <SafeIcon icon={FiFolder} className="w-4 h-4 mr-3 text-gray-500" />
                  Move
                </button>
                <button 
                  onClick={handleTrashClick}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-3 text-red-500" />
                  Move to Trash
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Selection Checkbox (visible in selection mode) */}
      {selectionMode && (
        <div className="absolute top-2 left-2">
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center
            ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white'}
          `}>
            {isSelected && (
              <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BookmarkCard;
import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiGrid, FiList, FiPlus, FiClock, FiCheckSquare, FiSquare, FiX } from 'react-icons/fi';
import { useBookmarkFilter } from '../../contexts/BookmarkFilterContext';
import { useSelection } from '../../contexts/SelectionContext';

const BookmarkHeader = ({ 
  viewMode, 
  setViewMode, 
  totalBookmarks, 
  folderName, 
  activeFolder, 
  onAddBookmark,
  bookmarks = []
}) => {
  const { recentTimeFrame, setRecentTimeFrame } = useBookmarkFilter();
  const { 
    isSelectionMode, 
    toggleSelectionMode, 
    selectedBookmarks, 
    selectAll, 
    deselectAll 
  } = useSelection();

  // Handle select all
  const handleSelectAll = () => {
    if (selectedBookmarks.length === bookmarks.length) {
      deselectAll();
    } else {
      selectAll(bookmarks);
    }
  };

  return (
    <div className="flex flex-col mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          {isSelectionMode ? (
            <div className="flex items-center">
              <button 
                onClick={handleSelectAll}
                className="p-1.5 rounded-md hover:bg-gray-100 mr-2"
                title={selectedBookmarks.length === bookmarks.length ? "Deselect all" : "Select all"}
              >
                <SafeIcon 
                  icon={selectedBookmarks.length === bookmarks.length ? FiCheckSquare : FiSquare} 
                  className="w-5 h-5 text-primary-600"
                />
              </button>
              <h1 className="text-xl font-bold text-gray-800">
                {selectedBookmarks.length} {selectedBookmarks.length === 1 ? 'item' : 'items'} selected
              </h1>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800">{folderName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {totalBookmarks} {totalBookmarks === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Selection mode toggle */}
          {!isSelectionMode && bookmarks.length > 0 && activeFolder !== 'trash' && (
            <button
              onClick={toggleSelectionMode}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-primary-600"
              aria-label="Enter selection mode"
              title="Select multiple bookmarks"
            >
              <SafeIcon icon={FiCheckSquare} className="w-5 h-5" />
            </button>
          )}
          
          {/* Cancel selection */}
          {isSelectionMode && (
            <button
              onClick={toggleSelectionMode}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Exit selection mode"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          )}
          
          {/* View toggle - only show when not in selection mode */}
          {!isSelectionMode && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Grid view"
              >
                <SafeIcon icon={FiGrid} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="List view"
              >
                <SafeIcon icon={FiList} className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Add new bookmark button - hide in trash view and selection mode */}
          {!isSelectionMode && activeFolder !== 'trash' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAddBookmark}
              className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1.5" />
              Add Bookmark
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Recent time frame selector - only show when not in selection mode */}
      {!isSelectionMode && activeFolder === 'recent' && (
        <div className="mt-4 mb-2">
          <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setRecentTimeFrame('24h')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                recentTimeFrame === '24h' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => setRecentTimeFrame('7d')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                recentTimeFrame === '7d' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setRecentTimeFrame('30d')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                recentTimeFrame === '30d' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkHeader;
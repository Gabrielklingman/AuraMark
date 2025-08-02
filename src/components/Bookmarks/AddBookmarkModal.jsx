import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import useFolders from '../../hooks/useFolders';
import { useTags } from '../../contexts/TagContext';
import useUrlMetadata from '../../hooks/useUrlMetadata';
import TagPill from './TagPill';
import {
  FiX,
  FiLink,
  FiFileText,
  FiPlus,
  FiSearch,
  FiFolder,
  FiStar,
  FiCheck,
  FiTag,
  FiLoader,
  FiImage,
  FiRefreshCw
} from 'react-icons/fi';

const AddBookmarkModal = ({ isOpen, onClose, onBookmarkAdded }) => {
  const [bookmarkType, setBookmarkType] = useState('link');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [notes, setNotes] = useState('');
  const [folderSearch, setFolderSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataFetched, setMetadataFetched] = useState(false);

  const { currentUser } = useAuth();
  const { folders, loading: foldersLoading } = useFolders();
  const { tags: allTags, getTagColor } = useTags();
  const { getUrlMetadata, loading: metadataLoading, error: metadataError } = useUrlMetadata();

  // Filter folders based on search
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(folderSearch.toLowerCase())
  );

  // Handle URL input changes and metadata fetching
  useEffect(() => {
    // Reset metadata state when URL changes
    setMetadataFetched(false);
  }, [url]);

  // Handle metadata fetching
  const handleFetchMetadata = async () => {
    if (!url || isFetchingMetadata || metadataFetched) return;

    setIsFetchingMetadata(true);
    setError('');

    try {
      const metadata = await getUrlMetadata(url);
      
      if (metadata) {
        // Only update title if it's currently empty
        if (!title && metadata.title) {
          setTitle(metadata.title);
        }
        
        // Update description/notes if available and empty
        if (!notes && metadata.description) {
          setNotes(metadata.description);
        }
        
        // Set thumbnail preview
        if (metadata.image) {
          setPreviewThumbnail(metadata.image);
        }
        
        setMetadataFetched(true);
      }
    } catch (err) {
      setError('Failed to fetch URL metadata. You can still continue with manual entry.');
      console.error('Error fetching metadata:', err);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Auto-fetch metadata when URL is entered and title is empty
  useEffect(() => {
    const autoFetchMetadataTimeout = setTimeout(() => {
      if (bookmarkType === 'link' && url && !title && !metadataFetched && !isFetchingMetadata) {
        handleFetchMetadata();
      }
    }, 1000); // Delay to avoid excessive API calls while typing

    return () => clearTimeout(autoFetchMetadataTimeout);
  }, [url, title, bookmarkType, metadataFetched, isFetchingMetadata]);

  // Handle tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      addTag();
      e.preventDefault();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const addExistingTag = (tag) => {
    if (!selectedTags.includes(tag.name)) {
      setSelectedTags([...selectedTags, tag.name]);
    }
  };

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to save bookmarks');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare bookmark data
      const bookmarkData = {
        type: bookmarkType,
        title: title || (bookmarkType === 'link' ? url : 'Untitled Note'),
        url: bookmarkType === 'link' ? url : null,
        textContent: bookmarkType === 'text' ? textContent : null,
        notes,
        folderId: selectedFolder?.id || null,
        tags: selectedTags,
        isFavorite,
        isRead,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        previewThumbnail: bookmarkType === 'link' ? previewThumbnail : null
      };
      
      // Save to Firestore
      const userBookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
      const docRef = await addDoc(userBookmarksRef, bookmarkData);
      
      console.log('Bookmark saved with ID:', docRef.id);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
      // Notify parent component that a bookmark was added
      if (onBookmarkAdded) {
        onBookmarkAdded();
      }
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError('Failed to save bookmark. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setBookmarkType('link');
    setUrl('');
    setTitle('');
    setTextContent('');
    setNotes('');
    setFolderSearch('');
    setSelectedFolder(null);
    setTagInput('');
    setSelectedTags([]);
    setIsFavorite(false);
    setIsRead(false);
    setError('');
    setPreviewThumbnail(null);
    setMetadataFetched(false);
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Add New Bookmark</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Input Type Selection */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`
                          flex items-center justify-center px-6 py-5 rounded-xl
                          ${bookmarkType === 'link' 
                            ? 'bg-primary-50 ring-2 ring-primary-500 text-primary-700' 
                            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'}
                          transition-all duration-200
                        `}
                        onClick={() => setBookmarkType('link')}
                      >
                        <SafeIcon icon={FiLink} className="w-5 h-5 mr-2" />
                        <span className="font-medium">Link</span>
                      </button>
                      
                      <button
                        type="button"
                        className={`
                          flex items-center justify-center px-6 py-5 rounded-xl
                          ${bookmarkType === 'text' 
                            ? 'bg-primary-50 ring-2 ring-primary-500 text-primary-700' 
                            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'}
                          transition-all duration-200
                        `}
                        onClick={() => setBookmarkType('text')}
                      >
                        <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2" />
                        <span className="font-medium">Text</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Input Forms - Link */}
                  {bookmarkType === 'link' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                          URL <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="url"
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            required
                          />
                          {url && !metadataFetched && (
                            <button
                              type="button"
                              onClick={handleFetchMetadata}
                              disabled={isFetchingMetadata || !url}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors"
                              title="Fetch URL metadata"
                            >
                              <SafeIcon 
                                icon={isFetchingMetadata ? FiLoader : FiRefreshCw} 
                                className={`w-4 h-4 ${isFetchingMetadata ? 'animate-spin' : ''}`} 
                              />
                            </button>
                          )}
                        </div>
                        {isFetchingMetadata && (
                          <p className="mt-1 text-xs text-primary-600">
                            Fetching page information...
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="Enter a title for this bookmark"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      {/* Preview Thumbnail */}
                      {previewThumbnail && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preview Image
                          </label>
                          <div className="relative mt-1 rounded-lg border border-gray-300 overflow-hidden w-full max-w-xs h-32">
                            <img 
                              src={previewThumbnail} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={() => setPreviewThumbnail(null)}
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewThumbnail(null)}
                              className="absolute top-1 right-1 p-1 bg-white/80 rounded-md hover:bg-white text-gray-700"
                              title="Remove preview image"
                            >
                              <SafeIcon icon={FiX} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Content Input Forms - Text */}
                  {bookmarkType === 'text' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label htmlFor="text-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                          id="text-title"
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="Enter a title for this note"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-1">
                          Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="text-content"
                          value={textContent}
                          onChange={e => setTextContent(e.target.value)}
                          placeholder="Enter your text content here..."
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          rows="4"
                          required
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Notes Field */}
                  <div className="mb-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes/Description <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Add any additional notes or description..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      rows="3"
                    />
                  </div>
                  
                  {/* Folder Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Add to Folder
                      </label>
                    </div>
                    
                    {/* Folder Search */}
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SafeIcon icon={FiSearch} className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={folderSearch}
                        onChange={e => setFolderSearch(e.target.value)}
                        placeholder="Search folders..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                    
                    {/* Folders Gallery */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                      {foldersLoading ? (
                        <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                          Loading folders...
                        </div>
                      ) : filteredFolders.length === 0 ? (
                        <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                          {folderSearch ? 'No matching folders found' : 'No folders created yet'}
                        </div>
                      ) : (
                        filteredFolders.map((folder) => (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => setSelectedFolder(selectedFolder?.id === folder.id ? null : folder)}
                            className={`
                              flex items-center px-3 py-2 rounded-lg text-sm
                              transition-all duration-200
                              ${selectedFolder?.id === folder.id 
                                ? 'ring-2 ring-primary-500 bg-primary-50' 
                                : 'bg-white border border-gray-200 hover:bg-gray-50'}
                            `}
                          >
                            <span className={`w-2 h-2 rounded-full ${folder.color.split(' ')[0]} mr-2`}></span>
                            <span className="truncate">{folder.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Tagging Option */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Tags
                    </label>
                    
                    {/* Tag Input */}
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SafeIcon icon={FiTag} className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="Type tag and press Enter..."
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        disabled={!tagInput.trim()}
                        className={`
                          absolute inset-y-0 right-0 flex items-center px-3
                          ${tagInput.trim() ? 'text-primary-600 hover:text-primary-800' : 'text-gray-300'}
                          transition-colors
                        `}
                      >
                        <SafeIcon icon={FiPlus} className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTags.map((tag, index) => (
                          <TagPill key={`${tag}-${index}`} tag={tag} onRemove={removeTag} />
                        ))}
                      </div>
                    )}
                    
                    {/* Existing Tags */}
                    {allTags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Available Tags:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allTags.map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => addExistingTag(tag)}
                              className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${tag.color} hover:opacity-80 transition-opacity
                                ${selectedTags.includes(tag.name) ? 'opacity-50' : ''}
                              `}
                              disabled={selectedTags.includes(tag.name)}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Toggles */}
                  <div className="flex items-center space-x-4 mb-6">
                    {/* Favorite Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`
                        flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isFavorite 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}
                      `}
                    >
                      <SafeIcon icon={FiStar} className={`h-4 w-4 mr-1.5 ${isFavorite ? 'fill-amber-500' : ''}`} />
                      {isFavorite ? 'Favorited' : 'Add to Favorites'}
                    </button>
                    
                    {/* Read/Done Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsRead(!isRead)}
                      className={`
                        flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isRead 
                          ? 'bg-green-50 text-green-600 border border-green-200' 
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}
                      `}
                    >
                      <SafeIcon icon={FiCheck} className={`h-4 w-4 mr-1.5 ${isRead ? 'text-green-500' : ''}`} />
                      {isRead ? 'Marked as Read' : 'Mark as Read'}
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg text-white font-medium hover:from-primary-700 hover:to-primary-600 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                      {isSubmitting ? (
                        <>
                          <SafeIcon icon={FiLoader} className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Bookmark'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddBookmarkModal;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiX, FiTag, FiPlus, FiLoader } from 'react-icons/fi';
import { useTags } from '../../contexts/TagContext';
import { useSelection } from '../../contexts/SelectionContext';
import TagPill from './TagPill';

const TagSelectionModal = ({ isOpen, onClose, onTagsSelect }) => {
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  const { tags: existingTags, loading: tagsLoading } = useTags();
  const { selectedBookmarks, loading } = useSelection();

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

  const toggleExistingTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      removeTag(tagName);
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // Apply selected tags
  const handleApplyTags = async () => {
    if (selectedTags.length > 0) {
      await onTagsSelect(selectedTags);
    }
    setSelectedTags([]);
    setTagInput('');
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
                <h2 className="text-xl font-semibold text-gray-800">Add Tags</h2>
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
                  Add tags to {selectedBookmarks.length} bookmark{selectedBookmarks.length > 1 ? 's' : ''}
                </p>
                
                {/* Tag Input */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiTag} className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type tag and press Enter..."
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                  <button
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
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Selected Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag, index) => (
                        <TagPill key={`selected-${tag}-${index}`} tag={tag} onRemove={removeTag} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Existing Tags */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Available Tags:</p>
                  {tagsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <SafeIcon icon={FiLoader} className="w-5 h-5 text-primary-500 animate-spin" />
                      <span className="ml-2 text-gray-500">Loading tags...</span>
                    </div>
                  ) : existingTags.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No existing tags</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {existingTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleExistingTag(tag.name)}
                          className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${tag.color} 
                            ${selectedTags.includes(tag.name) 
                              ? 'ring-2 ring-primary-500' 
                              : 'hover:opacity-80'}
                            transition-all
                          `}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
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
                <button
                  onClick={handleApplyTags}
                  disabled={selectedTags.length === 0 || loading}
                  className={`
                    px-4 py-2 rounded-lg transition-colors
                    ${selectedTags.length === 0 || loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'}
                  `}
                >
                  {loading ? (
                    <>
                      <SafeIcon icon={FiLoader} className="inline w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Tags'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TagSelectionModal;
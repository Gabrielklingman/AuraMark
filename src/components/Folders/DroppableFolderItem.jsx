import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import SafeIcon from '../../common/SafeIcon';

const DroppableFolderItem = ({ 
  folder, 
  isActive, 
  isDragging, 
  onClick 
}) => {
  // This is now correctly at the top level of the component
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
  });

  return (
    <motion.button
      ref={setNodeRef}
      onClick={onClick}
      className={`
        w-full flex items-center px-3 py-2 rounded-lg text-sm
        transition-all duration-150 hover:bg-gray-200
        ${isActive ? 'text-primary-600 font-medium' : 'text-gray-600'}
        ${isOver && isDragging ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
      `}
      animate={{
        boxShadow: isOver && isDragging 
          ? '0 0 0 2px rgba(99, 102, 241, 0.6)' 
          : 'none',
        backgroundColor: isOver && isDragging 
          ? 'rgba(237, 233, 254, 0.5)' 
          : isActive 
            ? 'rgba(243, 244, 246, 0.8)' 
            : 'transparent'
      }}
    >
      <span className={`w-2 h-2 mr-2 rounded-full ${folder.color.split(' ')[0]}`}></span>
      <span className="truncate">{folder.name}</span>
      {isOver && isDragging && (
        <span className="ml-auto text-xs text-primary-600">Drop here</span>
      )}
    </motion.button>
  );
};

export default DroppableFolderItem;
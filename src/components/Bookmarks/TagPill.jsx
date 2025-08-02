import React from 'react';
import { useTags } from '../../contexts/TagContext';

const TagPill = ({ tag, onRemove, size = 'sm' }) => {
  const { getTagColor } = useTags();
  const colorClass = getTagColor(tag);
  
  // Size variations
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${colorClass} ${sizeClasses[size]}
      `}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-1 rounded-full hover:bg-white/30 p-0.5"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default TagPill;
import React from 'react';

const SafeIcon = ({ icon: IconComponent, className = '', ...props }) => {
  if (!IconComponent) {
    return null;
  }
  
  return <IconComponent className={className} {...props} />;
};

export default SafeIcon;
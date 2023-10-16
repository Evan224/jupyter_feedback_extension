import React from 'react';

const Tooltip = ({ content, position, onClose }) => {
  const style = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    background: 'lightgray',
    border: '1px solid black',
    padding: '5px',
    zIndex: 1000,
  };

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target !== e.currentTarget) {return;}
      onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div style={style}>
      {content}
    </div>
  );
};

export default Tooltip;

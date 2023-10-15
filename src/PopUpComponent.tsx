import { FC, useEffect } from 'react';

interface IPopupProps {
  top: number;
  left: number;
  onButtonClick: () => void;
}

export const PopupComponent: FC<IPopupProps> = ({ top, left, onButtonClick }) => {
  useEffect(() => {
    // This will run when component mounts and cleanup on unmount
    return () => {
      // Any cleanup logic can go here
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        padding: '5px',
        zIndex: 1000,
      }}
    >
      <button onClick={onButtonClick}>Rate</button>
    </div>
  );
};

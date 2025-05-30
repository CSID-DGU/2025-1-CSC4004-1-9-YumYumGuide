import React from 'react';

interface HeaderProps {
  goBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ goBack }) => {
  return (
    <div className="flex items-center pt-6 px-6 pb-4">
      <button 
        onClick={goBack}
        className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-5 text-lg"
      >
        &lt;
      </button>
      <h1 className="text-xl font-bold">새로운 일정</h1>
    </div>
  );
};

export default Header; 
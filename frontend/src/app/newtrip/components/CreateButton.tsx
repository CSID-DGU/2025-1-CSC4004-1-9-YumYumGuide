import React from 'react';

interface CreateButtonProps {
  onClick: () => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({ onClick }) => {
  return (
    <button className="create-button" onClick={onClick}>
      <span className="mr-2">🚀</span>
      일정 생성하기
    </button>
  );
};

export default CreateButton; 
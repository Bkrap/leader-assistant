import React from 'react';

interface ChoiceProps {
  selectedOutput: string;
  onChange: (choice: string) => void;
}

const Choice: React.FC<ChoiceProps> = ({ selectedOutput, onChange }) => {
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
    console.log("Dropdown value changed to:", event.target.value);
  };

  return (
    <div className='flex flex-col w-2/12 mb-4'>
      <label className='font-bold mb-2' htmlFor="choiceDropdown">Select output:</label>
      <select
        id="selectedOutput"
        value={selectedOutput}
        onChange={handleDropdownChange}
        className="rounded-lg border-blue-200 border-solid border-2 p-2 mb-4"
      >
        <option value="text">Text</option>
        <option value="voice">Voice</option>
      </select>
    </div>
  );
};

export default Choice;

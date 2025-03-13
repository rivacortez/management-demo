import React from 'react';

interface StyledDropdownProps {
  value: string | number;
  options?: Array<string | number>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  className?: string;
}

const StyledDropdown: React.FC<StyledDropdownProps> = ({ 
  value, 
  options = [], 
  onChange, 
  label, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && <span className="text-muted-foreground text-sm">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="bg-background text-foreground border border-input rounded px-2 py-1 text-sm appearance-none pr-8 hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        >
          {Array.isArray(options) && options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StyledDropdown;
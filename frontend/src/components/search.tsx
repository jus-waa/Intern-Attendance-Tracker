import React from 'react';
import { Search } from 'lucide-react';

interface SearchComponentProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  className = "",
  width = "w-50"
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`font-xs px-4 py-2 border rounded-full ${width} shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10`}
      />
      <Search className="w-5 h-5 text-gray-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
    </div>
  );
};

export default SearchComponent;
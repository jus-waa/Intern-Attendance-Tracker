//schools.tsx
import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, University } from "lucide-react";

type SchoolDropdownProps = {
  data: { abbreviation: string }[];
  activeSchool: string;
  onSchoolChange: (school: string) => void;
};

const SchoolDropdown: React.FC<SchoolDropdownProps> = ({
  data,
  activeSchool,
  onSchoolChange,
}) => {
  const [uniqueSchools, setUniqueSchools] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const abbreviationMap = new Map<string, string>();

    data.forEach((item) => {
      const key = item.abbreviation.toLowerCase();
      if (!abbreviationMap.has(key)) {
        abbreviationMap.set(key, item.abbreviation);
      }
    });

    const schoolsArray = Array.from(abbreviationMap.values());
    setUniqueSchools(schoolsArray);

    if (schoolsArray.length > 0 && !activeSchool) {
      onSchoolChange(schoolsArray[0]); // select first by default
    }
  }, [data]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="items-center relative inline-block" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-2 pr-10 text-sm 
                  focus:outline-none focus:ring-1 focus:ring-teal-500 hover:bg-gray-100 cursor-pointer"
      >
        <University className="w-4 h-4 text-gray-600 inline-block mr-2 mb-1" />
        {activeSchool || "Select University"}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 
                      transition-transform duration-200 pointer-events-none ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div 
          className="absolute mt-1 min-w-full bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
          {uniqueSchools.map((school) => (
            <div
              key={school}
              onClick={() => {
                onSchoolChange(school);
                setIsOpen(false);
              }}
              className={`flex bg-white px-3 py-2 text-gray-600 text-sm cursor-pointer text-left hover:bg-gray-100 ${
                school === activeSchool ? "" : ""
              }`}
            >
              {school}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolDropdown;
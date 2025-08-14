import React, { useEffect, useState } from "react";

type SchoolTabsProps = {
  data: { abbreviation: string }[];  // any array with an abbreviation field
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const SchoolTabs: React.FC<SchoolTabsProps> = ({ data, activeTab, onTabChange }) => {
  const [uniqueSchools, setUniqueSchools] = useState<string[]>([]);

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

    if (schoolsArray.length > 0 && !activeTab) {
      onTabChange(schoolsArray[0]); // select first by default
    }
  }, [data]);

  return (
    <div className="flex gap-2 mb-4">
      {uniqueSchools.map((school) => (
        <button
          key={school}
          onClick={() => onTabChange(school)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition
            ${activeTab === school
              ? "bg-teal-500 text-white border-teal-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          {school}
        </button>
      ))}
    </div>
  );
};

export default SchoolTabs;

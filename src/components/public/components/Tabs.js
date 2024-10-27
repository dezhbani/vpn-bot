import React, { useState } from 'react';

// Reusable Tabs component
const Tabs = ({ tabs }) => {
  // Check if tabs array is provided and has at least one item, otherwise default to an empty array
  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].label : '');

  // Function to handle tab changes
  const handleTabChange = (tabLabel) => {
    setActiveTab(tabLabel);
  };

  return (
    <div className="w-full mx-5 dir-rtl mt-5 font-iran-sans">
      {/* Tab headers */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.label)}
            className={`px-4 py-2 -mb-px text-md font-semibold ${
              activeTab === tab.label ? 'text-main-blue border-b-2 border-main-blue' : 'text-gray-600'
            } focus:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 mt-4">
        {tabs.map((tab) => (
          activeTab === tab.label && (
            <div key={tab.label}>
              {tab.content}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Tabs;

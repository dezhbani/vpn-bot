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
    <div className="w-full p-5 dir-rtl font-iran-sans bg-white shadow-[2px_4px_30px_0px_#00000010] rounded-2xl">
      {/* Tab headers */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.label)}
            className={`px-4 py-2 -mb-px text-md font-semibold ${activeTab === tab.label ? 'text-main-blue border-b-2 border-main-blue' : 'text-gray-600'
              } focus:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="w-full">
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

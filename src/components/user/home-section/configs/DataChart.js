import React from 'react'

const DataChart = ({data}) => {
    console.log(data);
    
    const usage = data?.up + data?.down
    const percentage = Math.floor((usage / data?.total) * 100)
    // console.log();
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
    return (
        <div className="flex mx-5 items-center">
            <svg
                className="w-64 h-w-64 transform -rotate-90"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
            >
            <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#f1f1f1"
                strokeWidth="8"
                fill="transparent"
            />
            <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#0095FF"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress || 0}
                className="text-blue-500 transition-all duration-300"
            />
            <text
                x="60"
                y="60"
                textAnchor="middle"
                dy=".3em"
                className="text-xl text-blue font-bold"
                transform="rotate(90, 60, 60)"  
                >
                {percentage}%
            </text>
            </svg>
        </div>
    )
}

export default DataChart;
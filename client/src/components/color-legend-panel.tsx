import React, { useState, useEffect } from "react";

interface ColorLegendPanelProps {
  className?: string;
}

export function ColorLegendPanel({ className = "" }: ColorLegendPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const today = currentTime.getDay();
  
  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('en-MY', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = currentTime.toLocaleTimeString('en-MY', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });
  
  // Color mappings for each day
  const stockInColors = {
    1: "#3B82F6", // Monday - Blue
    2: "#F97316", // Tuesday - Orange  
    3: "#8B4513", // Wednesday - Brown
    4: "#10B981", // Thursday - Green
    5: "#8B5CF6", // Friday - Purple
    6: "#EC4899", // Saturday - Pink
    0: "#EAB308", // Sunday - Yellow
  };
  
  const moveFrontColors = {
    1: "#EAB308", // Monday - Yellow
    2: "#3B82F6", // Tuesday - Blue
    3: "#F97316", // Wednesday - Orange
    4: "#8B4513", // Thursday - Brown
    5: "#10B981", // Friday - Green
    6: "#8B5CF6", // Saturday - Purple
    0: "#EC4899", // Sunday - Pink
  };
  
  const expiredColors = {
    1: "#EC4899", // Monday - Pink
    2: "#EAB308", // Tuesday - Yellow
    3: "#3B82F6", // Wednesday - Blue
    4: "#F97316", // Thursday - Orange
    5: "#8B4513", // Friday - Brown
    6: "#10B981", // Saturday - Green
    0: "#8B5CF6", // Sunday - Purple
  };

  const dayNames = {
    0: "Ahad",
    1: "Isnin", 
    2: "Selasa",
    3: "Rabu",
    4: "Khamis",
    5: "Jumaat",
    6: "Sabtu"
  };

  const colorNames = {
    "#3B82F6": "Blue",
    "#F97316": "Orange",
    "#8B4513": "Brown", 
    "#10B981": "Green",
    "#8B5CF6": "Purple",
    "#EC4899": "Pink",
    "#EAB308": "Yellow"
  };

  return (
    <div className={`bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-lg p-6 shadow-sm max-w-4xl w-full ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 text-center">
        Daily Color Legend
      </h3>
      <div className="text-xs text-slate-600 dark:text-slate-400 mb-4 text-center">
        {formattedDate} | {formattedTime}
      </div>
      
      {/* Divider below date/time */}
      <div className="border-t border-gray-300 dark:border-gray-600 my-5" />
      
      {/* Table for Today's Colors */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="py-2 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Category</th>
              <th className="py-2 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">Color</th>
              <th className="py-2 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">Name</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-transparent hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Stock In</td>
              <td className="py-3 px-4 text-center">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/50 shadow-sm mx-auto"
                  style={{ backgroundColor: stockInColors[today as keyof typeof stockInColors] }}
                />
              </td>
              <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                {colorNames[stockInColors[today as keyof typeof stockInColors] as keyof typeof colorNames]}
              </td>
            </tr>
            <tr className="border-b border-transparent hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Move Front</td>
              <td className="py-3 px-4 text-center">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/50 shadow-sm mx-auto"
                  style={{ backgroundColor: moveFrontColors[today as keyof typeof moveFrontColors] }}
                />
              </td>
              <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                {colorNames[moveFrontColors[today as keyof typeof moveFrontColors] as keyof typeof colorNames]}
              </td>
            </tr>
            <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Expired</td>
              <td className="py-3 px-4 text-center">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/50 shadow-sm mx-auto"
                  style={{ backgroundColor: expiredColors[today as keyof typeof expiredColors] }}
                />
              </td>
              <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                {colorNames[expiredColors[today as keyof typeof expiredColors] as keyof typeof colorNames]}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Full Week Schedule (Collapsible) */}
      <details className="mt-[5px]">
        <summary className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-left mt-[5px]">
          View Full Week Schedule
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Day</th>
                <th className="py-2 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">Stock In</th>
                <th className="py-2 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">Move Front</th>
                <th className="py-2 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">Expired</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(dayNames).map((dayKey) => {
                const day = parseInt(dayKey);
                const isToday = day === today;
                return (
                  <tr 
                    key={day} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      isToday 
                        ? 'bg-blue-100/50 dark:bg-blue-900/30 font-medium' 
                        : 'hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {dayNames[day as keyof typeof dayNames]}
                      {isToday && <span className="ml-2 text-blue-600 dark:text-blue-400 text-[10px]">(Today)</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: stockInColors[day as keyof typeof stockInColors] }}
                        />
                        <span className="text-slate-600 dark:text-slate-400">
                          {colorNames[stockInColors[day as keyof typeof stockInColors] as keyof typeof colorNames]}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: moveFrontColors[day as keyof typeof moveFrontColors] }}
                        />
                        <span className="text-slate-600 dark:text-slate-400">
                          {colorNames[moveFrontColors[day as keyof typeof moveFrontColors] as keyof typeof colorNames]}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: expiredColors[day as keyof typeof expiredColors] }}
                        />
                        <span className="text-slate-600 dark:text-slate-400">
                          {colorNames[expiredColors[day as keyof typeof expiredColors] as keyof typeof colorNames]}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
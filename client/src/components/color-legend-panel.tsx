import React from "react";

interface ColorLegendPanelProps {
  className?: string;
}

export function ColorLegendPanel({ className = "" }: ColorLegendPanelProps) {
  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay();
  const now = new Date();
  
  // Format date and time
  const formattedDate = now.toLocaleDateString('en-MY', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = now.toLocaleTimeString('en-MY', { 
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
    <div className={`bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-lg p-6 shadow-sm ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 text-center">
        Daily Color Legend
      </h3>
      <div className="text-xs text-slate-600 dark:text-slate-400 mb-6 text-center">
        {formattedDate} | {formattedTime}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stock In */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Stock In:</span>
            <div 
              className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
              style={{ backgroundColor: stockInColors[today as keyof typeof stockInColors] }}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {colorNames[stockInColors[today as keyof typeof stockInColors] as keyof typeof colorNames]}
            </span>
          </div>
        </div>

        {/* Move Front */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Move Front:</span>
            <div 
              className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
              style={{ backgroundColor: moveFrontColors[today as keyof typeof moveFrontColors] }}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {colorNames[moveFrontColors[today as keyof typeof moveFrontColors] as keyof typeof colorNames]}
            </span>
          </div>
        </div>

        {/* Expired */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Expired:</span>
            <div 
              className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
              style={{ backgroundColor: expiredColors[today as keyof typeof expiredColors] }}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {colorNames[expiredColors[today as keyof typeof expiredColors] as keyof typeof colorNames]}
            </span>
          </div>
        </div>
      </div>

      {/* Full Week Schedule (Collapsible) */}
      <details className="mt-4">
        <summary className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          View Full Week Schedule
        </summary>
        <div className="mt-3 space-y-2 text-xs">
          {Object.keys(dayNames).map((dayKey) => {
            const day = parseInt(dayKey);
            const isToday = day === today;
            return (
              <div key={day} className={`grid grid-cols-3 gap-4 p-2 rounded ${isToday ? 'bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[50px]">
                    {dayNames[day as keyof typeof dayNames]}:
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: stockInColors[day as keyof typeof stockInColors] }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: moveFrontColors[day as keyof typeof moveFrontColors] }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: expiredColors[day as keyof typeof expiredColors] }}
                    />
                  </div>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {isToday && <span className="text-blue-600 dark:text-blue-400 font-medium">(Today)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
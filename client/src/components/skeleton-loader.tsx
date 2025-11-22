import { useState, useEffect } from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  className?: string;
}

interface SkeletonRowProps {
  columns?: number;
  index?: number;
}

interface SkeletonCellProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonCell({ width = "w-full", height = "h-4", className = "" }: SkeletonCellProps) {
  return (
    <div className={`skeleton ${width} ${height} ${className}`} data-testid="skeleton-cell" />
  );
}

export function SkeletonRow({ columns = 7, index = 0 }: SkeletonRowProps) {
  return (
    <tr className={`skeleton-row fade-in-stagger border-b border-border/20`} data-testid={`skeleton-row-${index}`}>
      {/* Actions column */}
      <td className="p-3 w-16">
        <div className="flex gap-1 justify-center">
          <SkeletonCell width="w-8" height="h-8" className="rounded-md" />
          <SkeletonCell width="w-8" height="h-8" className="rounded-md" />
          <SkeletonCell width="w-8" height="h-8" className="rounded-md" />
          <SkeletonCell width="w-8" height="h-8" className="rounded-md" />
        </div>
      </td>

      {/* No column */}
      <td className="p-3 w-16">
        <SkeletonCell width="w-8" height="h-4" className="mx-auto" />
      </td>

      {/* Dynamic columns */}
      {Array.from({ length: columns - 2 }).map((_, colIndex) => (
        <td key={colIndex} className="p-3">
          {colIndex === 1 ? ( // Location column (spans 3)
            <SkeletonCell width="w-32" height="h-4" />
          ) : colIndex === 2 || colIndex === 3 ? null : ( // Skip for colspan
            <SkeletonCell width={colIndex === 0 ? "w-16" : "w-20"} height="h-4" />
          )}
        </td>
      ))}
    </tr>
  );
}

export function SkeletonLoader({ rows = 5, columns = 7, className = "" }: SkeletonLoaderProps) {
  return (
    <div className={`w-full ${className}`} data-testid="skeleton-loader">
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonRow key={index} columns={columns} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Initializing");
  
  const tips = [
    "💡 Add images to your rows for visual reference",
    "🔗 Share your table with custom links",
    "🎨 Customize marker colors on the map",
    "📊 Drag and drop rows to reorder",
    "🗺️ View delivery routes with Google Maps",
    "📸 Upload images from gallery or URL",
    "🔄 Toggle between delivery alternates",
    "📍 Calculate distances automatically",
    "💾 Save your table layout preferences",
    "🎯 Filter routes by delivery schedule"
  ];

  useEffect(() => {
    // Random tip rotation - change every 800ms
    const tipInterval = setInterval(() => {
      setCurrentTip(Math.floor(Math.random() * tips.length));
    }, 800);

    // Progress animation - 5 seconds total (0 to 100%)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2; // Increment by 2% every 100ms = 5 seconds total
      });
    }, 100);

    // Update loading status based on progress
    const statusInterval = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress < 20) {
          setLoadingStatus("Initializing");
        } else if (currentProgress < 40) {
          setLoadingStatus("Loading data");
        } else if (currentProgress < 60) {
          setLoadingStatus("Processing");
        } else if (currentProgress < 80) {
          setLoadingStatus("Almost there");
        } else if (currentProgress < 95) {
          setLoadingStatus("Finalizing");
        } else {
          setLoadingStatus("Complete");
        }
        return currentProgress;
      });
    }, 100);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div className="table-loading-overlay" data-testid="loading-overlay">
      <div className="flex flex-col items-center gap-8 zoom-in">
        {/* iOS-style Spinner with Logo */}
        <div className="relative">
          {/* Main logo container with FamilyMart logo */}
          <div className="w-28 h-28 flex items-center justify-center relative">
            <img 
              src="/assets/FamilyMart.png" 
              alt="FamilyMart Logo" 
              className="w-24 h-24 object-contain relative z-10"
            />
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '2s' }}></div>
          </div>
          
          {/* iOS-style primary spinner ring */}
          <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-blue-500 border-r-blue-400/70 border-b-blue-300/40 animate-spin" 
               style={{ animationDuration: '0.8s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }}>
          </div>
          
          {/* Secondary ring for depth */}
          <div className="absolute inset-0 -m-2 rounded-full border-[3px] border-transparent border-t-blue-400/50 border-r-blue-300/30 animate-spin" 
               style={{ animationDuration: '1.2s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }}>
          </div>
          
          {/* Outer pulsing glow ring */}
          <div className="absolute inset-0 -m-4 rounded-full border-[2px] border-blue-500/20 animate-ping" 
               style={{ animationDuration: '2s' }}>
          </div>
        </div>
        
        {/* Tips with smooth transition */}
        <div className="text-center">
          <div className="text-sm text-blue-200/90 font-medium transition-all duration-500 ease-in-out">
            {tips[currentTip]}
          </div>
        </div>
        
        {/* iOS-style Animated progress bar */}
        <div className="w-72 space-y-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50 transition-all duration-100 ease-linear relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Moving shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-blue-200/70 font-medium">
            <span>{loadingStatus}</span>
            <span className="font-mono font-bold tabular-nums">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InlineLoading({ size = "sm", type = "spinner" }: { size?: "sm" | "lg"; type?: "spinner" | "triple" | "particles" }) {
  if (type === "triple") {
    return (
      <div className="loading-triple-bounce" data-testid="inline-loading">
        <div className="bounce" />
        <div className="bounce" />
        <div className="bounce" />
      </div>
    );
  }
  
  if (type === "particles") {
    return <div className="loading-particles" data-testid="inline-loading" />;
  }
  
  return (
    <div className={`${size === "lg" ? "loading-spinner-lg" : "loading-spinner"}`} data-testid="inline-loading" />
  );
}

// Simple navigation spinner - iOS style for button back/navigation only
export function NavigationSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="text-center space-y-8">
        {/* iOS-style spinner container */}
        <div className="relative inline-block">
          {/* Main logo with subtle pulse */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <img 
              src="/assets/FamilyMart.png" 
              alt="FamilyMart Logo" 
              className="w-20 h-20 object-contain"
            />
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl animate-pulse" style={{ animationDuration: '2s' }}></div>
          </div>
          
          {/* iOS-style rotating ring - single clean ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-blue-400/60 border-b-blue-300/30 animate-spin" 
               style={{ animationDuration: '0.8s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }}>
          </div>
          
          {/* Second ring for depth - slower */}
          <div className="absolute inset-0 -m-1 rounded-full border-[2px] border-transparent border-t-blue-400/40 border-r-blue-300/20 animate-spin" 
               style={{ animationDuration: '1.2s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }}>
          </div>
        </div>
        
        {/* iOS-style loading dots - clean and minimal */}
        <div className="flex gap-2 justify-center items-center h-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50" 
               style={{ animationDelay: '0ms', animationDuration: '0.6s' }}>
          </div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50" 
               style={{ animationDelay: '150ms', animationDuration: '0.6s' }}>
          </div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50" 
               style={{ animationDelay: '300ms', animationDuration: '0.6s' }}>
          </div>
        </div>
        
        {/* Optional loading text - iOS style */}
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse" style={{ animationDuration: '2s' }}>
          Loading...
        </div>
      </div>
    </div>
  );
}

export function LoadingDots({ type = "wave" }: { type?: "dots" | "wave" | "triple" }) {
  if (type === "wave") {
    return (
      <div className="loading-wave" data-testid="loading-dots">
        <div className="wave-dot" />
        <div className="wave-dot" />
        <div className="wave-dot" />
        <div className="wave-dot" />
        <div className="wave-dot" />
      </div>
    );
  }
  
  if (type === "triple") {
    return (
      <div className="loading-triple-bounce" data-testid="loading-dots">
        <div className="bounce" />
        <div className="bounce" />
        <div className="bounce" />
      </div>
    );
  }
  
  return (
    <span className="loading-dots" data-testid="loading-dots">
      Loading
    </span>
  );
}

// Awesome loading showcase component
export function AwesomeLoadingShowcase() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-card/50 rounded-lg border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="loading-morphing" />
        <span className="text-xs text-muted-foreground">Morphing</span>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="loading-pulse-glow" />
        <span className="text-xs text-muted-foreground">Pulse Glow</span>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="loading-orbit" />
        <span className="text-xs text-muted-foreground">Orbit</span>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="loading-wave">
          <div className="wave-dot" />
          <div className="wave-dot" />
          <div className="wave-dot" />
          <div className="wave-dot" />
          <div className="wave-dot" />
        </div>
        <span className="text-xs text-muted-foreground">Wave</span>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="loading-particles" />
        <span className="text-xs text-muted-foreground">Particles</span>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="loading-triple-bounce">
          <div className="bounce" />
          <div className="bounce" />
          <div className="bounce" />
        </div>
        <span className="text-xs text-muted-foreground">Triple Bounce</span>
      </div>
    </div>
  );
}


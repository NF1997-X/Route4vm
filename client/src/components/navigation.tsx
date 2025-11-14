import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Save, DoorOpen, Rows, Receipt, Layout, Sun, Moon, Bookmark, Plus, ChevronDown, Menu, BookOpen, LayoutGrid, ListChecks, Edit2, Table2, Link2, Sparkles, ArrowLeft, ChevronLeft, Palette } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { AddColumnModal } from "./add-column-modal";

interface NavigationProps {
  editMode?: boolean;
  onEditModeRequest?: () => void;
  onShowCustomization?: () => void;
  onAddRow?: () => void;
  onSaveData?: () => void;
  onGenerateTng?: () => void;
  onAddColumn?: (columnData: { name: string; dataKey: string; type: string; options?: string[] }) => Promise<void>;
  onOptimizeRoute?: () => void;
  onCalculateTolls?: () => void;
  onSaveLayout?: () => void;
  onSavedLinks?: () => void;
  onShowTutorial?: () => void;
  onBulkColorModal?: () => void;
  onClearAllData?: () => void;
  isAuthenticated?: boolean;
}

export function Navigation({ editMode, onEditModeRequest, onShowCustomization, onAddRow, onSaveData, onGenerateTng, onAddColumn, onOptimizeRoute, onCalculateTolls, onSaveLayout, onSavedLinks, onShowTutorial, onBulkColorModal, onClearAllData, isAuthenticated }: NavigationProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [submenuType, setSubmenuType] = useState<'vm-route' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        console.log('ESC pressed - closing menu');
        setIsMenuOpen(false);
        setShowSubmenu(false);
        setSubmenuType(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleString('en-US', options);
  };

  const handleSubmenuOpen = (type: 'vm-route') => {
    setSubmenuType(type);
    setTimeout(() => {
      setShowSubmenu(true);
    }, 50);
  };

  const handleBackToMenu = () => {
    setShowSubmenu(false);
    setTimeout(() => {
      setSubmenuType(null);
    }, 250);
  };

  const handleNavigationClick = (action: () => void) => {
    try {
      action();
      setTimeout(() => {
        setIsMenuOpen(false);
        setShowSubmenu(false);
        setSubmenuType(null);
      }, 200);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleSubmenuNavigation = (action: () => void) => {
    try {
      // Execute action first
      action();
    } catch (error) {
      console.error('Submenu navigation error:', error);
    }
    
    // Always go back to main menu, don't close dropdown
    setShowSubmenu(false);
    setTimeout(() => {
      setSubmenuType(null);
    }, 250);
  };

  const renderMainMenu = () => (
    <div className="p-3 space-y-2">
      {/* Vm Route Menu Item */}
      <div 
        onClick={() => handleSubmenuOpen('vm-route')}
        className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
        data-testid="menu-edit-page"
      >
        <div className="flex items-center w-full p-3">
          <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
            <Edit2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:rotate-12 transition-all duration-500" />
          </div>
          <div className="ml-3 flex-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300">Vm Route</span>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Manage routes & tables</p>
          </div>
          <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 text-purple-500 transition-all duration-300 ml-2" />
        </div>
      </div>

      {/* Theme Toggle */}
      <div 
        onClick={() => handleNavigationClick(toggleTheme)}
        className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
        data-testid="menu-toggle-theme"
      >
        <div className="flex items-center w-full p-3">
          {theme === 'dark' ? (
            <>
              <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 group-hover:rotate-180 transition-all duration-500" />
              </div>
              <div className="ml-3 flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-colors duration-300">Light Mode</span>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Switch to light theme</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                <Moon className="w-5 h-5 text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:rotate-180 transition-all duration-500" />
              </div>
              <div className="ml-3 flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">Dark Mode</span>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Switch to dark theme</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
            </>
          )}
        </div>
      </div>

      {/* Help Guide */}
      <div 
        onClick={() => handleNavigationClick(() => navigate('/help'))}
        className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
        data-testid="menu-help-guide"
      >
        <div className="flex items-center w-full p-3">
          <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 group-hover:rotate-12 transition-all duration-500" />
          </div>
          <div className="ml-3 flex-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors duration-300">User Guide</span>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Help & documentation</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
        </div>
      </div>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"></div>

      {/* Edit Mode Options */}
      {editMode ? (
        <>
          <div 
            onClick={() => handleNavigationClick(() => onAddRow && onAddRow())}
            className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
            data-testid="menu-add-row"
          >
            <div className="flex items-center w-full p-3">
              <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                <Rows className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:rotate-12 transition-all duration-500" />
              </div>
              <div className="ml-3 flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">Add Row</span>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Insert new table row</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
            </div>
          </div>

          {onAddColumn && (
            <div 
              onClick={() => handleNavigationClick(() => {
                const addColumnButton = document.querySelector('[data-testid="button-add-column"]') as HTMLButtonElement;
                if (addColumnButton) addColumnButton.click();
              })}
              className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
              data-testid="menu-add-column"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                  <Plus className="w-5 h-5 text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 group-hover:rotate-90 transition-all duration-500" />
                </div>
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors duration-300">Add Column</span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Create new column</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
              </div>
            </div>
          )}

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-red-200/30 to-transparent dark:via-red-700/30"></div>

          <div 
            onClick={() => handleNavigationClick(() => onEditModeRequest && onEditModeRequest())}
            className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
            data-testid="menu-exit-edit"
          >
            <div className="flex items-center w-full p-3">
              <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                <DoorOpen className="w-5 h-5 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 group-hover:rotate-12 transition-all duration-500" />
              </div>
              <div className="ml-3 flex-1">
                <span className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors duration-300">Exit Edit Mode</span>
                <p className="text-xs text-red-500/70 dark:text-red-400/70 mt-0.5">Return to view mode</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
            </div>
          </div>
        </>
      ) : (
        <div 
          onClick={() => handleNavigationClick(() => onEditModeRequest && onEditModeRequest())}
          className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
          data-testid="menu-enter-edit"
        >
          <div className="flex items-center w-full p-3">
            <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
              <Settings className="w-5 h-5 text-red-900 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 group-hover:rotate-90 transition-all duration-500" />
            </div>
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors duration-300">Edit Mode</span>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Enable table editing</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVmRouteSubmenu = () => (
    <div className="h-full">
      {/* Back Button */}
      <div className="px-3 py-3 border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-white/5 to-transparent dark:from-white/3 dark:to-transparent">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 group rounded"
          onClick={handleBackToMenu}
        >
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm font-medium">Back</span>
        </Button>
      </div>
      
      <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
        {editMode && (
          <>
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Bulk Color Modal clicked');
                handleSubmenuNavigation(() => {
                  console.log('Opening bulk color modal');
                  onBulkColorModal && onBulkColorModal();
                });
              }}
              className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
              data-testid="submenu-bulk-color"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                  <Palette className="w-5 h-5 text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">Bulk Color Marker</span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Edit marker colors by route</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
              </div>
            </div>

            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clear All Data clicked');
                handleSubmenuNavigation(() => {
                  console.log('Opening clear data confirmation');
                  onClearAllData && onClearAllData();
                });
              }}
              className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
              data-testid="submenu-clear-data"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                  <Database className="w-5 h-5 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors duration-300">Clear All Data</span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Delete all rows for fresh start</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
              </div>
            </div>

            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Share Link clicked');
                handleSubmenuNavigation(() => {
                  console.log('Navigating to share');
                  navigate('/share/tzqe9a');
                });
              }}
              className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
              data-testid="submenu-share-example"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                  <Receipt className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">Share Link Page</span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Example page</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
              </div>
            </div>
            
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Custom Page clicked');
                handleSubmenuNavigation(() => {
                  console.log('Navigating to custom');
                  navigate('/custom/8m2v27');
                });
              }}
              className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
              data-testid="submenu-custom-example"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
                  <Sparkles className="w-5 h-5 text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors duration-300">Custom Page</span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Example page</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
              </div>
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"></div>
          </>
        )}
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleSubmenuNavigation(() => navigate('/custom-tables'));
          }}
          className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
          data-testid="submenu-custom-list"
        >
          <div className="flex items-center w-full p-3">
            <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
              <Layout className="w-5 h-5 text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:rotate-12 transition-all duration-500" />
            </div>
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">All Custom Tables</span>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Manage your tables</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
          </div>
        </div>
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            console.log('Saved Links clicked');
            handleSubmenuNavigation(() => {
              console.log('Executing onSavedLinks');
              onSavedLinks && onSavedLinks();
            });
          }}
          className="cursor-pointer group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300 ease-out hover:scale-[1.02] transform rounded"
          data-testid="submenu-saved-links"
        >
          <div className="flex items-center w-full p-3">
            <div className="flex items-center justify-center w-10 h-10 transition-all duration-500">
              <Bookmark className="w-5 h-5 text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 group-hover:rotate-12 transition-all duration-500" />
            </div>
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors duration-300">All Saved Links</span>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Your bookmarks</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between text-[12px]">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm overflow-hidden">
                <img 
                  src="/assets/Logofm.png" 
                  alt="Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-0 leading-tight">
                <span className="font-bold text-slate-600 dark:text-slate-300 leading-none" style={{ fontSize: '12px' }}>
                  {editMode ? "Edit Mode" : "Route Management"}
                </span>
                <span className="text-slate-400 dark:text-slate-500 leading-none my-0.5" style={{ fontSize: '9px' }}>
                  All in one data informations
                </span>
              </div>
            </div>
          </div>

          {/* Navigation - Custom Menu Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="btn-glass w-8 h-8 md:w-auto md:h-9 p-0 md:px-3 pagination-button group transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/20"
              data-testid="button-main-menu"
              title="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-all duration-300" />
              <span className="hidden md:inline ml-2 text-xs transition-all duration-300">Menu</span>
            </Button>
            
            {/* Custom Dropdown Content */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-[80vh] bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-2xl animate-in fade-in-0 zoom-in-95 duration-400 ease-out overflow-hidden z-50">
                {/* Glass Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none rounded-2xl"></div>
                
                {/* Content Container */}
                <div className="relative z-10 overflow-hidden">
                  {/* Main Menu - Always rendered but conditionally visible */}
                  <div className={`transition-all duration-500 ease-in-out ${showSubmenu ? 'transform -translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'}`}>
                    {renderMainMenu()}
                  </div>

                  {/* Submenu Overlay - Positioned absolutely */}
                  <div className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${showSubmenu ? 'transform translate-x-0 opacity-100 pointer-events-auto' : 'transform translate-x-full opacity-0 pointer-events-none'}`}>
                    {submenuType === 'vm-route' && renderVmRouteSubmenu()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Click outside overlay */}
            {isMenuOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                onClick={() => {
                  console.log('Clicked outside - closing menu');
                  setIsMenuOpen(false);
                  setShowSubmenu(false);
                  setSubmenuType(null);
                }}
              />
            )}
          </div>

          {/* Hidden Add Column Modal */}
          {editMode && onAddColumn && (
            <div className="hidden">
              <AddColumnModal
                onCreateColumn={onAddColumn}
                disabled={!isAuthenticated}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
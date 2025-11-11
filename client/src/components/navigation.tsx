import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Save, DoorOpen, Rows, Receipt, Layout, Sun, Moon, Bookmark, Plus, ChevronDown, Menu, BookOpen, LayoutGrid, ListChecks, Edit2, Table2, Link2, Sparkles, ArrowLeft, ChevronLeft } from "lucide-react";
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
  isAuthenticated?: boolean;
}

export function Navigation({ editMode, onEditModeRequest, onShowCustomization, onAddRow, onSaveData, onGenerateTng, onAddColumn, onOptimizeRoute, onCalculateTolls, onSaveLayout, onSavedLinks, onShowTutorial, isAuthenticated }: NavigationProps) {
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
        className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-indigo-200/30 dark:hover:border-indigo-800/30"
        data-testid="menu-edit-page"
      >
        <div className="flex items-center w-full p-3">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-indigo-500/10 dark:bg-indigo-500/20 group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/30 transition-all duration-300">
            <Edit2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 group-hover:rotate-12 transition-all duration-300" />
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
        className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-yellow-200/30 dark:hover:border-blue-800/30"
        data-testid="menu-toggle-theme"
      >
        <div className="flex items-center w-full p-3">
          {theme === 'dark' ? (
            <>
              <div className="flex items-center justify-center w-10 h-10 rounded bg-yellow-500/10 dark:bg-yellow-500/20 group-hover:bg-yellow-500/20 dark:group-hover:bg-yellow-500/30 transition-all duration-300">
                <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-all duration-500" />
              </div>
              <div className="ml-3 flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-300 transition-colors duration-300">Light Mode</span>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Switch to light theme</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"></div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-10 h-10 rounded bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-all duration-300">
                <Moon className="w-5 h-5 text-blue-500 group-hover:rotate-180 transition-all duration-500" />
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
        className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-green-200/30 dark:hover:border-green-800/30"
        data-testid="menu-help-guide"
      >
        <div className="flex items-center w-full p-3">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-green-500/10 dark:bg-green-500/20 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-all duration-300">
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:rotate-12 transition-all duration-300" />
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
            className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-blue-200/30 dark:hover:border-blue-800/30"
            data-testid="menu-add-row"
          >
            <div className="flex items-center w-full p-3">
              <div className="flex items-center justify-center w-10 h-10 rounded bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-all duration-300">
                <Rows className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:rotate-12 transition-all duration-300" />
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
              className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-green-200/30 dark:hover:border-green-800/30"
              data-testid="menu-add-column"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-green-500/10 dark:bg-green-500/20 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-all duration-300">
                  <Plus className="w-5 h-5 text-green-500 dark:text-green-400 group-hover:rotate-90 transition-all duration-300" />
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
            className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 group hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-red-200/30 dark:hover:border-red-800/30"
            data-testid="menu-exit-edit"
          >
            <div className="flex items-center w-full p-3">
              <div className="flex items-center justify-center w-10 h-10 rounded bg-red-500/10 dark:bg-red-500/20 group-hover:bg-red-500/20 dark:group-hover:bg-red-500/30 transition-all duration-300">
                <DoorOpen className="w-5 h-5 text-red-500 dark:text-red-400 group-hover:rotate-12 transition-all duration-300" />
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
          className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-red-200/30 dark:hover:border-red-800/30"
          data-testid="menu-enter-edit"
        >
          <div className="flex items-center w-full p-3">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-red-500/10 dark:bg-red-500/20 group-hover:bg-red-500/20 dark:group-hover:bg-red-500/30 transition-all duration-300">
              <Settings className="w-5 h-5 text-red-900 dark:text-red-400 group-hover:rotate-90 transition-all duration-300" />
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
      {/* Back to Menu Button */}
      <div className="px-3 py-3 border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-white/5 to-transparent dark:from-white/3 dark:to-transparent">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 group rounded backdrop-blur"
          onClick={handleBackToMenu}
        >
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm font-medium">Back to Menu</span>
        </Button>
      </div>
      
      <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
        {editMode && (
          <>
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
              className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-blue-200/30 dark:hover:border-blue-800/30"
              data-testid="submenu-share-example"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-all duration-300">
                  <Link2 className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:rotate-12 transition-all duration-300" />
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
              className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-green-200/30 dark:hover:border-green-800/30"
              data-testid="submenu-custom-example"
            >
              <div className="flex items-center w-full p-3">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-green-500/10 dark:bg-green-500/20 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-all duration-300">
                  <Table2 className="w-5 h-5 text-green-500 dark:text-green-400 group-hover:rotate-12 transition-all duration-300" />
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
          className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-purple-200/30 dark:hover:border-purple-800/30"
          data-testid="submenu-custom-list"
        >
          <div className="flex items-center w-full p-3">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-purple-500/10 dark:bg-purple-500/20 group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-all duration-300">
              <ListChecks className="w-5 h-5 text-purple-500 dark:text-purple-400 group-hover:rotate-12 transition-all duration-300" />
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
          className="cursor-pointer group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-out hover:scale-[1.02] transform rounded backdrop-blur border border-transparent hover:border-amber-200/30 dark:hover:border-amber-800/30"
          data-testid="submenu-saved-links"
        >
          <div className="flex items-center w-full p-3">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-amber-500/10 dark:bg-amber-500/20 group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/30 transition-all duration-300">
              <Bookmark className="w-5 h-5 text-amber-500 dark:text-amber-400 group-hover:rotate-12 transition-all duration-300" />
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
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
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
              <div className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_32px_64px_0_rgba(0,0,0,0.35)] rounded-3xl animate-in fade-in-0 zoom-in-95 duration-400 ease-out overflow-hidden z-50">
                {/* Glass Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/5 dark:via-white/2 dark:to-transparent pointer-events-none rounded-3xl"></div>
                
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
                className="fixed inset-0 z-40"
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
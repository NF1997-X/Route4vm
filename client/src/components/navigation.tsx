import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Save, DoorOpen, Rows, Receipt, Layout, Sun, Moon, Bookmark, Plus, ChevronDown, Menu, BookOpen, LayoutGrid, ListChecks, Edit2, Edit3, Table2, Link2, Sparkles, ArrowLeft, ChevronLeft, Palette } from "lucide-react";
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
    <div className="p-3 space-y-0.5">
      {/* Vm Route Menu Item - iOS Sidebar Style */}
      <div 
        onClick={() => handleSubmenuOpen('vm-route')}
        className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
        data-testid="menu-edit-page"
      >
        <div className="flex items-center w-full px-3 py-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 mr-3">
            <Edit2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Vm Route</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0 -rotate-90" />
        </div>
      </div>

      {/* Theme Toggle - iOS Sidebar Style */}
      <div 
        onClick={() => handleNavigationClick(toggleTheme)}
        className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
        data-testid="menu-toggle-theme"
      >
        <div className="flex items-center w-full px-3 py-2.5">
          {theme === 'dark' ? (
            <>
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 mr-3">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Light Mode</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-purple-700 mr-3">
                <Moon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Dark Mode</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help Guide - iOS Sidebar Style */}
      <div 
        onClick={() => handleNavigationClick(() => navigate('/help'))}
        className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
        data-testid="menu-help-guide"
      >
        <div className="flex items-center w-full px-3 py-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 mr-3">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">User Guide</span>
          </div>
        </div>
      </div>

      <div className="my-2 h-px bg-gray-200 dark:bg-gray-700"></div>

      {/* Edit Mode Options - iOS Sidebar Style */}
      {editMode ? (
        <>
          <div 
            onClick={() => handleNavigationClick(() => onAddRow && onAddRow())}
            className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
            data-testid="menu-add-row"
          >
            <div className="flex items-center w-full px-3 py-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 mr-3">
                <Rows className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Add Row</span>
              </div>
            </div>
          </div>

          {onAddColumn && (
            <div 
              onClick={() => handleNavigationClick(() => {
                const addColumnButton = document.querySelector('[data-testid="button-add-column"]') as HTMLButtonElement;
                if (addColumnButton) addColumnButton.click();
              })}
              className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
              data-testid="menu-add-column"
            >
              <div className="flex items-center w-full px-3 py-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 mr-3">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Add Column</span>
                </div>
              </div>
            </div>
          )}

          <div className="my-2 h-px bg-gray-200 dark:bg-gray-700"></div>

          <div 
            onClick={() => handleNavigationClick(() => onEditModeRequest && onEditModeRequest())}
            className="cursor-pointer group rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 dark:active:bg-red-900/30 transition-all duration-150"
            data-testid="menu-exit-edit"
          >
            <div className="flex items-center w-full px-3 py-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-red-500 to-red-600 mr-3">
                <DoorOpen className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-red-600 dark:text-red-400 leading-tight">Exit Edit Mode</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div 
          onClick={() => handleNavigationClick(() => onEditModeRequest && onEditModeRequest())}
          className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
          data-testid="menu-enter-edit"
        >
          <div className="flex items-center w-full px-3 py-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 mr-3">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Edit Mode</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVmRouteSubmenu = () => (
    <div className="h-full">
      {/* Back Button */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-all duration-150 rounded-lg"
          onClick={handleBackToMenu}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </Button>
      </div>
      
      <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
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
              className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
              data-testid="submenu-bulk-color"
            >
              <div className="flex items-center w-full px-3 py-2.5 pl-12">
                <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Bulk Color</span>
                </div>
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
              className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
              data-testid="submenu-clear-data"
            >
              <div className="flex items-center w-full px-3 py-2.5 pl-12">
                <Database className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Clear Data</span>
                </div>
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
              className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
              data-testid="submenu-share-example"
            >
              <div className="flex items-center w-full px-3 py-2.5 pl-12">
                <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Share Link</span>
                </div>
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
              className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
              data-testid="submenu-custom-example"
            >
              <div className="flex items-center w-full px-3 py-2.5 pl-12">
                <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Custom Page</span>
                </div>
              </div>
            </div>

            <div className="my-2 h-px bg-gray-200 dark:bg-gray-700"></div>
          </>
        )}
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleSubmenuNavigation(() => navigate('/custom-tables'));
          }}
          className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
          data-testid="submenu-custom-list"
        >
          <div className="flex items-center w-full px-3 py-2.5 pl-12">
            <Layout className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Custom Tables</span>
            </div>
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
          className="cursor-pointer group rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 active:bg-gray-200/80 dark:active:bg-gray-700/60 transition-all duration-150"
          data-testid="submenu-saved-links"
        >
          <div className="flex items-center w-full px-3 py-2.5 pl-12">
            <Bookmark className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Saved Links</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop blur overlay - only when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all duration-300"
          onClick={() => {
            console.log('Clicked outside - closing menu');
            setIsMenuOpen(false);
            setShowSubmenu(false);
            setSubmenuType(null);
          }}
        />
      )}

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
              <div className="absolute right-0 top-full mt-2 w-80 max-h-[80vh] bg-white/95 dark:bg-gray-950/95 backdrop-blur-3xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-2xl animate-in fade-in-0 zoom-in-95 duration-400 ease-out overflow-hidden z-50">
                {/* Glass Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-white/10 dark:from-white/5 dark:via-white/3 dark:to-transparent pointer-events-none rounded-2xl"></div>
                
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
    </>
  );
}
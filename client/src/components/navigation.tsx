import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, Save, DoorOpen, Rows, Receipt, Layout, Sun, Moon, Bookmark, Plus, ChevronDown, Menu, BookOpen, LayoutGrid, ListChecks, Edit2, Edit3, Table2, Link2, Sparkles, ArrowLeft, ChevronLeft, Palette } from "lucide-react";
import { useLocation } from "wouter";
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
    <div className="p-2 space-y-1">
      {/* Vm Route Menu Item - iOS Style */}
      <div 
        onClick={() => handleSubmenuOpen('vm-route')}
        className="cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-150"
        data-testid="menu-edit-page"
      >
        <div className="flex items-center w-full px-3 py-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 mr-3 shadow-sm">
            <Edit2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Vm Route</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0 -rotate-90" />
        </div>
      </div>

      {/* Help Guide - iOS Style */}
      <div 
        onClick={() => handleNavigationClick(() => navigate('/help'))}
        className="cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-150"
        data-testid="menu-help-guide"
      >
        <div className="flex items-center w-full px-3 py-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 mr-3 shadow-sm">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">User Guide</span>
          </div>
        </div>
      </div>

      <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"></div>

      {/* Edit Mode Options - iOS Style */}
      {editMode ? (
        <>
          <div 
            onClick={() => handleNavigationClick(() => onAddRow && onAddRow())}
            className="cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-150"
            data-testid="menu-add-row"
          >
            <div className="flex items-center w-full px-3 py-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mr-3 shadow-sm">
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
              className="cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-150"
              data-testid="menu-add-column"
            >
              <div className="flex items-center w-full px-3 py-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 mr-3 shadow-sm">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">Add Column</span>
                </div>
              </div>
            </div>
          )}

          <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"></div>

          <div 
            onClick={() => handleNavigationClick(() => onEditModeRequest && onEditModeRequest())}
            className="cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors duration-150"
            data-testid="menu-exit-edit"
          >
            <div className="flex items-center w-full px-3 py-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 mr-3 shadow-sm">
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
          className="cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-150"
          data-testid="menu-enter-edit"
        >
          <div className="flex items-center w-full px-3 py-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 mr-3 shadow-sm">
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

      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-blue-200/40 dark:border-white/5 bg-white/60 dark:bg-gray-950/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-950/60 shadow-sm dark:shadow-black/30">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between text-[12px]">
          {/* Logo/Brand - iOS Style */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 hover:opacity-85 transition-opacity duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-sm dark:shadow-black/20">
                <img 
                  src="/assets/Logofm.png" 
                  alt="Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-0 leading-tight">
                <span className="font-semibold text-gray-900 dark:text-slate-100 leading-none" style={{ fontSize: '12px' }}>
                  {editMode ? "Edit Mode" : "Route VM"}
                </span>
                <span className="text-gray-500 dark:text-slate-400 leading-none my-0.5" style={{ fontSize: '9px' }}>
                  Data Management
                </span>
              </div>
            </div>
          </div>

          {/* Navigation - iOS Menu Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-800 border border-gray-200/60 dark:border-white/10 w-8 h-8 md:w-auto md:h-9 p-0 md:px-3 rounded-lg transition-all duration-200 hover:shadow-md dark:hover:shadow-black/40 active:scale-95"
              data-testid="button-main-menu"
              title="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-4 h-4 text-gray-700 dark:text-gray-300 transition-all duration-300" />
              <span className="hidden md:inline ml-2 text-xs text-gray-700 dark:text-gray-300 font-medium transition-all duration-300">Menu</span>
            </Button>
            
            {/* iOS-Style Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 max-h-[80vh] bg-white/98 dark:bg-gray-950/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 shadow-2xl shadow-black/15 dark:shadow-black/50 rounded-2xl animate-in fade-in-0 zoom-in-95 duration-300 ease-out overflow-hidden z-50">
                {/* Premium Glass Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/30 to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent pointer-events-none rounded-2xl"></div>
                
                {/* Content Container with dividers */}
                <div className="relative z-10 overflow-hidden" style={{ maxHeight: 'calc(80vh - 20px)' }}>
                  {/* Main Menu - Always visible, no transform */}
                  <div className={`transition-opacity duration-300 ease-in-out overflow-y-auto scrollbar-hide ${showSubmenu ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ maxHeight: 'calc(80vh - 20px)' }}>
                    {renderMainMenu()}
                  </div>

                  {/* Submenu Overlay - Slides from right to left */}
                  <div className={`absolute top-0 left-0 w-full h-full bg-white/98 dark:bg-gray-950/95 transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide ${showSubmenu ? 'transform translate-x-0 opacity-100 pointer-events-auto' : 'transform translate-x-full opacity-0 pointer-events-none'}`}>
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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnHeader } from "./column-header";
import { EditableCell } from "./editable-cell";
import { ImageLightbox } from "./image-lightbox";
import { InfoModal } from "./info-modal";
import { SlidingDescription } from "./sliding-description";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronRight,
  GripVertical,
  PlusCircle,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Search,
  Filter,
  X,
  MapPin,
  Route,
  Share2,
  Power,
  Trash,
  ZoomIn,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  SkeletonLoader,
  LoadingOverlay,
  InlineLoading,
} from "./skeleton-loader";
import { TableRow as TableRowType, TableColumn } from "@shared/schema";
import { UseMutationResult } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Simple mobile-friendly tooltip component
interface MobileTooltipProps {
  content: string;
  children: React.ReactNode;
  showBelow?: boolean;
}

function MobileTooltip({ content, children, showBelow = false }: MobileTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device supports touch
    const checkIsMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      setIsVisible(!isVisible);
      // Auto-hide after 3 seconds on mobile
      setTimeout(() => setIsVisible(false), 3000);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsVisible(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isMobile ? 'cursor-pointer' : 'cursor-help'}`}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 z-[1] ${showBelow ? 'top-full mt-1' : 'bottom-full mb-1'}`}>
          <div className="px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap">
            {content}
          </div>
          <div className={`absolute left-1/2 transform -translate-x-1/2 border-4 border-transparent ${showBelow ? 'bottom-full border-b-gray-900' : 'top-full border-t-gray-900'}`} />
        </div>
      )}
    </div>
  );
}

interface DataTableProps {
  rows: TableRowType[];
  columns: TableColumn[];
  editMode: boolean;
  isSharedView?: boolean; // Flag to indicate if this is a shared table view
  hideShareButton?: boolean; // Hide share button in shared view
  disablePagination?: boolean; // Disable pagination and show all rows
  onUpdateRow: UseMutationResult<
    any,
    Error,
    { id: string; updates: Partial<any> },
    unknown
  >;
  onDeleteRow: UseMutationResult<void, Error, string, unknown>;
  onReorderRows: UseMutationResult<TableRowType[], Error, string[], unknown>;
  onReorderColumns: UseMutationResult<TableColumn[], Error, string[], unknown>;
  onDeleteColumn: UseMutationResult<void, Error, string, unknown>;
  onSelectRowForImage: (rowId: string) => void;
  onShowCustomization?: () => void;
  onOptimizeRoute?: () => void;
  onShareTable?: () => void;
  onSavedLinks?: () => void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  isFiltered?: boolean;
  // Search and filter props
  searchTerm?: string;
  onSearchTermChange?: (term: string) => void;
  filterValue?: string[];
  onFilterValueChange?: (filters: string[]) => void;
  deliveryFilterValue?: string[];
  onDeliveryFilterValueChange?: (filters: string[]) => void;
  routeOptions?: string[];
  deliveryOptions?: string[];
  onClearAllFilters?: () => void;
  filteredRowsCount?: number;
  totalRowsCount?: number;
}

// SlightTable utility class for managing column visibility and horizontal scroll
class SlightTable {
  selector: HTMLElement | null;
  options: { maxCols?: number };
  table: HTMLTableElement | null;
  thead: HTMLTableSectionElement | null;
  tbody: HTMLTableSectionElement | null;
  visibleCols: number = 0;

  constructor(selector: HTMLElement | null, options: { maxCols?: number } = {}) {
    this.selector = selector;
    this.options = options;
    this.table = selector?.querySelector('table') as HTMLTableElement;
    this.thead = this.table?.querySelector('thead') as HTMLTableSectionElement;
    this.tbody = this.table?.querySelector('tbody') as HTMLTableSectionElement;
    
    if (this.table) {
      this.init();
    }
  }

  init() {
    if (!this.table || !this.thead) return;
    
    const headerCells = this.thead.querySelectorAll('th');
    this.visibleCols = headerCells.length;

    // If visible columns exceed maxCols, enable horizontal scroll
    if (this.options.maxCols && this.visibleCols > this.options.maxCols) {
      this.enableHorizontalScroll();
    }
  }

  enableHorizontalScroll() {
    if (!this.selector) return;

    // Ensure the table container allows horizontal scrolling
    this.selector.style.overflowX = 'auto';
    this.selector.style.overflowY = 'hidden';
    (this.selector.style as any)['-webkit-overflow-scrolling'] = 'touch';

    // Add smooth scrolling behavior
    this.selector.style.scrollBehavior = 'smooth';
  }
}

export function DataTable({
  rows,
  columns,
  editMode,
  isSharedView = false,
  hideShareButton = false,
  disablePagination = false,
  onUpdateRow,
  onDeleteRow,
  onReorderRows,
  onReorderColumns,
  onDeleteColumn,
  onSelectRowForImage,
  onShowCustomization,
  onOptimizeRoute,
  onShareTable,
  onSavedLinks,
  isAuthenticated = false,
  isLoading = false,
  isFiltered = false,
  // Search and filter props
  searchTerm = '',
  onSearchTermChange,
  filterValue = [],
  onFilterValueChange,
  deliveryFilterValue = [],
  onDeliveryFilterValueChange,
  routeOptions = [],
  deliveryOptions = [],
  onClearAllFilters,
  filteredRowsCount = 0,
  totalRowsCount = 0,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState<
    string | null
  >(null);
  const [sortState, setSortState] = useState<{column: string; direction: 'asc' | 'desc'} | null>(null);
  const [selectedRowImages, setSelectedRowImages] = useState<{ rowId: string; images: any[] } | null>(null);
  const { toast } = useToast();

  // Filter columns to hide "info" column when not in edit mode
  const visibleColumns = editMode ? columns : columns.filter(col => col.dataKey !== 'info');

  // Reset to page 1 when rows change (due to filtering)
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [rows.length]);

  // Initialize SlightTable for horizontal scroll when too many columns
  useEffect(() => {
    const tableContainer = document.querySelector('[data-testid="data-table"]') as HTMLElement;
    if (tableContainer) {
      // Set maxCols based on visible columns - enable horizontal scroll if more than 8 columns
      const maxCols = Math.min(8, visibleColumns.length);
      if (visibleColumns.length > maxCols) {
        new SlightTable(tableContainer, { maxCols });
      }
    }
  }, [visibleColumns.length]);

  // Use rows as provided (already filtered by parent with distances calculated)
  
  // Helper function to determine schedule status
  const getScheduleStatus = (row: TableRowType) => {
    const currentDay = new Date().getDay();
    const alt1Days = [1, 3, 5, 0]; // Mon, Wed, Fri, Sun
    const alt2Days = [2, 4, 6];    // Tue, Thu, Sat
    
    if (row.active === false || row.deliveryAlt === "inactive") {
      return 'inactive'; // Red
    } else if (
      (row.deliveryAlt === "alt1" && !alt1Days.includes(currentDay)) ||
      (row.deliveryAlt === "alt2" && !alt2Days.includes(currentDay))
    ) {
      return 'off-schedule'; // Yellow
    } else if (
      isSharedView && 
      row.delivery === "Weekday" && 
      (currentDay === 5 || currentDay === 6) // Friday or Saturday
    ) {
      return 'off-schedule'; // Yellow for weekday delivery on Fri/Sat in shared view
    } else {
      return 'on-schedule'; // Green
    }
  };

  // Apply sorting based on sortState
  const sortedRows = sortState ? (() => {
    const sorted = [...rows].sort((a, b) => {
      // Multi-tier sorting ONLY for shared view or edit mode: on-schedule > off-schedule > inactive
      if (isSharedView || editMode) {
        const statusA = getScheduleStatus(a);
        const statusB = getScheduleStatus(b);
        
        const statusOrder = { 'on-schedule': 0, 'off-schedule': 1, 'inactive': 2 };
        if (statusOrder[statusA] !== statusOrder[statusB]) {
          return statusOrder[statusA] - statusOrder[statusB];
        }
      } else {
        // Regular view mode: only put inactive rows at bottom
        const activeA = a.active !== false;
        const activeB = b.active !== false;
        if (activeA !== activeB) {
          return activeA ? -1 : 1;
        }
      }
      
      const direction = sortState.direction === 'asc' ? 1 : -1;
      
      switch (sortState.column) {
        case 'code': {
          const codeA = a.code || "";
          const codeB = b.code || "";
          const numA = parseInt(codeA) || 0;
          const numB = parseInt(codeB) || 0;
          return (numA - numB) * direction;
        }
        case 'route': {
          const routeA = a.route || "";
          const routeB = b.route || "";
          return routeA.localeCompare(routeB) * direction;
        }
        case 'location': {
          const locationA = a.location || "";
          const locationB = b.location || "";
          return locationA.localeCompare(locationB) * direction;
        }
        case 'delivery': {
          const deliveryA = a.delivery || "";
          const deliveryB = b.delivery || "";
          return deliveryA.localeCompare(deliveryB) * direction;
        }
        case 'kilometer': {
          const kmA = parseFloat((a as any).kilometer) || 0;
          const kmB = parseFloat((b as any).kilometer) || 0;
          return (kmA - kmB) * direction;
        }
        case 'order': {
          const noA = a.no || 0;
          const noB = b.no || 0;
          return (noA - noB) * direction;
        }
        default:
          return 0;
      }
    });
    
    // Keep QL Kitchen at top if it exists and is active
    const qlKitchenIndex = sorted.findIndex(row => row.location === "QL Kitchen" && row.active !== false);
    if (qlKitchenIndex > 0) {
      const qlKitchenRow = sorted.splice(qlKitchenIndex, 1)[0];
      sorted.unshift(qlKitchenRow);
    }
    
    return sorted;
  })() : (() => {
    // Without sorting: use tier-based sorting ONLY for shared view or edit mode
    if (isSharedView || editMode) {
      const onScheduleRows = rows.filter(row => getScheduleStatus(row) === 'on-schedule');
      const offScheduleRows = rows.filter(row => getScheduleStatus(row) === 'off-schedule');
      const inactiveRows = rows.filter(row => getScheduleStatus(row) === 'inactive');
      return [...onScheduleRows, ...offScheduleRows, ...inactiveRows];
    } else {
      // Regular view mode: only put inactive rows at bottom
      const activeRows = rows.filter(row => row.active !== false);
      const inactiveRows = rows.filter(row => row.active === false);
      return [...activeRows, ...inactiveRows];
    }
  })();

  // Calculate pagination
  const totalRows = sortedRows.length;
  const totalPages = disablePagination ? 1 : Math.ceil(totalRows / pageSize);
  const startIndex = disablePagination ? 0 : (currentPage - 1) * pageSize;
  const endIndex = disablePagination ? totalRows : startIndex + pageSize;
  const paginatedRows = disablePagination ? sortedRows : sortedRows.slice(startIndex, endIndex);

  // Reset to first page when page size changes
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "column") {
      const newColumnOrder = Array.from(columns);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);

      const columnIds = newColumnOrder.map((col) => col.id);
      onReorderColumns.mutate(columnIds);
    } else if (type === "row") {
      const newRowOrder = Array.from(rows);
      const [reorderedRow] = newRowOrder.splice(source.index, 1);
      newRowOrder.splice(destination.index, 0, reorderedRow);

      const rowIds = newRowOrder.map((row) => row.id);
      onReorderRows.mutate(rowIds);
    }
  }, [columns, rows, onReorderColumns, onReorderRows]);

  const formatNumber = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      currencyDisplay: "symbol",
    })
      .format(num || 0)
      .replace("MYR", "RM");
  };

  const getCellValue = (
    row: TableRowType,
    column: TableColumn,
    rowIndex?: number,
  ) => {
    switch (column.dataKey) {
      case "id":
        return row.id.slice(0, 8).toUpperCase();
      case "no":
        // Show infinity icon for QL Kitchen row
        if (row.location === "QL Kitchen") {
          return "∞";
        }
        // Display sequential numbers (1, 2, 3...) based on position in table
        // This shows sequential numbers even if code has gaps
        if (rowIndex !== undefined) {
          const hasQLKitchenAtTop = paginatedRows[0]?.location === "QL Kitchen";
          return hasQLKitchenAtTop ? rowIndex : rowIndex + 1;
        }
        return row.no || 0;
      case "route":
        return row.route || "";
      case "code":
        return row.code || "";
      case "location":
        return row.location || "";
      case "delivery":
        return row.delivery || "";
      case "alt1":
        return (row as any).alt1 || "";
      case "alt2":
        return (row as any).alt2 || "";
      case "info":
        return row.info || "";
      case "tngSite":
        return row.tngSite || "";
      case "tngRoute":
        // Handle currency formatting for TnG column
        if (column.type === "currency") {
          const value = parseFloat(row.tngRoute || "0") || 0;
          return formatCurrency(value);
        }
        return row.tngRoute || "";
      case "destination":
        // Handle currency formatting for Destination column
        if (column.type === "currency") {
          const value = parseFloat(row.destination || "0") || 0;
          return formatCurrency(value);
        }
        return row.destination || "";
      case "images":
        const images = row.images || [];
        // Convert string arrays to ImageWithCaption format
        return images.map((img: any) =>
          typeof img === "string" ? { url: img, caption: "" } : img,
        );
      case "kilometer":
        // Use the kilometer value already calculated by parent component
        const kmValue = (row as any).kilometer;
        if (kmValue === "—" || kmValue === undefined || kmValue === null) {
          return "—";
        }
        if (typeof kmValue === "number") {
          if (kmValue === 0) {
            return "0.00 km";
          }
          return `${kmValue.toFixed(2)} km`;
        }
        return "—";
      default:
        // Handle dynamic columns - return empty value for new columns
        return (row as any)[column.dataKey] || "";
    }
  };

  const getDeliveryBadgeColor = (delivery: string) => {
    const colors: Record<string, string> = {
      "Same Day": "bg-transparent text-white",
      "Next Day": "bg-transparent text-white",
      "2-3 Days": "bg-transparent text-white",
      "3-5 Days": "bg-transparent text-white",
      Daily: "bg-transparent text-white",
      Weekday: "bg-transparent text-white",
      "Alternate 1": "bg-transparent text-white",
      "Alternate 2": "bg-transparent text-white",
    };
    return colors[delivery] || "bg-transparent text-white";
  };

  // Calculate totals based on currently visible filtered/searched data
  // The 'rows' prop already contains only the filtered data from the parent component
  const calculateColumnSum = (dataKey: string, columnType: string) => {
    if (dataKey === "no") {
      return rows.reduce((sum, row) => sum + (row.no || 0), 0);
    }
    if (dataKey === "kilometer") {
      // Get last visible row that has valid coordinates (excluding QL Kitchen)
      const validRows = rows.filter(row => 
        row.location !== "QL Kitchen" && 
        row.latitude && 
        row.longitude &&
        Number.isFinite(parseFloat(row.latitude)) && 
        Number.isFinite(parseFloat(row.longitude))
      );
      
      if (validRows.length === 0) return 0;
      
      const lastRow = validRows[validRows.length - 1];
      const lastKm = (lastRow as any).kilometer;
      
      // If no valid kilometer data, return 0
      if (typeof lastKm !== "number" || !Number.isFinite(lastKm)) return 0;
      
      // Find QL Kitchen coordinates for return trip calculation
      const allRowsWithQL = [...rows];
      const qlKitchen = allRowsWithQL.find(row => row.location === "QL Kitchen");
      
      if (!qlKitchen || !qlKitchen.latitude || !qlKitchen.longitude) {
        // No QL Kitchen, just return the last kilometer value
        return lastKm;
      }
      
      const qlLat = parseFloat(qlKitchen.latitude);
      const qlLng = parseFloat(qlKitchen.longitude);
      
      if (!Number.isFinite(qlLat) || !Number.isFinite(qlLng)) {
        return lastKm;
      }
      
      // Calculate return distance from last location to QL Kitchen
      const lastLat = parseFloat(lastRow.latitude || "0");
      const lastLng = parseFloat(lastRow.longitude || "0");
      
      // Haversine formula for return distance
      const R = 6371; // Earth's radius in km
      const dLat = (qlLat - lastLat) * (Math.PI / 180);
      const dLon = (qlLng - lastLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lastLat * (Math.PI / 180)) *
          Math.cos(qlLat * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const returnDistance = R * c;
      
      // Total = last kilometer value + return to QL Kitchen
      return lastKm + returnDistance;
    }
    if (columnType === "currency" && dataKey === "tngRoute") {
      return rows.reduce((sum, row) => {
        const value = parseFloat(row.tngRoute || "0") || 0;
        return sum + value;
      }, 0);
    }
    if (columnType === "currency" && dataKey === "destination") {
      return rows.reduce((sum, row) => {
        const value = parseFloat(row.destination || "0") || 0;
        return sum + value;
      }, 0);
    }
    if (columnType === "currency" && dataKey === "tollPrice") {
      return rows.reduce((sum, row) => {
        const value = parseFloat(row.tollPrice || "0") || 0;
        return sum + value;
      }, 0);
    }
    return 0;
  };

  const handleSortByCode = (direction: 'asc' | 'desc') => {
    // Sort rows by code column
    const sortedRows = [...rows].sort((a, b) => {
      const codeA = a.code || "";
      const codeB = b.code || "";

      // Handle numeric codes by parsing them
      const numA = parseInt(codeA) || 0;
      const numB = parseInt(codeB) || 0;

      // If both are numbers, sort numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === 'asc' ? numA - numB : numB - numA;
      }

      // Otherwise sort alphabetically
      return direction === 'asc' ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortBySortOrder = (direction: 'asc' | 'desc') => {
    // Sort rows by no field
    const sortedRows = [...rows].sort((a, b) => {
      const noA = a.no || 0;
      const noB = b.no || 0;
      return direction === 'asc' ? noA - noB : noB - noA;
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByDelivery = (direction: 'asc' | 'desc') => {
    // Sort rows by delivery column (A-Z or Z-A)
    const sortedRows = [...rows].sort((a, b) => {
      const deliveryA = a.delivery || "";
      const deliveryB = b.delivery || "";
      return direction === 'asc' ? deliveryA.localeCompare(deliveryB) : deliveryB.localeCompare(deliveryA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByLocation = (direction: 'asc' | 'desc') => {
    // Sort rows by location column (A-Z or Z-A)
    const sortedRows = [...rows].sort((a, b) => {
      const locationA = a.location || "";
      const locationB = b.location || "";
      return direction === 'asc' ? locationA.localeCompare(locationB) : locationB.localeCompare(locationA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByRoute = (direction: 'asc' | 'desc') => {
    // Sort rows by route column (A-Z or Z-A)
    const sortedRows = [...rows].sort((a, b) => {
      const routeA = a.route || "";
      const routeB = b.route || "";
      return direction === 'asc' ? routeA.localeCompare(routeB) : routeB.localeCompare(routeA);
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortByKilometer = (direction: 'asc' | 'desc') => {
    // Sort rows by kilometer column (0-9 or 9-0)
    const sortedRows = [...rows].sort((a, b) => {
      const kmA = parseFloat((a as any).kilometer) || 0;
      const kmB = parseFloat((b as any).kilometer) || 0;
      return direction === 'asc' ? kmA - kmB : kmB - kmA;
    });

    // Reorder rows using the mutation
    const sortedRowIds = sortedRows.map((row) => row.id);
    onReorderRows.mutate(sortedRowIds);
  };

  const handleSortToggle = useCallback((column: string) => {
    // Cycle through: null → asc → desc → null
    let newDirection: 'asc' | 'desc' | null = null;
    
    if (!sortState || sortState.column !== column) {
      // First click: set to ascending
      newDirection = 'asc';
    } else if (sortState.direction === 'asc') {
      // Second click: set to descending
      newDirection = 'desc';
    } else {
      // Third click: clear sort
      newDirection = null;
    }
    
    if (newDirection === null) {
      setSortState(null);
      // No need to reorder, just clear the state
      return;
    }
    
    setSortState({ column, direction: newDirection });
    
    // Apply the sort
    switch (column) {
      case "route":
        handleSortByRoute(newDirection);
        break;
      case "code":
        handleSortByCode(newDirection);
        break;
      case "delivery":
        handleSortByDelivery(newDirection);
        break;
      case "location":
        handleSortByLocation(newDirection);
        break;
      case "kilometer":
        handleSortByKilometer(newDirection);
        break;
      case "order":
        handleSortBySortOrder(newDirection);
        break;
      default:
        break;
    }
  }, [sortState, handleSortByRoute, handleSortByCode, handleSortByDelivery, handleSortByLocation, handleSortByKilometer, handleSortBySortOrder]);

  const handleDeleteClick = (rowId: string) => {
    setSelectedRowForDelete(rowId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRowForDelete) {
      onDeleteRow.mutate(selectedRowForDelete);
      setDeleteConfirmOpen(false);
      setSelectedRowForDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedRowForDelete(null);
  };

  // Filter toggle functions
  const toggleRouteFilter = useCallback((route: string) => {
    if (!onFilterValueChange) return;
    
    const newFilters = filterValue.includes(route)
      ? filterValue.filter(f => f !== route)
      : [...filterValue, route];
    onFilterValueChange(newFilters);
  }, [filterValue, onFilterValueChange]);

  const toggleDeliveryFilter = useCallback((delivery: string) => {
    if (!onDeliveryFilterValueChange) return;
    
    const newFilters = deliveryFilterValue.includes(delivery)
      ? deliveryFilterValue.filter(f => f !== delivery)
      : [...deliveryFilterValue, delivery];
    onDeliveryFilterValueChange(newFilters);
  }, [deliveryFilterValue, onDeliveryFilterValueChange]);

  return (
    <div
      className="glass-table rounded-xl border border-gray-200/60 dark:border-white/10 shadow-md table-container my-4 overflow-hidden"
      data-testid="data-table"
    >
      {/* Top Row: Entries (Left) and Customize Buttons (Right) */}
      <div className="px-2 py-1 border-b border-border/20 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-gray-950/80 dark:via-gray-950/70 dark:to-gray-950/80 backdrop-blur-sm text-[7px]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" }}>
        <div className="flex flex-row gap-1 items-center justify-between">
          
          {/* Left Side: Entries Selector */}
          {!disablePagination && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[7px] text-muted-foreground font-medium">
                Show
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-5 px-1.5 pagination-button text-[7px] font-semibold [&>svg]:hidden w-auto min-w-[2rem] rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md">
                  <SelectItem value="10" className="font-semibold text-[7px]">10</SelectItem>
                  <SelectItem value="30" className="font-semibold text-[7px]">30</SelectItem>
                  <SelectItem value="50" className="font-semibold text-[7px]">50</SelectItem>
                  <SelectItem value="100" className="font-semibold text-[7px]">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[7px] text-muted-foreground font-medium">
                of {totalRows} entries
              </span>
            </div>
          )}
          
          {/* Right Side: Customize and Other Buttons */}
          <div className="flex items-center gap-1">
            <Button
              onClick={onShowCustomization}
              variant="outline"
              size="sm"
              className="w-5 h-5 p-0 pagination-button rounded-md"
              data-testid="button-show"
              title="Customize columns"
            >
              <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </Button>
            <Button
              onClick={onOptimizeRoute}
              variant="outline"
              size="sm"
              className="w-5 h-5 p-0 pagination-button rounded-md"
              data-testid="button-optimize-route"
              title="Optimize delivery route with AI"
            >
              <Route className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </Button>
            {!hideShareButton && (
              <Button
                onClick={onShareTable}
                variant="outline"
                size="sm"
                className="w-5 h-5 p-0 pagination-button rounded-md"
                data-testid="button-share-table"
                title="Share current table view"
              >
                <Share2 className="w-3 h-3 text-green-500 dark:text-green-400" />
              </Button>
            )}
          </div>
        </div>
        
      </div>
      {/* Bottom Row: Sort/Filter/Clear (Left) and Search (Right) */}
      <div className="flex justify-between items-center px-2 py-1 border-b border-border/20 bg-white/50 dark:bg-gray-950/95 backdrop-blur-sm rounded-t-md">
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Sort Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-4 px-1 pagination-button text-[6px] justify-start rounded-md"
                data-testid="sort-trigger"
              >
                {sortState && (
                  <>
                    {sortState.direction === 'asc' ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
                    <span className="hidden sm:inline text-[8px]">
                      {sortState.column === 'route' && 'Route'}
                      {sortState.column === 'code' && 'Code'}
                      {sortState.column === 'location' && 'Location'}
                      {sortState.column === 'delivery' && 'Delivery'}
                      {sortState.column === 'kilometer' && 'Km'}
                      {sortState.column === 'order' && 'No'}
                    </span>
                    <span className="sm:hidden text-[8px]">Sort</span>
                  </>
                )}
                {!sortState && (
                  <>
                    <ArrowUpDown className="w-2.5 h-2.5 mr-0.5 opacity-50" />
                    <span className="text-[8px]">Sort</span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0 rounded-lg" align="start">
              <div className="p-1 btn-glass rounded-lg">
                <h4 className="font-medium text-[9px] mb-1 pb-1 border-b border-border/20 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  Sort By
                </h4>
                <div className="space-y-1 text-xs">
                  <Button
                    variant={sortState?.column === 'route' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'route' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('route')}
                    data-testid="button-sort-route"
                  >
                    <span>Route</span>
                    {sortState?.column === 'route' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'route' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'code' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'code' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('code')}
                    data-testid="button-sort-code"
                  >
                    <span>Code</span>
                    {sortState?.column === 'code' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'code' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'location' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'location' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('location')}
                    data-testid="button-sort-location"
                  >
                    <span>Location</span>
                    {sortState?.column === 'location' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'location' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'delivery' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'delivery' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('delivery')}
                    data-testid="button-sort-delivery"
                  >
                    <span>Delivery</span>
                    {sortState?.column === 'delivery' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'delivery' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  <Button
                    variant={sortState?.column === 'kilometer' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-between text-xs ${
                      sortState?.column === 'kilometer' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                    }`}
                    onClick={() => handleSortToggle('kilometer')}
                    data-testid="button-sort-kilometer"
                  >
                    <span>Kilometer</span>
                    {sortState?.column === 'kilometer' && (
                      sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                    {sortState?.column !== 'kilometer' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Button>
                  {isFiltered && (
                    <Button
                      variant={sortState?.column === 'order' ? 'default' : 'ghost'}
                      size="sm"
                      className={`w-full justify-between text-xs ${
                        sortState?.column === 'order' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''
                      }`}
                      onClick={() => handleSortToggle('order')}
                      data-testid="button-sort-order"
                    >
                      <span>No</span>
                      {sortState?.column === 'order' && (
                        sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                      {sortState?.column !== 'order' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Combined Filter Section */}
          <div className="w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-5 px-1.5 pagination-button text-[7px] justify-start rounded-md" data-testid="combined-filter-trigger">
                  <span className="hidden sm:inline">
                    {isSharedView ? (
                      deliveryFilterValue.length === 0 
                        ? "🔍 Hide Deliveries" 
                        : `🚫 ${deliveryFilterValue.length} hidden`
                    ) : (
                      filterValue.length === 0 && deliveryFilterValue.length === 0 
                        ? "🔍 Filters" 
                        : `📍 ${filterValue.length} • 🚫 ${deliveryFilterValue.length}`
                    )}
                  </span>
                  <span className="sm:hidden">
                    {isSharedView ? (
                      deliveryFilterValue.length === 0 ? "🔍" : `🚫${deliveryFilterValue.length}`
                    ) : (
                      filterValue.length === 0 && deliveryFilterValue.length === 0 
                        ? "🔍" 
                        : `📍${filterValue.length} 🚫${deliveryFilterValue.length}`
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-56 p-0 rounded-lg" align="start">
              <div className="space-y-2 p-2 text-[8px] btn-glass rounded-lg">
                {/* Routes Section - Hidden in shared view */}
                {!isSharedView && (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[7px] flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-accent" />
                          Routes ({filterValue.length} selected)
                        </h4>
                        {filterValue.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => onFilterValueChange?.([])} className="h-auto p-0.5 text-[6px]">
                            <X className="w-3 h-3 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-1.5 bg-background/50">
                        {routeOptions.filter(route => route !== "WH").map(route => (
                          <div key={route} className="flex items-center space-x-1.5">
                            <Checkbox
                              id={`route-${route}`}
                              checked={filterValue.includes(route)}
                              onCheckedChange={() => toggleRouteFilter(route)}
                            />
                            <Label htmlFor={`route-${route}`} className="text-[7px] cursor-pointer">
                              📍 {route}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Separator */}
                    <div className="border-t border-border/20 my-1"></div>
                  </>
                )}
                
                {/* Trips Section (Delivery Filter) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[7px] flex items-center gap-1.5">
                      <Filter className="w-3 h-3 text-orange-500" />
                      Hide Deliveries ({deliveryFilterValue.length} hidden)
                    </h4>
                    {deliveryFilterValue.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => onDeliveryFilterValueChange?.([])} className="h-auto p-0.5 text-[6px]">
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-1.5 bg-background/50">
                    {deliveryOptions.map(delivery => (
                      <div key={delivery} className="flex items-center space-x-1.5">
                        <Checkbox
                          id={`delivery-${delivery}`}
                          checked={deliveryFilterValue.includes(delivery)}
                          onCheckedChange={() => toggleDeliveryFilter(delivery)}
                        />
                        <Label htmlFor={`delivery-${delivery}`} className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[7px] cursor-pointer font-medium">
                          🚫 {delivery}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          </div>
          
          {/* Clear All Section */}
          {(searchTerm || filterValue.length > 0 || deliveryFilterValue.length > 0) && (
            <Button
              onClick={onClearAllFilters}
              variant="outline"
              size="sm"
              className="h-5 px-1.5 pagination-button text-[7px] border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 rounded-md"
              data-testid="clear-all-filters"
            >
              <span className="hidden sm:inline bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">Clear</span>
              <span className="sm:hidden bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">Clear</span>
            </Button>
          )}
        </div>
        
        {/* Right Side: Search Input */}
        <div className="flex-1 max-w-[30%] lg:max-w-md ml-auto flex items-center gap-2">
          <div className="relative group flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2.5 h-3 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange?.(e.target.value)}
              className="pl-6 pr-6 h-7 bg-white/80 dark:bg-gray-950/95 text-foreground placeholder:text-muted-foreground border-1.5 border-border/40 dark:border-gray-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:focus-visible:ring-gray-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-xs"
              data-testid="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchTermChange?.('')}
                className="absolute right-0.5 top-1/2 transform -translate-y-1/2 p-0.5 w-4 h-4 rounded-full hover:bg-muted/50 flex items-center justify-center"
                data-testid="clear-search"
                aria-label="Clear search"
              >
                <X className="w-2.5 h-2.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Active Filters Display */}
      {(searchTerm || filterValue.length > 0 || deliveryFilterValue.length > 0) && (
        <div className="px-4 py-1.5 border-b border-border/20 bg-gradient-to-r from-muted/10 via-transparent to-muted/10 dark:from-gray-950/60 dark:via-gray-950/40 dark:to-gray-950/60">
          <div className="flex flex-wrap items-center gap-0.5">
            <span className="text-muted-foreground font-medium text-[7px]">Active:</span>
            {searchTerm && (
              <div className="flex items-center gap-0.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs">
                <Search className="w-2.5 h-2.5" />
                <span>"{searchTerm}"</span>
                <button onClick={() => onSearchTermChange?.('')} className="ml-0.5 p-0.5 hover:text-primary/70 flex items-center justify-center rounded-full hover:bg-primary/10" aria-label="Remove text filter">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            {filterValue.map(route => {
              // Get icon for the route with improved pattern matching
              const getRouteIcon = (routeCode: string) => {
                const upperRoute = routeCode.toUpperCase();
                
                // Check for Selangor patterns (SL, SEL, SELANGOR)
                if (upperRoute.includes('SL') || upperRoute.includes('SEL') || upperRoute.includes('SELANGOR')) {
                  return '/icon/selangor-flag.png';
                } 
                // Check for Kuala Lumpur patterns (KL, KUL, KUALA LUMPUR)
                else if (upperRoute.includes('KL') || upperRoute.includes('KUL') || upperRoute.includes('KUALA')) {
                  return '/icon/kl-flag.png';
                }
                return null;
              };

              const iconSrc = getRouteIcon(route);

              return (
                <div key={route} className="flex items-center gap-0.5 px-2 py-0.5 bg-transparent border border-transparent rounded-full text-gray-400 text-xs">
                  {iconSrc ? (
                    <img src={iconSrc} alt={`${route} flag`} className="w-4 h-4 object-contain mr-1" />
                  ) : (
                    <Filter className="w-2.5 h-2.5" />
                  )}
                  <span>{route}</span>
                  <button onClick={() => toggleRouteFilter(route)} className="ml-0.5 p-0.5 hover:text-red-600 flex items-center justify-center rounded-full hover:bg-red-500/10" aria-label={`Remove route filter: ${route}`}>
                    <X className="w-2.5 h-2.5 text-red-500" />
                  </button>
                </div>
              );
            })}
            {deliveryFilterValue.map(delivery => (
              <div key={delivery} className="flex items-center gap-0.5 px-2 py-0.5 bg-transparent border border-transparent rounded-full text-gray-400 text-xs">
                <Filter className="w-2.5 h-2.5" />
                <span>{delivery}</span>
                <button onClick={() => toggleDeliveryFilter(delivery)} className="ml-0.5 p-0.5 hover:text-red-600 flex items-center justify-center rounded-full hover:bg-red-500/10" aria-label={`Remove delivery filter: ${delivery}`}>
                  <X className="w-2.5 h-2.5 text-red-500" />
                </button>
              </div>
            ))}
            <div className="ml-auto text-muted-foreground text-xs">
              {filteredRowsCount} of {totalRowsCount} results
            </div>
          </div>
        </div>
      )}
      <div 
        className="w-full relative contain-layout contain-paint overflow-x-auto"
        style={disablePagination ? {
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto',
          willChange: 'transform',
        } : {
          willChange: 'transform',
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table className="w-full" style={{tableLayout: "auto", width: "100%"}}>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column, index) => (
                  <TableHead
                    key={column.id}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-center table-header-footer-12px font-medium text-blue-700 dark:text-blue-300 tracking-wide bg-white/95 dark:bg-gray-950/95 whitespace-nowrap h-10 sm:h-12"
                    style={{ textAlign: "center", fontSize: "9px" }}
                    colSpan={column.dataKey === "location" ? 3 : 1}
                  >
                    <ColumnHeader
                      column={column}
                      dragHandleProps={undefined}
                      onDelete={() => onDeleteColumn.mutate(column.id)}
                      isAuthenticated={isAuthenticated}
                      editMode={editMode}
                    />
                  </TableHead>
                ))}
                <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-center table-header-footer-12px font-semibold text-red-700 dark:text-red-300 tracking-wide bg-white/95 dark:bg-gray-950/95 whitespace-nowrap h-10 sm:h-12">
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent text-xs sm:text-sm font-bold">
                    Act
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId="rows" type="row">
              {(provided) => (
                <TableBody
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="pt-2"
                  key={`page-${currentPage}`}
                >
                  {isLoading
                    ? Array.from({ length: Math.min(pageSize, 5) }).map(
                        (_, index) => (
                          <tr
                            key={`skeleton-${index}`}
                            className={`skeleton-row bg-white dark:bg-gray-950/80 backdrop-blur-sm hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:shadow-sm dark:hover:shadow-lg transition-all duration-200 cursor-pointer`}
                          >
                            {/* Actions column */}
                            <td className="py-3 px-4 w-12">
                              <div className="flex gap-2 justify-center">
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-gray-500/20 to-slate-500/20 animate-pulse" />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" style={{animationDelay: "0.1s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse" style={{animationDelay: "0.2s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-yellow-500/20 to-green-500/20 animate-pulse" style={{animationDelay: "0.3s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-red-500/20 to-yellow-500/20 animate-pulse" style={{animationDelay: "0.4s"}} />
                                <div className="skeleton w-8 h-8 rounded-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 animate-pulse" style={{animationDelay: "0.5s"}} />
                              </div>
                            </td>

                            {/* Dynamic columns - cleaner skeleton */}
                            {visibleColumns.map((column) => (
                              <td
                                key={column.id}
                                className="py-3 px-4"
                                colSpan={column.dataKey === "location" ? 3 : 1}
                              >
                                {column.dataKey === "images" ? (
                                  <div className="skeleton w-12 h-8 rounded mx-auto bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                                ) : column.dataKey === "delivery" ? (
                                  <div className="skeleton w-16 h-6 rounded-full mx-auto bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-pulse" />
                                ) : column.dataKey === "location" ? (
                                  <div className="skeleton w-32 h-4 mx-auto bg-gradient-to-r from-yellow-400/20 to-green-400/20 animate-pulse" />
                                ) : (
                                  <div className="skeleton w-20 h-4 mx-auto bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ),
                      )
                    : paginatedRows.map((row, index) => (
                        <Draggable
                          key={row.id}
                          draggableId={row.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`group hover:bg-slate-50 dark:hover:bg-gray-900/50 ${
                                (() => {
                                  // Apply 3-color styling ONLY for shared view or edit mode
                                  if (isSharedView || editMode) {
                                    const status = getScheduleStatus(row);
                                    if (status === 'inactive') {
                                      return "bg-gray-100/60 dark:bg-gray-950/80 opacity-50";
                                    } else if (status === 'off-schedule') {
                                      return row.location === "QL Kitchen" 
                                        ? "bg-gradient-to-r from-gray-100/80 to-slate-100/80 dark:from-gray-950/80 dark:to-slate-950/80 opacity-60" 
                                        : "bg-white dark:bg-gray-950/80 opacity-60";
                                    } else {
                                      return row.location === "QL Kitchen" 
                                        ? "bg-gradient-to-r from-gray-100/80 to-slate-100/80 dark:from-gray-950/80 dark:to-slate-950/80" 
                                        : "bg-white dark:bg-gray-950/80";
                                    }
                                  } else {
                                    // Regular view mode: standard styling
                                    if (row.active === false) {
                                      return "bg-gray-100/60 dark:bg-gray-950/80 opacity-50";
                                    } else {
                                      return row.location === "QL Kitchen" 
                                        ? "bg-gradient-to-r from-gray-100/80 to-slate-100/80 dark:from-gray-950/80 dark:to-slate-950/80" 
                                        : "bg-white dark:bg-gray-950/80";
                                    }
                                  }
                                })()
                              } hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:shadow-sm dark:hover:shadow-lg transition-all duration-200 cursor-pointer ${
                                snapshot.isDragging ? "drag-elevate" : ""
                              }`}
                              data-testid={`table-row-${row.id}`}
                            >
                              {visibleColumns.map((column) => (
                                <TableCell
                                  key={column.id}
                                  className="py-2 sm:py-2.5 px-3 sm:px-4 align-middle table-cell-10px text-center text-[6px] sm:text-[8px] bg-transparent text-foreground whitespace-nowrap font-normal h-8 sm:h-9 rounded-sm"
                                  style={{
                                    textAlign: "center",
                                    minWidth: "80px",
                                    height: "36px",
                                    maxHeight: "44px",
                                    ...(column.dataKey === "location" && {
                                      minWidth: `${140 + 20}px`,
                                      fontSize: "9px",
                                    }),
                                    ...(column.dataKey === "delivery" && {
                                      minWidth: "130px",
                                      fontSize: "9px",
                                      fontWeight: "normal",
                                    }),
                                    ...(column.dataKey === "id" && {
                                      minWidth: "140px",
                                    }),
                                    ...(column.dataKey === "code" && {
                                      minWidth: "120px",
                                    }),
                                    ...(column.dataKey === "route" && {
                                      minWidth: "110px",
                                    }),
                                    ...(column.dataKey === "no" && {
                                      minWidth: "90px",
                                    }),
                                    ...(column.dataKey === "kilometer" && {
                                      minWidth: "100px",
                                    }),
                                    ...(column.dataKey === "tollPrice" && {
                                      minWidth: "110px",
                                    }),
                                    ...(column.dataKey === "tngRoute" && {
                                      minWidth: "110px",
                                    }),
                                    ...(column.dataKey === "images" && {
                                      minWidth: "140px",
                                    }),
                                    ...(column.type === "currency" && !column.dataKey.match(/tollPrice|tngRoute/) && {
                                      minWidth: "120px",
                                    }),
                                  }}
                                  colSpan={
                                    column.dataKey === "location" ? 3 : 1
                                  }
                                  data-testid={`cell-${row.id}-${column.dataKey}`}
                                >
                                  <div className="w-[98%] mx-auto text-center">
                                  {column.dataKey === "images" ? (
                                    <div className="relative flex items-center justify-center">
                                      {row.images && row.images.length > 0 ? (
                                        <div
                                          className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer border border-border/30 hover:border-border/60 transition-all duration-300 transform hover:scale-110 hover:shadow-lg group"
                                          onClick={() => setSelectedRowImages({ rowId: row.id, images: row.images || [] })}
                                        >
                                          <img
                                            src={row.images[0].url}
                                            alt={row.images[0].caption || "Image"}
                                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                                            loading="lazy"
                                          />
                                          {/* Overlay with zoom icon and count */}
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1">
                                            <ZoomIn className="h-4 w-4 text-white" />
                                            {row.images.length > 1 && (
                                              <span className="text-white text-xs font-semibold">+{row.images.length - 1}</span>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">
                                          No image
                                        </div>
                                      )}
                                      {editMode && (
                                        <button
                                          onClick={() => onSelectRowForImage(row.id)}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg"
                                          title="Add Image"
                                        >
                                          +
                                        </button>
                                      )}
                                    </div>
                                  ) : column.dataKey === "info" ? (
                                    row.info && row.info.trim() ? (
                                      <InfoModal
                                        info={row.info}
                                        rowId={row.id}
                                        code={row.code}
                                        route={row.route}
                                        location={row.location}
                                        latitude={row.latitude ? String(row.latitude) : undefined}
                                        longitude={row.longitude ? String(row.longitude) : undefined}
                                        qrCode={row.qrCode || undefined}
                                        images={row.images || []}
                                        no={row.no}
                                        markerColor={row.markerColor || undefined}
                                        onUpdateRow={(updates) =>
                                          onUpdateRow.mutate({
                                            id: row.id,
                                            updates,
                                          })
                                        }
                                        editMode={false}
                                        allRows={rows}
                                        iconType="info"
                                      />
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )
                                  ) : column.dataKey === "route" ? (
                                    editMode && column.isEditable === "true" ? (
                                      <EditableCell
                                        value={getCellValue(row, column, index)}
                                        type="select"
                                        options={routeOptions}
                                        dataKey={column.dataKey}
                                        onSave={(value) =>
                                          onUpdateRow.mutate({
                                            id: row.id,
                                            updates: {
                                              [column.dataKey]: value,
                                            },
                                          })
                                        }
                                      />
                                    ) : (
                                      <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
                                        {getCellValue(row, column, index) || '—'}
                                      </span>
                                    )
                                  ) : column.dataKey === "delivery" ? (
                                    editMode && column.isEditable === "true" ? (
                                      <EditableCell
                                        value={getCellValue(row, column, index)}
                                        type="select"
                                        options={deliveryOptions}
                                        dataKey={column.dataKey}
                                        onSave={(value) =>
                                          onUpdateRow.mutate({
                                            id: row.id,
                                            updates: {
                                              [column.dataKey]: value,
                                            },
                                          })
                                        }
                                      />
                                    ) : (
                                      <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
                                        {getCellValue(row, column, index) || '—'}
                                      </span>
                                    )
                                  ) : column.dataKey === "id" ? (
                                    <span className="font-mono text-slate-600 dark:text-slate-300" style={{ fontSize: '10px' }}>
                                      {getCellValue(row, column, index)}
                                    </span>
                                  ) : column.dataKey === "no" && editMode && row.location !== "QL Kitchen" ? (
                                    <EditableCell
                                      value={String(row.no || 0)}
                                      type="number"
                                      dataKey={column.dataKey}
                                      onSave={(value) =>
                                        onUpdateRow.mutate({
                                          id: row.id,
                                          updates: { no: parseInt(value) || 0 },
                                        })
                                      }
                                    />
                                  ) : editMode &&
                                    column.isEditable === "true" ? (
                                    <EditableCell
                                      value={getCellValue(row, column, index)}
                                      type={column.type === "textarea" ? "textarea" : column.type}
                                      options={column.options || undefined}
                                      dataKey={column.dataKey}
                                      onSave={(value) =>
                                        onUpdateRow.mutate({
                                          id: row.id,
                                          updates: { [column.dataKey]: value },
                                        })
                                      }
                                    />
                                  ) : (
                                    <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
                                      {column.dataKey === "kilometer" ? (
                                        <MobileTooltip
                                          content={(() => {
                                            const segmentDistance = (row as any).segmentDistance;
                                            if (segmentDistance && typeof segmentDistance === "number" && segmentDistance > 0) {
                                              return `${segmentDistance.toFixed(2)} km`;
                                            }
                                            return "Starting point";
                                          })()}
                                          showBelow={index === 0 && index !== paginatedRows.length - 1}
                                        >
                                          <span className="cursor-help">
                                            {getCellValue(row, column, index)}
                                          </span>
                                        </MobileTooltip>
                                      ) : (
                                        getCellValue(row, column, index)
                                      )}
                                    </span>
                                  )}
                                  </div>
                                </TableCell>
                              ))}
                              <TableCell
                                className="px-2 py-2 text-sm text-center"
                                style={{ textAlign: "center" }}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className={`p-2 rounded ${
                                        snapshot.isDragging ? "cursor-grabbing" : editMode ? "cursor-grab" : "cursor-default"
                                      } text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all`}
                                      title={editMode ? "Drag to reorder" : ""}
                                      data-testid={`drag-handle-${row.id}`}
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                    {editMode && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 ${
                                            onUpdateRow.isPending &&
                                            onUpdateRow.variables?.id === row.id
                                              ? "opacity-50"
                                              : ""
                                          }`}
                                          onClick={() => {
                                            if (editMode) {
                                              onSelectRowForImage(row.id);
                                            } else {
                                              onSelectRowForImage(
                                                "access-denied",
                                              );
                                            }
                                          }}
                                          disabled={
                                            onUpdateRow.isPending &&
                                            onUpdateRow.variables?.id === row.id
                                          }
                                          data-testid={`button-add-image-${row.id}`}
                                          title="Add image"
                                        >
                                          <PlusCircle className="w-4 h-4" />
                                        </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className={`bg-transparent border-transparent hover:bg-transparent hover:border-transparent ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : "text-blue-400 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-400"} ${
                                          onDeleteRow.isPending &&
                                          onDeleteRow.variables === row.id
                                            ? "mutation-loading"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          isAuthenticated &&
                                          handleDeleteClick(row.id)
                                        }
                                        disabled={
                                          !isAuthenticated ||
                                          (onDeleteRow.isPending &&
                                            onDeleteRow.variables === row.id)
                                        }
                                        data-testid={`button-delete-row-${row.id}`}
                                        title={
                                          !isAuthenticated
                                            ? "Authentication required to delete rows"
                                            : "Delete row"
                                        }
                                      >
                                        {onDeleteRow.isPending &&
                                        onDeleteRow.variables === row.id ? (
                                          <InlineLoading type="particles" />
                                        ) : (
                                          <Trash className="w-4 h-4" />
                                        )}
                                      </Button>
                                      </>
                                    )}
                                    <InfoModal
                                      info={row.info || ""}
                                      rowId={row.id}
                                      code={row.code}
                                      route={row.route}
                                      location={row.location}
                                      latitude={row.latitude ? String(row.latitude) : undefined}
                                      longitude={row.longitude ? String(row.longitude) : undefined}
                                      qrCode={row.qrCode || undefined}
                                      images={row.images || []}
                                      no={row.no}
                                      markerColor={row.markerColor || undefined}
                                      onUpdateRow={(updates) =>
                                        onUpdateRow.mutate({
                                          id: row.id,
                                          updates,
                                        })
                                      }
                                      editMode={editMode}
                                      allRows={rows}
                                      iconType={editMode ? "filetext" : "info"}
                                    />
                                    {editMode ? (
                                      <Select
                                        value={row.deliveryAlt || "normal"}
                                        onValueChange={(value) => {
                                          const nextActive = value !== "inactive";
                                          onUpdateRow.mutate({
                                            id: row.id,
                                            updates: { deliveryAlt: value, active: nextActive },
                                          });
                                        }}
                                        disabled={
                                          onUpdateRow.isPending &&
                                          onUpdateRow.variables?.id === row.id
                                        }
                                      >
                                        <SelectTrigger 
                                          className={`h-8 w-16 text-xs border-transparent bg-transparent ${
                                            (() => {
                                              // Apply 3-color styling ONLY for shared view or edit mode
                                              if (isSharedView || editMode) {
                                                const status = getScheduleStatus(row);
                                                
                                                if (status === 'inactive') {
                                                  // Red for inactive
                                                  return "text-red-500 dark:text-red-400";
                                                } else if (status === 'off-schedule') {
                                                  // Yellow for off-schedule (with opacity)
                                                  return "opacity-60 text-yellow-500 dark:text-yellow-400";
                                                } else {
                                                  // Green for on-schedule
                                                  return "text-green-500 dark:text-green-400";
                                                }
                                              } else {
                                                // Regular view mode: 3-color system (green, yellow, red)
                                                if (row.deliveryAlt === "inactive") {
                                                  return "text-red-500 dark:text-red-400";
                                                } else if (row.deliveryAlt === "alt1" || row.deliveryAlt === "alt2") {
                                                  return "text-yellow-500 dark:text-yellow-400";
                                                } else {
                                                  return "text-green-500 dark:text-green-400";
                                                }
                                              }
                                            })()
                                          }`}
                                          data-testid={`select-delivery-alt-${row.id}`}
                                        >
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="normal">
                                            <span className="text-green-600 dark:text-green-400">🟢</span>
                                          </SelectItem>
                                          <SelectItem value="alt1">
                                            <span className="text-yellow-600 dark:text-yellow-400">🟡</span>
                                          </SelectItem>
                                          <SelectItem value="alt2">
                                            <span className="text-yellow-600 dark:text-yellow-400">🟡</span>
                                          </SelectItem>
                                          <SelectItem value="inactive">
                                            <span className="text-red-500 dark:text-red-400">🔴</span>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className={`border-transparent bg-transparent hover:bg-transparent cursor-not-allowed ${
                                          (() => {
                                            // Apply 3-color styling ONLY for shared view or edit mode
                                            if (isSharedView || editMode) {
                                              const status = getScheduleStatus(row);
                                              
                                              if (status === 'inactive') {
                                                // Red for inactive - NO opacity reduction
                                                return "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300";
                                              } else if (status === 'off-schedule') {
                                                // Yellow for off-schedule (with opacity for disabled look)
                                                return "opacity-40 text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-500";
                                              } else {
                                                // Green for on-schedule - slight opacity
                                                return "opacity-60 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-500";
                                              }
                                            } else {
                                              // Regular view mode: 3-color system (green, yellow, red)
                                              if (row.deliveryAlt === "inactive") {
                                                return "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300";
                                              } else if (row.deliveryAlt === "alt1" || row.deliveryAlt === "alt2") {
                                                return "opacity-60 text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-500";
                                              } else {
                                                return "opacity-60 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-500";
                                              }
                                            }
                                          })()
                                        }`}
                                        disabled={true}
                                        data-testid={`button-toggle-active-${row.id}`}
                                        title={
                                          row.deliveryAlt === "alt1"
                                            ? "Delivery Alt 1 (Mon, Wed, Fri, Sun)"
                                            : row.deliveryAlt === "alt2"
                                            ? "Delivery Alt 2 (Tue, Thu, Sat)"
                                            : row.deliveryAlt === "inactive"
                                            ? "Inactive"
                                            : "Normal Delivery (Every Day)"
                                        }
                                      >
                                        <Power className="w-4 h-4" />
                                      </Button>
                                    )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
            <tfoot>
              <TableRow className="h-10 sm:h-12 bg-white/95 dark:bg-gray-950/95">
                {visibleColumns.map((column, index) => (
                  <TableCell
                    key={column.id}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-center table-header-footer-12px font-semibold text-blue-700 dark:text-blue-300 tracking-wide bg-white/95 dark:bg-gray-950/95 whitespace-nowrap h-10 sm:h-12"
                    style={{ textAlign: "center", fontSize: "9px" }}
                    colSpan={column.dataKey === "location" ? 3 : 1}
                  >
                    {index === 0 ? (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent" style={{fontSize: '11px'}}>Totals</span>
                    ) : column.dataKey === "no" ? (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">—</span>
                    ) : column.dataKey === "kilometer" ? (
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {(() => {
                          const total = calculateColumnSum("kilometer", column.type);
                          return total > 0 ? `${total.toFixed(2)} km` : "—";
                        })()}
                      </span>
                    ) : column.dataKey === "tngRoute" &&
                      column.type === "currency" ? (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        {formatCurrency(
                          calculateColumnSum("tngRoute", column.type),
                        )}
                      </span>
                    ) : column.dataKey === "tollPrice" &&
                      column.type === "currency" ? (
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(
                          calculateColumnSum("tollPrice", column.type),
                        )}
                      </span>
                    ) : (
                      <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">—</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-center table-header-footer-12px font-semibold text-red-700 dark:text-red-300 tracking-wide bg-white/95 dark:bg-gray-950/95 whitespace-nowrap h-10 sm:h-12">
                  <span className="font-semibold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">—</span>
                </TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </DragDropContext>
      </div>

      {/* Pagination Controls - Below Footer */}
      {!disablePagination && (
        <div className="flex flex-col items-center gap-3 px-4 py-4 border-t border-blue-200 dark:border-gray-700 bg-white/50 dark:bg-gray-950/95 backdrop-blur-sm transition-smooth-fast rounded-b-xl">
          <div className="flex items-center gap-1.5">
            {/* Show First button only when currentPage > 3 (has 3+ pages before) */}
            {currentPage > 3 && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => goToPage(1)}
                className="pagination-button"
                data-testid="button-first-page"
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
            )}

            <div className="flex items-center gap-1">
              {(() => {
                // Calculate sliding window of max 6 pages
                const maxButtons = 6;
                
                // If total pages <= maxButtons, show all pages
                if (totalPages <= maxButtons) {
                  const pages = [];
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                  
                  return pages.map((pageNum) => {
                    const isCurrentPage = pageNum === currentPage;
                    return (
                      <Button
                        key={pageNum}
                        variant="outline"
                        size="xs"
                        onClick={() => goToPage(pageNum)}
                        className={`pagination-button page-number ${
                          isCurrentPage ? "active" : ""
                        }`}
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  });
                }
                
                // For more than maxButtons pages, calculate sliding window
                let startPage = Math.max(1, currentPage - 3);
                let endPage = Math.min(totalPages, startPage + maxButtons - 1);

                // Adjust if we're near the end to always show maxButtons
                if (endPage - startPage < maxButtons - 1) {
                  startPage = Math.max(1, endPage - maxButtons + 1);
                }

                const pages = [];
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                return pages.map((pageNum) => {
                  const isCurrentPage = pageNum === currentPage;

                  return (
                    <Button
                      key={pageNum}
                      variant="outline"
                      size="xs"
                      onClick={() => goToPage(pageNum)}
                      className={`pagination-button page-number ${
                        isCurrentPage ? "active" : ""
                      }`}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* Show Last button only when (totalPages - currentPage) >= 3 (has 3+ pages after) */}
            {(totalPages - currentPage) >= 3 && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => goToPage(totalPages)}
                className="pagination-button"
                data-testid="button-last-page"
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] transition-smooth-fast">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this row? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox Modal */}
      {selectedRowImages && (
        <ImageLightbox
          images={selectedRowImages.images}
          isOpen={true}
          onClose={() => setSelectedRowImages(null)}
          initialIndex={0}
        />
      )}
    </div>
  );
}

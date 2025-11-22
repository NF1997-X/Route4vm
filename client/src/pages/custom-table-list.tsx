import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Share2, Trash2, Copy, Check, Home, Edit, ArrowLeft, ChevronDown, ChevronUp, Eye, MoreVertical } from "lucide-react";
import type { TableRow, CustomTable } from "@shared/schema";
import { Footer } from "@/components/footer";
import { LoadingOverlay } from "@/components/skeleton-loader";
import { useLocation } from "wouter";

export default function CustomTableList() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<CustomTable | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableDescription, setTableDescription] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<string[]>([]);
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<CustomTable | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch all table rows
  const { data: tableRows = [], isLoading: isLoadingRows } = useQuery<TableRow[]>({
    queryKey: ["/api/table-rows"],
  });

  // Fetch custom tables
  const { data: customTables = [], isLoading: isLoadingTables } = useQuery<CustomTable[]>({
    queryKey: ["/api/custom-tables"],
  });

  // Filter table rows based on search and delivery filter
  const filteredRows = tableRows.filter((row) => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Delivery filter (hide selected delivery types)
    const matchesDelivery = deliveryFilter.length === 0 || 
      !deliveryFilter.includes(row.delivery);

    return matchesSearch && matchesDelivery;
  });

  // Get unique delivery types
  const deliveryOptions = Array.from(
    new Set(tableRows.map(row => row.delivery).filter(Boolean))
  ) as string[];

  // Create custom table mutation
  const createTableMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; rowIds: string[] }) => {
      const response = await apiRequest("POST", "/api/custom-tables", data);
      if (!response.ok) {
        throw new Error("Failed to create custom table");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tables"] });
      setIsCreateDialogOpen(false);
      setTableName("");
      setTableDescription("");
      setSelectedRows(new Set());
      toast({
        title: "Custom table created!",
        description: "Your custom table has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create custom table. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update custom table mutation
  const updateTableMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string; rowIds: string[] }) => {
      const response = await apiRequest("PUT", `/api/custom-tables/${data.id}/rows`, {
        name: data.name,
        description: data.description,
        rowIds: data.rowIds,
      });
      if (!response.ok) {
        throw new Error("Failed to update custom table");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tables"] });
      setIsEditDialogOpen(false);
      setEditingTable(null);
      setTableName("");
      setTableDescription("");
      setSelectedRows(new Set());
      toast({
        title: "Custom table updated!",
        description: "Your custom table has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update custom table. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete custom table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/custom-tables/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete custom table");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tables"] });
      toast({
        title: "Table deleted",
        description: "Custom table has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete custom table.",
        variant: "destructive",
      });
    },
  });

  const toggleRowSelection = (rowId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
  };

  const handleCreateTable = () => {
    if (!tableName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a table name.",
        variant: "destructive",
      });
      return;
    }

    if (selectedRows.size === 0) {
      toast({
        title: "No locations selected",
        description: "Please select at least one location.",
        variant: "destructive",
      });
      return;
    }

    createTableMutation.mutate({
      name: tableName,
      description: tableDescription,
      rowIds: Array.from(selectedRows),
    });
  };

  const handleEditTable = async (table: CustomTable) => {
    setEditingTable(table);
    setTableName(table.name);
    setTableDescription(table.description || "");
    
    // Fetch current rows for this table
    try {
      const response = await apiRequest("GET", `/api/custom-tables/${table.id}/rows`);
      const rows = await response.json() as TableRow[];
      setSelectedRows(new Set(rows.map(r => r.id)));
      setIsEditDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load table data.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTable = () => {
    if (!editingTable) return;
    
    if (!tableName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a table name.",
        variant: "destructive",
      });
      return;
    }

    if (selectedRows.size === 0) {
      toast({
        title: "No locations selected",
        description: "Please select at least one location.",
        variant: "destructive",
      });
      return;
    }

    updateTableMutation.mutate({
      id: editingTable.id,
      name: tableName,
      description: tableDescription,
      rowIds: Array.from(selectedRows),
    });
  };

  const copyShareLink = async (customTable: CustomTable) => {
    const url = `${window.location.origin}/custom/${customTable.shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(customTable.id);
      setShareUrl(url);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard.",
      });
      setTimeout(() => setCopiedId(""), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const handleActionClick = (table: CustomTable) => {
    setSelectedTable(table);
    setActionDialogOpen(true);
  };

  const handleViewTable = () => {
    if (selectedTable) {
      window.open(`/custom/${selectedTable.shareId}`, "_blank");
      setActionDialogOpen(false);
    }
  };

  const handleDeleteTable = () => {
    if (selectedTable) {
      deleteTableMutation.mutate(selectedTable.id);
      setActionDialogOpen(false);
      setSelectedTable(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-black">
      {/* Simple Header with Home Button */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="w-full px-4">
          <div className="flex h-14 items-center justify-between text-[12px]">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
                  <img 
                    src="/assets/Logofm.png" 
                    alt="Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0 leading-tight">
                  <span className="font-bold text-slate-600 dark:text-slate-300 leading-none" style={{ fontSize: '12px' }}>Custom Tables</span>
                  <span className="text-slate-400 dark:text-slate-500 leading-none my-0.5" style={{ fontSize: '9px' }}>Create table , select list and share </span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              size="sm"
              className="btn-glass w-8 h-8 md:w-auto md:h-9 p-0 md:px-3 pagination-button group transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 active:shadow-none"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-all duration-300" />
              <span className="hidden md:inline ml-2 text-xs transition-all duration-300">Back</span>
            </Button>
          </div>
        </div>
      </nav>
      <main className="min-h-screen pt-[72px] pb-20">
        <div className="w-full mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className={`text-sm ${isEditDialogOpen ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-600 dark:text-gray-400"}`}>
            {selectedRows.size} location(s) selected
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={selectedRows.size === 0}
            className={`bg-transparent border border-gray-300 dark:border-gray-700 ${
              selectedRows.size > 0 
                ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10" 
                : "text-gray-400 dark:text-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Table
          </Button>
        </div>

        {/* Location Selection Table */}
        <div className="bg-white/90 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl overflow-hidden mb-8">
          {/* Header with Search */}
          <div className="p-6 pb-4 border-b border-gray-300 dark:border-white/10">
            <h2 className="text-sm font-semibold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Select Locations
            </h2>
            <div className="flex gap-3">
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-white dark:bg-black/20 border-gray-300 dark:border-white/20 text-sm h-8 shadow-sm"
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center px-3 bg-white dark:bg-black/20 rounded-md border border-gray-300 dark:border-white/20 shadow-sm font-medium">
                {selectedRows.size} selected
              </div>
            </div>
          </div>

          {/* Table with Scroll */}
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800/50 dark:to-slate-900/50 sticky top-0 z-10">
                <tr className="border-b-2 border-gray-300 dark:border-white/10">
                  <th className="px-3 py-2 text-center text-xs font-semibold whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.size === filteredRows.length && filteredRows.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows(new Set(filteredRows.map(row => row.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-semibold whitespace-nowrap">Route</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold whitespace-nowrap">Code</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold whitespace-nowrap">Location</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold whitespace-nowrap">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-600 dark:text-gray-400">
                      {searchTerm ? "No locations found matching your search" : "No locations available"}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, index) => {
                    const isSelected = selectedRows.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`custom-table-row border-b border-gray-200 dark:border-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer ${
                          isSelected ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-900 dark:text-gray-100"
                        }`}
                        onClick={() => toggleRowSelection(row.id)}
                      >
                        <td className="px-3 py-2 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(row.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className={`px-2 py-2 text-xs whitespace-nowrap text-center ${isSelected ? "font-semibold" : ""}`}>
                          {row.route}
                        </td>
                        <td className={`px-2 py-2 text-xs whitespace-nowrap text-center ${isSelected ? "font-semibold" : ""}`}>
                          {row.code}
                        </td>
                        <td className={`px-4 py-2 text-xs whitespace-nowrap text-center ${isSelected ? "font-semibold" : ""}`}>
                          {row.location}
                        </td>
                        <td className={`px-4 py-2 text-xs whitespace-nowrap text-center ${isSelected ? "font-semibold" : ""}`}>
                          {row.delivery}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800/50 dark:to-slate-900/50 border-t border-gray-300 dark:border-white/10">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Showing {filteredRows.length} of {tableRows.length} location(s)
            </div>
          </div>
        </div>

        {/* Existing Custom Tables */}
        <div className="bg-white/90 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
          <h6 className="font-semibold mb-4 text-gray-900 dark:text-white text-center" style={{ fontSize: '12px' }}>My Custom Tables</h6>
          {customTables.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No custom tables yet. Create one to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {customTables.map((table) => {
                const isExpanded = expandedTableId === table.id;
                return (
                  <div
                    key={table.id}
                    className="custom-table-card bg-transparent dark:bg-transparent rounded-xl border border-transparent dark:border-transparent hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* Main Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* Title & Toggle */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-[13px] truncate">
                              {table.name}
                            </h3>
                            {(table.description || table.createdAt) && (
                              <button
                                onClick={() => setExpandedTableId(isExpanded ? null : table.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Single Action Button */}
                        <button
                          onClick={() => handleActionClick(table)}
                          className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110 active:scale-95"
                          title="Actions"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* Collapsible Section */}
                      {isExpanded && (table.description || table.createdAt) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2 animate-in slide-in-from-top-2 duration-200">
                          {table.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              📝 {table.description}
                            </p>
                          )}
                          {table.createdAt && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-500">
                              🗓️ Created {new Date(table.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Table Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent 
          className="bg-white/90 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl"
          style={{
            maxHeight: 'min(80vh, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 40px))',
            touchAction: 'pan-y',
          }}
        >
          <div 
            className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 border-0 shadow-inner" 
            style={{
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          />
          <DialogHeader 
            className="relative z-10"
            style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
          >
            <DialogTitle>Create Custom Table</DialogTitle>
            <DialogDescription>
              Enter a name and optional description for your custom table.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 relative z-10">
            <div>
              <label className="text-sm font-medium mb-2 block">Table Name *</label>
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g., Weekend Deliveries"
                className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Input
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
                placeholder="Add a description..."
                className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRows.size} location(s) will be included in this table
            </div>
          </div>
          <DialogFooter 
            className="relative z-10"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="bg-transparent border-transparent text-red-500 hover:bg-red-500/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTable}
              disabled={createTableMutation.isPending}
              loading={createTableMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createTableMutation.isPending ? "Creating..." : "Create Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingTable(null);
          setTableName("");
          setTableDescription("");
          setSelectedRows(new Set());
        }
      }}>
        <DialogContent 
          className="bg-white/90 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl max-h-[80vh] overflow-y-auto"
          style={{
            maxHeight: 'min(80vh, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 40px))',
            touchAction: 'pan-y',
          }}
        >
          <div 
            className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 border-0 shadow-inner" 
            style={{
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          />
          <DialogHeader 
            className="relative z-10"
            style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
          >
            <DialogTitle>Edit Custom Table</DialogTitle>
            <DialogDescription>
              Update name, description, or add/remove locations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 relative z-10">
            <div>
              <label className="text-sm font-medium mb-2 block">Table Name *</label>
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g., Weekend Deliveries"
                className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Input
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
                placeholder="Add a description..."
                className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRows.size} location(s) selected
            </div>
            
            {/* Location Selection */}
            <div className="border-t pt-4 space-y-2 max-h-[300px] overflow-y-auto">
              <h4 className="font-medium text-sm mb-2">Select Locations:</h4>
              {filteredRows.map((row) => (
                <label 
                  key={row.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded cursor-pointer"
                >
                  <Checkbox
                    checked={selectedRows.has(row.id)}
                    onCheckedChange={() => toggleRowSelection(row.id)}
                  />
                  <span className="text-sm">
                    {row.location} ({row.route})
                  </span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter 
            className="relative z-10"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-transparent border-transparent text-red-500 hover:bg-red-500/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTable}
              disabled={updateTableMutation.isPending}
              loading={updateTableMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateTableMutation.isPending ? "Updating..." : "Update Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="bg-white/90 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl max-w-sm">
          <div 
            className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30" 
            style={{
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-center text-base">{selectedTable?.name}</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Choose an action
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 relative z-10">
            {/* Share */}
            <button
              onClick={() => {
                if (selectedTable) {
                  copyShareLink(selectedTable);
                  setActionDialogOpen(false);
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            >
              <Share2 className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Copy Share Link</span>
            </button>

            {/* View */}
            <button
              onClick={handleViewTable}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
            >
              <Eye className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">View Table</span>
            </button>

            {/* Edit */}
            <button
              onClick={() => {
                if (selectedTable) {
                  handleEditTable(selectedTable);
                  setActionDialogOpen(false);
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
            >
              <Edit className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Edit Locations</span>
            </button>

            {/* Delete */}
            <button
              onClick={handleDeleteTable}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <Trash2 className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Delete Table</span>
            </button>
          </div>
          <DialogFooter className="relative z-10">
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              className="w-full bg-transparent border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}

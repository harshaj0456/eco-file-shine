import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Shield,
  Minimize2,
  Archive,
  Trash2,
  Tag,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpDown,
  MoreHorizontal,
  Folder,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataStore } from "@/lib/store/dataStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useHistoryStore } from "@/lib/store/historyStore";
import { formatStorageValue, formatCarbonValue } from "@/lib/services/CarbonCalculator";
import type { DigitalFile, FileActionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FileManagementTable({
  selectedIds,
  onSelectionChange,
}: {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) {
  const { files, setFileStatus, batchSetFileStatus, updateFileTags, updateFileNotes } = useDataStore();
  const settings = useSettingsStore((s) => s.settings);
  const { undo, redo, past, future } = useHistoryStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FileActionStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"size" | "age" | "name" | "carbon">("size");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [lastSelectedIdx, setLastSelectedIdx] = useState<number | null>(null);

  // Filter & Sort
  const filteredFiles = useMemo(() => {
    return files
      .filter((f) => {
        if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
        if (statusFilter !== "all" && f.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            f.name.toLowerCase().includes(q) ||
            f.folder.toLowerCase().includes(q) ||
            f.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "size") diff = a.sizeGB - b.sizeGB;
        if (sortBy === "age") diff = a.ageMonths - b.ageMonths;
        if (sortBy === "name") diff = a.name.localeCompare(b.name);
        if (sortBy === "carbon") diff = a.carbonGramsAnnual - b.carbonGramsAnnual;
        return sortOrder === "desc" ? -diff : diff;
      });
  }, [files, categoryFilter, statusFilter, search, sortBy, sortOrder]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredFiles.map((f) => f.id));
    }
  };

  const handleRowClick = (fileId: string, index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIdx !== null) {
      // Multi-select with Shift+Click
      const start = Math.min(lastSelectedIdx, index);
      const end = Math.max(lastSelectedIdx, index);
      const rangeIds = filteredFiles.slice(start, end + 1).map((f) => f.id);
      const next = Array.from(new Set([...selectedIds, ...rangeIds]));
      onSelectionChange(next);
    } else {
      // Toggle single selection
      if (selectedIds.includes(fileId)) {
        onSelectionChange(selectedIds.filter((id) => id !== fileId));
      } else {
        onSelectionChange([...selectedIds, fileId]);
      }
      setLastSelectedIdx(index);
    }
  };

  const statusBadges: Record<FileActionStatus, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: "text-blue-500", bg: "bg-blue-500/10" },
    kept: { label: "Kept", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    compressed: { label: "Compressed", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    archived: { label: "Archived", color: "text-amber-500", bg: "bg-amber-500/10" },
    deleted: { label: "Purged", color: "text-rose-500", bg: "bg-rose-500/10" },
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs font-sans space-y-4">
      {/* Top Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 min-w-64">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files, folders, or tags…"
              className="h-8 pl-8 text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
          >
            <option value="all">All Categories</option>
            {settings.dataDiet.categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="kept">Kept</option>
            <option value="compressed">Compressed</option>
            <option value="archived">Archived</option>
            <option value="deleted">Purged</option>
          </select>
        </div>

        {/* Undo/Redo & Batch Action Tools */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={past.length === 0}
            onClick={undo}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="mr-1 size-3" /> Undo ({past.length})
          </Button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-emerald-600 hover:bg-emerald-500/10 font-semibold"
                onClick={() => batchSetFileStatus(selectedIds, "kept")}
              >
                <Shield className="mr-1 size-3" /> Keep ({selectedIds.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-blue-600 hover:bg-blue-500/10 font-semibold"
                onClick={() => batchSetFileStatus(selectedIds, "compressed")}
              >
                <Minimize2 className="mr-1 size-3" /> Compress
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-amber-600 hover:bg-amber-500/10 font-semibold"
                onClick={() => batchSetFileStatus(selectedIds, "archived")}
              >
                <Archive className="mr-1 size-3" /> Archive
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => batchSetFileStatus(selectedIds, "deleted")}
              >
                <Trash2 className="mr-1 size-3" /> Purge
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="w-10 px-3 py-2 text-center">
                <button
                  onClick={handleSelectAll}
                  className="grid size-4 place-items-center rounded text-muted-foreground hover:text-foreground"
                >
                  {selectedIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
                    <CheckSquare className="size-4 text-primary" />
                  ) : (
                    <Square className="size-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-2 font-bold cursor-pointer select-none" onClick={() => { setSortBy("name"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                <span className="flex items-center gap-1">File Name & Path <ArrowUpDown className="size-2.5 opacity-50" /></span>
              </th>
              <th className="px-3 py-2 font-bold cursor-pointer select-none" onClick={() => { setSortBy("size"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                <span className="flex items-center gap-1">Size <ArrowUpDown className="size-2.5 opacity-50" /></span>
              </th>
              <th className="px-3 py-2 font-bold cursor-pointer select-none" onClick={() => { setSortBy("age"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                <span className="flex items-center gap-1">Age & Usage <ArrowUpDown className="size-2.5 opacity-50" /></span>
              </th>
              <th className="px-3 py-2 font-bold">Category & Tags</th>
              <th className="px-3 py-2 font-bold">Status</th>
              <th className="px-3 py-2 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No files matching your search filters.
                </td>
              </tr>
            ) : (
              filteredFiles.map((file, idx) => {
                const isSelected = selectedIds.includes(file.id);
                const statusBadge = statusBadges[file.status] || statusBadges.active;

                return (
                  <tr
                    key={file.id}
                    onClick={(e) => handleRowClick(file.id, idx, e)}
                    className={cn(
                      "transition-colors hover:bg-muted/40 cursor-pointer select-none",
                      isSelected && "bg-primary-soft/40 hover:bg-primary-soft/60"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-2.5 text-center">
                      <button className="grid size-4 place-items-center text-muted-foreground">
                        {isSelected ? (
                          <CheckSquare className="size-4 text-primary" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </td>

                    {/* Name & Folder */}
                    <td className="px-3 py-2.5 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate" title={file.name}>
                          {file.name}
                        </span>
                        {file.isDuplicate && (
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.2 text-[9px] font-bold text-rose-500">
                            Duplicate
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        📁 {file.folder}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-3 py-2.5 font-mono font-bold text-foreground whitespace-nowrap">
                      {formatStorageValue(file.sizeGB, settings.units.storage)}
                    </td>

                    {/* Age & Access */}
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                      <div>{file.ageMonths} months old</div>
                      <div className="text-[10px] text-muted-foreground/70">
                        {file.accessCount} open{file.accessCount === 1 ? "" : "s"} ({file.lastAccessedDaysAgo}d ago)
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                          {file.category}
                        </span>
                        {file.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-secondary px-1.5 py-0.2 text-[9px] font-medium text-secondary-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          statusBadge.bg,
                          statusBadge.color
                        )}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Individual Actions */}
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-emerald-500"
                          title="Keep"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileStatus(file.id, "kept");
                          }}
                        >
                          <Shield className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-blue-500"
                          title="Compress"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileStatus(file.id, "compressed");
                          }}
                        >
                          <Minimize2 className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-amber-500"
                          title="Archive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileStatus(file.id, "archived");
                          }}
                        >
                          <Archive className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          title="Purge"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileStatus(file.id, "deleted");
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>
          Showing {filteredFiles.length} of {files.length} total files · Shift+Click to multi-select
        </span>
        <span className="font-bold text-foreground">
          Selected: {selectedIds.length} items
        </span>
      </div>
    </div>
  );
}

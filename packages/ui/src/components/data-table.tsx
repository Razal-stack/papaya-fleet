"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ label: string; value: string }>;
  }>;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  actionButton?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  filters = [],
  pageSize = 10,
  onRowClick,
  actionButton,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    // Add custom filter function for case-insensitive filtering
    filterFns: {
      fuzzy: (row, columnId, filterValue) => {
        const value = row.getValue(columnId);
        if (value == null) return false;
        // Case-insensitive comparison
        return String(value).toLowerCase() === String(filterValue).toLowerCase();
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: rowsPerPage,
      },
    },
  });

  React.useEffect(() => {
    table.setPageSize(rowsPerPage);
  }, [rowsPerPage, table]);

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center flex-1 space-x-2">
          {/* Global Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9 h-10 bg-background border-input rounded-md shadow-sm hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-colors"
            />
          </div>

          {/* Filters */}
          {filters.map((filter) => (
            <DropdownMenu key={filter.key}>
              <DropdownMenuTrigger className="h-9 px-3.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm inline-flex items-center justify-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                <Filter className="mr-2 h-4 w-4" />
                {filter.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuCheckboxItem
                  checked={!table.getColumn(filter.key)?.getFilterValue()}
                  onCheckedChange={() => {
                    const column = table.getColumn(filter.key);
                    if (column) {
                      column.setFilterValue(undefined);
                    }
                  }}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {filter.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={table.getColumn(filter.key)?.getFilterValue() === option.value}
                    onCheckedChange={(checked) => {
                      const column = table.getColumn(filter.key);
                      if (column) {
                        column.setFilterValue(checked ? option.value : undefined);
                      }
                    }}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Views and Action Button */}
        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 px-3.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm inline-flex items-center justify-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              <Eye className="mr-2 h-4 w-4" />
              Views
              <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/([A-Z])/g, " $1").trim()}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Action Button */}
          {actionButton}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 360px)" }}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="h-10 px-4 text-xs font-semibold text-muted-foreground bg-muted/30"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "h-[50px] border-b border-border/50 transition-colors text-[15px]",
                      onRowClick && "cursor-pointer hover:bg-muted/30",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-0 h-[50px]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-3 py-3 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium">
            Showing {table.getState().pagination.pageIndex * rowsPerPage + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * rowsPerPage,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            results
          </span>

          <Select value={`${rowsPerPage}`} onValueChange={(value) => setRowsPerPage(Number(value))}>
            <SelectTrigger className="h-8 w-[70px] rounded-md border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm font-medium px-3 py-1 bg-background rounded-lg border border-input shadow-sm">
              Page <span className="font-semibold text-primary">{currentPage}</span> of{" "}
              <span className="font-semibold">{pageCount}</span>
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

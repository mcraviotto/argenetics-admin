"use client";

import NotificationsDialog from "@/components/notifications-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setDialogsState } from "@/lib/store/dialogs-store";
import { cn } from "@/lib/utils";
import { useListClientsQuery } from "@/services/doctors";
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  DnaOff,
  Filter,
  Megaphone,
  Plus,
  Search
} from "lucide-react";
import { Link } from 'next-view-transitions';
import { useId, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";

export default function UsersTable() {
  const id = useId();

  const [searchFilter, setSearchFilter] = useState<string>("");

  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);

  const { data: clients, isLoading } = useListClientsQuery({
    query: debouncedSearchFilter
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const [sorting, setSorting] = useState<SortingState>([{
    id: "name",
    desc: false,
  }]);

  const table = useReactTable({
    data: clients ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  const renderLoadingCell = (colIndex: number, isLoading: boolean) => {
    switch (colIndex) {
      case 0:
        return (
          <Skeleton className="w-4 h-4 rounded-md border-none blur-[2px]" />
        );
      case 4:
        return (
          <Badge className={cn("shadow-lg w-fit", status_adapter["inactive"].color)}>
            <p className={cn("blur-[6px]")}>Invitado</p>
          </Badge>
        );
      case 5:
        return (
          <div className="flex justify-end">
            <Skeleton className="w-[40px] h-[40px] rounded-full border-none" />
            <Skeleton className="w-[40px] h-[40px] rounded-full border-none" />
          </div>
        );
      default:
        return (
          <span
            className={cn(
              "font-medium transition-all duration-200",
              isLoading ? "text-muted-foreground font-normal blur-[6px]" : "blur-none"
            )}
          >
            jdflsafjladk
          </span>
        );
    }
  }

  const uniqueStatusValues = useMemo(() => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return [];

    const values = Array.from(statusColumn.getFacetedUniqueValues().keys());
    return values.sort();
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  const statusCounts = useMemo(() => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return new Map();
    return statusColumn.getFacetedUniqueValues();
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("status")?.getFilterValue()]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-210px)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              className="h-9 peer ps-9"
              placeholder="Buscar por nombre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <Search size={16} strokeWidth={2} aria-hidden="true" />
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="shadow-sm shrink-0">
                <Filter />
                Estado
                {selectedStatuses.length > 0 && (
                  <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">Filters</div>
                <div className="space-y-3">
                  {uniqueStatusValues.map((value, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-${i}`}
                        checked={selectedStatuses.includes(value)}
                        onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                      />
                      <Label
                        htmlFor={`${id}-${i}`}
                        className="flex grow justify-between gap-2 font-normal"
                      >
                        {status_adapter[value as keyof typeof status_adapter].label}
                        <span className="ms-2 text-xs text-muted-foreground">
                          {statusCounts.get(value)}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => {
              setDialogsState({
                open: "notifications",
                payload: {
                  clients_count: table.getSelectedRowModel().rows.length,
                  clients_ids: table.getSelectedRowModel().rows.map((row) => row.original.id),
                  global: table.getSelectedRowModel().rows.length ? false : true,
                }
              })
            }}
            className={cn("ml-auto transition-all")}
            variant="outline"
          >
            <Megaphone
              className="-ms-1 me-2 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Envíar notificación
            {table.getSelectedRowModel().rows.length > 0 ? (
              <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                {table.getSelectedRowModel().rows.length}
              </span>
            ) : ' global'}
          </Button>
          <Button size="sm" className="ml-auto" asChild>
            <Link href="/users/new">
              <Plus />
              Nuevo cliente
            </Link>
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background flex shadow-lg shadow-border h-full">
        <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none">
          <TableHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={`loading-${index}-${colIndex}`}
                      className="last:py-0 last:text-right h-[55px]"
                    >
                      {renderLoadingCell(colIndex, isLoading)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center text-muted-foreground absolute inset-0">
                    <DnaOff className="w-8 h-8" />
                    <p className="text-center">No se encontraron estudios.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-8">
        <div className="flex grow justify-start whitespace-nowrap text-sm text-muted-foreground">
          <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
            Mostrando{" "}
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                  table.getState().pagination.pageSize,
                  0,
                ),
                table.getRowCount(),
              )}
            </span>{" "}
            de{" "}<span className="text-foreground">{table.getRowCount().toString()}</span>
            {" "}resultados
          </p>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      <NotificationsDialog />
    </div>
  );
}


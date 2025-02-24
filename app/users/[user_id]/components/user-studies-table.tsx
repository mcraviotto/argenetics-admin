"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useListClientStudiesQuery } from "@/services/studies";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  DnaOff
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { columns } from "./columns";

export default function UserStudiesTable() {
  const params = useParams();
  const userId = params.user_id as string;

  const { data: client_studies, isLoading } = useListClientStudiesQuery(userId);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: client_studies?.per_page ?? 20,
  });

  const data = client_studies?.data ?? [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-262px)]">
      <div className="overflow-hidden rounded-lg border border-border bg-background flex shadow-lg shadow-border h-full">
        <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none">
          <TableHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: `${header.getSize()}px` }} className="h-11">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`loading-${index}-${colIndex}`} className="last:py-0 last:text-right h-[55px]">
                      {colIndex === 2 ? (
                        <Badge className={cn("shadow-lg w-fit", status_adapter["inactive"].color)}>
                          <p className={cn("blur-[6px]")}>Procesando</p>
                        </Badge>
                      ) : colIndex === 3 ? (
                        <div className="flex justify-end">
                          <Skeleton className="w-[40px] h-[40px] rounded-full border-none blur-[2px]" />
                          <Skeleton className="w-[40px] h-[40px] rounded-full border-none blur-[2px]" />
                        </div>
                      ) : (
                        <span
                          className={cn(
                            "font-medium transition-all duration-200",
                            "text-muted-foreground font-normal blur-[6px]"
                          )}
                        >
                          jdflsafjladk
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0">
                      <span className="transition-all duration-500 block" style={{ filter: "blur(0)" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
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
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getRowCount()
              )}
            </span>{" "}
            de{" "}
            <span className="text-foreground">{table.getRowCount().toString()}</span> resultados
          </p>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
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
    </div>
  );
}

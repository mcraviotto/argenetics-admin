"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useListPatientsQuery } from "@/services/patients";
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
  Plus,
  Search
} from "lucide-react";
import { Link } from 'next-view-transitions';
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./components/columns";

type Filters = {
  medical_institution_id: string;
  state: string
}

export default function PatientsPage() {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [filters, setFilters] = useState<Filters>({
    medical_institution_id: "",
    state: ""
  });

  //const { data: institutions } = useGetAllInstitutionsQuery({ query: "" });
  const { data: patients, isLoading: isLoadingPatients } = useListPatientsQuery({
    page: pagination.pageIndex + 1,
    medical_institution_id: filters?.medical_institution_id ?? "",
    query: debouncedSearchFilter ?? "",
    state: filters?.state === "all" ? "" : filters?.state
  });

  const [sorting, setSorting] = useState<SortingState>([{
    id: "name",
    desc: false,
  }]);

  const table = useReactTable({
    data: patients?.data ?? [],
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
    rowCount: patients?.total_elements ?? 0,
    manualPagination: true,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  const renderLoadingCell = (colIndex: number) => {
    switch (colIndex) {
      case 3:
        return (
          <Badge className={cn("shadow-lg w-fit bg-gray-200/50 rounded-sm blur-[4px]")}>
            <p className={cn("blur-[6px]")}>Invitado</p>
          </Badge>
        );
      case 4:
        return <Skeleton className="w-[40px] h-[40px] rounded-full border-none" />
      default:
        return (
          <span className="transition-all duration-200 text-muted-foreground font-normal blur-[6px]">
            jdflsafjladk
          </span>
        );
    }
  }

  return (
    <div className="space-y-1 flex flex-col h-[calc(100vh-162px)]">
      <h1 className="text-xl font-medium mb-3">
        Pacientes
      </h1>
      <div className="overflow-hidden rounded-sm bg-background shadow-md h-full flex flex-col">
        <div className="flex items-center justify-between gap-3 bg-background p-4 shadow-md border-b">
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-[400px]">
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
            <div className="flex items-center gap-4 w-full">
              <span className="text-sm font-medium text-nowrap">
                Filtrar por:
              </span>
              <Select
                onValueChange={(value) => setFilters({ ...filters, state: value })}
                value={filters?.state}
              >
                <SelectTrigger
                  className="w-[200px] h-9"
                >
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
              {/*             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-[200px] h-9 relative justify-between px-3 !shadow-none hover:border-ring/50 data-[state=open]:border-primary data-[state=open]:border-2 data-[state=open]:!shadow-md data-[state=open]:!shadow-primary/25"
                    )}
                  >
                    {filters?.medical_institution_id ? (
                      <div className="flex w-full items-center justify-between">
                        <p className="truncate">
                          {institutions?.find((institution) => institution.id === filters.medical_institution_id)?.name}
                        </p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilters({ ...filters, medical_institution_id: '' });
                          }}
                          className="cursor-pointer"
                        >
                          <X className="opacity-50" />
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-muted-foreground/50">
                          Centro médico
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Buscar..." className="h-10" />
                    <CommandList className="p-1">
                      <CommandEmpty>No hay resultados</CommandEmpty>
                      <CommandGroup>
                        {institutions?.map((institution) => (
                          <CommandItem
                            value={institution.id}
                            key={institution.id}
                            onSelect={() => {
                              setPagination({ ...pagination, pageIndex: 0 });
                              setFilters({
                                ...filters,
                                medical_institution_id: institution.id
                              });
                            }}
                          >
                            {institution.name}
                            <CheckIcon
                              className={cn(
                                "ml-auto",
                                institution.id === filters?.medical_institution_id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover> */}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="ml-auto" asChild>
              <Link href="/views/patients/new">
                <Plus />
                Nuevo paciente
              </Link>
            </Button>
          </div>
        </div>
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
          <TableBody className="h-full">
            {isLoadingPatients ? (
              Array.from({ length: 20 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell
                      key={`loading-${index}-${colIndex}`}
                      className="last:py-0 last:text-right h-[55px]"
                    >
                      {renderLoadingCell(colIndex)}
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
        <div className="flex items-center justify-between gap-8 bg-background p-4 rounded-b-sm border-t mt-auto">
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
      </div>
    </div>
  );
}


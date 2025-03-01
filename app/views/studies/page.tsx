'use client'

import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserQuery } from "@/services/auth";
import { useListStudiesQuery } from "@/services/studies";
import { PaginationState } from "@tanstack/react-table";
import { format, parse } from "date-fns";
import { ChevronDown, DnaOff, FilePlus2, Plus, Search, X } from "lucide-react";
import { Link } from 'next-view-transitions';
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./components/columns";
import PatientStudyCard from "./components/patient-study-card";

type Filters = {
  date: string;
  state: string;
  medical_institution_id: string;
}

export default function StudiesPage() {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [filters, setFilters] = useState<Filters>({
    date: "",
    state: "",
    medical_institution_id: ""
  });

  const { data: user, isLoading: isUserLoading } = useUserQuery();
  const { data: studies, isLoading: isLoadingStudies } = useListStudiesQuery({
    page: pagination.pageIndex + 1,
    date: filters?.date ?? "",
    query: debouncedSearchFilter ?? "",
    state: filters?.state === "all" ? "" : filters?.state,
    medical_institution_id: filters?.medical_institution_id ?? "",
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
    <div className={cn("space-y-1 flex flex-col h-[calc(100vh-162px)]")}>
      <h1 className="text-xl font-medium mb-3">Estudios</h1>
      <div
        className={cn(
          "relative overflow-auto rounded-sm bg-background shadow-md h-full flex flex-col transition-all",
          user?.userable_type === "Patient" && "bg-transparent border-none shadow-none pb-4 pr-2",
          isUserLoading && "blur-sm"
        )}
      >
        <div
          className={cn(
            "flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 bg-background p-4 shadow-md border-b",
            user?.userable_type === "Patient" && "rounded-md border-none lg:sticky top-0 z-10"
          )}
        >
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 w-full">
            <div className="relative w-full xl:w-[400px]">
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
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 w-full">
              <span className="text-sm font-medium whitespace-nowrap">Filtrar por:</span>
              <Select
                onValueChange={(value) => setFilters({ ...filters, state: value })}
                value={filters?.state}
              >
                <SelectTrigger className="w-full xl:w-[200px] h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready_to_download">Activo</SelectItem>
                  <SelectItem value="requested_to_download">Solicitado</SelectItem>
                  <SelectItem value="initial">Inicial</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full xl:w-[200px] h-9 relative justify-between px-3 !shadow-none hover:border-ring/50 data-[state=open]:border-primary data-[state=open]:border-2 data-[state=open]:!shadow-md data-[state=open]:!shadow-primary/25"
                    )}
                  >
                    {filters?.date ? (
                      <div className="flex w-full items-center justify-between">
                        <p className="truncate">
                          {format(parse(filters.date, 'dd/MM/yyyy', new Date()), "PPP")}
                        </p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilters({ ...filters, date: '' });
                          }}
                          className="cursor-pointer"
                        >
                          <X className="opacity-50" />
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-muted-foreground/50">Fecha</span>
                        <ChevronDown className={cn("text-muted-foreground/50")} />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.date
                        ? parse(filters.date, "dd/MM/yyyy", new Date())
                        : new Date()
                    }
                    onSelect={(date) => {
                      setFilters({
                        ...filters,
                        date: date ? format(date, "dd/MM/yyyy") : ""
                      });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
            <Button size="sm" className="w-full xl:w-auto" asChild>
              <Link href="/views/studies/new">
                <Plus />
                Nuevo estudio
              </Link>
            </Button>
          </div>
        </div>

        {user?.userable_type === "Patient" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {(!studies?.data?.length && !isLoadingStudies) && (
              <div className="flex flex-col items-center justify-center col-span-full inset-0 text-muted-foreground gap-2 absolute">
                <DnaOff className="w-7 h-7" />
                <p className="text-center text-sm">No se encontraron estudios.</p>
              </div>
            )}
            {studies?.data?.map((study) => (
              <PatientStudyCard key={study.id} study={study} />
            ))}
          </div>
        ) : (
          <DataTable
            data={studies?.data ?? []}
            columns={columns}
            loading={isLoadingStudies}
            pagination={pagination}
            setPagination={setPagination}
            renderLoadingCell={renderLoadingCell}
            rowCount={studies?.total_elements ?? 0}
            emptyDataMessage={
              <div className="flex flex-col items-center justify-center">
                <FilePlus2 className="w-8 h-8" />
                <p className="text-center">No se encontraron estudios.</p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

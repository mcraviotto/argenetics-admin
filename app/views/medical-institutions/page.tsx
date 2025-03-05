"use client";

import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useListInstitutionsQuery } from "@/services/institutions";
import {
  PaginationState
} from "@tanstack/react-table";
import {
  DnaOff,
  Hospital,
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

export default function MedicalInstitutionsPage() {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [filters, setFilters] = useState<Filters>({
    medical_institution_id: "",
    state: ""
  });

  const { data: institutions, isLoading: isLoadingInstitution } = useListInstitutionsQuery({
    page: pagination.pageIndex + 1,
    query: debouncedSearchFilter ?? "",
    state: filters?.state === "all" ? "" : filters?.state
  });

  const renderLoadingCell = (colIndex: number) => {
    switch (colIndex) {
      case 4:
        return (
          <Badge className={cn("shadow-lg w-fit bg-gray-200/50 rounded-sm blur-[4px]")}>
            <p className={cn("blur-[6px]")}>Invitado</p>
          </Badge>
        );
      case 3:
        return <Skeleton className="w-[40px] h-[40px] rounded-full border-none" />

      default:
        return (
          <span
            className={cn("transition-all duration-200 text-muted-foreground font-normal blur-[6px]")}
          >
            jdflsafjladk
          </span>
        );
    }
  }

  return (
    <div className="space-y-1 flex flex-col h-[calc(100vh-162px)] px-2 sm:px-4">
      <h1 className="text-xl font-medium mb-3">Centros médicos</h1>
      <div className="overflow-hidden rounded-sm bg-background shadow-md h-full flex flex-col">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-background p-3 sm:p-4 shadow-md border-b">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
            <div className="relative w-full lg:w-[400px]">
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
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
              <span className="text-sm font-medium whitespace-nowrap">Filtrar por:</span>
              <Select onValueChange={(value) => setFilters({ ...filters, state: value })} value={filters?.state}>
                <SelectTrigger className="w-full lg:w-[200px] h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end mt-2 lg:mt-0">
            <Button size="sm" className="w-full lg:w-auto" asChild>
              <Link href="/views/medical-institutions/new">
                <Plus className="mr-1" />
                Nuevo centro médico
              </Link>
            </Button>
          </div>
        </div>
        <DataTable
          data={institutions?.data ?? []}
          columns={columns}
          renderLoadingCell={renderLoadingCell}
          loading={isLoadingInstitution}
          pagination={pagination}
          setPagination={setPagination}
          rowCount={institutions?.total_elements ?? 0}
          emptyDataMessage={
            <div className="flex flex-col items-center justify-center">
              <Hospital className="w-8 h-8" />
              <p className="text-center">No se encontraron instituciones médicas.</p>
            </div>
          }
        />
      </div>
    </div>
  )
}


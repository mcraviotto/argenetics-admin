"use client";

import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useListPatientsQuery } from "@/services/patients";
import {
  PaginationState
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  UserRoundPlus
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
        <DataTable
          data={patients?.data ?? []}
          columns={columns}
          renderLoadingCell={renderLoadingCell}
          loading={isLoadingPatients}
          pagination={pagination}
          setPagination={setPagination}
          rowCount={patients?.total_elements ?? 0}
          emptyDataMessage={
            <div className="flex flex-col items-center justify-center">
              <UserRoundPlus className="w-8 h-8" />
              <p className="text-center">No se encontraron pacientes.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}


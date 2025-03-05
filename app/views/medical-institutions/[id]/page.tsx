"use client"

import DataTable from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, placeholder } from "@/lib/utils"
import { useListDoctorsQuery } from "@/services/doctors"
import { useGetInstitutionQuery } from "@/services/institutions"
import type { PaginationState } from "@tanstack/react-table"
import { ArrowLeft, Edit, Stethoscope } from "lucide-react"
import { Link } from "next-view-transitions"
import { useParams } from "next/navigation"
import { useState } from "react"
import { institutions_status_adapter } from "../utils"
import { columns } from "./components/columns"

export default function InstitutionPage() {
  const params = useParams<{ id: string }>()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { data: institution, isLoading } = useGetInstitutionQuery(params.id)
  const { data: doctors, isLoading: isLoadingDoctors } = useListDoctorsQuery({
    page: pagination.pageIndex + 1,
    medical_institution_id: params.id,
  })

  const renderLoadingCell = (colIndex: number) => {
    switch (colIndex) {
      case 4:
        return <Skeleton className="w-[40px] h-[40px] rounded-full border-none" />

      default:
        return (
          <span className={cn("transition-all duration-200 text-muted-foreground font-normal blur-[6px]")}>
            jdflsafjladk
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1
        className={cn(
          "text-xl md:text-2xl font-semibold transition-all duration-200",
          isLoading ? "blur-[4px]" : "blur-none",
        )}
      >
        {!institution ? placeholder(16) : institution.name}
      </h1>
      <div className="bg-background p-4 sm:p-6 rounded-md shadow-lg shadow-border space-y-4 sm:space-y-6 flex flex-col">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Nombre</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(16) : (institution?.name ?? "")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">CUIT</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(10) : (institution?.fiscal_number ?? "")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Correo electrónico</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(15) : (institution?.user?.email ?? "")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Número de teléfono principal</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(13) : (institution.primary_phone_number ?? "")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Número de teléfono secundario</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(13) : (institution.secondary_phone_number ?? "")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Dirección</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(12) : (institution.address ?? "")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Estado</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution
                ? placeholder(13)
                : institution.user?.state
                  ? institutions_status_adapter[institution.user?.state].label
                  : institutions_status_adapter.rejected.label}
            </span>
          </div>
          <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
            <label className="text-muted-foreground text-sm">Médicos</label>
            <div className="space-y-1 flex flex-col h-[300px] sm:h-[350px] md:h-[calc(100vh-634px)] min-h-[250px]">
              <DataTable
                data={doctors?.data ?? []}
                loading={isLoadingDoctors}
                columns={columns}
                pagination={pagination}
                setPagination={setPagination}
                renderLoadingCell={renderLoadingCell}
                rowCount={doctors?.total_elements ?? 0}
                emptyDataMessage={
                  <div className="flex flex-col items-center justify-center">
                    <Stethoscope className="w-8 h-8" />
                    <p className="text-center">No se encontraron médicos.</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-auto w-fit">
          <Button variant="ghost" asChild>
            <Link href={`/views/medical-institutions`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:block">
                Volver
              </span>
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/views/medical-institutions/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


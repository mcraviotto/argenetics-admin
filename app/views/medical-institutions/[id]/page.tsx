'use client'

import { Button } from "@/components/ui/button";
import { cn, placeholder } from "@/lib/utils";
import { useGetInstitutionQuery } from "@/services/institutions";
import { ArrowLeft, Edit } from "lucide-react";
import { Link } from "next-view-transitions";
import { useParams } from "next/navigation";
import { institutions_status_adapter } from "../utils";

export default function InstitutionPage() {
  const params = useParams<{ id: string }>()

  const { data: institution, isLoading } = useGetInstitutionQuery(params.id)

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className={cn("text-xl font-semibold transition-all duration-200", isLoading ? "blur-[4px]" : "blur-none")}>
        {!institution ? placeholder(16) : institution.name}
      </h1>
      <div className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1 grid-cols-2">
            <label className="text-muted-foreground text-sm">Nombre</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(16) : institution?.name ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">CUIT</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(10) : institution?.fiscal_number ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Correo electrónico</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(15) : institution?.user?.email ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Número de teléfono principal</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(13) : institution.primary_phone_number ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Número de teléfono secundario</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(13) : institution.secondary_phone_number ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Dirección</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(12) : institution.address ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Estado</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!institution ? placeholder(13)
                :
                institution.user?.state ? institutions_status_adapter[institution.user?.state].label : institutions_status_adapter.rejected.label
              }
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-auto w-fit">
          <Button
            variant="ghost"
            asChild
          >
            <Link href={`/views/medical-institutions`}>
              <ArrowLeft />
              Volver
            </Link>
          </Button>
          <Button
            asChild
          >
            <Link href={`/views/medical-institutions/${params.id}/edit`}>
              <Edit />
              Editar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
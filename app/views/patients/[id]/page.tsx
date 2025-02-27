'use client'

import { gender_adapter } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { cn, placeholder } from "@/lib/utils";
import { useGetPatientQuery } from "@/services/patients";
import { ArrowLeft, Edit } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useParams } from "next/navigation";
import { patient_status_adapter } from "../utils";
import { provinces } from "@/app/data";
import { useUserQuery } from "@/services/auth";

export default function PatientPage() {
  const params = useParams<{ id: string }>()
  const router = useTransitionRouter()

  const { data: patient, isLoading } = useGetPatientQuery(params.id)
  const { data: user } = useUserQuery()

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className={cn("text-xl font-semibold transition-all duration-200", isLoading ? "blur-[4px]" : "blur-none")}>
        {!patient ? placeholder(14) : patient.first_name + " " + patient.last_name}
      </h1>
      <div className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1 grid-cols-2">
            <label className="text-muted-foreground text-sm">Nombre</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(10) : patient?.first_name ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Apellido/s</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(10) : patient?.last_name ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Correo electrónico</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(15) : patient?.user.email ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">DNI</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(9) : patient?.identification_number ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Fecha de nacimiento</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(10) : patient?.birth_date ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Género</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ?
                placeholder(12)
                :
                gender_adapter[patient.gender as keyof typeof gender_adapter] ?? ""
              }
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Provincia</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(13) : provinces.find(province => province.value === patient.state)?.label ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Ciudad</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(13) : patient.city ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Número de teléfono</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ? placeholder(13) : patient.phone_number ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Estado</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!patient ?
                placeholder(13)
                :
                patient_status_adapter[patient.user.state as keyof typeof patient_status_adapter].label ?? ""
              }
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-auto w-fit">
          <Button
            variant="ghost"
            asChild
          >
            <Link href={`/views/patients`}>
              <ArrowLeft />
              Volver
            </Link>
          </Button>
          <Button
            onClick={() => router.push(`/views/patients/${params.id}/edit`)}
            disabled={user?.userable_type !== "Administrator"}
          >
            <Edit />
            Editar
          </Button>
        </div>
      </div>
    </div>
  )
}
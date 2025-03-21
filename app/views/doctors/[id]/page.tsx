'use client'

import { gender_adapter } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { cn, placeholder } from "@/lib/utils";
import { useGetDoctorQuery } from "@/services/doctors";
import { ArrowLeft, Edit } from "lucide-react";
import { Link } from "next-view-transitions";
import { useParams } from "next/navigation";
import { doctor_speciality_adapter, doctor_status_adapter } from "../utils";
import { useUserQuery } from "@/services/auth";

export default function DoctorPage() {
  const params = useParams<{ id: string }>()

  const { data: doctor, isLoading } = useGetDoctorQuery(params.id)
  const { data: user } = useUserQuery();

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className={cn("text-xl font-semibold transition-all duration-200", isLoading ? "blur-[4px]" : "blur-none")}>
        {!doctor ? placeholder(14) : doctor.first_name + " " + doctor.last_name}
      </h1>
      <div className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1 grid-cols-2">
            <label className="text-muted-foreground text-sm">Nombre</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(10) : doctor?.first_name ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Apellido/s</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(10) : doctor?.last_name ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Correo electrónico</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(15) : doctor?.user.email ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">DNI</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(9) : doctor?.identification_number ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Fecha de nacimiento</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(10) : doctor?.birth_date ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Género</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ?
                placeholder(12)
                :
                gender_adapter[doctor.gender as keyof typeof gender_adapter] ?? ""
              }
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Número de teléfono</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(13) : doctor.phone_number ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Especialidad</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(10) : doctor_speciality_adapter[doctor.specialty as keyof typeof doctor_speciality_adapter] ?? ""}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Matrícula nacional</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ? placeholder(10) : doctor.national_licence ?? ""}
            </span>
          </div>
          {doctor?.provincial_licence &&
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-sm">Matrícula provincial</label>
              <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
                {!doctor ? placeholder(10) : doctor.provincial_licence}
              </span>
            </div>
          }
          {user?.userable_type !== "MedicalInstitution" &&
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-sm">Centros médicos</label>
              <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
                {!doctor ? placeholder(13) : doctor.medical_institutions.length > 0 ? doctor.medical_institutions.map((institution) => institution.name).join(", ") : "No asignado"}
              </span>
            </div>
          }
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Estado</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!doctor ?
                placeholder(13)
                :
                doctor_status_adapter[doctor.user.state as keyof typeof doctor_status_adapter].label ?? ""
              }
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-auto w-fit">
          <Button
            variant="ghost"
            asChild
          >
            <Link href={`/views/doctors`}>
              <ArrowLeft />
              Volver
            </Link>
          </Button>
          {user?.userable_type === "Administrator" &&
            <Button
              asChild
            >
              <Link href={`/views/doctors/${params.id}/edit`}>
                <Edit />
                Editar
              </Link>
            </Button>
          }
        </div>
      </div>
    </div>
  )
}
'use client'
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, placeholder } from "@/lib/utils";
import { useGetStudyQuery, useLazyDownloadStudyQuery } from "@/services/studies";
import { ArrowLeft, CheckIcon, Download, Edit, X } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useParams } from "next/navigation";
import { useState } from "react";
import { study_options } from "../data";
import { downloadFileFromUrl, formatReference, study_status_adapter } from "../utils";
import { useUserQuery } from "@/services/auth";

export default function StudyPage() {
  const params = useParams<{ id: string }>();
  const router = useTransitionRouter();

  const { data: study, isLoading } = useGetStudyQuery(params.id);
  const { data: user } = useUserQuery()
  const [downloadStudy] = useLazyDownloadStudyQuery();

  const [downloadStates, setDownloadStates] = useState<{ [key: string]: "success" | "failed" | null }>({});

  const handleDownload = async (document_type: string, id: string) => {
    const key = document_type;
    try {
      const response = await downloadStudy({ document_type, id }).unwrap();
      if (!response.url) throw new Error("No se pudo obtener la URL de descarga");

      await downloadFileFromUrl(response.url, `${document_type}-${id}`);

      setDownloadStates(prev => ({ ...prev, [key]: "success" }));
    } catch (error) {
      setDownloadStates(prev => ({ ...prev, [key]: "failed" }));
    } finally {
      setTimeout(() => setDownloadStates(prev => ({ ...prev, [key]: null })), 1500);
    }
  };

  console.log(study)

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1 className={cn("text-xl font-semibold transition-all duration-200", isLoading ? "blur-[4px]" : "blur-none")}>
        {!study ? placeholder(20) : study_options.flatMap(category => category.items).find(option => option.value === study?.title)?.label || (study?.title ?? "")}
      </h1>
      <div className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1 grid-cols-2">
            <label className="text-muted-foreground text-sm">Estudio</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!study ? placeholder(10) : study_options.flatMap(category => category.items).find(option => option.value === study?.title)?.label || (study?.title ?? "")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Paciente</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!study ? placeholder(16) : study?.patient_name ?? ""}
            </span>
          </div>
          <div className="flex flex-col">
            <label className="text-muted-foreground text-sm">Orden médica</label>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
                {!study ? placeholder(9) : formatReference(study?.medical_order_ref) || "No hay orden médica"}
              </span>
              {study?.medical_order_ref && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload("medical_order", params.id)}
                        disabled={!!downloadStates["medical_order"]}
                      >
                        <div className={cn("absolute transition-all", downloadStates["medical_order"] === "success" ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                          <CheckIcon className="stroke-emerald-500" aria-hidden="true" />
                        </div>
                        <div className={cn("absolute transition-all", downloadStates["medical_order"] === "failed" ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                          <X className="stroke-red-500" aria-hidden="true" />
                        </div>
                        <div className={cn("absolute transition-all", (downloadStates["medical_order"]) ? "scale-0 opacity-0" : "scale-100 opacity-100")}>
                          <Download aria-hidden="true" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">Descargar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-muted-foreground text-sm">Resultado</label>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
                {!study ? placeholder(10) : formatReference(study?.storage_ref) || "No hay resultado"}
              </span>
              {study?.storage_ref && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload("result", params.id)}
                        disabled={!!downloadStates["result"]}
                      >
                        <div className={cn("absolute transition-all", downloadStates["result"] === "success" ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                          <CheckIcon className="stroke-emerald-500" aria-hidden="true" />
                        </div>
                        <div className={cn("absolute transition-all", downloadStates["result"] === "failed" ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                          <X className="stroke-red-500" aria-hidden="true" />
                        </div>
                        <div className={cn("absolute transition-all", (downloadStates["result"]) ? "scale-0 opacity-0" : "scale-100 opacity-100")}>
                          <Download aria-hidden="true" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">Descargar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          {study?.additional_docs_storage_ref && (
            <div className="flex flex-col">
              <label className="text-muted-foreground text-sm">Documentos adicionales</label>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
                  {formatReference(study.additional_docs_storage_ref) || "No hay documentos adicionales"}
                </span>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload("additional_docs", params.id)}
                        disabled={!!downloadStates["additional_docs"]}
                      >
                        <div className={cn("absolute transition-all", downloadStates["additional_docs"] === "success" ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                          <CheckIcon className="stroke-emerald-500" aria-hidden="true" />
                        </div>
                        <div className={cn("absolute transition-all", downloadStates["additional_docs"] === "failed" ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                          <X className="stroke-red-500" aria-hidden="true" />
                        </div>
                        <div className={cn("absolute transition-all", (downloadStates["additional_docs"]) ? "scale-0 opacity-0" : "scale-100 opacity-100")}>
                          <Download aria-hidden="true" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">Descargar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Médico</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!study ? placeholder(15) : study?.doctor?.name || "No asignado"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm">Estado</label>
            <span className={cn("text-sm transition-all duration-300", isLoading ? "blur-[4px]" : "blur-none")}>
              {!study ? placeholder(13) : study_status_adapter[study.state as keyof typeof study_status_adapter].label ?? ""}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-auto w-fit">
          <Button variant="ghost" asChild>
            <Link href={`/views/studies`}>
              <ArrowLeft />
              Volver
            </Link>
          </Button>
          {user?.userable_type === "Administrator" &&
            <Button
              onClick={() => router.push(`/views/studies/${params.id}/edit`)}
            >
              <Edit />
              Editar
            </Button>
          }
        </div>
      </div>
    </div>
  );
}

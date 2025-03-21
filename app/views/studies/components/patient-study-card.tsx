import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { downloadFileFromUrl, study_status_adapter } from "../utils";
import { ListStudy } from "@/schemas/studies";
import { study_options } from "../data";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { useLazyDownloadStudyQuery, useRequestToDownloadStudyMutation, useUpdateStudyMutation } from "@/services/studies";

export default function PatientStudyCard({ study }: { study: ListStudy }) {
  const studyTitle =
    study_options.flatMap(category => category.items).find(s => s.value === study.title)?.label ||
    study.title;

  const [downloadStudy, { isLoading: isDownloadingStudy }] = useLazyDownloadStudyQuery();
  const [requestDownload, { isLoading: isRequestingDownload }] = useRequestToDownloadStudyMutation();

  const handleDownload = async (id: string) => {
    const document_type = "result";
    try {
      const response = await downloadStudy({ document_type, id }).unwrap();
      if (!response.url) throw new Error("No se pudo obtener la URL de descarga");

      await downloadFileFromUrl(response.url, `${document_type}-${id}`);
    } catch (error) {
      console.error(`Error al descargar ${document_type}:`, error);
    }
  };

  const handleUpdateStudyStatus = async (id: string) => {
    try {
      await requestDownload(id);
    } catch (error) {
      console.error(`Error al actualizar el estado del estudio:`, error);
    }
  }

  return (
    <div className="flex flex-col bg-background p-4 rounded-md shadow-md h-auto md:h-full">
      <div className="flex justify-between flex-wrap">
        <span className="text-md font-medium">{studyTitle}</span>
        <Badge
          className={cn(
            "shadow-none rounded-full",
            study_status_adapter[study.state as keyof typeof study_status_adapter].color
          )}
        >
          {study_status_adapter[study.state as keyof typeof study_status_adapter].label}
        </Badge>
      </div>
      <div className="flex flex-col mt-2">
        <div className="flex flex-wrap">
          <span className="text-sm text-muted-foreground">Doctor:</span>
          <span className="text-sm ml-1">{study?.doctor?.name || "No asignado"}</span>
        </div>
        <div className="flex flex-wrap">
          <span className="text-sm text-muted-foreground">Fecha del estudio:</span>
          <span className="text-sm ml-1">{study?.date}</span>
        </div>
      </div>
      <div className="mt-4 sm:mt-auto">
        {study.state === "expired" ? (
          <Button
            className="mt-4 w-full md:w-[167px]"
            size="sm"
            loading={isRequestingDownload}
            onClick={() => handleUpdateStudyStatus(study.id)}
          >
            <RotateCcw className="mr-1" />
            Solicitar de nuevo
          </Button>
        ) : study.state === "ready_to_download" ? (
          <Button
            className="mt-8 w-full md:w-[115px]"
            size="sm"
            loading={isDownloadingStudy}
            onClick={() => handleDownload(study.id)}
          >
            <Download className="mr-1" />
            Descargar
          </Button>
        ) : (
          study_status_adapter[study.state as keyof typeof study_status_adapter].patientLabel && (
            <span className="text-sm text-muted-foreground mt-2">
              {study_status_adapter[study.state as keyof typeof study_status_adapter].patientLabel}
            </span>
          )
        )}
      </div>
    </div>
  );
}

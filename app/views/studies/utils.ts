
export const study_status_adapter = {
  ready_to_download: {
    label: "Activo",
    patientLabel: "Listo para descargar.",
    color: "bg-green-200/50 text-green-700 hover:bg-green-300/50",
  },
  expired: {
    label: "Expirado",
    color: "bg-red-200/50 text-red-700 hover:bg-red-300/50",
    patientLabel: "El estudio ha expirado.",
  },
  requested_to_download: {
    label: "Solicitado",
    color: "bg-amber-200/50 text-amber-700 hover:bg-amber-300/50",
    patientLabel: "Enviamos tu solicitud de descarga.",
  },
  initial: {
    label: "Inicial",
    color: "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50",
    patientLabel: "Solicitado, enviamos tu solicitud de estudios.",
  },
  at_lab: {
    label: "En laboratorio",
    color: "bg-blue-200/50 text-blue-700 hover:bg-blue-300/50",
    patientLabel: "El estudio se encuentra en laboratorio.",
  },
  report_completed: {
    label: "Informe realizado",
    color: "bg-purple-200/50 text-purple-700 hover:bg-purple-300/50",
    patientLabel: "El informe del estudio está listo.",
  },
  pending_pickup: {
    label: "Coordina retiro",
    color: "bg-amber-200/50 text-amber-700 hover:bg-amber-300/50",
    patientLabel: "Coordina el retiro de tu estudio.",
  },
}

export const formatReference = (ref: string): string => {
  if (!ref) return "";

  const segments = ref.split("/");
  if (segments.length < 2) return ref;
  const fileSegment = segments[1];
  const dashIndex = fileSegment.indexOf("-");
  if (dashIndex === -1) return fileSegment;

  return fileSegment.slice(dashIndex + 1);
}

export const downloadFileFromUrl = async (url: string, filename: string) => {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
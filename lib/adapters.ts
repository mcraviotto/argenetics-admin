
export const status_adapter = {
  active: {
    label: "Activo",
    color: "bg-sky-100 text-sky-800 shadow-sky-100 hover:bg-sky-100/75",
  },
  inactive: {
    label: "Inactivo",
    color: "bg-gray-100 text-gray-800 shadow-gray-100 hover:bg-gray-100/75",
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 shadow-yellow-100 hover:bg-yellow-100/75",
  },
  invited: {
    label: "Invitado",
    color: "bg-yellow-100 text-yellow-800 shadow-yellow-100 hover:bg-yellow-100/75",
  },
  rejected: {
    label: "Rechazado",
    color: "bg-red-100 text-red-800 shadow-red-100 hover:bg-red-100/75",
  },
}

export const gender_adapter = {
  male: "Masculino",
  female: "Femenino",
}

export const study_status_adapter = {
  processing: {
    label: "Procesando",
    color: "bg-sky-100 text-sky-800 shadow-sky-100 hover:bg-sky-100/75",
  },
  processed: {
    label: "Procesado",
    color: "bg-emerald-50 text-emerald-800 shadow-emerald-50 hover:bg-emerald-50/75",
  },
  with_errors: {
    label: "Con errores",
    color: "bg-red-100 text-red-800 shadow-red-100 hover:bg-red-100/75",
  }
}
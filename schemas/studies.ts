import { z } from "zod";

export const listStudySchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string(),
  date: z.string(),
  state: z.enum(["ready_to_download", "initial", "requested_to_download", "expired"]),
  metadata: z.string(),
  storage_ref: z.string(),
  medical_order_ref: z.string(),
  patient_name: z.string(),
  doctor: z.object({
    name: z.string(),
    id: z.string(),
  }),
  patient: z.object({
    name: z.string(),
    id: z.string(),
  }),
  additional_docs_storage_ref: z.string(),
})

export const listStudiesResponseSchema = z.object({
  data: z.array(listStudySchema),
  current_page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_elements: z.number()
})

export const newStudySchema = z.object({
  title: z.string({ required_error: "El título es requerido" }).min(1, "El título es requerido"),
  code: z.string().optional(),
  state: z.enum(["ready_to_download", "initial", "requested_to_download", "expired"], { required_error: "El estado es requerido" }),
  storage_ref: z.instanceof(File).optional(),
  medical_order_ref: z.instanceof(File, { message: "La orden médica es requerida" }),
  additional_docs_storage_ref: z.instanceof(File).optional(),
  patient_id: z.string({ required_error: "El paciente es requerido" }).min(1, "El paciente es requerido"),
  doctor_id: z.string().optional(),
})


export type ListStudy = z.infer<typeof listStudySchema>
export type ListStudiesResponse = z.infer<typeof listStudiesResponseSchema>

export type NewStudy = z.infer<typeof newStudySchema>
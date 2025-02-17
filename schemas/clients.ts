import { CalendarDate } from "@internationalized/date";
import { DateValue } from "react-aria-components";
import { z } from "zod";

export const clientSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  identification_number: z.string(),
  birth_date: z.string(),
  gender: z.enum(["male", "female", "other"]),
  phone_number: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    userable_type: z.string(),
    state: z.enum(["active", "inactive", "pending", "rejected", "invited"]),
  }),
})

export const clientStudiesSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    title: z.string(),
    code: z.string(),
    date: z.string(),
    state: z.string(),
    client_name: z.string(),
    metadata: z.object({
      blocks: z.array(z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        day: z.string().optional(),
        dose: z.string().optional(),
        supplement: z.string().optional(),
      })).optional(),
      obs: z.string().optional(),
      note: z.string().optional(),
    }),
    client_id: z.string(),
    study_id: z.string(),
    storage_ref: z.string(),
  })),
  current_page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_elements: z.number(),
})

const dateValueSchema: z.ZodType<DateValue> = z.custom<DateValue>((data) => {
  return data instanceof CalendarDate;
}, { message: "La fecha debe ser un DateValue válido" });


export const newClientSchema = z.object({
  first_name: z.string({ required_error: "El nombre es requerido" }).min(1, { message: "El nombre es requerido" }),
  last_name: z.string({ required_error: "El apellido es requerido" }).min(1, { message: "El apellido es requerido" }),
  identification_number: z.string({ required_error: "La cédula es requerida" }).min(1, { message: "La cédula es requerida" }),
  birth_date: dateValueSchema,
  gender: z.enum(["male", "female", "other"], { required_error: "El género es requerido", invalid_type_error: "El género es requerido" }),
  phone_number: z.string({ required_error: "El teléfono es requerido" }).min(1, { message: "El teléfono es requerido" }),
  email: z.string({ required_error: "El email es requerido" }).email({ message: "El email es requerido" }),
})

export type Client = z.infer<typeof clientSchema>
export type ClientStudies = z.infer<typeof clientStudiesSchema>
export type NewClient = z.infer<typeof newClientSchema>
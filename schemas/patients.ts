import { z } from "zod";
import { newDoctorSchema, newPatientSchema } from "./auth";

export const listPatientSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  identification_number: z.string(),
  birth_date: z.string(),
  gender: z.enum(["male", "female", "other"]),
  phone_number: z.string(),
  state: z.string(),
  city: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    userable_type: z.string(),
    state: z.enum(["active", "pending", "rejected"]),
    confirmed: z.boolean()
  })
});

export const listPatientsResponseSchema = z.object({
  data: z.array(listPatientSchema),
  current_page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_elements: z.number()
});

export type NewPatient = z.infer<typeof newPatientSchema>;

export type ListPatient = z.infer<typeof listPatientSchema>;
export type ListPatientsResponse = z.infer<typeof listPatientsResponseSchema>;
import { z } from "zod";
import { newDoctorSchema } from "./auth";

export const listDoctorSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  identification_number: z.string(),
  birth_date: z.string(),
  gender: z.enum(["male", "female", "other"]),
  phone_number: z.string(),
  specialty: z.string(),
  national_licence: z.string(),
  provincial_licence: z.string().optional(),
  medical_institutions: z.array(z.object({
    id: z.string(),
    name: z.string()
  })),
  user: z.object({
    id: z.string(),
    email: z.string(),
    userable_type: z.string(),
    state: z.enum(["active", "pending", "rejected"]),
    confirmed: z.boolean()
  })
});

export const listDoctorsResponseSchema = z.object({
  data: z.array(listDoctorSchema),
  current_page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_elements: z.number()
});

export type NewDoctor = z.infer<typeof newDoctorSchema>;

export type ListDoctor = z.infer<typeof listDoctorSchema>;
export type ListDoctorsResponse = z.infer<typeof listDoctorsResponseSchema>;
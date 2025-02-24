import { z } from "zod";
import { newMedicalInstitutionSchema } from "./auth";

export const allInstitutionsSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
}))

export const listInstitutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  fiscal_number: z.string(),
  primary_phone_number: z.string(),
  secondary_phone_number: z.string(),
  address: z.string(),
  doctors_count: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    userable_type: z.literal("MedicalInstitution"),
    state: z.enum(["active", "pending", "rejected"]),
    confirmed: z.boolean(),
  }).nullable()
})

export const listInstitutionsResponseSchema = z.object({
  data: z.array(listInstitutionSchema),
  current_page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_elements: z.number()
});

export type ListInstitution = z.infer<typeof listInstitutionSchema>
export type ListInstitutionsResponse = z.infer<typeof listInstitutionsResponseSchema>

export type NewInstitution = z.infer<typeof newMedicalInstitutionSchema>

export type AllInstitutions = z.infer<typeof allInstitutionsSchema>

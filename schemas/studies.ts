import { z } from "zod";

export const studySchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string(),
})

export type Study = z.infer<typeof studySchema>

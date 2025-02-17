import { z } from "zod";

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  notification_type: z.enum(["in_app", "push"]),
  sent_by: z.string(),
  created_at: z.string(),
  clients_count: z.number(),
})

export const newNotificationSchema = z.object({
  title: z.string({ required_error: "El título es requerido" }).min(1, { message: "El título es requerido" }),
  body: z.string({ required_error: "El cuerpo es requerido" }).min(1, { message: "El cuerpo es requerido" }),
  notification_type: z.string({ required_error: "El tipo de notificación es requerido" }).min(1, { message: "El tipo de notificación es requerido" }),
})

export type Notification = z.infer<typeof notificationSchema>

import { CalendarDate } from "@internationalized/date";
import { DateValue } from "react-aria-components";
import { z } from "zod";

const dateValueSchema: z.ZodType<DateValue> = z.custom<DateValue>((data) => {
  return data instanceof CalendarDate;
}, { message: "La fecha es invalida" });

const baseUserSchema = z.object({
  email: z.string({ required_error: "El email es requerido" }).email({ message: "El email es requerido" }),
  password: z.string({ required_error: "La contraseña es requerida" }).min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  role: z.enum(["patient", "doctor", "medical_institution"], { required_error: "El rol es requerido" }),
});

const personCommonSchema = z.object({
  first_name: z.string({ required_error: "El nombre es requerido" }).min(1, { message: "El nombre es requerido" }),
  last_name: z.string({ required_error: "El apellido es requerido" }).min(1, { message: "El apellido es requerido" }),
  identification_number: z.string({ required_error: "El número de identificación es requerido" }).min(1, { message: "El número de identificación es requerido" }),
  birth_date: dateValueSchema,
  gender: z.enum(["male", "female", "other"], { required_error: "El género es requerido" }),
  phone_number: z.string({ required_error: "El número de teléfono es requerido" }).min(3, { message: "El número de teléfono es requerido" }),
});

export const newPatientSchema = baseUserSchema.extend({
  role: z.literal("patient"),
})
  .merge(personCommonSchema)
  .extend({
    city: z.string({ required_error: "La ciudad es requerida" }).min(1, { message: "La ciudad es requerida" }),
    state: z.string({ required_error: "La provincia es requerida" }).min(1, { message: "La provincia es requerida" }),
  });

export const newDoctorSchema = baseUserSchema.extend({
  role: z.literal("doctor"),
})
  .merge(personCommonSchema)
  .extend({
    specialty: z.string({ required_error: "La especialidad es requerida" }).min(1, { message: "La especialidad es requerida" }),
  });

export const newMedicalInstitutionSchema = baseUserSchema.extend({
  role: z.literal("medical_institution"),
  name: z.string({ required_error: "El nombre es requerido" }).min(1, { message: "El nombre es requerido" }),
  fiscal_number: z.string({ required_error: "El número de identificación fiscal es requerido" }).min(1, { message: "El número de identificación fiscal es requerido" }),
  primary_phone_number: z.string({ required_error: "El número de teléfono es requerido" }).min(3, { message: "El número de teléfono es requerido" }),
  secondary_phone_number: z.string().optional(),
  address: z.string({ required_error: "La dirección es requerida" }).min(1, { message: "La dirección es requerida" }),
});

export const signUpSchema = z.discriminatedUnion("role", [
  newPatientSchema.extend({
    birth_date: z.string({ required_error: "La fecha de nacimiento es requerida" }).min(1, { message: "La fecha de nacimiento es requerida" }),
  }),
  newDoctorSchema.extend({
    birth_date: z.string({ required_error: "La fecha de nacimiento es requerida" }).min(1, { message: "La fecha de nacimiento es requerida" }),
  }),
  newMedicalInstitutionSchema,
]);

export const signInSchema = z.object({
  email: z.string().email({
    message: "El email es requerido",
  }),
  password: z.string({ required_error: "La contraseña es requerida" }).min(1, {
    message: "La contraseña es requerida",
  }),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  userable_type: z.enum(["Administrator", "Patient", "Institution", "Doctor"]),
  state: z.enum(["active", "pending", "rejected"]),
  confirmed: z.boolean(),
  userable: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    abilities: z.string()
  }),
})

type SignInSuccess = {
  token: string
}

type SignInError = {
  message: string
}

export type SignInResponse = SignInSuccess | SignInError
export type SignInRequest = z.infer<typeof signInSchema>

export type SignUpRequest = z.infer<typeof signUpSchema>;

export type User = z.infer<typeof userSchema>
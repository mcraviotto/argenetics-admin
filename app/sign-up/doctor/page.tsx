"use client"

import { CountrySelect, FlagComponent, PhoneInput } from "@/components/phone-input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar-rac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateInput } from "@/components/ui/datefield-rac"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { newDoctorSchema } from "@/schemas/auth"
import { useLazyUserQuery, useSignUpMutation } from "@/services/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import Cookies from "js-cookie"
import { ArrowLeft, CalendarIcon, Eye, EyeOff } from "lucide-react"
import { Link, useTransitionRouter } from "next-view-transitions"
import { useState } from "react"
import {
  Button as AriaButton,
  Popover as AriaPopover,
  DatePicker,
  Dialog,
  Group,
  I18nProvider,
  Label,
} from "react-aria-components"
import { useForm } from "react-hook-form"
import * as RPNInput from "react-phone-number-input"
import { toast } from "sonner"
import type { z } from "zod"

export default function DoctorRegisterPage() {
  const router = useTransitionRouter()

  const [isVisible, setIsVisible] = useState(false)

  const [signUp, { isLoading }] = useSignUpMutation()
  const [getUser] = useLazyUserQuery()

  const form = useForm<z.infer<typeof newDoctorSchema>>({
    resolver: zodResolver(newDoctorSchema),
    defaultValues: {
      role: "doctor",
      password: "",
      first_name: "",
      last_name: "",
      email: "",
      identification_number: "",
      phone_number: "",
      national_licence: "",
      provincial_licence: "",
    },
  })

  async function onSubmit(values: z.infer<typeof newDoctorSchema>) {
    try {
      const response = await signUp({
        ...values,
        birth_date: format(values.birth_date.toString(), "dd/MM/yyyy"),
      }).unwrap()

      if ("token" in response) {
        Cookies.set("sessionToken", response.token)
      }

      await getUser().unwrap()

      router.push("/otp")
    } catch (err: any) {
      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-red-600 border-red-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-red-600/50">
          <p className="font-medium">Algo salió mal</p>
          <p className="text-sm">{err.data.error || "Ocurrió un error inesperado"}</p>
        </div>
      ))
    }
  }

  return (
    <Card className="shadow-lg shadow-border p-3 sm:p-6 border-none w-full max-w-[700px] flex flex-col gap-4">
      <CardHeader className="text-center relative p-4 sm:p-6">
        <Button variant="link" className="px-2 absolute top-2 left-2 sm:left-4" type="button" disableRipple asChild>
          <Link href="/sign-up" className="flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
        </Button>
        <CardTitle className="text-xl sm:text-2xl font-medium mt-2">Registrar médico</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-center">
          Completa el formulario para registrar un médico
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full flex flex-col gap-4 sm:gap-6 px-3 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="first_name"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.first_name && "group-focus-within:text-destructive",
                    )}
                  >
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="first_name"
                      type="first_name"
                      placeholder="Jhon"
                      className={cn(
                        form.formState.errors.first_name &&
                        "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="last_name"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.last_name && "group-focus-within:text-destructive",
                    )}
                  >
                    Apellido
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="last_name"
                      type="last_name"
                      placeholder="Doe"
                      className={cn(
                        form.formState.errors.last_name &&
                        "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="email"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.email && "group-focus-within:text-destructive",
                    )}
                  >
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jhon@gmail.com"
                      className={cn(
                        form.formState.errors.email &&
                        "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identification_number"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="identification_number"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.identification_number && "group-focus-within:text-destructive",
                    )}
                  >
                    Número de identificación
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="identification_number"
                      type="text"
                      placeholder="123456789"
                      autoComplete="new-password"
                      className={cn(
                        form.formState.errors.identification_number &&
                        "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <I18nProvider locale="es-419">
                      <DatePicker
                        className="flex flex-col gap-2 group"
                        value={field.value ? field.value : undefined}
                        onChange={(date) => field.onChange(date)}
                      >
                        <FormLabel
                          className={cn(
                            "group-focus-within:text-primary transition-colors",
                            form.formState.errors.birth_date && "group-focus-within:text-destructive",
                          )}
                        >
                          Fecha de nacimiento
                        </FormLabel>
                        <div className="flex">
                          <Label className="text-sm sr-only">Fecha de nacimiento</Label>
                          <Group className="w-full">
                            <DateInput
                              className={cn(
                                "pe-9 flex w-full rounded-md border border-input bg-background px-3 h-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground data-[focus-within]:outline-none data-[focus-within]:!border-2 data-[focus-within]:!border-primary data-[focus-within]:shadow-md data-[focus-within]:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-ring/50 transition-[border-width,border-color] duration-75",
                                form.formState.errors.birth_date &&
                                "border-destructive hover:border-destructive data-[focus-within]:!border-destructive data-[focus-within]:!shadow-destructive/25",
                              )}
                            />
                          </Group>
                          <AriaButton className="z-10 -me-px -ms-11 flex w-9 items-center justify-center rounded-e-lg text-muted-foreground/50 outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70">
                            <CalendarIcon size={16} strokeWidth={2} />
                          </AriaButton>
                        </div>
                        <AriaPopover
                          className="z-50 rounded-lg border border-border bg-background text-popover-foreground shadow-lg shadow-black/5 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
                          offset={4}
                        >
                          <Dialog className="max-h-[inherit] overflow-auto p-2">
                            <Calendar />
                          </Dialog>
                        </AriaPopover>
                      </DatePicker>
                    </I18nProvider>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    className={cn(
                      "transition-colors group-has-[button[data-state=open]]:text-primary",
                      form.formState.errors.gender && "group-has-[button[data-state=open]]:text-destructive",
                    )}
                  >
                    Género
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "gender-trigger",
                          form.formState.errors.gender &&
                          "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                        )}
                      >
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="phone_number"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.phone_number && "group-focus-within:text-destructive",
                    )}
                  >
                    Número de teléfono
                  </FormLabel>
                  <FormControl>
                    <RPNInput.default
                      className={cn("flex rounded-md")}
                      international
                      flagComponent={FlagComponent}
                      countrySelectComponent={CountrySelect}
                      inputComponent={PhoneInput}
                      placeholder="123456789"
                      defaultCountry="AR"
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="password"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.password && "group-focus-within:text-destructive",
                    )}
                  >
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        type={isVisible ? "text" : "password"}
                        placeholder="•••••••••••"
                        className={cn(
                          form.formState.errors.password &&
                          "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                        )}
                        {...field}
                      />
                      <Button
                        className="absolute inset-y-0 end-0 flex p-0 !w-7 !h-7 items-center justify-center rounded-full text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 top-1/2 transform -translate-y-1/2 right-1.5 focus-visible:!ring-0 focus-visible:!outline-none focus-visible:!shadow-none focus-visible:ring-offset-0"
                        variant="ghost"
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                        aria-label={isVisible ? "Hide password" : "Show password"}
                        aria-pressed={isVisible}
                        aria-controls="password"
                      >
                        {isVisible ? (
                          <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Eye size={16} strokeWidth={2} aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="national_licence"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="national_licence"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.national_licence && "group-focus-within:text-destructive",
                    )}
                  >
                    Matrícula nacional
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="national_licence"
                      type="text"
                      placeholder="123456789"
                      autoComplete="new-password"
                      className={cn(
                        form.formState.errors.national_licence &&
                        "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provincial_licence"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="provincial_licence"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.provincial_licence && "group-focus-within:text-destructive",
                    )}
                  >
                    Matrícula provincial
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="provincial_licence"
                      type="text"
                      placeholder="123456789"
                      autoComplete="new-password"
                      className={cn(
                        form.formState.errors.provincial_licence &&
                        "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    className={cn(
                      "transition-colors group-has-[button[data-state=open]]:text-primary",
                      form.formState.errors.specialty && "group-has-[button[data-state=open]]:text-destructive",
                    )}
                  >
                    Especialidad
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "specialty-trigger",
                          form.formState.errors.specialty &&
                          "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                        )}
                      >
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiología</SelectItem>
                      <SelectItem value="medical_clinic">Clínica médica</SelectItem>
                      <SelectItem value="dermatology">Dermatología</SelectItem>
                      <SelectItem value="endocrinology">Endocrinología</SelectItem>
                      <SelectItem value="gastroenterology">Gastroenterología</SelectItem>
                      <SelectItem value="medical_genetics">Genética médica/AGO</SelectItem>
                      <SelectItem value="gynecology">Ginecología</SelectItem>
                      <SelectItem value="hematology">Hematología</SelectItem>
                      <SelectItem value="immunology">Inmunología</SelectItem>
                      <SelectItem value="mastology">Mastología</SelectItem>
                      <SelectItem value="nephrology">Nefrología</SelectItem>
                      <SelectItem value="ophthalmology">Oftalmología</SelectItem>
                      <SelectItem value="oncology">Oncología</SelectItem>
                      <SelectItem value="pediatrics">Pediatría</SelectItem>
                      <SelectItem value="urology">Urología</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2">
              <Button
                loading={isLoading}
                className="w-full relative overflow-hidden mt-2"
                onClick={form.handleSubmit(onSubmit)}
              >
                Crear cuenta
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
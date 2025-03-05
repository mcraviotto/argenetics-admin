'use client'

import { CountrySelect, FlagComponent, PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/multiselect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { newDoctorSchema } from "@/schemas/auth";
import { useUserQuery } from "@/services/auth";
import { useCreateDoctorMutation } from "@/services/doctors";
import { useGetAllInstitutionsQuery } from "@/services/institutions";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { Button as AriaButton, Popover as AriaPopover, DatePicker, Dialog, Group, I18nProvider, Label } from "react-aria-components";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { toast } from "sonner";
import { z } from "zod";

const createAdaptedNewDoctorSchema = (userableType: string) =>
  newDoctorSchema
    .omit({ password: true })
    .extend({
      state: z.enum(["active", "pending", "rejected"]).optional(),
      medical_institutions: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      ),
    })
    .superRefine((data, ctx) => {
      if (userableType === "Administrator" && !data.state) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El estado es requerido",
          path: ["state"],
        });
      }
    });

export default function NewDoctorPage() {
  const router = useTransitionRouter();

  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  const { data: institutions } = useGetAllInstitutionsQuery({ query: "" });
  const { data: user, isLoading: isUserLoading } = useUserQuery()

  const adaptedSchema = createAdaptedNewDoctorSchema(user?.userable_type || "");

  const form = useForm<z.infer<typeof adaptedSchema>>({
    resolver: zodResolver(adaptedSchema),
    defaultValues: {
      role: "doctor",
      first_name: "",
      last_name: "",
      email: "",
      identification_number: "",
      phone_number: "",
      medical_institutions: [],
    },
  })

  async function onSubmit(values: z.infer<typeof adaptedSchema>) {
    try {
      await createDoctor({
        ...values,
        birth_date: format(values.birth_date.toString(), "dd/MM/yyyy"),
        medical_institution_ids: values.medical_institutions.map((institution) => institution.id),
      }).unwrap()

      router.push("/views/doctors")

      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-green-600 border-green-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-green-600/50">
          <p className="font-medium">Médico creado</p>
          <p className="text-sm">El médico ha sido creado exitosamente</p>
        </div>
      ))
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nuevo médico</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6 flex flex-col">
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 transition-all", isUserLoading && "blur-md")}>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="first_name"
                    className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.first_name && "group-focus-within:text-destructive")}
                  >
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="first_name"
                      type="first_name"
                      placeholder="Jhon"
                      className={cn(form.formState.errors.first_name && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
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
                    className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.last_name && "group-focus-within:text-destructive")}
                  >
                    Apellido
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="last_name"
                      type="last_name"
                      placeholder="Doe"
                      className={cn(form.formState.errors.last_name && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
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
                    className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.email && "group-focus-within:text-destructive")}
                  >
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jhon@gmail.com"
                      className={cn(form.formState.errors.email && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
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
                    className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.identification_number && "group-focus-within:text-destructive")}
                  >
                    Número de identificación
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="identification_number"
                      type="text"
                      placeholder="123456789"
                      autoComplete="new-password"
                      className={cn(form.formState.errors.identification_number && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
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
                        <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.birth_date && "group-focus-within:text-destructive")}>
                          Fecha de nacimiento
                        </FormLabel>
                        <div className="flex">
                          <Label className="text-sm sr-only">Fecha de nacimiento</Label>
                          <Group className="w-full">
                            <DateInput
                              className={cn("pe-9 flex w-full rounded-md border border-input bg-background px-3 h-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground data-[focus-within]:outline-none data-[focus-within]:!border-2 data-[focus-within]:!border-primary data-[focus-within]:shadow-md data-[focus-within]:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-ring/50 transition-[border-width,border-color] duration-75", form.formState.errors.birth_date && "border-destructive hover:border-destructive data-[focus-within]:!border-destructive data-[focus-within]:!shadow-destructive/25")}
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
                  <FormLabel className={cn(
                    "transition-colors group-has-[button[data-state=open]]:text-primary",
                    form.formState.errors.gender && "group-has-[button[data-state=open]]:text-destructive"
                  )}>
                    Género
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn("gender-trigger", form.formState.errors.gender && "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25")}
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
                    className={
                      cn("group-focus-within:text-primary transition-colors",
                        form.formState.errors.phone_number && "group-focus-within:text-destructive"
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
              name="specialty"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel className={cn(
                    "transition-colors group-has-[button[data-state=open]]:text-primary",
                    form.formState.errors.specialty && "group-has-[button[data-state=open]]:text-destructive"
                  )}>
                    Especialidad
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn("specialty-trigger", form.formState.errors.specialty && "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25")}
                      >
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="surgery">Cirugía</SelectItem>
                      <SelectItem value="neurology">Neurología</SelectItem>
                      <SelectItem value="pediatry">Pediatría</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {user?.userable_type !== "MedicalInstitution" && (
              <FormField
                control={form.control}
                name="medical_institutions"
                render={({ field }) => (
                  <FormItem className="flex flex-col group">
                    <FormLabel
                      htmlFor="medical_institutions"
                      className={
                        cn("group-focus-within:text-primary transition-colors",
                          form.formState.errors.medical_institutions && "group-focus-within:text-destructive"
                        )}
                    >
                      Centros médicos
                    </FormLabel>
                    <FormControl>
                      <MultipleSelector
                        commandProps={{
                          label: "Centros médicos",
                          filter: (itemValue: string, search: string) => {
                            const option = institutions?.find(inst => inst.id === itemValue);
                            return option && option.name.toLowerCase().includes(search.toLowerCase())
                              ? 1
                              : -1;
                          },
                        }}
                        options={institutions?.map((institution) => ({
                          label: institution.name,
                          value: institution.id,
                        }))}
                        value={field.value?.map((institution) => ({
                          label: institution.name,
                          value: institution.id,
                        }))}
                        placeholder="Selecciona un centro médico"
                        onChange={(newValue) => {
                          field.onChange(newValue.map((institution) => ({
                            name: institution.label,
                            id: institution.value,
                          })))
                        }}
                        emptyIndicator={
                          <p className="text-center text-sm">No hay centros médicos disponibles</p>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {user?.userable_type === "Administrator" && (
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex flex-col group">
                    <FormLabel className={cn(
                      "transition-colors group-has-[button[data-state=open]]:text-primary",
                      form.formState.errors.state && "group-has-[button[data-state=open]]:text-destructive"
                    )}>
                      Estado
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn("state-trigger", form.formState.errors.state && "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25")}
                        >
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="rejected">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="flex gap-2 mx-auto w-fit sm:ml-auto">
            <Button
              variant="ghost"
              asChild
            >
              <Link href={`/views/doctors`}>
                <ArrowLeft />
                <span className="hidden sm:block">
                  Volver
                </span>
              </Link>
            </Button>
            <Button
              className="ml-auto min-w-24"
              loading={isLoading}
              onClick={() => {
                form.handleSubmit(onSubmit)();
              }}
            >
              Crear médico
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
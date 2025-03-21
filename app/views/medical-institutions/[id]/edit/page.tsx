'use client'

import { CountrySelect, FlagComponent, PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { newMedicalInstitutionSchema } from "@/schemas/auth";
import { useGetInstitutionQuery, useUpdateInstitutionMutation } from "@/services/institutions";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { toast } from "sonner";
import { z } from "zod";

const editInstitutionSchema = newMedicalInstitutionSchema.omit({
  password: true,
  role: true,
}).extend({
  state: z.enum(["active", "pending", "rejected"]),
});

export default function EditInstitutionPage() {
  const params = useParams<{ id: string }>()
  const router = useTransitionRouter();

  const { data: institution, isLoading: isInstitutionLoading } = useGetInstitutionQuery(params.id)

  const [updateInstitution, { isLoading }] = useUpdateInstitutionMutation()

  const form = useForm<z.infer<typeof editInstitutionSchema>>({
    resolver: zodResolver(editInstitutionSchema),
    defaultValues: {
      name: institution?.name || "",
      email: institution?.user?.email || "",
      fiscal_number: institution?.fiscal_number || "",
      primary_phone_number: institution?.primary_phone_number || "",
      secondary_phone_number: institution?.secondary_phone_number || "",
      address: institution?.address || "",
      state: institution?.user?.state,
    },
  })

  async function onSubmit(values: z.infer<typeof editInstitutionSchema>) {
    try {
      await updateInstitution({
        ...values,
        id: params.id,
      }).unwrap()

      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-green-600 border-green-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-green-600/50">
          <p className="font-medium">Institución actualizada</p>
          <p className="text-sm">Los datos de la institución han sido actualizados correctamente</p>
        </div>
      ))

      router.push(`/views/medical-institutions/${params.id}`)
    } catch (err: any) {
      console.error(err)
      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-red-600 border-red-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-red-600/50">
          <p className="font-medium">Algo salió mal</p>
          <p className="text-sm">{err.data.error || "Ocurrió un error inesperado"}</p>
        </div>
      ))
    }
  }

  useEffect(() => {
    if (!institution) return
    form.reset({
      name: institution.name,
      email: institution?.user?.email,
      fiscal_number: institution.fiscal_number,
      primary_phone_number: institution.primary_phone_number,
      secondary_phone_number: institution.secondary_phone_number,
      address: institution.address,
      state: institution?.user?.state,
    })
  }, [institution])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="name"
                    className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.name && "group-focus-within:text-destructive")}
                  >
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="name"
                      placeholder="Jhon"
                      className={cn(form.formState.errors.name && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fiscal_number"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="identification_number"
                    className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.fiscal_number && "group-focus-within:text-destructive")}
                  >
                    CUIT
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="fiscal_number"
                      type="fiscal_number"
                      placeholder="123456789"
                      className={cn(form.formState.errors.fiscal_number && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
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
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="address"
                    className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.address && "group-focus-within:text-destructive")}
                  >
                    Dirección
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="address"
                      type="address"
                      placeholder="Av. Siempre Viva 123"
                      className={cn(form.formState.errors.address && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primary_phone_number"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="primary_phone_number"
                    className={
                      cn("group-focus-within:text-primary transition-colors",
                        form.formState.errors.primary_phone_number && "group-focus-within:text-destructive"
                      )}
                  >
                    Número de teléfono principal
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
              name="secondary_phone_number"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="secondary_phone_number"
                    className={
                      cn("group-focus-within:text-primary transition-colors",
                        form.formState.errors.secondary_phone_number && "group-focus-within:text-destructive"
                      )}
                  >
                    Número de teléfono secundario
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
          </div>
          <div className="flex gap-2 ml-auto w-fit">
            <Button
              variant="ghost"
              asChild
            >
              <Link href={`/views/medical-institutions/${params.id}`}>
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
              <Save />
              Guardar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
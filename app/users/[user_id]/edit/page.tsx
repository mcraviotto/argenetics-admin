"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar-rac"
import { DateInput } from "@/components/ui/datefield-rac"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { newClientSchema } from "@/schemas/doctors"
import { useCreateClientMutation, useGetClientQuery, useUpdateClientMutation } from "@/services/doctors"
import { AnimatePresence, motion } from "framer-motion"
import { AtSign, CalendarIcon, IdCard, Loader2, Phone } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button as AriaButton, DatePicker, DateValue, Dialog, Group, I18nProvider, Label, Popover } from "react-aria-components"
import { format, isValid, parse, parseISO } from "date-fns"
import { fromDate, parseAbsoluteToLocal, parseDate } from "@internationalized/date"

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()

  const clientId = params.user_id as string

  const { toast } = useToast()
  const { data: client } = useGetClientQuery(clientId)
  const [updateClient] = useUpdateClientMutation();

  const [isLoading, setLoading] = useState(false)

  const extendedSchema = newClientSchema.extend({
    email: z.string().optional(),
    user_state: z.enum(["invited", "active", "pending", "rejected", "inactive"], { required_error: "El estado es requerido", invalid_type_error: "El estado es requerido" }),
  });

  const form = useForm<z.infer<typeof extendedSchema>>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      first_name: client?.first_name ?? "",
      last_name: client?.last_name ?? "",
      identification_number: client?.identification_number ?? "",
      birth_date: client && parseDate(formatDateToISO(client?.birth_date)),
      gender: client?.gender,
      phone_number: client?.phone_number ?? "",
      user_state: client?.user.state,
    }
  })

  function formatDateToISO(dateStr: string) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toISOString().split('T')[0];
  }

  async function onSubmit(data: z.infer<typeof extendedSchema>) {
    const formattedBirthDay = format(parseISO(data.birth_date.toString()), "dd/MM/yyyy")

    setLoading(true);
    try {
      await updateClient({
        id: clientId,
        data: {
          ...data,
          birth_date: formattedBirthDay,
        }
      }).unwrap()

      toast({
        title: "Cliente actualizado",
        description: "El cliente ha sido actualizado exitosamente",
      });

      router.push(`/users/${clientId}`);
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Algo salió mal",
        variant: "destructive",
        description: err.data.error || "Ocurrió un error al actualizar el cliente",
      })
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (client) {
      form.reset({
        first_name: client.first_name,
        last_name: client.last_name,
        identification_number: client.identification_number,
        birth_date: parseDate(formatDateToISO(client.birth_date)),
        gender: client.gender,
        phone_number: client.phone_number,
        user_state: client.user.state,
      })
    }
    return () => {
      form.reset()
    }
  }, [client])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background p-4 rounded-md shadow-lg shadow-border border space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="space-y-1 group">
                  <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.first_name && "group-focus-within:text-destructive")}>
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={form.formState.errors.first_name && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25"}
                      placeholder="Jhon"
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
                <FormItem className="space-y-1 group">
                  <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.last_name && "group-focus-within:text-destructive")}>
                    Apellido
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={form.formState.errors.last_name && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25"}
                      placeholder="Doe"
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
                <FormItem className="space-y-1 group">
                  <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.identification_number && "group-focus-within:text-destructive")}>
                    Número de identificación
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className={cn("peer ps-9", form.formState.errors.identification_number && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
                        placeholder="123456789"
                        {...field}
                      />
                      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                        <IdCard size={16} strokeWidth={2} aria-hidden="true" />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Esta será la contraseña temporal del cliente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem className="space-y-1 group">
                  <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.identification_number && "group-focus-within:text-destructive")}>
                    Número de teléfono
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className={cn("peer ps-9", form.formState.errors.identification_number && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
                        placeholder="123456789"
                        {...field}
                      />
                      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                        <Phone size={16} strokeWidth={2} aria-hidden="true" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <I18nProvider locale="es-419">
                      <DatePicker
                        className="space-y-1 group"
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
                          <AriaButton className="z-10 -me-px -ms-9 flex w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70">
                            <CalendarIcon size={16} strokeWidth={2} />
                          </AriaButton>
                        </div>
                        <Popover
                          className="z-50 rounded-lg border border-border bg-background text-popover-foreground shadow-lg shadow-black/5 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
                          offset={4}
                        >
                          <Dialog className="max-h-[inherit] overflow-auto p-2">
                            <Calendar />
                          </Dialog>
                        </Popover>
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
                <FormItem className="space-y-1">
                  <FormLabel>Género</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(form.formState.errors.gender && "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25")}
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
              name="user_state"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(form.formState.errors.user_state && "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25")}
                      >
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="invited">Invitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-[86px]"
              disabled={isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="!w-5 !h-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    Guardar
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
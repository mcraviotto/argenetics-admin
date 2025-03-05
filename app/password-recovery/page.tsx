"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSendRecoveryEmailMutation } from "@/services/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"
import { Link, useTransitionRouter } from "next-view-transitions"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const FormSchema = z.object({
  email: z.string().email({ message: "El email es inválido" }).min(1, { message: "El email es requerido" }),
})

export default function PasswordRecoveryPage() {
  const router = useTransitionRouter()

  const [sendRecoveryEmail, { isLoading }] = useSendRecoveryEmailMutation()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await sendRecoveryEmail({ email: data.email }).unwrap()
      router.push(`/password-recovery/otp?email=${data.email}`)
    } catch (err: any) {
      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-red-600 border-red-800 p-4 rounded-md shadow-lg w-full max-w-[356px] text-accent shadow-red-600/50">
          <p className="font-medium">Algo salió mal</p>
          <p className="text-sm">{err.data.error || "Ocurrió un error inesperado"}</p>
        </div>
      ))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full")}>
      <Card className="shadow-lg shadow-border p-3 sm:p-6 border-none relative">
        <CardHeader className="text-center p-4 sm:p-6">
          <Button variant="link" className="px-2 absolute top-2 left-2 sm:left-4" type="button" disableRipple asChild>
            <Link href="/sign-in" className="flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          </Button>
          <CardTitle className="text-xl sm:text-2xl font-medium mt-2">Recuperar contraseña</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-neutral-500">
            Ingresa tu email y te enviaremos un código de recuperación
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 sm:gap-6 items-center">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormControl>
                      <Input
                        id="email"
                        placeholder="m@example.com"
                        className={cn(
                          form.formState.errors.email &&
                          "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                          "w-full",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" loading={isLoading}>
                Confirmar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
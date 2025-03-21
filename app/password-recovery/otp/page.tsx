"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useSendRecoveryEmailMutation, useUpdatePasswordMutation } from "@/services/auth"
import { Link, useTransitionRouter } from "next-view-transitions"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"

const FormSchema = z.object({
  email: z.string().min(1, {
    message: "El email es requerido",
  }),
  new_password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
  code: z.string().min(6, {
    message: "El código debe tener al menos 6 caracteres",
  }),
})

export default function OtpPage() {
  const router = useTransitionRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get("email")

  const [updatePassword, { isLoading }] = useUpdatePasswordMutation()
  const [sendRecoveryEmail] = useSendRecoveryEmailMutation()

  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [resendCountdown, setResendCountdown] = useState<number>(0)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
      email: email || "",
      new_password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await updatePassword(data).unwrap()

      router.push("/sign-in")

      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-green-600 border-green-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-green-600/50">
          <p className="font-medium">Contraseña actualizada</p>
          <p className="text-sm">Tu contraseña ha sido actualizada correctamente</p>
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

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)

  useEffect(() => {
    if (resendCountdown === 0) return

    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCountdown])

  const handleResendCode = async () => {
    setResendCountdown(30)
    await sendRecoveryEmail({ email: email || "" }).unwrap()
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full")}>
      <Card className="shadow-lg shadow-border p-3 sm:p-6 border-none relative">
        <CardHeader className="text-center p-4 sm:p-6">
          <Button variant="link" className="px-2 absolute top-2 left-2 sm:left-4" type="button" disableRipple asChild>
            <Link href="/password-recovery" className="flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          </Button>
          <CardTitle className="text-xl sm:text-2xl font-medium mt-2">Recuperar contraseña</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-neutral-500">
            Ingresá el código de verificación que te enviamos a tu correo
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 sm:gap-6 items-center">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className="flex justify-center gap-1 sm:gap-2">
                          <InputOTPSlot
                            className="!rounded-sm border !ring-primary h-9 w-9 sm:h-12 sm:w-12 text-base sm:text-lg"
                            index={0}
                          />
                          <InputOTPSlot
                            className="!rounded-sm border !ring-primary h-9 w-9 sm:h-12 sm:w-12 text-base sm:text-lg"
                            index={1}
                          />
                          <InputOTPSlot
                            className="!rounded-sm border !ring-primary h-9 w-9 sm:h-12 sm:w-12 text-base sm:text-lg"
                            index={2}
                          />
                          <InputOTPSlot
                            className="!rounded-sm border !ring-primary h-9 w-9 sm:h-12 sm:w-12 text-base sm:text-lg"
                            index={3}
                          />
                          <InputOTPSlot
                            className="!rounded-sm border !ring-primary h-9 w-9 sm:h-12 sm:w-12 text-base sm:text-lg"
                            index={4}
                          />
                          <InputOTPSlot
                            className="!rounded-sm border !ring-primary h-9 w-9 sm:h-12 sm:w-12 text-base sm:text-lg"
                            index={5}
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="text-sm mb-1">Nueva contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={isVisible ? "text" : "password"}
                          placeholder="•••••••••••"
                          className={cn(
                            form.formState.errors.new_password &&
                            "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25",
                          )}
                          {...field}
                        />
                        <Button
                          className="absolute inset-y-0 end-0 flex p-0 !w-7 !h-7 items-center justify-center rounded-full text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 top-1/2 transform -translate-y-1/2 right-1.5 focus-visible:!ring-0 focus-visible:!outline-none focus-visible:!shadow-none focus-visible:ring-offset-0"
                          variant="ghost"
                          type="button"
                          onClick={toggleVisibility}
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
              <Button type="submit" className="w-full" loading={isLoading}>
                Verificar
              </Button>
              <Button
                variant="link"
                type="button"
                disableRipple
                onClick={handleResendCode}
                className="text-sm mx-auto justify-start px-0 h-auto"
                disabled={resendCountdown > 0}
              >
                {resendCountdown > 0
                  ? `Reenviar código (${resendCountdown})`
                  : "Reenviar código"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

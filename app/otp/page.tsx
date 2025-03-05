"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useVerifyTokenMutation } from "@/services/auth"
import { useTransitionRouter } from "next-view-transitions"
import { toast } from "sonner"

const FormSchema = z.object({
  token: z.string().min(6, {
    message: "El código debe tener al menos 6 caracteres",
  }),
})

export default function OtpPage() {
  const router = useTransitionRouter()

  const [verifyToken, { isLoading }] = useVerifyTokenMutation()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      token: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await verifyToken({ token: data.token }).unwrap()
      router.push("/views")
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
      <Card className="shadow-lg shadow-border p-3 sm:p-6 border-none">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-medium">Confirmá tu cuenta</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-neutral-500">
            Ingresá el código de verificación que te enviamos a tu teléfono
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 sm:gap-6 items-center">
              <FormField
                control={form.control}
                name="token"
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
              <Button type="submit" className="w-full" loading={isLoading}>
                Verificar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
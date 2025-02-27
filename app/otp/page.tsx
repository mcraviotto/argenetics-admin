'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useVerifyTokenMutation } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { useTransitionRouter } from "next-view-transitions";

const FormSchema = z.object({
  token: z.string().min(6, {
    message: "El código debe tener al menos 6 caracteres",
  }),
})

export default function OtpPage() {
  const { toast } = useToast()

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
      console.log(err)
      toast({
        title: "Algo salió mal",
        variant: "destructive",
        description: 'data' in err ? err.data.error : "Por favor, intenta de nuevo",
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full")}>
      <Card className="shadow-lg shadow-border p-6 border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-medium">Confirmá tu cuenta</CardTitle>
          <CardDescription className="text-sm text-neutral-500">Ingresá el código de verificación que te enviamos a tu teléfono</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 items-center">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className="flex justify-center gap-2">
                          <InputOTPSlot className="!rounded-sm border !ring-primary" index={0} />
                          <InputOTPSlot className="!rounded-sm border !ring-primary" index={1} />
                          <InputOTPSlot className="!rounded-sm border !ring-primary" index={2} />
                          <InputOTPSlot className="!rounded-sm border !ring-primary" index={3} />
                          <InputOTPSlot className="!rounded-sm border !ring-primary" index={4} />
                          <InputOTPSlot className="!rounded-sm border !ring-primary" index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                Verificar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
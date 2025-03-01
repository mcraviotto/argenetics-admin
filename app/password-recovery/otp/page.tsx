'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useUpdatePasswordMutation, useVerifyTokenMutation } from "@/services/auth";
import { Link, useTransitionRouter } from "next-view-transitions";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [updatePassword, { isLoading }] = useUpdatePasswordMutation()

  const [isVisible, setIsVisible] = useState<boolean>(false);


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
          <p className="font-medium">
            Contraseña actualizada
          </p>
          <p className="text-sm">
            Tu contraseña ha sido actualizada correctamente
          </p>
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

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className={cn("flex flex-col gap-6 w-full")}>
      <Card className="shadow-lg shadow-border p-6 border-none relative">
        <CardHeader className="text-center">
          <Button
            variant="link"
            className="px-2 absolute top-2 left-4"
            type="button"
            disableRipple
            asChild
          >
            <Link href="/password-recovery">
              <ArrowLeft />
              Volver
            </Link>
          </Button>
          <CardTitle className="text-2xl font-medium">
            Recuperar contraseña
          </CardTitle>
          <CardDescription className="text-sm text-neutral-500">Ingresá el código de verificación que te enviamos a tu correo</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 items-center">
              <FormField
                control={form.control}
                name="code"
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
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={isVisible ? "text" : "password"}
                          placeholder="•••••••••••"
                          className={cn(form.formState.errors.new_password && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25")}
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
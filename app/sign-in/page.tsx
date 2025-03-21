"use client"

import { api } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { signInSchema } from "@/schemas/auth"
import { useLazyUserQuery, useSignInMutation } from "@/services/auth"
import { store } from "@/store"
import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from "js-cookie"
import { Eye, EyeOff } from "lucide-react"
import { useTransitionRouter } from "next-view-transitions"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

export default function SignIn() {
  const router = useTransitionRouter()

  const [authUser, { isLoading }] = useSignInMutation()
  const [getUser] = useLazyUserQuery()

  const [isVisible, setIsVisible] = useState<boolean>(false)

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    try {
      const response = await authUser(values).unwrap()

      if ("token" in response) {
        Cookies.set("sessionToken", response.token)
      }

      await getUser().unwrap()

      router.push("/views")
      store.dispatch(api.util.resetApiState())
    } catch (err: any) {
      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-red-600 border-red-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-red-600/50">
          <p className="font-medium">Algo salió mal</p>
          <p className="text-sm">{err.data.message || err.data.error || "Ocurrió un error inesperado"}</p>
        </div>
      ))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md mx-auto")}>
      <Card className="shadow-lg shadow-border p-3 sm:p-6 border-none">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-medium">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <div className="grid gap-3 sm:gap-4">
                <div className="grid gap-2 group">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
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
                            placeholder="m@example.com"
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
                </div>
                <div className="grid gap-2 group">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
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
                </div>
                <Button
                  variant="link"
                  type="button"
                  disableRipple
                  onClick={() => router.push("/password-recovery")}
                  className="text-sm mx-auto justify-start px-0 h-auto"
                >
                  Olvidé mi contraseña
                </Button>
                <Button loading={isLoading} className="w-full relative overflow-hidden mt-2">
                  Ingresar
                </Button>
                <CardDescription className="text-center text-xs sm:text-sm pt-2">
                  ¿No tenés una cuenta?
                  <Button
                    variant="link"
                    className="px-1 sm:px-2 text-xs sm:text-sm h-auto"
                    type="button"
                    disableRipple
                    onClick={() => router.push("/sign-up")}
                  >
                    Registrate
                  </Button>
                </CardDescription>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
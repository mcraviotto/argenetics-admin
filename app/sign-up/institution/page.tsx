"use client"

import { CountrySelect, FlagComponent, PhoneInput } from "@/components/phone-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { newMedicalInstitutionSchema } from "@/schemas/auth"
import { useLazyUserQuery, useSignUpMutation } from "@/services/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from "js-cookie"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Link, useTransitionRouter } from "next-view-transitions"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as RPNInput from "react-phone-number-input"
import { toast } from "sonner"
import type { z } from "zod"

export default function InstitutionRegisterPage() {
  const router = useTransitionRouter()

  const [isVisible, setIsVisible] = useState(false)

  const [signUp, { isLoading }] = useSignUpMutation()
  const [getUser] = useLazyUserQuery()

  const form = useForm<z.infer<typeof newMedicalInstitutionSchema>>({
    resolver: zodResolver(newMedicalInstitutionSchema),
    defaultValues: {
      role: "medical_institution",
      password: "",
      name: "",
      email: "",
      primary_phone_number: "",
      secondary_phone_number: "",
      address: "",
      fiscal_number: "",
    },
  })

  async function onSubmit(values: z.infer<typeof newMedicalInstitutionSchema>) {
    try {
      const response = await signUp(values).unwrap()

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
        <CardTitle className="text-xl sm:text-2xl font-medium mt-2">Registrar institución médica</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-center">
          Completa el formulario para registrar una institución médica
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full flex flex-col gap-4 sm:gap-6 px-3 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="name"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.name && "group-focus-within:text-destructive",
                    )}
                  >
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="name"
                      placeholder="Jhon"
                      className={cn(
                        form.formState.errors.name &&
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
              name="fiscal_number"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="identification_number"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.fiscal_number && "group-focus-within:text-destructive",
                    )}
                  >
                    CUIT
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="fiscal_number"
                      type="text"
                      placeholder="123456789"
                      className={cn(
                        form.formState.errors.fiscal_number &&
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
              name="address"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="address"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.address && "group-focus-within:text-destructive",
                    )}
                  >
                    Dirección
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="address"
                      type="address"
                      placeholder="Av. Siempre Viva 123"
                      className={cn(
                        form.formState.errors.address &&
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
              name="primary_phone_number"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    htmlFor="primary_phone_number"
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.primary_phone_number && "group-focus-within:text-destructive",
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
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.secondary_phone_number && "group-focus-within:text-destructive",
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

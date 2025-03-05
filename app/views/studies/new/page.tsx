'use client'

import FileUploader from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { newStudySchema } from "@/schemas/studies";
import { useUserQuery } from "@/services/auth";
import { useGetAllDoctorsQuery } from "@/services/doctors";
import { useGetAllPatientsQuery } from "@/services/patients";
import { useUploadFileToS3Mutation } from "@/services/s3";
import { useCreateStudyMutation } from "@/services/studies";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckIcon, ChevronsUpDown, FileIcon, Save, X } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { study_options } from "../data";
import { useEffect } from "react";
import { toast } from "sonner";

const createAdaptedNewStudySchema = (userableType: string) =>
  newStudySchema
    .omit({
      medical_order_ref: true,
      storage_ref: true,
      additional_docs_storage_ref: true,
      state: true,
    })
    .extend({
      study_category_id: z.string({ required_error: "La categoría de estudio es requerida" }),
      result: z.instanceof(File).optional(),
      medical_order: z.instanceof(File).optional(),
      additional_docs: z.instanceof(File).optional(),
    })
    .superRefine((data, ctx) => {
      if (userableType === "MedicalInstitution") {
        if (!data.medical_order) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La orden médica es requerida",
            path: ["medical_order"],
          });
        }
      } else if (
        userableType === "Patient" ||
        userableType === "Doctor" ||
        userableType === "Administrator"
      ) {
        if (!data.medical_order) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La orden médica es requerida",
            path: ["medical_order"],
          });
        }
      } else {
        if (!data.result) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El resultado es requerido",
            path: ["result"],
          });
        }
      }

      if (data.title === "prosigna" && !data.additional_docs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Los documentos adicionales son requeridos para estudios prosigna",
          path: ["additional_docs"],
        });
      }
    });

export default function NewStudyPage() {
  const router = useTransitionRouter();

  const { data: patients } = useGetAllPatientsQuery()
  const { data: doctors } = useGetAllDoctorsQuery()
  const { data: user, isLoading: isUserLoading } = useUserQuery()

  const [createStudy, { isLoading }] = useCreateStudyMutation()
  const [uploadFileToS3, { isLoading: isUploadingFile }] = useUploadFileToS3Mutation();

  const adaptedSchema = createAdaptedNewStudySchema(user?.userable_type || "")

  const form = useForm<z.infer<typeof adaptedSchema>>({
    resolver: zodResolver(adaptedSchema),
    defaultValues: {
      patient_id: undefined,
      doctor_id: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof adaptedSchema>) {
    try {
      const { result, medical_order, additional_docs, study_category_id, ...data } = values

      const result_storage_ref = result ? await uploadFileToS3({ file: result, patient_id: values.patient_id }).unwrap() : ""
      const medical_order_storage_ref = medical_order ? await uploadFileToS3({ file: medical_order, patient_id: values.patient_id }).unwrap() : ""
      const additional_docs_storage_ref = additional_docs ? await uploadFileToS3({ file: additional_docs, patient_id: values.patient_id }).unwrap() : ""

      await createStudy({
        ...data,
        storage_ref: result_storage_ref,
        medical_order_ref: medical_order_storage_ref,
        additional_docs_storage_ref,
      }).unwrap()

      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-green-600 border-green-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-green-600/50">
          <p className="font-medium">Estudio creado</p>
          <p className="text-sm">El estudio ha sido creado exitosamente</p>
        </div>
      ))

      router.push(`/views/studies`)
    } catch (err: any) {
      toast.custom((t) => (
        <div className="flex flex-col gap-1 bg-red-600 border-red-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-red-600/50">
          <p className="font-medium">Algo salió mal</p>
          <p className="text-sm">{err.data.error || "Ocurrió un error inesperado"}</p>
        </div>
      ))
    }
  }

  const result = useWatch({ control: form.control, name: "result" })
  const medical_order = useWatch({ control: form.control, name: "medical_order" })
  const additional_docs = useWatch({ control: form.control, name: "additional_docs" })
  const selected_category = useWatch({ control: form.control, name: "study_category_id" })
  const study_type = useWatch({ control: form.control, name: "title" })

  useEffect(() => {
    if (user && user?.userable_type === "Patient") {
      form.setValue("patient_id", user.userable.id)
    }
    if (user && user?.userable_type === "Doctor") {
      form.setValue("doctor_id", user.userable.id)
    }
  }, [user])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nuevo estudio</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6 flex flex-col">
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 transition-all", isUserLoading && "blur-md")}>
            <FormField
              control={form.control}
              name="study_category_id"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    className={cn(
                      "transition-colors group-has-[button[data-state=open]]:text-primary",
                      form.formState.errors.study_category_id && "group-has-[button[data-state=open]]:text-destructive"
                    )}
                  >
                    Categoría de estudio
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between px-3 !shadow-none hover:border-ring/50 data-[state=open]:border-primary data-[state=open]:border-2 data-[state=open]:!shadow-md data-[state=open]:!shadow-primary/25",
                            form.formState.errors.study_category_id && "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                            !field.value && "text-muted-foreground/50 font-normal"
                          )}
                        >
                          {field.value
                            ? study_options.find(
                              (category) => category.value === field.value
                            )?.label
                            : "Selecciona una categoría"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput
                          placeholder="Buscar..."
                          className="h-10"
                        />
                        <CommandList className="p-1">
                          <CommandEmpty>
                            No hay resultados
                          </CommandEmpty>
                          <CommandGroup>
                            {study_options.map((category) => (
                              <CommandItem
                                value={category.label}
                                key={category.value}
                                onSelect={() => {
                                  form.setValue("study_category_id", category.value)
                                  form.setValue("title", "")
                                }}
                              >
                                {category.label}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto",
                                    category.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    className={cn(
                      "transition-colors group-has-[button[data-state=open]]:text-primary",
                      form.formState.errors.title && "group-has-[button[data-state=open]]:text-destructive"
                    )}
                  >
                    Tipo de estudio
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between px-3 !shadow-none hover:border-ring/50 data-[state=open]:border-primary data-[state=open]:border-2 data-[state=open]:!shadow-md data-[state=open]:!shadow-primary/25",
                            form.formState.errors.title && "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                            !field.value && "text-muted-foreground/50 font-normal"
                          )}
                        >
                          {field.value
                            ? study_options.flatMap((category) => category.items).find(
                              (study) => study.value === field.value
                            )?.label
                            : "Selecciona un estudio"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput
                          placeholder="Buscar..."
                          className="h-10"
                        />
                        <CommandList className="p-1">
                          <CommandEmpty>
                            No hay resultados
                          </CommandEmpty>
                          <CommandGroup>
                            {study_options
                              .find((category) => category.value === selected_category)
                              ?.items.map((study) => (
                                <CommandItem
                                  value={study.label}
                                  key={study.value}
                                  onSelect={() => {
                                    form.setValue("title", study.value, { shouldValidate: true })
                                  }}
                                >
                                  {study.label}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto",
                                      study.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {user?.userable_type !== "Patient" && (
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col group">
                    <FormLabel
                      className={cn(
                        "transition-colors group-has-[button[data-state=open]]:text-primary",
                        form.formState.errors.patient_id && "group-has-[button[data-state=open]]:text-destructive"
                      )}
                    >
                      Paciente
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between px-3 !shadow-none hover:border-ring/50 data-[state=open]:border-primary data-[state=open]:border-2 data-[state=open]:!shadow-md data-[state=open]:!shadow-primary/25",
                              form.formState.errors.patient_id && "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                              !field.value && "text-muted-foreground/50 font-normal"
                            )}
                          >
                            {field.value ? patients?.find((patient) => patient.id === field.value)?.name : "Selecciona un paciente"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command>
                          <CommandInput
                            placeholder="Buscar..."
                            className="h-10"
                          />
                          <CommandList className="p-1">
                            <CommandEmpty>
                              No hay resultados
                            </CommandEmpty>
                            <CommandGroup>
                              {patients?.map((patient) => (
                                <CommandItem
                                  value={patient.id}
                                  key={patient.id}
                                  onSelect={() => {
                                    form.setValue("patient_id", patient.id)
                                  }}
                                >
                                  {patient.name}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto",
                                      patient.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {user?.userable_type !== "Doctor" && (
              <FormField
                control={form.control}
                name="doctor_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col group">
                    <FormLabel
                      className={cn(
                        "transition-colors group-has-[button[data-state=open]]:text-primary",
                        form.formState.errors.doctor_id && "group-has-[button[data-state=open]]:text-destructive"
                      )}
                    >
                      Médico (opcional)
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between px-3 !shadow-none hover:border-ring/50 data-[state=open]:border-primary data-[state=open]:border-2 data-[state=open]:!shadow-md data-[state=open]:!shadow-primary/25",
                              form.formState.errors.doctor_id && "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                              !field.value && "text-muted-foreground/50 font-normal"
                            )}
                          >
                            {field.value ? doctors?.find((doctor) => doctor.id === field.value)?.name : "Selecciona un doctor"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command>
                          <CommandInput
                            placeholder="Buscar..."
                            className="h-10"
                          />
                          <CommandList className="p-1">
                            <CommandEmpty>
                              No hay resultados
                            </CommandEmpty>
                            <CommandGroup>
                              {doctors?.map((doctor) => (
                                <CommandItem
                                  key={doctor.id}
                                  value={doctor.name}
                                  onSelect={() => {
                                    form.setValue("doctor_id", doctor.id)
                                  }}
                                >
                                  {doctor.name}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto",
                                      doctor.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="medical_order"
              render={() => (
                <FormItem className="space-y-1 group md:col-span-2">
                  <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.medical_order && "group-focus-within:text-destructive")}>
                    Orden médica
                  </FormLabel>
                  {(!!medical_order) ? (
                    <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                          <FileIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-medium text-sm">{medical_order.name}</span>
                      </div>
                      <Button
                        className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={() => {
                          form.setValue("medical_order", undefined, { shouldValidate: true })
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  ) :
                    <FormControl>
                      <FileUploader
                        id="medical_order"
                        onChange={(file) => {
                          form.setValue("medical_order", file, { shouldValidate: true })
                        }} />
                    </FormControl>
                  }
                  <FormMessage />
                </FormItem>
              )}
            />
            {user?.userable_type !== "Patient" && user?.userable_type !== "Doctor" && user?.userable_type !== "MedicalInstitution" && (
              <FormField
                control={form.control}
                name="result"
                render={() => (
                  <FormItem className="space-y-1 group md:col-span-2">
                    <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.result && "group-focus-within:text-destructive")}>
                      Resultado
                    </FormLabel>
                    {(!!result) ? (
                      <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                            <FileIcon className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-medium text-sm">{result.name}</span>
                        </div>
                        <Button
                          className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => {
                            form.setValue("result", undefined, { shouldValidate: true })
                          }}
                        >
                          <X />
                        </Button>
                      </div>
                    ) :
                      <FormControl>
                        <FileUploader
                          id="result"
                          onChange={(file) => {
                            form.setValue("result", file, { shouldValidate: true })
                          }} />
                      </FormControl>
                    }
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {study_type === "prosigna" && (
              <FormField
                control={form.control}
                name="additional_docs"
                render={() => (
                  <FormItem className="space-y-1 group md:col-span-2">
                    <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.additional_docs && "group-focus-within:text-destructive")}>
                      Documentos adicionales
                    </FormLabel>
                    {(!!additional_docs) ? (
                      <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                            <FileIcon className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-medium text-sm">{additional_docs.name}</span>
                        </div>
                        <Button
                          className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => {
                            form.reset({
                              ...form.getValues(),
                              additional_docs: undefined,
                            })
                          }}
                        >
                          <X />
                        </Button>
                      </div>
                    ) :
                      <FormControl>
                        <FileUploader
                          id="additional_docs"
                          onChange={(file) => {
                            form.setValue("additional_docs", file, { shouldValidate: true })
                          }} />
                      </FormControl>
                    }
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="flex gap-2 ml-auto w-fit">
            <Button
              variant="ghost"
              asChild
            >
              <Link href={`/views/studies`}>
                <ArrowLeft />
                <span className="hidden sm:block">
                  Volver
                </span>
              </Link>
            </Button>
            <Button
              className="ml-auto min-w-24"
              loading={isLoading || isUploadingFile}
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
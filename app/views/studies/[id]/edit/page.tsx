"use client"

import FileUploader from "@/components/file-uploader"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { newStudySchema } from "@/schemas/studies"
import { useGetAllDoctorsQuery } from "@/services/doctors"
import { useGetAllPatientsQuery } from "@/services/patients"
import { useUploadFileToS3Mutation } from "@/services/s3"
import { useGetStudyQuery, useUpdateStudyMutation } from "@/services/studies"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, CheckIcon, ChevronsUpDown, FileIcon, Save, X } from "lucide-react"
import { Link, useTransitionRouter } from "next-view-transitions"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { study_options } from "../../data"
import { formatReference } from "../../utils"
import { toast } from "sonner"
import { useUserQuery } from "@/services/auth"

const baseEditStudySchema = newStudySchema
  .omit({
    medical_order_ref: true,
    storage_ref: true,
    additional_docs_storage_ref: true,
    consent_storage_ref: true,
    clinical_records_storage_ref: true,
    histopathological_storage_ref: true
  })
  .extend({
    id: z.string(),
    study_category_id: z.string({ required_error: "La categoría de estudio es requerida" }),
    result: z.object({
      storage_ref: z.string().optional(),
      file_name: z.string(),
      file: z.instanceof(File).optional(),
    }).optional(),
    medical_order: z.object({
      storage_ref: z.string().optional(),
      file_name: z.string().optional(),
      file: z.instanceof(File).optional(),
    }).optional(),
    additional_docs: z.object({
      storage_ref: z.string().optional(),
      file_name: z.string().optional(),
      file: z.instanceof(File).optional(),
    }).optional(),
    consent: z.object({
      storage_ref: z.string().optional(),
      file_name: z.string().optional(),
      file: z.instanceof(File).optional(),
    }).optional(),
    clinical_records: z.object({
      storage_ref: z.string().optional(),
      file_name: z.string().optional(),
      file: z.instanceof(File).optional(),
    }).optional(),
    histopathological: z.object({
      storage_ref: z.string().optional(),
      file_name: z.string().optional(),
      file: z.instanceof(File).optional(),
    }).optional()
  })

function createAdaptedEditStudySchema(userableType: string) {
  return baseEditStudySchema.superRefine((data, ctx) => {
    const hasFileOrRef = (field: { file?: File; storage_ref?: string } | undefined) =>
      !!field && (!!field.file || (field.storage_ref && field.storage_ref.trim().length > 0))

    if (userableType === "MedicalInstitution") {
      if (!hasFileOrRef(data.medical_order)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La orden médica es requerida",
          path: ["medical_order", "storage_ref"]
        })
      }
    } else if (
      userableType === "Patient" ||
      userableType === "Doctor" ||
      userableType === "Administrator"
    ) {
      if (!hasFileOrRef(data.medical_order)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La orden médica es requerida",
          path: ["medical_order", "storage_ref"]
        })
      }
    } else {
      if (!hasFileOrRef(data.result)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El resultado es requerido",
          path: ["result", "storage_ref"]
        })
      }
    }

    if (data.title === "prosigna") {
      if (!hasFileOrRef(data.additional_docs)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Los documentos adicionales son requeridos para estudios prosigna",
          path: ["additional_docs", "storage_ref"]
        })
      }
    }

    if (data.study_category_id === "prestaciones_biologia_molecular") {
      if (!hasFileOrRef(data.consent)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El consentimiento informado es requerido",
          path: ["consent", "storage_ref"]
        })
      }
    }

    if (data.study_category_id === "prestaciones_anatomia_patologica") {
      if (!hasFileOrRef(data.histopathological)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El informe histopatológico es requerido",
          path: ["histopathological", "storage_ref"]
        })
      }
    }
  })
}

export default function EditStudyPage() {
  const params = useParams<{ id: string }>()
  const router = useTransitionRouter()

  const { data: study } = useGetStudyQuery(params.id)
  const { data: patients } = useGetAllPatientsQuery()
  const { data: doctors } = useGetAllDoctorsQuery()
  const { data: user } = useUserQuery()

  const [updateStudy, { isLoading }] = useUpdateStudyMutation()
  const [uploadFileToS3, { isLoading: isUploadingFile }] = useUploadFileToS3Mutation()

  const userableType = user?.userable_type || ""
  const adaptedSchema = createAdaptedEditStudySchema(userableType)

  const form = useForm<z.infer<typeof adaptedSchema>>({
    resolver: zodResolver(adaptedSchema),
    defaultValues: {
      id: params.id,
      title: study?.title || "",
      patient_id: study?.patient?.id || "",
      doctor_id: study?.doctor?.id || "",
      state: study?.state,
      study_category_id: study_options.find(cat => cat.items.some(i => i.value === study?.title))?.value,
    }
  })

  async function onSubmit(values: z.infer<typeof adaptedSchema>) {
    try {
      const {
        result,
        medical_order,
        additional_docs,
        consent,
        clinical_records,
        histopathological,
        study_category_id,
        ...data
      } = values

      const result_storage_ref = result?.storage_ref
        ? result.storage_ref
        : result?.file
          ? await uploadFileToS3({ file: result.file, patient_id: values.patient_id }).unwrap()
          : ""
      const medical_order_storage_ref = medical_order?.storage_ref
        ? medical_order.storage_ref
        : medical_order?.file
          ? await uploadFileToS3({ file: medical_order.file, patient_id: values.patient_id }).unwrap()
          : ""
      const additional_docs_storage_ref = additional_docs?.storage_ref
        ? additional_docs.storage_ref
        : additional_docs?.file
          ? await uploadFileToS3({ file: additional_docs.file, patient_id: values.patient_id }).unwrap()
          : ""
      const consent_storage_ref = consent?.storage_ref
        ? consent.storage_ref
        : consent?.file
          ? await uploadFileToS3({ file: consent.file, patient_id: values.patient_id }).unwrap()
          : ""
      const clinical_records_storage_ref = clinical_records?.storage_ref
        ? clinical_records.storage_ref
        : clinical_records?.file
          ? await uploadFileToS3({ file: clinical_records.file, patient_id: values.patient_id }).unwrap()
          : ""
      const histopathological_storage_ref = histopathological?.storage_ref
        ? histopathological.storage_ref
        : histopathological?.file
          ? await uploadFileToS3({ file: histopathological.file, patient_id: values.patient_id }).unwrap()
          : ""

      await updateStudy({
        ...data,
        storage_ref: result_storage_ref,
        medical_order_ref: medical_order_storage_ref,
        additional_docs_storage_ref,
        consent_storage_ref,
        clinical_records_storage_ref,
        histopathological_storage_ref
      }).unwrap()

      toast.custom(() => (
        <div className="flex flex-col gap-1 bg-green-600 border-green-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-green-600/50">
          <p className="font-medium">Estudio actualizado</p>
          <p className="text-sm">Los datos del estudio han sido actualizados correctamente</p>
        </div>
      ))
      router.push(`/views/studies/${params.id}`)
    } catch (err: any) {
      toast.custom(() => (
        <div className="flex flex-col gap-1 bg-red-600 border-red-800 p-4 rounded-md shadow-lg w-[356px] text-accent shadow-red-600/50">
          <p className="font-medium">Algo salió mal</p>
          <p className="text-sm">{err.data?.error || "Ocurrió un error inesperado"}</p>
        </div>
      ))
    }
  }

  const result = useWatch({ control: form.control, name: "result" })
  const medical_order = useWatch({ control: form.control, name: "medical_order" })
  const additional_docs = useWatch({ control: form.control, name: "additional_docs" })
  const consent = useWatch({ control: form.control, name: "consent" })
  const clinical_records = useWatch({ control: form.control, name: "clinical_records" })
  const histopathological = useWatch({ control: form.control, name: "histopathological" })
  const selected_category = useWatch({ control: form.control, name: "study_category_id" })

  useEffect(() => {
    if (!study) return
    form.reset({
      id: params.id,
      title: study.title || "",
      patient_id: study.patient?.id || "",
      doctor_id: study.doctor?.id || "",
      state: study.state,
      study_category_id: study_options.find(cat => cat.items.some(i => i.value === study.title))?.value,
      result: {
        storage_ref: study.storage_ref || "",
        file_name: formatReference(study.storage_ref) || ""
      },
      medical_order: {
        storage_ref: study.medical_order_ref || "",
        file_name: formatReference(study.medical_order_ref) || ""
      },
      additional_docs: {
        storage_ref: study.additional_docs_storage_ref || "",
        file_name: formatReference(study.additional_docs_storage_ref) || ""
      },
      consent: {
        storage_ref: study.consent_storage_ref || "",
        file_name: formatReference(study.consent_storage_ref) || ""
      },
      clinical_records: {
        storage_ref: study.clinical_records_storage_ref || "",
        file_name: formatReference(study.clinical_records_storage_ref) || ""
      },
      histopathological: {
        storage_ref: study.histopathological_storage_ref || "",
        file_name: formatReference(study.histopathological_storage_ref) || ""
      }
    })
  }, [study])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar estudio</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6 flex flex-col"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            form.formState.errors.study_category_id &&
                            "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                            !field.value && "text-muted-foreground/50 font-normal"
                          )}
                        >
                          {field.value
                            ? study_options.find(cat => cat.value === field.value)?.label
                            : "Selecciona una categoría"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Buscar..." className="h-10" />
                        <CommandList className="p-1">
                          <CommandEmpty>No hay resultados</CommandEmpty>
                          <CommandGroup>
                            {study_options.map(cat => (
                              <CommandItem
                                value={cat.label}
                                key={cat.value}
                                onSelect={() => {
                                  form.setValue("study_category_id", cat.value)
                                  form.setValue("title", "")
                                }}
                              >
                                {cat.label}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto",
                                    cat.value === field.value ? "opacity-100" : "opacity-0"
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
                            form.formState.errors.title &&
                            "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                            !field.value && "text-muted-foreground/50 font-normal"
                          )}
                        >
                          {field.value
                            ? study_options
                              .flatMap(c => c.items)
                              .find(s => s.value === field.value)?.label
                            : "Selecciona un estudio"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Buscar..." className="h-10" />
                        <CommandList className="p-1">
                          <CommandEmpty>No hay resultados</CommandEmpty>
                          <CommandGroup>
                            {study_options
                              .find(c => c.value === form.getValues("study_category_id"))
                              ?.items.map(study => (
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
                                      study.value === field.value ? "opacity-100" : "opacity-0"
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
                            form.formState.errors.patient_id &&
                            "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                            !field.value && "text-muted-foreground/50 font-normal"
                          )}
                        >
                          {field.value
                            ? patients?.find(p => p.id === field.value)?.name
                            : "Selecciona un paciente"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Buscar..." className="h-10" />
                        <CommandList className="p-1">
                          <CommandEmpty>No hay resultados</CommandEmpty>
                          <CommandGroup>
                            {patients?.map(patient => (
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
                                    patient.id === field.value ? "opacity-100" : "opacity-0"
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
              name="doctor_id"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    className={cn(
                      "transition-colors group-has-[button[data-state=open]]:text-primary",
                      form.formState.errors.doctor_id && "group-has-[button[data-state=open]]:text-destructive"
                    )}
                  >
                    Médico
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between px-3 !shadow-none hover:border-ring/50 data-[state=open]:border-primary data-[state=open]:border-2 data-[state=open]:!shadow-md data-[state=open]:!shadow-primary/25",
                            form.formState.errors.doctor_id &&
                            "border-destructive hover:border-destructive data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25",
                            !field.value && "text-muted-foreground/50 font-normal"
                          )}
                        >
                          {field.value
                            ? doctors?.find(d => d.id === field.value)?.name
                            : "Selecciona un doctor"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                      <Command>
                        <CommandInput placeholder="Buscar..." className="h-10" />
                        <CommandList className="p-1">
                          <CommandEmpty>No hay resultados</CommandEmpty>
                          <CommandGroup>
                            {doctors?.map(doctor => (
                              <CommandItem
                                value={doctor.id}
                                key={doctor.id}
                                onSelect={() => {
                                  form.setValue("doctor_id", doctor.id)
                                }}
                              >
                                {doctor.name}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto",
                                    doctor.id === field.value ? "opacity-100" : "opacity-0"
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
              name="state"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel
                    className={cn(
                      "transition-colors group-has-[button[data-state=open]]:text-primary",
                      form.formState.errors.state && "group-has-[button[data-state=open]]:text-destructive"
                    )}
                  >
                    Estado
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "state-trigger",
                          form.formState.errors.state &&
                          "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25"
                        )}
                      >
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="initial">Inicial</SelectItem>
                      <SelectItem value="ready_to_download">Listo para descargar</SelectItem>
                      <SelectItem value="pending_pickup">Coordina retiro</SelectItem>
                      <SelectItem value="at_lab">En laboratorio</SelectItem>
                      <SelectItem value="report_completed">Informe realizado</SelectItem>
                      <SelectItem value="requested_to_download">Solicitado para descargar</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medical_order.storage_ref"
              render={() => (
                <FormItem className="space-y-1 group md:col-span-2">
                  <FormLabel
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.medical_order?.storage_ref && "group-focus-within:text-destructive"
                    )}
                  >
                    Orden médica
                  </FormLabel>
                  {medical_order?.file || medical_order?.storage_ref ? (
                    <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                          <FileIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-medium text-sm">{medical_order.file_name}</span>
                      </div>
                      <Button
                        className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={() => {
                          form.setValue(
                            "medical_order",
                            { file: undefined, storage_ref: "", file_name: "" },
                            { shouldValidate: true }
                          )
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  ) : (
                    <FormControl>
                      <FileUploader
                        id="medical_order"
                        onChange={file => {
                          form.setValue(
                            "medical_order",
                            { file, storage_ref: "", file_name: file.name },
                            { shouldValidate: true }
                          )
                        }}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="result.storage_ref"
              render={() => (
                <FormItem className="space-y-1 group md:col-span-2">
                  <FormLabel
                    className={cn(
                      "group-focus-within:text-primary transition-colors",
                      form.formState.errors.result?.storage_ref && "group-focus-within:text-destructive"
                    )}
                  >
                    Resultado
                  </FormLabel>
                  {result?.file || result?.storage_ref ? (
                    <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                          <FileIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-medium text-sm">{result.file_name}</span>
                      </div>
                      <Button
                        className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={() => {
                          form.setValue(
                            "result",
                            { file: undefined, storage_ref: "", file_name: "" },
                            { shouldValidate: true }
                          )
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  ) : (
                    <FormControl>
                      <FileUploader
                        id="result"
                        onChange={file => {
                          form.setValue(
                            "result",
                            { file, storage_ref: "", file_name: file.name },
                            { shouldValidate: true }
                          )
                        }}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selected_category === "prestaciones_biologia_molecular" && (
              <>
                <FormField
                  control={form.control}
                  name="consent.storage_ref"
                  render={() => (
                    <FormItem className="space-y-1 group md:col-span-2">
                      <FormLabel
                        className={cn(
                          "group-focus-within:text-primary transition-colors",
                          form.formState.errors.consent?.storage_ref && "group-focus-within:text-destructive"
                        )}
                      >
                        Consentimiento informado
                      </FormLabel>
                      {consent?.file || consent?.storage_ref ? (
                        <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                              <FileIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-medium text-sm">{consent.file_name}</span>
                          </div>
                          <Button
                            className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                            variant="ghost"
                            type="button"
                            size="icon"
                            onClick={() => {
                              form.setValue(
                                "consent",
                                { file: undefined, storage_ref: "", file_name: "" },
                                { shouldValidate: true }
                              )
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                      ) : (
                        <FormControl>
                          <FileUploader
                            id="consent"
                            onChange={file => {
                              form.setValue(
                                "consent",
                                { file, storage_ref: "", file_name: file.name },
                                { shouldValidate: true }
                              )
                            }}
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clinical_records.storage_ref"
                  render={() => (
                    <FormItem className="space-y-1 group md:col-span-2">
                      <FormLabel
                        className={cn(
                          "group-focus-within:text-primary transition-colors",
                          form.formState.errors.clinical_records?.storage_ref && "group-focus-within:text-destructive"
                        )}
                      >
                        Historial clínico
                      </FormLabel>
                      {clinical_records?.file || clinical_records?.storage_ref ? (
                        <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                              <FileIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-medium text-sm">{clinical_records.file_name}</span>
                          </div>
                          <Button
                            className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                            variant="ghost"
                            type="button"
                            size="icon"
                            onClick={() => {
                              form.setValue(
                                "clinical_records",
                                { file: undefined, storage_ref: "", file_name: "" },
                                { shouldValidate: true }
                              )
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                      ) : (
                        <FormControl>
                          <FileUploader
                            id="clinical_records"
                            onChange={file => {
                              form.setValue(
                                "clinical_records",
                                { file, storage_ref: "", file_name: file.name },
                                { shouldValidate: true }
                              )
                            }}
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_docs.storage_ref"
                  render={() => (
                    <FormItem className="space-y-1 group md:col-span-2">
                      <FormLabel
                        className={cn(
                          "group-focus-within:text-primary transition-colors",
                          form.formState.errors.additional_docs?.storage_ref && "group-focus-within:text-destructive"
                        )}
                      >
                        Documentos adicionales
                      </FormLabel>
                      {additional_docs?.file || additional_docs?.storage_ref ? (
                        <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                              <FileIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-medium text-sm">{additional_docs.file_name}</span>
                          </div>
                          <Button
                            className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                            variant="ghost"
                            type="button"
                            size="icon"
                            onClick={() => {
                              form.setValue(
                                "additional_docs",
                                { file: undefined, storage_ref: "", file_name: "" },
                                { shouldValidate: true }
                              )
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                      ) : (
                        <FormControl>
                          <FileUploader
                            id="additional_docs"
                            onChange={file => {
                              form.setValue(
                                "additional_docs",
                                { file, storage_ref: "", file_name: file.name },
                                { shouldValidate: true }
                              )
                            }}
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selected_category === "prestaciones_anatomia_patologica" && (
              <FormField
                control={form.control}
                name="histopathological.storage_ref"
                render={() => (
                  <FormItem className="space-y-1 group md:col-span-2">
                    <FormLabel
                      className={cn(
                        "group-focus-within:text-primary transition-colors",
                        form.formState.errors.histopathological?.storage_ref && "group-focus-within:text-destructive"
                      )}
                    >
                      Informe histopatológico
                    </FormLabel>
                    {histopathological?.file || histopathological?.storage_ref ? (
                      <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md border transition-border justify-between shadow-sm hover:ring-1 ring-ring/50 transition-all">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                            <FileIcon className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-medium text-sm">
                            {histopathological.file_name}
                          </span>
                        </div>
                        <Button
                          className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => {
                            form.setValue(
                              "histopathological",
                              { file: undefined, storage_ref: "", file_name: "" },
                              { shouldValidate: true }
                            )
                          }}
                        >
                          <X />
                        </Button>
                      </div>
                    ) : (
                      <FormControl>
                        <FileUploader
                          id="histopathological"
                          onChange={file => {
                            form.setValue(
                              "histopathological",
                              { file, storage_ref: "", file_name: file.name },
                              { shouldValidate: true }
                            )
                          }}
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="flex gap-2 ml-auto w-fit">
            <Button variant="ghost" asChild>
              <Link href={`/views/studies/${params.id}`}>
                <ArrowLeft />
                <span className="hidden sm:block">Volver</span>
              </Link>
            </Button>
            <Button
              className="ml-auto min-w-24"
              loading={isLoading || isUploadingFile}
              onClick={() => form.handleSubmit(onSubmit)()}
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

'use client'

import FileUploader from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { newStudySchema } from "@/schemas/studies";
import { useGetAllDoctorsQuery } from "@/services/doctors";
import { useGetAllPatientsQuery } from "@/services/patients";
import { useUploadFileToS3Mutation } from "@/services/s3";
import { useCreateStudyMutation, useGetStudyQuery, useUpdateStudyMutation } from "@/services/studies";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckIcon, ChevronsUpDown, FileIcon, Save, X } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { study_options } from "../data";

const adaptedNewStudySchema = newStudySchema
  .omit({
    medical_order_ref: true,
    storage_ref: true,
    additional_docs_storage_ref: true,
    state: true,
  })
  .extend({
    study_category_id: z.string({ required_error: "La categoría de estudio es requerida" }),
    result: z.instanceof(File, { message: "El resultado es requerido" }),
    medical_order: z.instanceof(File).optional(),
    additional_docs: z.instanceof(File).optional(),
  });

export default function NewStudyPage() {
  const router = useTransitionRouter();

  const { toast } = useToast()

  const { data: patients } = useGetAllPatientsQuery()
  const { data: doctors } = useGetAllDoctorsQuery()

  const [createStudy, { isLoading }] = useCreateStudyMutation()
  const [uploadFileToS3, { isLoading: isUploadingFile }] = useUploadFileToS3Mutation();

  const form = useForm<z.infer<typeof adaptedNewStudySchema>>({
    resolver: zodResolver(adaptedNewStudySchema),
  })

  async function onSubmit(values: z.infer<typeof adaptedNewStudySchema>) {
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

      toast({
        title: "Estudio creado",
        description: "El estudio ha sido creado exitosamente",
      });

      router.push(`/views/studies`)
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Algo salió mal",
        variant: "destructive",
        description: err.data.error || "Ocurrió un error al crear el estudio",
      })
    }
  }

  const result = useWatch({ control: form.control, name: "result" })
  const medical_order = useWatch({ control: form.control, name: "medical_order" })
  const additional_docs = useWatch({ control: form.control, name: "additional_docs" })
  const selected_category = useWatch({ control: form.control, name: "study_category_id" })
  const study_type = useWatch({ control: form.control, name: "title" })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar estudio</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background p-6 rounded-md shadow-lg shadow-border space-y-6 flex flex-col">
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
            {/* <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="flex flex-col group">
                  <FormLabel className={cn(
                    "transition-colors group-has-[button[data-state=open]]:text-primary",
                    form.formState.errors.state && "group-has-[button[data-state=open]]:text-destructive"
                  )}>
                    Estado
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn("state-trigger", form.formState.errors.state && "border-destructive hover:border-destructive focus-visible:!border-destructive focus-visible:!shadow-destructive/25 data-[state=open]:!border-destructive data-[state=open]:!shadow-destructive/25")}
                      >
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ready_to_download">Listo para descargar</SelectItem>
                      <SelectItem value="initial">Inicial</SelectItem>
                      <SelectItem value="requested_to_download">Solicitado para descargar</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="medical_order"
              render={() => (
                <FormItem className="space-y-1 group col-span-2">
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
            <FormField
              control={form.control}
              name="result"
              render={() => (
                <FormItem className="space-y-1 group col-span-2">
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
                          form.reset({ result })
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
            {study_type === "prosigna" && (
              <FormField
                control={form.control}
                name="additional_docs"
                render={() => (
                  <FormItem className="space-y-1 group col-span-2">
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
                            form.setValue("additional_docs", undefined, { shouldValidate: true })
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
                Volver
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
'use client'

import FileUploader from "@/app/users/[user_id]/components/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { setDialogsState } from "@/lib/store/dialogs-store";
import { cn } from "@/lib/utils";
import { useGetClientQuery } from "@/services/doctors";
import { useUploadFileToS3Mutation } from "@/services/s3";
import { useUpdateStudyMutation, useGetClientStudyQuery, useDownloadClientStudyMutation } from "@/services/studies";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { FileIcon, Loader2, Plus, Trash } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import Blocks from "./components/blocks";
import NewBlockDialog from "../../components/new-block-dialog";
import { Square } from "../../components/square";
import EditBlockDialog from "./components/edit-block-dialog";
import { createStudySchema } from "../../utils";

function getStorageRef(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const pathWithSlash = url.pathname;

    const path = pathWithSlash.startsWith('/') ? pathWithSlash.substring(1) : pathWithSlash;

    return decodeURIComponent(path);
  } catch (error) {
    console.log(error)
    return null;
  }
}

export default function EditClientStudyPage() {
  const router = useTransitionRouter()

  const { client_study_id, user_id } = useParams<{ client_study_id: string; user_id: string }>();
  const { toast } = useToast()

  const [uploadFileToS3] = useUploadFileToS3Mutation();
  const [updateStudy] = useUpdateStudyMutation();
  const [downloadStudy] = useDownloadClientStudyMutation();

  const { data: clientStudy, isLoading: isClientStudyLoading } = useGetClientStudyQuery(client_study_id);
  const { data: client, isLoading: isClientLoading } = useGetClientQuery(user_id ?? "");

  const [isLoading, setLoading] = useState(false);
  const [loadNewStudy, setLoadNewStudy] = useState(false);

  const dynamicSchema = createStudySchema(client_study_id, loadNewStudy);

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      client_id: "",
      study_code: "",
      storage_ref: "",
    },
  });

  async function onSubmit(data: z.infer<typeof dynamicSchema>) {
    setLoading(true);
    try {
      let storage_ref = getStorageRef((await downloadStudy(client_study_id)).data?.url!);

      if (data.file) {
        storage_ref = await uploadFileToS3({
          file: data.file,
          client_id: data.client_id,
        }).unwrap();
      }

      const response = await updateStudy({
        id: client_study_id,
        storage_ref: storage_ref!,
        study_code: data.study_code,
        client_id: data.client_id,
        metadata: (data as any).metadata,
      })

      if (response.data?.id) {
        toast({
          title: "Estudio actualizado",
          description: "El estudio ha sido actualizado exitosamente",
        });
      }

      router.push(`/users/${user_id}`)
    } catch (err: any) {
      toast({
        title: "Algo salió mal",
        variant: "destructive",
        description: "Por favor, intenta de nuevo",
      })
    } finally {
      setLoading(false);
    }
  }

  const uploadedFile = useWatch({
    control: form.control,
    name: "file",
  });

  useEffect(() => {
    if (!clientStudy) return;

    form.setValue("study_code", clientStudy?.code);
    form.setValue("metadata", clientStudy?.metadata);
    form.setValue("storage_ref", clientStudy?.storage_ref);
  }, [clientStudy]);

  useEffect(() => {
    if (!client) return;
    form.setValue("client_id", client?.id);
  }, [client]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h1
        className={cn(
          "text-xl font-semibold transition-all duration-200",
          isClientStudyLoading ? "text-muted-foreground font-normal blur-[6px]" : "blur-none"
        )}
      >
        {isClientStudyLoading ? "texto de estudio" : clientStudy?.title}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-background p-6 rounded-md shadow-lg shadow-border border space-y-6">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      type="button"
                      disableRipple
                      className={cn(
                        "justify-between px-3 bg-secondary cursor-default border-none hover:bg-secondary/50",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Square className={cn("bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20")}>
                          <p
                            className={cn("transition-all duration-200", isClientLoading ? "blur-[4px]" : "blur-none")}
                          >
                            {isClientLoading ? "T" : client?.first_name?.charAt(0)}
                          </p>
                        </Square>
                        <p
                          className={cn("transition-all duration-200", isClientLoading ? "text-muted-foreground font-normal blur-[6px]" : "blur-none")}
                        >
                          {isClientLoading ? "Agustin Delgado" : `${client?.first_name} ${client?.last_name}`}
                        </p>
                      </div>
                    </Button>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="study_code"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>Estudio</FormLabel>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      disableRipple
                      type="button"
                      className={cn(
                        "justify-between px-3 bg-secondary cursor-default border-none hover:bg-secondary/50",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Square className={cn("bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20")}>
                          <p
                            className={cn("transition-all duration-200", isClientStudyLoading ? "blur-[4px]" : "blur-none")}
                          >
                            {isClientStudyLoading ? "T" : clientStudy?.title?.charAt(0)}
                          </p>
                        </Square>
                        <p
                          className={cn("transition-all duration-200", isClientStudyLoading ? "text-muted-foreground font-normal blur-[6px]" : "blur-none")}
                        >
                          {isClientStudyLoading ? "Agustin Delgado" : clientStudy?.title}
                        </p>
                      </div>
                    </Button>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          {clientStudy?.storage_ref && !loadNewStudy ?
            <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md bg-secondary transition-border justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-2">
                <Square className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                  <FileIcon className="w-3.5 h-3.5" />
                </Square>
                <span className="font-medium text-sm">{clientStudy.storage_ref}</span>
              </div>

              <Button
                className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                variant="destructive"
                type="button"
                size="icon"
                onClick={() => setLoadNewStudy(true)}
              >
                <Trash />
              </Button>
            </div> : (
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem className="space-y-1 group col-span-2">
                    <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors.file && "group-focus-within:text-destructive")}>
                      PDF Adjunto
                    </FormLabel>
                    <FormControl>
                      <FileUploader onChange={field.onChange} />
                    </FormControl>
                    {uploadedFile && (
                      <div className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-md bg-secondary transition-border justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                          <Square className="bg-indigo-400/20 text-indigo-500 shadow-lg shadow-indigo-400/20">
                            <FileIcon className="w-3.5 h-3.5" />
                          </Square>
                          <span className="font-medium text-sm">{uploadedFile.name}</span>
                        </div>

                        <Button
                          className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          variant="destructive"
                          type="button"
                          size="icon"
                          onClick={() => form.resetField("file")}
                        >
                          <Trash />
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )

          }
          {clientStudy?.code !== "lab" && clientStudy?.code !== "in_body" && clientStudy?.code !== "genetic" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <Label
                  className={cn(
                    form.formState.errors["metadata" as keyof z.infer<typeof dynamicSchema>] && "text-destructive"
                  )}
                >
                  Bloques
                </Label>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={() => setDialogsState({
                    payload: { study_code: clientStudy?.code },
                    open: "new-block"
                  })}
                >
                  <Plus />
                  Nuevo bloque
                </Button>
              </div>
              <Blocks />
              {form.formState.errors["metadata" as keyof z.infer<typeof dynamicSchema>] && (
                <p className={cn("text-sm font-medium text-destructive")}>
                  Al menos un bloque es requerido
                </p>
              )}
            </div>
          )}
          {(clientStudy?.code === "lab" || clientStudy?.code === "in_body" || clientStudy?.code === "genetic") && (
            <FormField
              control={form.control}
              name={"metadata.obs" as any}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingresa observaciones"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {clientStudy?.code === "supplements" && (
            <FormField
              control={form.control}
              name={"metadata.note" as any}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nota</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingresa una nota para el estudio"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-[86px]"
              disabled={isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="!w-5 !h-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    Guardar
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
          <NewBlockDialog
            key={`new-${clientStudy?.code}`}
            studyCode={clientStudy?.code}
          />
          <EditBlockDialog
            key={`edit-${clientStudy?.code}`}
            studyCode={clientStudy?.code}
          />
        </form>
      </Form>
    </div>
  );
}

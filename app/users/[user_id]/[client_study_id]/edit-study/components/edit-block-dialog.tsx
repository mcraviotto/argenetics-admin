import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { closeDialogs, DialogsState, dialogsStateObservable } from "@/lib/store/dialogs-store";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { getBlockSchemaAndDefaults } from "../../../utils";

export const Editor = dynamic(() => import("../../../../../../components/markdown-area"), { ssr: false });

export default function EditBlockDialog({ studyCode }: { studyCode?: string }) {
  const { setValue, getValues } = useFormContext<any>();

  const [dialogState, setDialogState] = useState<DialogsState>({ open: false });

  const { schema: blockSchema, defaultValues: blockDefaultValues, fields } = getBlockSchemaAndDefaults(studyCode ?? "");

  const blockId = dialogState?.payload?.blockId;

  const form = useForm<z.infer<typeof blockSchema>>({
    resolver: zodResolver(blockSchema),
    defaultValues: blockDefaultValues,
  });

  const onOpenChange = () => {
    closeDialogs()
    form.reset();
  }

  const onSubmit = async (data: z.infer<typeof blockSchema>) => {
    const metadata = getValues("metadata");
    const blocks = metadata?.blocks || [];
    const updatedBlocks = [...blocks];
    updatedBlocks[blockId] = data;

    setValue("metadata", { ...metadata, blocks: updatedBlocks });
    onOpenChange()
  };

  useEffect(() => {
    const subscription = dialogsStateObservable.subscribe(setDialogState)
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const metadata = getValues("metadata");
    const blocks = metadata?.blocks || [];
    const block = blocks[blockId];

    if (block) {
      form.reset(block);
    }

  }, [blockId])

  return (
    <Dialog
      open={dialogState.open === "edit-block"}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="w-1/2 min-w-[400px] max-w-[700px] max-h-[600px] overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Editar bloque</DialogTitle>
          <DialogDescription>
            Los bloques son las secciones del estudio que el cliente verá en la app.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4">
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as keyof z.infer<typeof blockSchema>}
                render={({ field: inputField }) => (
                  <FormItem className="space-y-1 group">
                    <FormLabel className={cn("group-focus-within:text-primary transition-colors", form.formState.errors[field.name as keyof z.infer<typeof blockSchema>] && "group-focus-within:text-destructive")}>
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      {field.type === "textarea" ? (
                        <Editor
                          initialValue={inputField.value}
                          setValue={form.setValue}
                        />
                      ) : (
                        <Input
                          className={form.formState.errors[field.name as keyof z.infer<typeof blockSchema>] && "border-destructive hover:border-destructive focus:!border-destructive focus:!shadow-destructive/25"}
                          placeholder={field.label}
                          {...inputField}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div className="flex justify-end">
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                Agregar
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

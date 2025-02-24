'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { closeDialogs, DialogsState, dialogsStateObservable } from "@/lib/store/dialogs-store";
import { useDeleteClientMutation } from "@/services/doctors";
import { useEffect, useState } from "react";

export default function DeleteClientDialog() {
  const { toast } = useToast()

  const [dialogState, setDialogState] = useState<DialogsState>({ open: false });

  const { client_id } = dialogState?.payload ?? {}

  const [deleteClient, { isLoading }] = useDeleteClientMutation()

  const handleDeleteClient = async () => {
    try {
      await deleteClient(client_id)
      closeDialogs()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive"
      })
    }
  }

  const onOpenChange = () => {
    closeDialogs()
  }

  useEffect(() => {
    const subscription = dialogsStateObservable.subscribe(setDialogState)
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AlertDialog
      open={dialogState.open === "delete-client"}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que deseas eliminar este cliente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Todos los estudios asociados a este cliente también se eliminarán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading} onClick={handleDeleteClient}>
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
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
import { useDeleteClientStudyMutation } from "@/services/studies";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useState } from "react";

export default function DeleteClientStudyDialog() {
  const router = useTransitionRouter()
  const { toast } = useToast()

  const [dialogState, setDialogState] = useState<DialogsState>({ open: false });

  const { client_study_id, user_id } = dialogState?.payload ?? {}

  const [deleteStudy, { isLoading }] = useDeleteClientStudyMutation()

  const handleDeleteStudy = async () => {
    try {
      await deleteStudy(client_study_id)
      router.push(`/users/${user_id}`)
      closeDialogs()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el estudio",
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
      open={dialogState.open === "delete-client-study"}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que deseas eliminar este estudio?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading} onClick={handleDeleteStudy}>
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
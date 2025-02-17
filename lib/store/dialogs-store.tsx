import { BehaviorSubject } from 'rxjs';

export type DialogsState = {
  open: "notifications" | "new-block" | "edit-block" | "delete-client-study" | "delete-client" | false,
  payload?: any
}

const initalState: DialogsState = {
  open: false,
  payload: undefined
}

const dialogsState$ = new BehaviorSubject(initalState)

export const setDialogsState = (state: DialogsState) => {
  dialogsState$.next(state)
}

export const getDialogsState = () => {
  return dialogsState$.getValue()
}

export const closeDialogs = () => {
  dialogsState$.next({ open: false, payload: undefined })
}

export const dialogsStateObservable = dialogsState$.asObservable()
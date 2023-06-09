export type SavedCell = {
  name: string,
  description: string
  id: string
}

// What happens when the user clicks (or drags) at the simulation canvas
export enum InputMode {
  SelectCell,
  SelectArea,
  MoveCanvas
}

import { useLocalStorage } from "@vueuse/core";

// What happens when the user clicks (or drags) at the simulation canvas
export enum InputMode {
  SelectCell,
  SelectArea,
  MoveCanvas,
}

const inputMode = useLocalStorage("savedInputMode", InputMode.MoveCanvas);

export default function () {
  const setInputMode = (mode: InputMode) => {
    inputMode.value = mode;
  };

  return {
    inputMode,
    setInputMode,
  };
}

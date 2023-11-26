import { InputMode } from "@/types";
import { useLocalStorage } from '@vueuse/core';

const inputMode = useLocalStorage('savedInputMode', InputMode.MoveCanvas);

export default function() {
  const setInputMode = (mode: InputMode) => {
    inputMode.value = mode;
  }

  return {
    inputMode,
    setInputMode,
  }
}

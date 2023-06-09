import { InputMode } from "~/src/types";

const useInputMode = () => {
  const inputMode = useState('inputMode', () => {
    const savedInputMode = localStorage.getItem("savedInputMode");
    if (savedInputMode === null) {
      return InputMode.SelectCell;
    } else {
      return Number.parseInt(savedInputMode);
    }
  });

  const setInputMode = (mode: InputMode) => {
    localStorage.setItem("savedInputMode", mode.toString());
    inputMode.value = mode
  }

  return {
    inputMode,
    setInputMode
  }
}
export default useInputMode

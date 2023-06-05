import Bot from "~/src/bot";
import { forceRender } from "~/src/render";

// Store currently selected cell to be globaly accessable
const useSelectedCell = () => {
  const selectedCell: Ref<Bot> = useState('savedCell', () => null);

  const setSelectedCell = (cell: Bot) => {
    selectedCell.value = cell
    forceRender();
  }

  return {
    selectedCell,
    setSelectedCell
  }
}
export default useSelectedCell

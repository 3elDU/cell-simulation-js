import { forceRender } from "@/render";

/**
 * @type {Ref<import('@/bot').default>}
 */
const selectedCell = ref()

export default function() {
  /** @param {import('@/bot').default | null} cell */
  const setSelectedCell = (cell) => {
    selectedCell.value = cell;
    forceRender();
  }

  return {
    selectedCell,
    setSelectedCell
  }
}

const isSelecting = ref(false);

export default function() {
  const setIsSelecting = (selecting: boolean) => {
    isSelecting.value = selecting;
  }

  return {
    isSelecting,
    setIsSelecting
  }
}

// Indicate that a user is going to click at the canvas ( select a cell )
// Used to adjust UI accordingly
const useIsSelecting = () => {
  const isSelecting = useState('selecting', () => false);

  const setIsSelecting = (selecting: boolean) => {
    isSelecting.value = selecting
  }

  return {
    isSelecting,
    setIsSelecting
  }
}
export default useIsSelecting

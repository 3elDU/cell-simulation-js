// Allows opening/closing the sidebar, and retrieving it's state from anywhere
const useOpenSidebar = () => {
  const isOpened = useState('sidebaropened', () => true);

  const setIsOpened = (opened: boolean) => {
    isOpened.value = opened
  }

  return {
    isOpened,
    setIsOpened
  }
}
export default useOpenSidebar

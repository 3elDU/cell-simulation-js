const isOpened = ref(true);

export default function() {
  const setIsOpened = (opened: boolean) => {
    isOpened.value = opened;
  }

  return {
    isOpened,
    setIsOpened
  }
}

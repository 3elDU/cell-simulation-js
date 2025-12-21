import { sendToWorker } from "@/ipc";

const fieldSize: Ref<[number, number]> = ref([64, 64]);

export default function useFieldSize() {
  function setFieldSize(width: number, height: number) {
    fieldSize.value = [width, height];
    sendToWorker({
      type: "resize",
      width,
      height,
    });
  }

  return { fieldSize, setFieldSize };
}

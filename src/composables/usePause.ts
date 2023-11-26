import { forceRender } from "@/render";
import simulation from "@/simulation";

const paused = ref(true);

export default function usePause() {
  const togglePause = () => {
    simulation.togglePause()
    paused.value = simulation.isPaused;
    forceRender();
  }

  return {
    paused,
    togglePause,
  }
}

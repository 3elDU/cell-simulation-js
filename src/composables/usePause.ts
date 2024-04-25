import { forceRender } from "@/simulation/render";
import simulation from "@/simulation/simulation";

const paused = ref(true);

export default function usePause() {
  const togglePause = () => {
    simulation.togglePause();
    paused.value = simulation.isPaused;
    forceRender();
  };

  return {
    paused,
    togglePause,
  };
}

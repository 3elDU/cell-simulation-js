<script setup lang="ts">
import Bot from "@/simulation/bot";
import simulation from "@/simulation/simulation";

const selectedCell = useSelectedCellStore();
const { isOpened } = useSidebar();

const sidebar = ref();

let sidebarVisibilityTimeout: number;
watch(isOpened, (opened) => {
  if (opened) {
    sidebar.value.style.left = "0px";

    // clear the timeout, otherwise the sidebar transition could bug out and stay in the hidden state
    // ( for example,  when the user opens and closes the sidebar too fast )
    clearTimeout(sidebarVisibilityTimeout);
    sidebar.value.style.visibility = "visible";
  } else {
    sidebar.value.style.left = `-${
      sidebar.value.getBoundingClientRect().width
    }px`;

    //  hide the sidebar completely.
    // `setTimeout` is used, because we first need to wait before the CSS transition ends
    sidebarVisibilityTimeout = setTimeout(
      () => (sidebar.value.style.visibility = "hidden"),
      300
    );
  }
});
</script>

<template>
  <div ref="sidebar" id="sidebar">
    <div class="h-full flex flex-col gap-4">
      <Accordion name="Simulation statistics" :initialState="true">
        <SimulationStatistics />
      </Accordion>

      <Accordion
        v-if="selectedCell.value instanceof Bot && !selectedCell.value.empty"
        name="Selected cell"
      >
        <SelectedCellInfo />
      </Accordion>
    </div>
  </div>
</template>

<style scoped>
#sidebar {
  position: fixed;

  left: 0;
  z-index: 20;

  width: 100%;
  height: 100%;
  overflow-y: auto;

  background: #d4d4d4;
  border-right: 1px solid #aaaaaa;

  padding: 1rem;
  padding-top: 5rem;

  transition: all 300ms ease-in-out;
}

@media (min-width: 640px) {
  #sidebar {
    width: 20rem;
  }
}

@media (prefers-color-scheme: dark) {
  #sidebar {
    background: #262626;
    border-right: 1px solid #404040;
  }
}
</style>

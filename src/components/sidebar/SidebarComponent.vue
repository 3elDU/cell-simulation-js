<script setup lang="ts">
import m from "@/i18n/message";

const selectedCell = useSelectedCellStore();
const { isOpened } = useSidebar();

const sidebarEl = ref<HTMLDivElement>();
const left = ref("0px");
const visibility = ref("visible");

let sidebarVisibilityTimeout: number;
watch(isOpened, (opened) => {
  if (opened) {
    left.value = "0px";

    // clear the timeout, otherwise the sidebar transition could bug out and stay in the hidden state
    // ( for example,  when the user opens and closes the sidebar too fast )
    clearTimeout(sidebarVisibilityTimeout);
    visibility.value = "visible";
  } else {
    const width = sidebarEl.value!.getBoundingClientRect().width;
    left.value = `-${width}px`;

    //  hide the sidebar completely.
    // `setTimeout` is used, because we first need to wait before the CSS transition ends
    sidebarVisibilityTimeout = setTimeout(
      () => (visibility.value = "hidden"),
      300
    );
  }
});
</script>

<template>
  <div id="sidebar-wrapper" ref="sidebarEl">
    <div id="sidebar-controls-blur" aria-hidden></div>
    <div id="sidebar">
      <div id="sidebar-content">
        <Accordion :name="m('sidebar.statistics')" :initialState="true">
          <SimulationStatistics />
        </Accordion>

        <Accordion
          v-if="selectedCell.selected"
          :name="m('sidebar.selectedCell')"
        >
          <SelectedCellInfo />
        </Accordion>

        <div id="sidebar-footer">
          <Globe />
          <GitHub />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#sidebar-wrapper {
  position: fixed;

  width: 100%;
  height: 100%;

  left: v-bind(left);
  z-index: var(--z-bar);
  visibility: v-bind(visibility);

  transition: left var(--transition-medium) ease-in-out;
}
#sidebar {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  background: var(--frosted-pane-background);
  backdrop-filter: blur(var(--pane-blur));

  padding: var(--space-md);
  /** Account for the controls */
  padding-top: calc(var(--space-md) * 7);
}
#sidebar-controls-blur {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: calc(var(--space-md) * 7);

  z-index: calc(var(--z-bar) + 1);
  backdrop-filter: blur(3rem);
  mask: linear-gradient(to bottom, black 50%, transparent);
  mask-clip: no-clip;
}

#sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

#sidebar-footer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

@media (min-width: 640px) {
  #sidebar-wrapper,
  #sidebar {
    width: var(--sidebar-width);
  }
}
</style>

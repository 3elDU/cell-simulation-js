/* eslint-disable */

import {CellSimulation} from "~/src/simulation";
import {shallowReactive} from "vue";
import {defaultConfig} from "~/src/config";

export const state = () => ({
  // use shallowReactive, because CellSimulation contains a lot of nested object, that Vue needs to traverse
  // without shallowReactive, performance... isn't great, to say the least
  simulation: shallowReactive(new CellSimulation(64, 64, defaultConfig())),
  paused: true,

  sidebarResizeDragLock: false,
  canvasDragLock: false,
})

export const getters = {
  getSimulation: state => state.simulation,
  getSimulationWidth: state => state.simulation.width,
  getSimulationHeight: state => state.simulation.height,
  getCellAt: (state) => (x, y) => state.simulation.bots[y * state.simulation.width + x],

  getConfig: (state) => state.config,

  isPaused: (state) => state.paused,

  getSidebarResizeDragLock: (state) => state.sidebarResizeDragLock,
  getCanvasDragLock: (state) => state.canvasDragLock,
}

export const mutations = {
  generateMap: (state) => state.simulation.generateMap(),
  clearMap: (state) => state.simulation.clearMap(),
  updateSimulation: (state) => state.simulation.update(),
  setCell: (state, cell) => state.simulation.bots[cell.y * state.simulation.width + cell.x] = cell,

  setPaused: (state, paused) => state.paused = paused,

  setSidebarResizeDragLock: (state, lock) => state.sidebarResizeDragLock = lock,
  setCanvasDragLock: (state, lock) => state.canvasDragLock = lock
}

export const actions = {}



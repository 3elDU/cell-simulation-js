/* eslint-disable */

import {CellSimulation} from "~/src/simulation";
import {shallowReactive} from "vue";

export const state = () => ({
  // use shallowReactive, because CellSimulation contains a lot of nested object, that Vue needs to traverse
  // without shallowReactive, performance... isn't great, to say the least
  simulation: shallowReactive(new CellSimulation(64, 64)),
  paused: true
})

export const getters = {
  getSimulation: state => state.simulation,
  getSimulationWidth: state => state.simulation.width,
  getSimulationHeight: state => state.simulation.height,
  getCellAt: (state) => (x, y) => state.simulation.bots[y * state.simulation.width + x],

  isPaused: (state) => state.paused
}

export const mutations = {
  generateMap: (state) => state.simulation.generateMap(),
  updateSimulation: (state) => state.simulation.update(),

  setPaused(state, paused) {
    state.paused = paused
  }
}

export const actions = {}



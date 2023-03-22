/* eslint-disable */

import {CellSimulation} from "~/src/simulation";

export const state = () => ({
  simulation: new CellSimulation(64, 64),
  paused: true
})

export const getters = {
  getSimulation: state => state.simulation,
  getSimulationWidth: state => state.simulation.width,
  getSimulationHeight: state => state.simulation.height,
  getCellAt: (state) => (x, y) => state.simulation.field[y][x],

  isPaused: (state) => state.paused
}

export const mutations = {
  setPaused(state, paused) {
    console.log(`Set paused to ${paused}`)
    state.paused = paused
  }
}

export const actions = {
  generateMap({state}) {
    state.simulation.generateMap()
  },
}



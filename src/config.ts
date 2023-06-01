export interface Config {
  mutationPercent: number
  genomeLength: number
  startEnergy: number
  reproductionRequiredEnergy: number
  cellMaxAge: number
  photosynthesisEnergy: number
  attackRequiredEnergy: number
  attackEnergy: number
  movementCost: number
  turnCost: number
  noopCost: number
}

export default {
  mutationPercent: 25,
  genomeLength: 32,
  startEnergy: 5.0,
  reproductionRequiredEnergy: 16,
  cellMaxAge: 2048,
  photosynthesisEnergy: 1,
  attackRequiredEnergy: 2,
  attackEnergy: 0.5,
  movementCost: 1,
  turnCost: 0.5,
  noopCost: 0.1
}

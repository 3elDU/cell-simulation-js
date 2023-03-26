import { Config } from '~/src/config'
import { randomRange } from '~/src/rand'

export enum Instruction {
  // do nothing
  NOOP,

  // movement
  TURN_LEFT,
  TURN_RIGHT,
  MOVE_FORWARDS,

  PHOTOSYNTHESIS,

  // gives e energy to cell in front
  GIVE_ENERGY,

  // attacks cell in front
  // if cell class is hunter cell, it kills the cell immediately
  ATTACK_CELL,

  // eats dead cell in front
  RECYCLE_DEAD_CELL,

  // jump to instruction b1 if cell has more than e energy
  // otherwise, jump to instruction b2
  CHECK_ENERGY,

  // if left -> b1
  // if right ->
  CHECK_ROTATION,

  // jump to instruction BX, if there's alive cell in front
  JMP_IF_FACING_ALIVE_CELL,

  // jump to instruction BX, if there's dead cell in front
  JMP_IF_FACING_DEAD_CELL,

  // jump to instruction BX, if facing empty space
  JMP_IF_FACING_VOID,

  // if cell's genome is at least CX% similar to other's cell genome, jumping to instruction bx
  JMP_IF_FACING_RELATIVE,

  // works, if cell has more than REPRODUCTION_REQUIRED_ENERGY energy
  MAKE_CHILD
}

export class Gene {
  instruction: Instruction

  opt: boolean

  e: number

  b1: number
  b2: number
  b3: number
  b4: number

  constructor (instruction: Instruction, opt: boolean, e: number, b1: number, b2: number, b3: number, b4: number) {
    this.instruction = instruction
    this.opt = opt
    this.e = e
    this.b1 = b1
    this.b2 = b2
    this.b3 = b3
    this.b4 = b4
  }

  static generate (config: Config): Gene {
    return new Gene(
      randomRange(0, Instruction.MAKE_CHILD + 1),
      Math.random() > 0.5,
      randomRange(0, config.reproductionRequiredEnergy * 2),
      randomRange(0, config.genomeLength),
      randomRange(0, config.genomeLength),
      randomRange(0, config.genomeLength),
      randomRange(0, config.genomeLength)
    )
  }

  clone (): Gene {
    return new Gene(
      this.instruction,
      this.opt,
      this.e,
      this.b1, this.b2, this.b3, this.b4
    )
  }

  static fromJSON (obj: any): Gene {
    return new Gene(
      obj.instruction,
      obj.opt,
      obj.e,
      obj.b1, obj.b2, obj.b4, obj.b4
    )
  }
}

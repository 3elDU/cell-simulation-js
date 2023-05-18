import { randomRange } from './rand.js'

export const Instruction = {
  // do nothing
  NOOP: "No-op",

  // movement
  TURN_LEFT: "Turn left",
  TURN_RIGHT: "Turn right",
  MOVE_FORWARDS: "Move forwards",

  PHOTOSYNTHESIS: "Photosynthesis",

  // gives e energy to cell in front
  GIVE_ENERGY: "Give energy",

  // attacks cell in front
  // if cell class is hunter cell, it kills the cell immediately
  ATTACK_CELL: "Attack cell",

  // eats dead cell in front
  RECYCLE_DEAD_CELL: "Recycle dead cell",

  // jump to instruction b1 if cell has more than e energy
  // otherwise, jump to instruction b2
  CHECK_ENERGY: "Check energy",

  // if left -> b1
  // if right -> b2
  // if up -> b3
  // if down -> b4
  CHECK_ROTATION: "Check rotation",

  // jump to instruction BX, if there's alive cell in front
  JMP_IF_FACING_ALIVE_CELL: "Check if facing alive cell",

  // jump to instruction BX, if there's dead cell in front
  JMP_IF_FACING_DEAD_CELL: "Check if facing dead cell",

  // jump to instruction BX, if facing empty space
  JMP_IF_FACING_VOID: "Check if facing void",

  // if cell's genome is at least CX% similar to other's cell genome, jumping to instruction bx
  JMP_IF_FACING_RELATIVE: "Check if facing relative",

  // works, if cell has more than REPRODUCTION_REQUIRED_ENERGY energy
  MAKE_CHILD: "Make child",
}
export function randomInstruction() {
  const values = Object.values(Instruction);
  return values[Math.floor(Math.random() * values.length)];
}

export class Gene {
  instruction
  
  opt
  e
  b1
  b2
  b3
  b4

  constructor (instruction, opt, e, b1, b2, b3, b4) {
    this.instruction = instruction
    this.opt = opt
    this.e = e
    this.b1 = b1
    this.b2 = b2
    this.b3 = b3
    this.b4 = b4
  }

  static generate (config) {
    return new Gene(
      randomInstruction(),
      Math.random() > 0.5,
      randomRange(0, config.reproductionRequiredEnergy * 2),
      randomRange(0, config.genomeLength),
      randomRange(0, config.genomeLength),
      randomRange(0, config.genomeLength),
      randomRange(0, config.genomeLength)
    )
  }

  clone () {
    return new Gene(
      this.instruction,
      this.opt,
      this.e,
      this.b1, this.b2, this.b3, this.b4
    )
  }

  static fromJSON (obj) {
    return new Gene(
      obj.instruction,
      obj.opt,
      obj.e,
      obj.b1, obj.b2, obj.b4, obj.b4
    )
  }
}

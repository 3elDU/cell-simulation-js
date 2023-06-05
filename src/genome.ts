import config, { Config } from '~/src/config'
import { randomRange, randomRangeInclusive } from '~/src/rand'

export enum Instruction {
  // do nothing
  Noop,

  // movement
  TurnLeft,
  TurnRight,
  MoveForwards,

  Photosynthesis,

  // gives e energy to cell in front
  GiveEnergy,

  // attacks cell in front
  // if cell class is hunter cell, it kills the cell immediately
  AttackCell,

  // eats dead cell in front
  RecycleDeadCell,

  // jump to instruction b1 if cell has more than e energy
  // otherwise, jump to instruction b2
  CheckEnergy,

  JumpIfFacingLeft,
  JumpIfFacingRight,
  JumpIfFacingUp,
  JumpIfFacingDown,

  // jump to instruction BX, if there's alive cell in front
  JumpIfFacingAliveCell,
  // jump to instruction BX, if there's dead cell in front
  JumpIfFacingDeadCell,
  // jump to instruction BX, if facing empty space
  JumpIfFacingVoid,
  // if cell's genome is at least CX% similar to other's cell genome, jumping to instruction bx
  JumpIfFacingRelative,

  // works, if cell has more than REPRODUCTION_REQUIRED_ENERGY energy
  MakeChild
}

// Name, shorthand, text/background color for each gene
export const InstructionInfoList = {
  [Instruction.Noop]: { backgroundColor: 'red', color: 'white', abbreviation: 'N', name: 'No-op' },
  [Instruction.TurnLeft]: { backgroundColor: '#b55088', color: 'white', abbreviation: 'L', name: 'Turn left' },
  [Instruction.TurnRight]: { backgroundColor: '#b55088', color: 'white', abbreviation: 'R', name: 'Turn right' },
  [Instruction.MoveForwards]: { backgroundColor: '#68386c', color: 'white', abbreviation: 'M', name: 'Move forwards' },
  [Instruction.Photosynthesis]: { backgroundColor: '#63c74d', color: 'black', abbreviation: 'P', name: 'Produce energy by photosynthesis' },
  [Instruction.GiveEnergy]: { backgroundColor: '#f77622', color: 'white', abbreviation: 'G', name: 'Give energy to cell in front' },
  [Instruction.AttackCell]: { backgroundColor: '#e43b44', color: 'white', abbreviation: 'A', name: 'Attack cell in front' },
  [Instruction.RecycleDeadCell]: { backgroundColor: '#3e8948', color: 'white', abbreviation: 'R', name: 'Recycle dead cell in front' },
  [Instruction.CheckEnergy]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'E', name: 'Check energy' },

  [Instruction.JumpIfFacingLeft]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'L', name: 'Check if turned left' },
  [Instruction.JumpIfFacingRight]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'R', name: 'Check if turned right' },
  [Instruction.JumpIfFacingUp]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'U', name: 'Check if turned up' },
  [Instruction.JumpIfFacingDown]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'D', name: 'Check if turned down' },

  [Instruction.JumpIfFacingAliveCell]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'A', name: 'Jump if facing alive cell' },
  [Instruction.JumpIfFacingDeadCell]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'D', name: 'Jump if facing dead cell' },
  [Instruction.JumpIfFacingVoid]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'V', name: 'Jump if facing void' },
  [Instruction.JumpIfFacingRelative]: { backgroundColor: '#124e89', color: 'white', abbreviation: 'S', name: 'Jump if facing relative' },
  [Instruction.MakeChild]: { backgroundColor: '#2ce8f5', color: 'black', abbreviation: 'M', name: 'Make child' },
}

export class Gene {
  instruction: Instruction

  // Boolean option. Changes how some instructions behave
  opt: boolean

  // Energy. Used in some conditionals (i.e. in CheckEnergy)
  e: number

  // Branch 1. Pointer to instruction to jump to, if the condition is true
  b1: number
  // Branch 2. Pointer to instruction to jump to, if the condition is false
  b2: number

  constructor(instruction: Instruction, opt: boolean, e: number, b1: number, b2: number) {
    this.instruction = instruction
    this.opt = opt
    this.e = e
    this.b1 = b1
    this.b2 = b2
  }

  static generate(): Gene {
    return new Gene(
      randomRangeInclusive(0, Instruction.MakeChild),
      Math.random() > 0.5,
      randomRange(0, config.reproductionRequiredEnergy * 2),
      randomRange(0, config.genomeLength),
      randomRange(0, config.genomeLength),
    )
  }

  clone(): Gene {
    return new Gene(
      this.instruction,
      this.opt,
      this.e,
      this.b1, this.b2
    )
  }

  static fromJSON(obj: any): Gene {
    return new Gene(
      obj.instruction,
      obj.opt,
      obj.e,
      obj.b1, obj.b2
    )
  }

  // Returns true if the instruction was mutated, false if any other property
  mutate(): boolean {
    const propertyToMutate = randomRangeInclusive(0, 4);
    switch (propertyToMutate) {
      case 0: this.instruction = randomRangeInclusive(0, Instruction.MakeChild);
      case 1: this.opt = Math.random() > 0.5;
      case 2: this.e = randomRange(0, config.reproductionRequiredEnergy * 2);
      case 3: this.b1 = randomRange(0, config.genomeLength);
      case 4: this.b2 = randomRange(0, config.genomeLength);
    }
    return propertyToMutate == 0;
  }
}

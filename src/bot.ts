import { RGB } from '~/src/color'
import { CellSimulation } from '~/src/simulation'
import { Gene, Instruction } from '~/src/genome'
import { randomRange, randomRangeInclusive } from '~/src/rand'
import clamp from '~/src/clamp'
import config from './config'
import { Direction, applyDirection, randomDirection, rotateLeft, rotateRight } from './direction';

export default class Bot {
  x: number
  y: number
  direction: Direction
  color: RGB
  energy: number
  genome: Array<Gene>
  currentInstruction: number = 0
  alive: boolean = true
  empty: boolean = false
  age: number = 0

  constructor(x: number, y: number, color: RGB, direction: Direction, energy: number, alive: boolean, empty: boolean) {
    this.x = x
    this.y = y
    this.color = color
    this.direction = direction
    this.energy = energy
    this.alive = alive
    this.empty = empty
    this.genome = []
  }

  static generateRandom(x: number, y: number): Bot {
    const bot = new Bot(
      x, y,
      RGB.random(),
      randomDirection(),
      config.startEnergy,
      true, false
    )

    // generate genome
    for (let i = 0; i < config.genomeLength; i++) {
      bot.genome[i] = Gene.generate()
    }

    return bot
  }

  static createEmpty(x: number, y: number): Bot {
    return new Bot(x, y, new RGB(0, 0, 0), 0, 0, false, true)
  }

  // Load bot from JSON object
  static fromJSON(obj: Bot): Bot {
    const bot = new Bot(obj.x, obj.y, new RGB(obj.color.r, obj.color.g, obj.color.b), obj.direction, obj.energy, obj.alive, obj.empty)
    bot.currentInstruction = obj.currentInstruction
    bot.age = obj.age

    for (const gene of obj.genome) {
      bot.genome.push(Gene.fromJSON(gene))
    }

    return bot
  }

  // Update the bot.
  // Reference to a whole simulation is needed, because bot may access neighbor cells, and/or modify them
  // i.e. attacking other cell, or making a child
  update(ctx: CellSimulation) {
    if (!this.alive) {
      return
    }

    const currentInstruction = this.genome[this.currentInstruction]
    let nextInstruction = this.currentInstruction + 1

    let { x: facingX, y: facingY } = applyDirection(this.x, this.y, this.direction);

    if (facingX < 0) {
      facingX = ctx.width - 1
    } else if (facingX >= ctx.width) {
      facingX = 0
    }

    if (facingY < 0) {
      facingY = ctx.height - 1
    } else if (facingY >= ctx.height) {
      facingY = 0
    }

    // store the reference to bot in front to avoid code repetition
    const botInFront = ctx.bots[facingY * ctx.width + facingX]

    switch (currentInstruction.instruction) {
      case Instruction.Noop:
        break

      case Instruction.TurnLeft:
        this.direction = rotateLeft(this.direction)
        break

      case Instruction.TurnRight:
        this.direction = rotateRight(this.direction);
        break

      case Instruction.MoveForwards:
        if (botInFront.empty) {
          ctx.bots[this.y * ctx.width + this.x] = Bot.createEmpty(this.x, this.y)
          this.x = facingX
          this.y = facingY
        }
        this.energy -= config.movementCost
        break

      case Instruction.Photosynthesis:
        this.energy += config.photosynthesisEnergy
        break

      case Instruction.GiveEnergy:
        if (!botInFront.alive) {
          break
        }

        const energyToGive = Math.min(this.energy, currentInstruction.e);
        botInFront.energy += energyToGive
        this.energy -= energyToGive
        break

      case Instruction.AttackCell:
        if (this.energy < config.attackRequiredEnergy) {
          break
        }
        this.energy -= config.attackRequiredEnergy

        if (!botInFront.alive) {
          break
        }

        let takenEnergy = Math.min(config.attackEnergy, botInFront.energy);
        botInFront.energy -= takenEnergy;
        this.energy += takenEnergy;
        break

      case Instruction.RecycleDeadCell:
        if (botInFront.empty || botInFront.alive) {
          break
        }

        this.energy += botInFront.energy
        ctx.bots[facingY * ctx.width + facingX] = Bot.createEmpty(facingX, facingY)
        break

      case Instruction.CheckEnergy:
        if (this.energy > currentInstruction.e) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingLeft:
        if (this.direction == Direction.Left) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingRight:
        if (this.direction == Direction.Right) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingUp:
        if (this.direction == Direction.Up) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingDown:
        if (this.direction == Direction.Down) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingAliveCell:
        if (botInFront.alive) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingVoid:
        if (botInFront.empty) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingDeadCell:
        if (!botInFront.alive && !botInFront.empty) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JumpIfFacingRelative:
        if (!botInFront.alive) {
          nextInstruction = currentInstruction.b2
          break
        }

        let similarGenes = 0

        for (let i = 0; i < config.genomeLength; i++) {
          if (this.genome[i].instruction === botInFront.genome[i].instruction) {
            similarGenes++
          }
        }

        if (similarGenes === config.genomeLength) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }

        break

      case Instruction.MakeChild:
        if (this.energy < config.reproductionRequiredEnergy || !botInFront.empty) {
          break
        }
        this.energy -= config.reproductionRequiredEnergy;

        const child = new Bot(
          facingX, facingY,
          new RGB(this.color.r, this.color.g, this.color.b),
          this.direction,
          config.startEnergy,
          true, false
        )

        // copying genome to the child
        for (let i = 0; i < config.genomeLength; i++) {
          child.genome[i] = this.genome[i].clone()
        }

        // mutation can happen
        if (Math.random() * 100 < config.mutationPercent) {
          const geneToMutate = randomRange(0, config.genomeLength)
          const instructionMutated = child.genome[geneToMutate].mutate();

          // if the instruction was mutated, change child's color a bit
          if (instructionMutated) {
            child.color.mutate();
          }
        }

        ctx.bots[facingY * ctx.width + facingX] = child
        break
    }

    if (nextInstruction >= config.genomeLength) {
      nextInstruction = 0
    }
    this.currentInstruction = nextInstruction

    this.energy -= config.noopCost;
    if (this.age > config.cellMaxAge || this.energy < 0) {
      this.alive = false
    }

    this.age++
    ctx.setCellAt(this.x, this.y, this)
  }
}

import { RGB } from '~/src/color'
import { CellSimulation } from '~/src/simulation'
import { Gene, Instruction } from '~/src/genome'
import { randomRange } from '~/src/rand'
import clamp from '~/src/clamp'
import config from './config'

export enum Direction {
  LEFT,
  RIGHT,
  UP,
  DOWN
}

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
      randomRange(0, Direction.DOWN),
      config.startEnergy,
      true, false
    )

    // generate genome
    for (let i = 0; i < config.genomeLength; i++) {
      bot.genome[i] = Gene.generate(config)
    }

    return bot
  }

  static createEmpty(x: number, y: number): Bot {
    return new Bot(x, y, new RGB(0, 0, 0), 0, 0, false, true)
  }

  static fromJSON(obj: any): Bot {
    const bot = new Bot(obj.x, obj.y, obj.color, obj.direction, obj.energy, obj.alive, obj.empty)

    for (const gene of obj.genome) {
      bot.genome.push(Gene.fromJSON(gene))
    }

    return bot
  }

  update(ctx: CellSimulation) {
    if (!this.alive) {
      return
    }

    const currentInstruction = this.genome[this.currentInstruction]
    let nextInstruction = this.currentInstruction + 1
    let consumedEnergy = config.noopCost

    let facingX = this.x
    let facingY = this.y
    switch (this.direction) {
      case Direction.LEFT:
        facingX -= 1
        break
      case Direction.RIGHT:
        facingX += 1
        break
      case Direction.UP:
        facingY -= 1
        break
      case Direction.DOWN:
        facingY += 1
    }

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

    const botInFront = ctx.bots[facingY * ctx.width + facingX]

    switch (currentInstruction.instruction) {
      case Instruction.NOOP:
        break

      case Instruction.TURN_LEFT:
        if (this.direction - 1 === -1) {
          this.direction = Direction.DOWN
        } else {
          this.direction--
        }
        break

      case Instruction.TURN_RIGHT:
        if (this.direction + 1 === 4) {
          this.direction = 0
        } else {
          this.direction++
        }
        break

      case Instruction.MOVE_FORWARDS:
        if (botInFront.empty) {
          ctx.bots[this.y * ctx.width + this.x] = Bot.createEmpty(this.x, this.y)
          this.x = facingX
          this.y = facingY
        }
        consumedEnergy += config.movementCost
        break

      case Instruction.PHOTOSYNTHESIS:
        // TODO: bot classes
        consumedEnergy -= config.photosynthesisEnergy
        break

      case Instruction.GIVE_ENERGY:
        if (!botInFront.alive) {
          break
        }

        // eslint-disable-next-line no-case-declarations
        const energyToGive = this.energy * currentInstruction.e
        if (energyToGive > this.energy) {
          break
        }

        botInFront.energy += energyToGive
        consumedEnergy += energyToGive

        break

      case Instruction.ATTACK_CELL:
        if (this.energy < config.attackRequiredEnergy) {
          break
        }

        consumedEnergy += config.attackRequiredEnergy

        if (!botInFront.alive) {
          break
        }

        // eslint-disable-next-line no-case-declarations
        let takenEnergy = 0

        // if option is true, kill cell in front
        if (currentInstruction.opt) {
          // Killing a cell consumes 2x more energy than regular attack
          consumedEnergy += config.attackEnergy
          takenEnergy = botInFront.energy * config.attackEnergy
          botInFront.alive = false
        } else {
          takenEnergy = botInFront.energy * config.attackEnergy
        }

        botInFront.energy -= takenEnergy * 1.5
        this.energy += takenEnergy
        break

      case Instruction.RECYCLE_DEAD_CELL:
        if (botInFront.empty || botInFront.alive) {
          break
        }

        consumedEnergy -= botInFront.energy
        ctx.bots[facingY * ctx.width + facingX] = Bot.createEmpty(facingX, facingY)

        break

      case Instruction.CHECK_ENERGY:
        if (this.energy > currentInstruction.e) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.CHECK_ROTATION:
        switch (this.direction) {
          case Direction.LEFT:
            nextInstruction = currentInstruction.b1
            break
          case Direction.RIGHT:
            nextInstruction = currentInstruction.b2
            break
          case Direction.UP:
            nextInstruction = currentInstruction.b3
            break
          case Direction.DOWN:
            nextInstruction = currentInstruction.b4
        }
        break

      case Instruction.JMP_IF_FACING_ALIVE_CELL:
        if (botInFront.alive) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JMP_IF_FACING_VOID:
        if (botInFront.empty) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JMP_IF_FACING_DEAD_CELL:
        if (!botInFront.alive && !botInFront.empty) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }
        break

      case Instruction.JMP_IF_FACING_RELATIVE:
        if (!botInFront.alive) {
          break
        }

        // eslint-disable-next-line no-case-declarations
        let similarGenes = 0

        for (let i = 0; i < config.genomeLength; i++) {
          if (this.genome[i].instruction === botInFront.genome[i].instruction) {
            similarGenes++
          }
        }

        // If at least GENOME_LENGTH-1 genes are the same, treat cells as relatives
        if (similarGenes === config.genomeLength) {
          nextInstruction = currentInstruction.b1
        } else {
          nextInstruction = currentInstruction.b2
        }

        break

      case Instruction.MAKE_CHILD:
        if (this.energy < config.reproductionRequiredEnergy || !botInFront.empty) {
          break
        }

        // eslint-disable-next-line no-case-declarations
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
        if (randomRange(1, 100) < config.mutationPercent) {
          const geneToMutate = randomRange(0, config.genomeLength)

          child.genome[geneToMutate].instruction = randomRange(0, Instruction.MAKE_CHILD + 1)
          child.genome[geneToMutate].opt = Math.random() > 0.5
          child.genome[geneToMutate].e += randomRange(-3, 3)
          child.genome[geneToMutate].b1 += randomRange(-2, 2)
          child.genome[geneToMutate].b2 += randomRange(-2, 2)
          child.genome[geneToMutate].b3 += randomRange(-2, 2)
          child.genome[geneToMutate].b4 += randomRange(-2, 2)

          child.genome[geneToMutate].e = clamp(child.genome[geneToMutate].e, 0, config.reproductionRequiredEnergy)
          child.genome[geneToMutate].b1 = clamp(child.genome[geneToMutate].b1, 0, config.genomeLength)
          child.genome[geneToMutate].b2 = clamp(child.genome[geneToMutate].b2, 0, config.genomeLength)
          child.genome[geneToMutate].b3 = clamp(child.genome[geneToMutate].b3, 0, config.genomeLength)
          child.genome[geneToMutate].b4 = clamp(child.genome[geneToMutate].b4, 0, config.genomeLength)

          // changing color a bit
          const colorToChange = randomRange(0, 2)

          if (colorToChange === 0) {
            child.color.r += randomRange(-16, 16)
          } else if (colorToChange === 1) {
            child.color.g += randomRange(-16, 16)
          } else {
            child.color.b += randomRange(-16, 16)
          }

          child.color.r = clamp(child.color.r, 0, 255)
          child.color.g = clamp(child.color.g, 0, 255)
          child.color.b = clamp(child.color.b, 0, 255)
        }

        ctx.bots[facingY * ctx.width + facingX] = child
        break
    }

    if (nextInstruction >= config.genomeLength) {
      nextInstruction = 0
    }
    this.currentInstruction = nextInstruction

    this.energy -= consumedEnergy

    if (this.age > config.cellMaxAge || this.energy < 0) {
      this.alive = false
    }

    this.age++
    ctx.setCellAt(this.x, this.y, this)
  }
}

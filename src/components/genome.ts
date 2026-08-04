import { random } from "@/random";

export type Command = "noop" | "left" | "right" | "move";

const commands: Command[] = ["noop", "left", "right", "move"];
/**
 * Generate a random command from all available commands
 */
export function randomCommand(): Command {
  return commands[Math.floor(random() * commands.length)]!;
}

/**
 * Represents a single undivisible instruction of a cell.
 *
 * Whether to actually run an instruction is determined by combining base weight,
 * sensor weights, and computing a probability. Sum of weights >0 means the instruction
 * is more likely to execute, <0 means the instruction is less likely to fire.
 *
 * Sensor values are also considered for allowing more complex behavioral
 * patterns, where the cell can decide what to do depending on its environment.
 */
export interface Gene {
  command: Command;

  /**
   * Base weight for execution probability.
   *
   * A float from -1 to 1
   */
  base: number;

  /**
   * How much each sensor influences execution of this command.
   *
   * Each value is a float in range from -1 to 1.
   */
  sensors: {
    a: number;
    b: number;
    c: number;
    d: number;
  };

  /**
   * How many instructions to skip, if this instruction is not fired.
   * 0 is also a legit value, which means this same instruction will
   * be executed in the next iteration.
   */
  skip: number;
}

export interface Genome {
  /**
   * Instruction pointer
   */
  ip: number;
  genome: Gene[];

  /**
   * Current instruction to execute.
   * This will be handled by a system that implements this command.
   *
   * Will be undefined when instruction is skipped
   */
  cur?: Command;
}

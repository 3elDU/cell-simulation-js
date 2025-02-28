import { Instruction } from "@/simulation/genome";
import type { MessageRegistry } from "..";

export default {
  option: {
    en: "Option",
    ru: "Опция",
    uk: "Опція",
  },
  energy: {
    en: "Energy",
    ru: "Энергия",
    uk: "Енергія",
  },
  branch1: {
    en: "B1",
    ru: "В1",
    uk: "Р1",
  },
  branch2: {
    en: "B2",
    ru: "В2",
    uk: "Р2",
  },
  [Instruction.Noop]: {
    en: "No-op",
    ru: "Нет операции",
    uk: "Немає операції",
  },
  [Instruction.TurnLeft]: {
    en: "Turn left",
    ru: "Повернуть влево",
    uk: "Повернути ліворуч",
  },
  [Instruction.TurnRight]: {
    en: "Turn right",
    ru: "Повернуть вправо",
    uk: "Повернути праворуч",
  },
  [Instruction.MoveForwards]: {
    en: "Move forwards",
    ru: "Двигаться вперёд",
    uk: "Рухатися вперед",
  },
  [Instruction.Photosynthesis]: {
    en: "Produce energy by photosynthesis",
    ru: "Производить энергию путем фотосинтеза",
    uk: "Виробляти енергію шляхом фотосинтезу",
  },
  [Instruction.GiveEnergy]: {
    en: "Give energy to cell in front",
    ru: "Передать энергию передней клетке",
    uk: "Передати енергію передній клітині",
  },
  [Instruction.AttackCell]: {
    en: "Attack cell in front",
    ru: "Атаковать переднюю клетку",
    uk: "Атакувати передню клітину",
  },
  [Instruction.RecycleDeadCell]: {
    en: "Recycle dead cell in front",
    ru: "Утилизировать мертвую клетку впереди",
    uk: "Утилізувати мертву клітину попереду",
  },
  [Instruction.CheckEnergy]: {
    en: "Check energy",
    ru: "Проверить энергию",
    uk: "Перевірити енергію",
  },
  [Instruction.JumpIfFacingLeft]: {
    en: "Check if turned left",
    ru: "Проверить, повернуто ли влево",
    uk: "Перевірити, чи повернуто ліворуч",
  },
  [Instruction.JumpIfFacingRight]: {
    en: "Check if turned right",
    ru: "Проверить, повернуто ли вправо",
    uk: "Перевірити, чи повернуто праворуч",
  },
  [Instruction.JumpIfFacingUp]: {
    en: "Check if turned up",
    ru: "Проверить, повернуто ли вверх",
    uk: "Перевірити, чи повернуто вгору",
  },
  [Instruction.JumpIfFacingDown]: {
    en: "Check if turned down",
    ru: "Проверить, повернуто ли вниз",
    uk: "Перевірити, чи повернуто вниз",
  },
  [Instruction.JumpIfFacingAliveCell]: {
    en: "Jump if facing alive cell",
    ru: "Перейти, если впереди живая клетка",
    uk: "Перейти, якщо попереду жива клітина",
  },
  [Instruction.JumpIfFacingDeadCell]: {
    en: "Jump if facing dead cell",
    ru: "Перейти, если впереди мертвая клетка",
    uk: "Перейти, якщо попереду мертва клітина",
  },
  [Instruction.JumpIfFacingVoid]: {
    en: "Jump if facing void",
    ru: "Перейти, если впереди пустота",
    uk: "Перейти, якщо попереду порожнеча",
  },
  [Instruction.JumpIfFacingRelative]: {
    en: "Jump if facing relative",
    ru: "Перейти, если впереди родственник",
    uk: "Перейти, якщо попереду родич",
  },
  [Instruction.MakeChild]: {
    en: "Make child",
    ru: "Создать потомка",
    uk: "Створити нащадка",
  },
} satisfies MessageRegistry;

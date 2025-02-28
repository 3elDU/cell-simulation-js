import type { MessageRegistry } from "..";

export default {
  mutationPercentName: {
    en: "Mutation percent",
    ru: "Процент мутации",
    uk: "Відсоток мутації",
  },
  mutationPercentDescription: {
    en: "A percentage with which a cell's child will have one of its instructions mutated",
    ru: "Процент, с которым у потомка клетки мутирует одна из её инструкций",
    uk: "Відсоток, з яким у нащадка клітини мутує одна з її інструкцій",
  },
  genomeLengthName: {
    en: "Genome length",
    ru: "Длина генома",
    uk: "Довжина геному",
  },
  genomeLengthDescription: {
    en: "The amount of instructions that the genome has.",
    ru: "Количество инструкций в геноме.",
    uk: "Кількість інструкцій у геномі.",
  },
  startEnergyName: {
    en: "Start energy",
    ru: "Начальная энергия",
    uk: "Стартова енергія",
  },
  startEnergyDescription: {
    en: "The amount of energy that the cell starts with. Descendants also take some energy from their parents.",
    ru: "Количество энергии, с которой клетка начинает. Потомки также получают часть энергии от своих родителей.",
    uk: "Кількість енергії, з якою клітина починає. Нащадки також отримують частину енергії від своїх батьків.",
  },
  reproductionRequiredEnergyName: {
    en: "Reproduction required energy",
    ru: "Энергия, необходимая для размножения",
    uk: "Енергія, необхідна для розмноження",
  },
  reproductionRequiredEnergyDescription: {
    en: "The minimum amount of energy that the cell must have in order to reproduce. This amount will then be subtracted when the reproduction is successful.",
    ru: "Минимальное количество энергии, которое должна иметь клетка для размножения. Это количество затем вычитается при успешном размножении.",
    uk: "Мінімальна кількість енергії, яку повинна мати клітина для розмноження. Ця кількість потім віднімається при успішному розмноженні.",
  },
  cellMaxAgeName: {
    en: "Cell max age",
    ru: "Максимальный возраст клетки",
    uk: "Максимальний вік клітини",
  },
  cellMaxAgeDescription: {
    en: "The maximum amount of ticks that the cell can live, after which it dies.",
    ru: "Максимальное количество тиков, которые клетка может прожить, после чего она умирает.",
    uk: "Максимальна кількість тактів, які клітина може прожити, після чого вона помирає.",
  },
  photosynthesisEnergyName: {
    en: "Photosynthesis energy",
    ru: "Энергия фотосинтеза",
    uk: "Енергія фотосинтезу",
  },
  photosynthesisEnergyDescription: {
    en: "The amount of energy produced by photosynthesis",
    ru: "Количество энергии, производимой фотосинтезом",
    uk: "Кількість енергії, що виробляється фотосинтезом",
  },
  attackRequiredEnergyName: {
    en: "Attack required energy",
    ru: "Энергия для атаки",
    uk: "Енергія для атаки",
  },
  attackRequiredEnergyDescription: {
    en: "The amount of energy cell must have to be able to attack other cells.",
    ru: "Количество энергии, которое клетка должна иметь, чтобы атаковать другие клетки.",
    uk: "Кількість енергії, яку клітина повинна мати, щоб атакувати інші клітини.",
  },
  attackEnergyName: {
    en: "Attack energy",
    ru: "Энергия атаки",
    uk: "Енергія атаки",
  },
  attackEnergyDescription: {
    en: "The maximum amount of energy the cell can receive by attacking another cell. If the other cell has less energy than this value, the attacker will receive all of its energy.",
    ru: "Максимальное количество энергии, которое клетка может получить при атаке другой клетки. Если у другой клетки меньше энергии, чем это значение, атакующий получит всю её энергию.",
    uk: "Максимальна кількість енергії, яку клітина може отримати при атаці іншої клітини. Якщо у іншої клітини менше енергії, ніж це значення, атакуючий отримає всю її енергію.",
  },
  movementCostName: {
    en: "Movement cost",
    ru: "Стоимость движения",
    uk: "Вартість руху",
  },
  movementCostDescription: {
    en: "The amount of energy it takes to move.",
    ru: "Количество энергии, затрачиваемой на движение.",
    uk: "Кількість енергії, витраченої на рух.",
  },
  turnCostName: {
    en: "Turn cost",
    ru: "Стоимость поворота",
    uk: "Вартість повороту",
  },
  turnCostDescription: {
    en: "The amount of energy it takes to turn left/right",
    ru: "Количество энергии, затрачиваемой на поворот влево/вправо",
    uk: "Кількість енергії, витраченої на поворот вліво/вправо",
  },
  noopCostName: {
    en: "No-op cost",
    ru: "Стоимость бездействия",
    uk: "Вартість бездіяльності",
  },
  noopCostDescription: {
    en: '"Living cost". This amount of energy will be subtracted from a cell each tick, no matter what it is doing.',
    ru: '"Стоимость жизни". Это количество энергии будет вычитаться у клетки каждый тик, независимо от её действий.',
    uk: '"Вартість життя". Ця кількість енергії буде відніматися у клітини кожен такт, незалежно від її дій.',
  },
} satisfies MessageRegistry;

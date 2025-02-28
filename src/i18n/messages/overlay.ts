import type { MessageRegistry } from "..";

export default {
  select: {
    en: "Select",
    ru: "Выбор клетки",
    uk: "Вибір клітини",
  },
  pan: {
    en: "Pan",
    ru: "Масштабирование",
    uk: "Масштабування",
  },
  placeMessage: {
    en: "Click where to place a cell",
    ru: "Нажмите на место, куда следует вставить клетку",
    uk: "Натисніть на місце, куди слід вставити клітину",
  },
  cancelSelection: {
    en: "Cancel",
    ru: "Отмена",
    uk: "Відміна",
  },
} satisfies MessageRegistry;

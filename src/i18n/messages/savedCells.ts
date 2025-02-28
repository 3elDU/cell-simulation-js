import type { MessageRegistry } from "..";

export default {
  modalTitle: {
    en: "Saved cells",
    ru: "Сохранённые клетки",
    uk: "Збережені клітини",
  },
  noSavedCells: {
    en: "There are no saved cells",
    ru: "Нету сохранённых клеток",
    uk: "Немає збережених клітин",
  },
  noSavedCellsInfoMessage: {
    en: 'You can save a cell by selecting one, and clicking a "Save" button, giving it a title, and optionally, description.',
    ru: 'Вы можете сохранить клетку, выбрав её и нажав кнопку "Сохранить". Дайте ей название, и необъязательное описание.',
    uk: 'Ви можете зберегти клітину, обравши її та натиснувши кнопку "Зберегти". Дайте їй назву, та необов\'язковий опис.',
  },
  loadCell: {
    en: "Load",
    ru: "Загрузить",
    uk: "Завантажити",
  },
  deleteCell: {
    en: "Delete",
    ru: "Удалить",
    uk: "Видалити",
  },
} satisfies MessageRegistry;

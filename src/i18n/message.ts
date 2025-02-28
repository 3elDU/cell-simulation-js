import useLanguage from "@/composables/language";
import { type Message, type MessageRegistry } from ".";
import simulationConfig from "./messages/config";
import controls from "./messages/controls";
import genome from "./messages/genome";
import overlay from "./messages/overlay";
import saveCellDialog from "./messages/saveCellDialog";
import savedCells from "./messages/savedCells";
import selectedCell from "./messages/selectedCell";
import sidebar from "./messages/sidebar";

const modules = {
  simulationConfig,
  sidebar,
  controls,
  savedCells,
  selectedCell,
  genome,
  saveCellDialog,
  overlay,
};
type Modules = typeof modules;
type Namespace = keyof Modules;

/**
 * Extract all possible message names from a record of modules,
 * each containing a list of messages
 */
type MessageNamesWithNamespace<
  Registries extends Record<string, MessageRegistry>,
  Registry = keyof Registries
> = Registry extends string
  ? Registries[Registry] extends Record<infer Message extends string, Message>
    ? `${Registry}.${Message}`
    : never
  : never;

type MessageNameWithNamespace = MessageNamesWithNamespace<Modules>;

/** Get a message by it's name translated to user's preferred locale. */
export default function m(name: MessageNameWithNamespace): string {
  const { language } = useLanguage();
  const [module, message] = name.split(/\./);
  if (!(module in modules)) {
    console.warn(`Inexistent i18n module: ${module}`);
    return "ERROR";
  }
  return modules[module as Namespace][message as keyof Modules[keyof Modules]][
    language.value
  ];
}

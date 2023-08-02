import { Exception } from "../Exceptions";
import * as Helpers  from "../Helpers";


/**Нормализация  строки фио */
export const normalizeFio = (fio?: string|null): string => Helpers.toTitleCase(Helpers.removeSpaces(fio));



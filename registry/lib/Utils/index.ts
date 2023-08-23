
import { Exception } from "../Exceptions";
import type{ UserContext } from "../UserContext";
import * as Helpers  from "../Helpers";



export  function chkRights(requiredModule: string[] | null | undefined, requiredRights: { [rec: string]: string } | null | undefined) {
    const iocc = useContainer();
    const UserCtx=iocc.get<UserContext>('UserContext');
    let modPermit = false;
    const _UserContext=useCounter

    if (requiredModule)
        for (let mod of requiredModule) {
            if (UserCtx.ChkLicModule(mod)) {
                modPermit = true;
                break;
            }
        }
    else
        modPermit = true;

    if (!modPermit) return false;

    if (requiredRights)
        for (let trait in requiredRights) {
            if (!UserCtx.ChkTokenTrait(trait, requiredRights[trait])) {
                return false;
            }
        }
    return true;
}



/**Нормализация  строки фио */
export const normalizeFio = (fio?: string|null): string => Helpers.toTitleCase(Helpers.removeSpaces(fio));



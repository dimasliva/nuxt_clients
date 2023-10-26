
import { Exception } from "../Exceptions";
import type { UserContext } from "../UserContext";
import * as Helpers from "../Helpers";



export function chkRights(requiredFeature: string[] | null | undefined, requiredRights: { [rec: string]: string } | null | undefined) {
    const iocc = useContainer();
    const UserCtx = iocc.get<UserContext>('UserContext');
    let modPermit = false;

    if (requiredFeature)
        for (let mod of requiredFeature) {
            if (UserCtx.chkLicModule(mod)) {
                modPermit = true;
                break;
            }
        }
    else
        modPermit = true;

    if (!modPermit) return false;

    if (requiredRights)
        for (let trait in requiredRights) {
            if (!UserCtx.chkTokenTrait(trait, requiredRights[trait])) {
                return false;
            }
        }
    return true;
}



export function chkTrait(tokens: string[] | null, trait: string) {
    const iocc = useContainer();
    const UserCtx = iocc.get<UserContext>('UserContext');

    if (tokens)
        for (let token in tokens) {
            if (!UserCtx.chkTokenTrait(token, trait)) {
                return false;
            }
        }
    return true;
}



/**Нормализация  строки фио */
export const normalizeFio = (fio?: string | null): string => Helpers.toTitleCase(Helpers.removeSpaces(fio));



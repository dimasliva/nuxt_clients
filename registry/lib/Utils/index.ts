
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


/**Строка фио из 3 частей */
export const makeFioStr = (surname: string | null | undefined, name: string | null | undefined, patronymic: string | null | undefined, bd?: string): string => {
    let res = (surname || "") + " " + (name || "") + " " + (patronymic || "");
    if (bd)
        res = " (" + new Intl.DateTimeFormat().format(new Date(bd)) + ")"
    return res;
}




let numberForKeys = 0;
/*Генерация последовательного числа для использования в качестве ключей компонентов*/
export const getNextSerialKey = () => numberForKeys++;



/*Расознование отдельных слов, телефона, почты, даты в строке */
export const recognizeDataInString = (str: string) => {
    str = Helpers.removeSpaces(str);
    let res = {
        words: [] as string[],
        phone: null as string | null,
        email: null as string | null,
        date: null as Date | null
    }

    if (str) {
        const dateRgx = new RegExp(/\d{2}\.\d{2}\.\d{4}|\d{2}\.\d{2}\.\d{2}|\d{6}/);
        const emailRgx = new RegExp(/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/);
        const phoneRgx = new RegExp(/\d{3}\d{3}\d{4}$/);

        let strs = str.split(' ');
        strs.forEach(item => {
            if (phoneRgx.test(item)) {
                res.phone = item;
            }
            else
                if (dateRgx.test(item)) {
                    let date: Date = null!;
                    if (item.length >= 8) {
                        //03.04.2010
                        //03.04.10

                        let arr = item.split('.');

                        if (<any>arr[2] < 1000) {
                            let curryy = (new Date()).getFullYear().toString().substring(2);
                            res.date = new Date(`${((<any>arr[2] > curryy) ? '19' : '20') + arr[2]}-${arr[1]}-${arr[0]}`)
                        }
                        else
                            res.date = new Date(`${arr[2]}-${arr[1]}-${arr[0]}`)
                    }
                    else
                        if (item.length == 6) {
                            //030410
                            let curryy = (new Date()).getFullYear().toString().substring(2);
                            res.date = new Date(`${((<any>item.substring(4, 6) > curryy) ? '19' : '20') + item.substring(4, 6)}-${item.substring(2, 4)}-${item.substring(0, 2)}`)
                        }

                    if (isNaN(<any>res.date))
                        res.date = null;
                }
                else
                    if (emailRgx.test(item))
                        res.email = item;
                    else
                        res.words.push(item);
        });
    }
    return res;
}



export async function mapAsync(arr: any[], handler: (val, inx) => Promise<any>) {
    const res: any[] = [];
    for (let i = 0; i < arr.length; i++)
        res.push(await handler(arr[i], i));
    return res;
}



export function getDateStr(date: Date) {
    return date.toISOString().substring(0, 10);
}



export async function getPasswordHash(psw: string) {
    if (!psw) return "";
    const msgUint8 = new TextEncoder().encode(psw); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex.toLowerCase();
}


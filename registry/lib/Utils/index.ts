
import { Exception } from "../Exceptions";
import type { UserContext } from "../UserContext";
import * as Helpers from "../Helpers";


export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



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
        res += " (" + new Intl.DateTimeFormat().format(new Date(bd)) + ")"
    return res;
}


/**Инициалы фио*/
export const makeInitialsStr = (surname: string | null | undefined, name: string | null | undefined, patronymic: string | null | undefined): string => {
    let res = (surname || "") + " " + (name?.charAt(0).toLocaleUpperCase() || "") + " " + (patronymic?.charAt(0).toLocaleUpperCase() || "");
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
                        if (item.includes(".")) {
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
                        else {
                            //03042010
                            res.date = new Date(`${item.substring(4, 8)}-${item.substring(2, 4)}-${item.substring(0, 2)}`)
                        }
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


function _padDate(num) {
    return (num < 10 ? '0' : '') + num;
};

export function getDateStr(date: Date) {
    const y = date.getFullYear();
    const m = _padDate(date.getMonth() + 1);
    const d = _padDate(date.getDate());

    return `${y}-${m}-${d}`;
}



export function getUtcDateStr(date: Date) {
    return date.toISOString().substring(0, 10);
}



export function getLocalISODateTime(date: Date): string {
    const offset = date.getTimezoneOffset();
    const timezoneOffset = Math.abs(offset / 60);
    const formattedTimezone = `${timezoneOffset.toFixed(2).replace(".",":").padStart(5,"0")}`;
    const localISOTime = new Date(date.getTime() - offset * 60000).toISOString();
    return `${localISOTime.slice(0, 19)}${offset>0?"-":"+" }${formattedTimezone}`;
}


export function getLocalISODateTimeWoTz(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localISOTime = new Date(date.getTime() - offset * 60000).toISOString();
    return localISOTime.slice(0, 19);
}



export function addDaysToDate(date: string | Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}


export function compareDatesOnly(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    if (d1.getTime() < d2.getTime()) {
        return -1;
    } else if (d1.getTime() > d2.getTime()) {
        return 1;
    } else {
        return 0;
    }
}



export function compareDates(date1: Date, date2: Date): number {
    if (date1.getTime() < date2.getTime()) {
        return -1;
    } else if (date1.getTime() > date2.getTime()) {
        return 1;
    } else {
        return 0;
    }
}



export function getMinutesOfDay(date: Date): number {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes;
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


/**Получить хэш строки в виде hex-строки по указанному алгоритму */
export async function getHashHex(str: string, alg: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256") {
    const msgUint8 = new TextEncoder().encode(str); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest(alg, msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex.toLowerCase();
}



/**Полное копирование данных объекта*/
export function CloneData<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

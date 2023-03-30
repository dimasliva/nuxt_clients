import { Exception } from "../Exceptions";

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function fmtStr(mess: string, ...args: any) {
  debugger
  return mess.replace(/{(\d+)}/g, function (match, number) {
    return args[number] || '';
  });
}

/**Полное копирование данных объекта*/
export function CloneData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}


/**Вывод данных исключения в консоль*/
export function excToLog(excIn: string, exc: any) {
  if (exc instanceof Exception)
    exc.toLog(excIn);
  else
    if (typeof exc == "string")
      console.error(`Exception in ${excIn}: ${exc}`);
    else
      console.error(`Exception in ${excIn}: ${JSON.stringify(exc)}`);
}
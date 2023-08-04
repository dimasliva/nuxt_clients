import type { EMessageType } from "~~/lib/globalTypes";


let _addToast;

export const createToast = (type:EMessageType, message:string, title?:string|null) => {
    _addToast(type,message,title);
}


export const regToastHandler = (addToastCb) => {
    _addToast = addToastCb;
}



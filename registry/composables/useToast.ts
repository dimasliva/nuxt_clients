import  { EMessageType } from "~~/lib/globalTypes";


let _addToast;

export const createToast = (type:EMessageType, message:string, title?:string|null) => {
    _addToast(type,message,title);
}

export const errToast = (message:string, title?:string|null) => {
    _addToast(EMessageType.Error,message,title);
}


export const infoToast = (message:string, title?:string|null) => {
    _addToast(EMessageType.Info,message,title);
}


export const okToast = (message:string, title?:string|null) => {
    _addToast(EMessageType.Success,message,title);
}


export const warnToast = (message:string, title?:string|null) => {
    _addToast(EMessageType.Warn,message,title);
}


export const regToastHandler = (addToastCb) => {
    _addToast = addToastCb;
}



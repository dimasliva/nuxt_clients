
let _addDiag, _closeDiag, _eventsHandler;

export const openDialog = (
    component: any,
    props: any,
    modal: boolean = true,
    eventsHandler: ((eventName: string, eventData: any)=> boolean) | null=null) => {
    _addDiag({ component, props, modal, eventsHandler: eventsHandler })
}


export const regDialogHandler = (addDiagCb, closeDialogCb, eventsHandler) => {
    _addDiag = addDiagCb;
    _closeDiag = closeDialogCb;
    _eventsHandler=eventsHandler;
}


export const closeDialog = (result: any) => {
    _closeDiag(result);
}


export const onDialogEvents = (e: string, eData:any):boolean => {
    return _eventsHandler(e,eData);
}


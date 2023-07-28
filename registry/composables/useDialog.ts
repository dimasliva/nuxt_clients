
let _addDiag, _closeDiag;

export const openDialog = (
    component: any,
    props: any,
    modal: boolean = true,
    eventsHandler: ((eventName: string, eventData: any)=> boolean) | null=null) => {
    _addDiag({ component, props, modal, eventsHandler: eventsHandler })
}

export const regDialogHandler = (addDiagCb, closeDialogCb) => {
    _addDiag = addDiagCb;
    _closeDiag = closeDialogCb;
}

export const closeDialog = (result: any) => {
    _closeDiag(result);
}

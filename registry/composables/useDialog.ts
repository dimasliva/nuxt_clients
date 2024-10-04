
let _addDiag, _closeDiag, _eventsHandler;

export const openDialog = (
    component: any,
    props: any,
    modal: boolean = true,
    redirectEventsToForm: boolean = true,
    eventsHandler: ((eventName: string, eventData: any) => boolean) | null = null) => {
    _addDiag({ component, props, modal, redirectEventsToForm, eventsHandler: eventsHandler })
}


export const regDialogHandler = (addDiagCb, closeDialogCb, eventsHandler) => {
    _addDiag = addDiagCb;
    _closeDiag = closeDialogCb;
    _eventsHandler = eventsHandler;
}


export const closeDialog = (result: any) => {
    _closeDiag(result);
}


export const onDialogEvents = (e: string, eData: any): boolean => {
    return _eventsHandler(e, eData);
}



export async function showModal(component: any, props: any, redirectEventsToForm: boolean, onBeforeClose?: (res: any) => boolean) {
    return new Promise((r) => {
        openDialog(component, props, true, redirectEventsToForm, (e: string, d: any) => {
            if (e == "onBeforeClose") {
                let res = onBeforeClose ? onBeforeClose(d) : true;
                if (res)
                    r(d);
                return res;
            }

            return true;
        })
    });
}
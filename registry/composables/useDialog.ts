
let _addDiag, _closeDiag;

export const openDialog = (component: any, props: any, modal:boolean=true,onBeforeClose:((res:any)=>boolean)|null=null) => {
    _addDiag({component, props,  modal, onBeforeClose: onBeforeClose})
}

export const regDialogHandler = (addDiagCb, closeDialogCb) => {
    _addDiag=addDiagCb;
    _closeDiag=closeDialogCb;
}

export const closeDialog = (result:any) => {
    _closeDiag(result);
}
  
let _component = shallowRef<any|null>(
    {
        Component: null,
        Props: null
    }
) 

export const useDialogOpen = (component: any, props: any) => {
    _component.value = {Component : component, Props : props}
}

export const getDialogComponent = () => {
    return _component
}

export const closeDialog = () => {
    _component.value = null;
}
  
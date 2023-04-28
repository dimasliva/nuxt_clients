let _component = shallowRef(
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
  
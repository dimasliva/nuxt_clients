import { chkTrait } from "~/src/common/lib/Utils"




export function setupBase<T=any>(props, emit)
{
    let OldModelVal = ref<T>();
    let CurrModelVal = ref<T>();
    let currErr = false;
    //const emit = defineEmits(["update:modelValue"])



    const Visible = ref(props.tokens ? chkTrait(props.tokens, "r") : true);
    const Readonly = ref(!(props.tokens ? chkTrait(props.tokens, "u") || chkTrait(props.tokens, "c") : true) || !!props.state?.readonly);

    const onValChanged = (force?: boolean) => {
        if (!currErr || force) {
            if (props.state && CurrModelVal.value != props.modelValue) {
                props.state.changedCnt++;
                emit('update:modelValue', CurrModelVal.value!);
            }
        }
    }


    const onKeydown = (k) => {
        if (k.key == 'Enter')
            blur()
        else
            if (k.key == 'Escape') {
                CurrModelVal.value = props.modelValue!;
                blur();
            }
    }



    const setErr = (res: any) => {
        if (props.state && !currErr) {
            currErr = true;
            props.state.errCnt++;
        }
        return res;
    }



    const resetErr = (res: any) => {
        if (props.state && currErr) {
            currErr = false;
            props.state.errCnt--;
        }
        return res;
    }


    const blur = () => {
        if (document.activeElement && typeof (<any>document).activeElement.blur == "function")
            (<any>document).activeElement.blur();
    }



    onUnmounted(() => {
        //т.к. компонент уничтожается, сбрсываем ошибку компонента. 
        //Иначе может возникнуть ситуация невозможности сохранения формы из-за наличия ошибки, которую нельзя сбросить т.к. элемент уничтожен
        resetErr(false);
    })

    return {
        onValChanged,
        onKeydown,
        setErr,
        resetErr,
        blur,
        OldModelVal,
        CurrModelVal,
        Visible,
        Readonly,
        currErr
    }
}
<template>
    <v-container>

        <v-row>

            <v-col sm="6">

                <InputField :type="EDataType.string" :state="state" label="Страна" :model-value="CurrModelVal!.getCountry()"
                    @update:model-value="async (val) => { CurrModelVal!.setCountry(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" placeholder="Россия" />
            </v-col>

        </v-row>

    </v-container>
</template>

    
<script setup lang="ts">
import { chkTrait } from "~/lib/Utils"
import { useI18n } from "vue-i18n"
import AddressEntity from '~/lib/MoApi/Records/DataEntities/AddressEntity';
import * as vHelpers from '~/lib/Helpers';
import { EDataType } from "~/lib/globalTypes";

const { t, locale } = useI18n();

defineOptions({
    inheritAttrs: false,
    customOptions: {}
})


const emit = defineEmits(["update:modelValue", "changed"])

interface IProps {

    modelValue?: AddressEntity | null;
    required?: boolean;
    label?: string | null;
    tokens?: string[] | null,

    state?: {
        errCnt: number,
        changedCnt: number,
        readonly: boolean
    } | null
}
const props = defineProps<IProps>();

const visible = ref(props.tokens ? chkTrait(props.tokens, "r") : true);
const readonly = ref(!(props.tokens ? chkTrait(props.tokens, "u") || chkTrait(props.tokens, "c") : true) || !!props.state?.readonly);

let OldModelVal = ref();
let CurrModelVal = ref<AddressEntity | null>();


//отслеживание изменений props.modelValue
watch(props, (rval: any) => {
    //присваивние здесь значения CurrModelVal приводит к тому, что обязательные поля становятся в ошибочное состояние сразу, 
    //а не после того как было введено значение пользователем
    if (OldModelVal.value !== rval.modelValue) {
        OldModelVal.value = rval.modelValue;
        CurrModelVal.value = props.modelValue!.clone();
    }

}, { immediate: true });


const onValChanged = (force?: boolean) => {
    if (!currErr || force) {
        if (props.state && CurrModelVal.value != props.modelValue) {
            props.state.changedCnt++;

            emit('update:modelValue', CurrModelVal.value);
        }
    }
}


const onKeydown = (k) => {
    if (k.key == 'Enter')
        blur()
    else
        if (k.key == 'Escape') {
            CurrModelVal.value = props.modelValue;
            blur();
        }
}

let currErr = false;


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

</script>

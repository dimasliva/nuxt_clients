<template>
    <!--Строка-->
    <v-text-field v-if="type == EDataType.string && visible" :disabled="disabled" v-bind="$attrs" :modelValue="modelValue"
        type="text" variant="underlined" clearable density="compact"
        @update:modelValue="(d) => emit('update:modelValue', d)">
        <template v-slot:label>
            <span>
                {{ hint || "" }} <span v-if="required" class="text-info">*</span>
            </span>
        </template>
    </v-text-field>


    <!--Дата-->
    <VueDatePicker v-if="type == EDataType.date && visible" v-bind="$attrs" :modelValue="modelValue"
        :enable-time-picker="false" model-type="yyyy-MM-dd" :locale="locale" auto-apply keep-action-row
        :min-date="constraints?.min" :max-date="constraints?.max"
        :action-row="{ showNow: true, showSelect: false, showCancel: false, showPreview: false }" now-button-label="Сегодня"
        @update:modelValue="(d) => emit('update:modelValue', d)">

        <template #trigger>
            <v-text-field :modelValue="modelValue" type="date" variant="underlined" required clearable density="compact"
                @update:modelValue="(e) => { emit('update:modelValue', e||null) }" :rules="DatePickerRules">
                <template v-slot:label>
                    <span>
                        {{ hint || "" }} <span v-if="required" class="text-info">*</span>
                    </span>
                </template>
            </v-text-field>
        </template>
    </VueDatePicker>
</template>


<script setup lang="ts">
import { EDataType } from '~/lib/globalTypes';
import { chkTrait } from "~/lib/Utils"
import { useI18n } from "vue-i18n"
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { debug } from 'console';

const { t, locale } = useI18n();

defineOptions({
    inheritAttrs: false,
    customOptions: {}
})

const emit = defineEmits(["update:modelValue"])

interface IProps {
    type: EDataType;
    constraints?: any;
    modelValue?: any | null;
    required?: boolean;
    hint?: string | null;
    rules?: any[] | null;
    tokens?: string[] | null,
    errCnt?: { cnt: number } | null
}

const props = defineProps<IProps>();

const visible = ref(props.tokens ? chkTrait(props.tokens, "r") : true);
const disabled = ref(props.tokens ? chkTrait(props.tokens, "u") || chkTrait(props.tokens, "c") : true);


const DatePickerRules = [
    (v) => {
        console.debug("v=" + v)

        if (v == null || v == "") {
            if (props.required)
                return setErr(`Дата не может быть пустой`);
            else
                return resetErr(true);

        }

        let d = new Date(v);
        if (isNaN(d as any))
            return setErr("Неверная дата");

        if (props.constraints?.max) {
            let maxdate = new Date(props.constraints?.max);
            if (d > maxdate)
                return setErr(`Дата должна быть не больше ${maxdate.toLocaleDateString()}`);
        }

        if (props.constraints?.min) {
            let mindate = new Date(props.constraints?.min);
            if (d < mindate)
                return setErr(`Дата должна быть не меньше ${mindate.toLocaleDateString()}`);
        }

        return resetErr(true);
    }
]


let currErr = false;

const setErr = (res: any) => {
    if (props.errCnt && !currErr) {
        currErr = true;
        props.errCnt.cnt++;
    }
    return res;
}



const resetErr = (res: any) => {
    if (props.errCnt && currErr) {
        currErr = false;
        props.errCnt.cnt--;
    }
    return res;
}



const isDate = (d) => !isNaN(new Date(d) as any);

const onDateChanged = (e) => {
    if (isNaN(new Date(e) as any)) {

    }
}




</script>
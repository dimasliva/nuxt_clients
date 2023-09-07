<template>
    <!--Строка-->
    <v-text-field v-if="type == EDataType.string && visible" v-bind="$attrs" :modelValue="modelValue" :readonly="readonly"
        type="text" variant="underlined" :clearable="!readonly" density="compact" v-maska:[maska]
        :maxlength="constraints?.max"
        @update:modelValue="(d) => { emit('update:modelValue', d); if (changedCnt) changedCnt.cnt++; }"
        :rules="StringFieldRules">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-info">*</span>
            </span>
        </template>
    </v-text-field>


    <!--Дата-->
    <VueDatePicker v-if="type == EDataType.date && visible" ref="refField" v-bind="$attrs" :modelValue="modelValue"
        :readonly="readonly" :dark="useTheme().global.current.value.dark" :enable-time-picker="false"
        model-type="yyyy-MM-dd" :locale="locale" auto-apply keep-action-row :min-date="constraints?.min"
        :max-date="constraints?.max"
        :action-row="{ showNow: true, showSelect: false, showCancel: false, showPreview: false }" now-button-label="Сегодня"
        @update:modelValue="(d) => { emit('update:modelValue', d); if (changedCnt) changedCnt.cnt++; }">

        <template #trigger>
            <v-text-field :modelValue="modelValue" type="date" variant="underlined" :clearable="!readonly" density="compact"
                :readonly="readonly"
                @update:modelValue="(e) => { emit('update:modelValue', e || null); if (changedCnt) changedCnt.cnt++; }"
                :rules="DatePickerRules">
                <template v-slot:label>
                    <span>
                        {{ label || "" }} <span v-if="required" class="text-info">*</span>
                    </span>
                </template>
            </v-text-field>
        </template>
    </VueDatePicker>


    <!--Выпадаюший список-->
    <v-select v-if="type == EDataType.strictstring && visible" ref="refField" v-bind="$attrs" :modelValue="modelValue"
        hide-details :readonly="readonly" :label="label || ''" :items="items" variant="solo" :rules="SingleStrSelectRules"
        @update:modelValue="(d) => { emit('update:modelValue', d); if (changedCnt) changedCnt.cnt++; }"
        :menuProps="{ scrollStrategy: 'close' }">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-info">*</span>
            </span>
        </template>
    </v-select>


    <!--Выпадаюший список с множественным выбором-->
    <v-select v-if="type == EDataType.strictstringarray && visible" ref="refField" v-bind="$attrs" :modelValue="modelValue"
        multiple clearable hide-details :readonly="readonly" :label="label || ''" :items="items" variant="solo"
        :rules="MultipleStrSelectRules"
        @update:modelValue="(d) => { emit('update:modelValue', d); if (changedCnt) changedCnt.cnt++; }"
        :menuProps="{ scrollStrategy: 'close' }">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-info">*</span>
            </span>
        </template>
    </v-select>


    <!--Целое число-->
    <v-text-field v-if="type == EDataType.int && visible" v-bind="$attrs" :modelValue="modelValue" :readonly="readonly"
        type="text" variant="underlined" :clearable="!readonly" density="compact" v-maska:[intFieldMaska]
        @update:modelValue="(d) => { emit('update:modelValue', d); if (changedCnt) changedCnt.cnt++; }"
        :rules="IntFieldRules">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-info">*</span>
            </span>
        </template>
    </v-text-field>
</template>


<script setup lang="ts">
import { EDataType } from '~/lib/globalTypes';
import { chkTrait } from "~/lib/Utils"
import { useI18n } from "vue-i18n"
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { useTheme } from 'vuetify/lib/framework.mjs';
import { debug } from 'console';

const { t, locale } = useI18n();

defineOptions({
    inheritAttrs: false,
    customOptions: {}
})

const emit = defineEmits(["update:modelValue", "changed"])

interface IProps {
    type: EDataType;
    constraints?: any;
    maska?: any;
    modelValue?: any | null;
    items?: any | null;
    required?: boolean;
    label?: string | null;
    rules?: any[] | null;
    tokens?: string[] | null,
    errCnt?: { cnt: number } | null,
    changedCnt?: { cnt: number } | null,
    readonly?: boolean | null
}

const props = defineProps<IProps>();

const visible = ref(props.tokens ? chkTrait(props.tokens, "r") : true);
const readonly = ref(!(props.tokens ? chkTrait(props.tokens, "u") || chkTrait(props.tokens, "c") : true) || !!props.readonly);
const refField = ref();


const StringFieldRules = [
    (v) => {
        if (!v) {
            if (props.required)
                return setErr(t('required'));
        }

        if (props.constraints?.min) {
            if (v && v.length < props.constraints?.min)
                return setErr(t('minStr', [props.constraints.min]));
        }

        return resetErr(true);
    }
];


const DatePickerRules = [
    (v) => {
        // console.debug("v=" + v)

        if (!v) {
            //если v пустое, то это может означать как отсутствующее значение  так и ошибочное
            let inputEl = refField.value.$el.querySelector('input');
            if (!inputEl.checkValidity()) {
                //console.debug("incorrect")
                return setErr(t('incorrect'));
            }
        }

        if (v == null || v == "") {
            if (props.required)
                return setErr(t('required'));
            else
                return resetErr(true);
        }

        let d = new Date(v);
        if (isNaN(d as any))
            return setErr(t('incorrect'));

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



const SingleStrSelectRules = [
    (v) => {
        if (!v) {
            if (props.required)
                return setErr("");
        }
        return resetErr(true);
    }
];


const MultipleStrSelectRules = [
    (v) => {
        if (!v || v.length == 0) {
            if (props.required)
                return setErr("");
        }
        return resetErr(true);
    }
]


const intFieldMaska: any = {
    mask: null,
    tokens: { D: { pattern: /\d/, multiple: true }, Z: { pattern: /-/, optional: true } }
}

if (props.type == EDataType.int) {
    let min = (props.constraints?.min != null) ? props.constraints.min : Number.MIN_SAFE_INTEGER;
    let max = (props.constraints?.max != null) ? props.constraints.max : Number.MAX_SAFE_INTEGER;
    intFieldMaska.tokens.D.multiple = false;
    let maxLength = Math.max(Math.abs(min).toString().length, Math.abs(max).toString().length)

    if (min < 0 && max < 0)
        intFieldMaska.mask = 'Z' + 'D'.repeat(maxLength);
    else
        if (min >= 0 && max >= 0)
            intFieldMaska.mask = 'D'.repeat(maxLength);
        else {
            //min<0 && max>=0
            let minMsak = 'Z' + ('D'.repeat(min.toString().length - 1));
            let maxMsak = ('D'.repeat(max.toString().length));
            intFieldMaska.mask = (v: string) => {
                if (!v) return 'ZD';
                return (v.startsWith('-')) ? minMsak : maxMsak
            }
        }
}


const IntFieldRules = [
    (v) => {
        if (!v) {
            if (props.required)
                return setErr('');
        }

        if (props.constraints?.min != null)
            if (v < props.constraints.min)
                return setErr(t('minNum', [props.constraints.min]));

        if (props.constraints?.max != null)
            if (v > props.constraints.max)
                return setErr(t('maxNum', [props.constraints.max]));

        return resetErr(true);
    }
];




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


</script>
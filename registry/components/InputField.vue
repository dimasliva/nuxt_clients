<template>
    <!--Строка-->
    <v-text-field v-if="type == EDataType.string && visible" ref="refField" v-bind="$attrs" v-model="CurrModelVal"
        :readonly="readonly" type="text" :variant='customVariant || "underlined"' :clearable="!readonly"
        density="compact" v-maska:[maska] :maxlength="constraints?.max" @blur="(d) => onValChanged()"
        @keydown.stop="(k) => onKeydown(k)" :rules="StringFieldRules">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </v-text-field>


    <!--Текст-->
    <v-textarea v-if="type == EDataType.text && visible" ref="refField" v-bind="$attrs" v-model="CurrModelVal" rows="2"
        :clearable="!readonly" :label="<string>label" :variant='customVariant || "solo"' :readonly="readonly"
        :maxlength="constraints?.max" :rules="StringFieldRules" @blur="(d) => onValChanged()"
        @keydown.stop="(k) => onKeydown(k)">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </v-textarea>



    <!--Телефон-->
    <VPhoneInput v-if="type == EDataType.phone && visible" ref="refField" v-bind="$attrs" :label="<string>label"
        :readonly="readonly" defaultCountry="RU" countryIconMode="svg" type="text" displayFormat="international"
        clearable density="compact" v-model="CurrModelVal" :variant='customVariant || "underlined"' countryLabel=""
        :rules="PhoneRules" @blur="(d) => onValChanged()" @keydown.stop="(k) => onKeydown(k)">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </VPhoneInput>


    <!--email-->
    <v-text-field v-if="type == EDataType.email && visible" ref="refField" v-bind="$attrs" v-model="CurrModelVal"
        :readonly="readonly" type="text" :variant='customVariant || "underlined"' :clearable="!readonly"
        density="compact" :maxlength="constraints?.max" @blur="(d) => onValChanged()"
        @keydown.stop="(k) => onKeydown(k)" :rules="MailFieldRules">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </v-text-field>


    <!--Дата-->
    <VueDatePicker v-if="type == EDataType.date && visible" v-bind="$attrs" :modelValue="CurrModelVal"
        :readonly="readonly" :dark="useTheme().global.current.value.dark" :enable-time-picker="false"
        model-type="yyyy-MM-dd" :locale="locale" auto-apply keep-action-row :min-date="constraints?.min"
        :max-date="constraints?.max"
        :action-row="{ showNow: true, showSelect: false, showCancel: false, showPreview: false }"
        now-button-label="Сегодня" @update:modelValue="(d) => { CurrModelVal = d; onValChanged(true); }">

        <template #trigger>
            <v-text-field v-model="CurrModelVal" type="date" ref="refField" :variant='customVariant || "underlined"'
                :clearable="!readonly" density="compact" :readonly="readonly" @blur="(d) => onValChanged()"
                @keydown.stop="(k) => onKeydown(k)" :rules="DatePickerRules">
                <template v-slot:label>
                    <span>
                        {{ label || "" }} <span v-if="required" class="text-error">*</span>
                    </span>
                </template>
            </v-text-field>
        </template>
    </VueDatePicker>


    <!--Выпадаюший список-->
    <v-select v-if="type == EDataType.strictstring && visible" ref="refField" v-bind="$attrs" :modelValue="CurrModelVal"
        :single-line="!(label || required)" density="compact" hide-details :readonly="readonly" :label="label || ''"
        :items="items" :item-props="itemProps" :variant='customVariant || "underlined"' :rules="SingleStrSelectRules"
        @update:modelValue="(d) => { CurrModelVal = d; onValChanged(true); }"
        :menuProps="{ scrollStrategy: 'close', maxWidth: 0 }">
        <template v-slot:label>
            <span v-if="label || required">
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
        <template #item="{ item, props }">
            <v-list-item v-bind="props" :title="undefined">
                <v-list-item-title class="text-wrap">{{ item.title }}</v-list-item-title>
            </v-list-item>
        </template>
    </v-select>


    <!--Выпадаюший список с множественным выбором-->
    <v-select width="300px" v-if="type == EDataType.strictstringarray && visible" ref="refField" v-bind="$attrs"
        v-model="CurrModelVal" multiple clearable hide-details :readonly="readonly" :label="label || ''" :items="items"
        :item-props="itemProps" :variant='customVariant || "solo"' :rules="MultipleStrSelectRules"
        @update:menu="(o) => { isMenuActive = o; if (!o) onValChanged(); }"
        @click:clear="() => { if (!isMenuActive) onValChanged(); }" :menuProps="{ scrollStrategy: 'close' }">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </v-select>


    <!--Целое число-->
    <v-text-field v-if="type == EDataType.int && visible" ref="refField" v-bind="$attrs" v-model="CurrModelVal"
        :readonly="readonly" type="text" :variant='customVariant || "underlined"' :clearable="!readonly"
        density="compact" v-maska:[IntFieldMaska] @blur="(d) => onValChanged()" @keydown.stop="(k) => onKeydown(k)"
        :rules="NumberFieldRules">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </v-text-field>

    <!--Плавоющее число-->
    <v-text-field v-if="type == EDataType.float && visible" ref="refField" v-bind="$attrs" v-model="CurrModelVal"
        :readonly="readonly" type="text" :variant='customVariant || "underlined"' :clearable="!readonly"
        density="compact" v-maska:[FloatFieldMaska] @blur="() => onFloatChanged()" @keydown.stop="(k) => onKeydown(k)"
        :rules="NumberFieldRules">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </v-text-field>

    <!--чекбокс-->
    <v-checkbox v-if="type == EDataType.bool && visible" ref="refField" v-bind="$attrs" :model-value="CurrModelVal"
        :readonly="readonly" hide-details :label="<any>label"
        @update:model-value="(val) => { CurrModelVal = val; onValChanged(); }">
    </v-checkbox>

    <!--Словарное значение. modelValue в виде {value:string, title?:string} или его массива -->
    <v-select v-if="(type == EDataType.reference || type == EDataType.referenceMultiple) && visible" ref="refField"
        :chips="type == EDataType.referenceMultiple" v-bind="$attrs" :modelValue="referVal" :readonly="true" type="text"
        :variant='customVariant || "underlined"' :clearable="!readonly" density="compact" :rules="SingleStrSelectRules"
        @keydown.stop="(k) => onKeydown(k)" @click="onReferEdit()"
        @click:clear="() => { CurrModelVal = null; onValChanged(true); }">
        <template v-slot:label>
            <span>
                {{ label || "" }} <span v-if="required" class="text-error">*</span>
            </span>
        </template>
    </v-select>

</template>



<script setup lang="ts" inherit-attrs="true">
import { EDataType } from '~/lib/globalTypes';
import { chkTrait } from "~/lib/Utils"
import { useI18n } from "vue-i18n"
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { useTheme } from 'vuetify/lib/framework.mjs';
import { VPhoneInput } from 'v-phone-input'; //https://github.com/paul-thebaud/v-phone-input
import 'flag-icons/css/flag-icons.min.css';
import 'v-phone-input/dist/v-phone-input.css';
import { isEqualData } from '~/lib/Helpers';
import type { FinderDataProvider } from '~/libVis/FinderDataProviders/FinderDataProvider';
import * as Utils from '~/lib/Utils';


const { t, locale } = useI18n();

defineOptions({
    inheritAttrs: true,
    customOptions: {}
})


const emit = defineEmits(["update:modelValue", "changed"])

interface IProps {
    type: EDataType;
    constraints?: any;
    maska?: any;
    modelValue?: any | null;
    items?: any | null;
    itemProps?: any | null;
    required?: boolean;
    label?: string | null;
    rules?: any[] | null;
    tokens?: string[] | null,
    finderDataProvider?: FinderDataProvider | null,
    readonly?: boolean | null;
    customVariant?: "solo" | "filled" | "outlined" | "plain" | "underlined" | "solo-inverted" | "solo-filled" | null;

    state?: {
        errCnt: number,
        changedCnt: number,
        readonly: boolean
    } | null
}

const props = defineProps<IProps>();

const visible = ref(props.tokens ? chkTrait(props.tokens, "r") : true);
const readonly = ref(!(props.tokens ? chkTrait(props.tokens, "u") || chkTrait(props.tokens, "c") : true) || !!props.state?.readonly || props.readonly);
const refField = ref();

let OldModelVal = ref();
let CurrModelVal = ref();
let CurrModelMaskVal = ref();
let isMenuActive: boolean = false;



const onValChanged = (force?: boolean) => {
    if (!currErr || force) {
        if (props.state && CurrModelVal.value != props.modelValue) {
            props.state.changedCnt++;
            let val = CurrModelVal.value;

            if (props.type == EDataType.phone) {
                if (val)
                    val = val.replace("+", "");
            }
            emit('update:modelValue', val);
        }
    }
}

const onKeydown = (k) => {
    if (k.key == 'Enter' && props.type != EDataType.text)
        blur()
    else
        if (k.key == 'Escape') {
            CurrModelVal.value = props.modelValue;
            blur();
        }

}


const blur = () => {
    if (refField.value && typeof refField.value.blur == "function")
        refField.value.blur();
    else
        if (document.activeElement && typeof (<any>document).activeElement.blur == "function")
            (<any>document).activeElement.blur();
}


const StringFieldRules = [
    (v) => {
        if (!v) {
            if (props.required)
                return setErr(false); //setErr(t('required'));
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


const PhoneRules = [
    (value, phone, o) => {
        if (props.required && !value)
            return setErr(false);
        else
            if (value && phone.valid != true)
                return setErr(t("phone.invalidPhone", [o.example]));

        return resetErr(true);
    },
];


const MailFieldRules = [
    (v) => {
        if (!v) {
            if (props.required)
                return setErr(false); //setErr(t('required'));
        }
        else
            if (!String(v)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                ))
                return setErr(false);

        return resetErr(true);
    }
];


const IntFieldMaska: any = {
    mask: null,
    tokens: { D: { pattern: /\d/, multiple: false }, Z: { pattern: /-/, optional: true } }
}

if (props.type == EDataType.int) {
    let min = (props.constraints?.min != null) ? props.constraints.min : Number.MIN_SAFE_INTEGER;
    let max = (props.constraints?.max != null) ? props.constraints.max : Number.MAX_SAFE_INTEGER;
    IntFieldMaska.tokens.D.multiple = false;
    let maxLength = Math.max(Math.abs(min).toString().length, Math.abs(max).toString().length)

    if (min < 0 && max < 0)
        IntFieldMaska.mask = 'Z' + 'D'.repeat(maxLength);
    else
        if (min >= 0 && max >= 0)
            IntFieldMaska.mask = 'D'.repeat(maxLength);
        else {
            //min<0 && max>=0
            let minMsak = 'Z' + ('D'.repeat(min.toString().length - 1));
            let maxMsak = ('D'.repeat(max.toString().length));
            IntFieldMaska.mask = (v: string) => {
                if (!v) return 'ZD';
                return (v.startsWith('-')) ? minMsak : maxMsak
            }
        }
}


const NumberFieldRules = [
    (v) => {
        if (!v) {
            if (props.required)
                return setErr('');
            else
                return resetErr(true);
        }

        if (isNaN(parseFloat(v)))
            return setErr(t('incorrect'));

        if (props.constraints?.min != null)
            if (v < props.constraints.min)
                return setErr(t('minNum', [props.constraints.min]));

        if (props.constraints?.max != null)
            if (v > props.constraints.max)
                return setErr(t('maxNum', [props.constraints.max]));

        return resetErr(true);
    }
];



//отслеживание изменений props.modelValue
watch(props, (rval: any) => {
    //присваивние здесь значения CurrModelVal приводит к тому, что обязательные поля становятся в ошибочное состояние сразу, 
    //а не после того как было введено значение пользователем

    if (OldModelVal.value != rval.modelValue) {

        if (props.type == EDataType.strictstringarray) {
            if (isEqualData(OldModelVal.value, rval.modelValue)) {
                OldModelVal.value = rval.modelValue;
                return;
            }
        }
        OldModelVal.value = rval.modelValue;

        if (props.type == EDataType.float) {
            let val = parseFloat(rval.modelValue);

            if (!isNaN(val) && props.constraints?.fixed && props.constraints?.numAfterPoint) {
                let val = parseFloat(props.modelValue).toFixed(props.constraints.numAfterPoint);

                CurrModelVal.value = <any>val;
            }
            else
                CurrModelVal.value = null;
        }
        else
            if (props.type == EDataType.phone) {
                if (rval.modelValue)
                    CurrModelVal.value = "+" + rval.modelValue;
                else
                    CurrModelVal.value = rval.modelValue;
            }
            else
                CurrModelVal.value = rval.modelValue;
    }
}, { immediate: true });



const onFloatChanged = () => {
    let val = parseFloat(CurrModelVal.value);

    if (!currErr) {
        if (props.state) props.state.changedCnt++;
        emit('update:modelValue', isNaN(val) ? null : val);
    }
}


const FloatFieldMaska: any = {
    mask: "ZDDD.##",
    tokens: { D: { pattern: /\d/, optional: true }, Z: { pattern: /-/, optional: true } },
}


if (props.type == EDataType.float) {

    let min = (props.constraints?.min != null) ? props.constraints.min : Number.MIN_VALUE;
    let max = (props.constraints?.max != null) ? props.constraints.max : Number.MAX_VALUE;
    let maxLength = Math.max(Math.trunc(Math.abs(min)).toString().length, Math.trunc(Math.abs(max)).toString().length);

    let suff = (props.constraints?.numAfterPoint) ? "." + "#".repeat(props.constraints.numAfterPoint) : "";
    let pattern = "";
    pattern = ('D'.repeat(maxLength)) + suff;
    if (min < 0) pattern = 'Z' + pattern;
    FloatFieldMaska.mask = pattern;
}


const referVal = computedAsync(() => {
    if (props.finderDataProvider && CurrModelVal.value != null) {
        if (CurrModelVal.value instanceof Array) {
            //множественный выбор
            return new Promise(async resolve => {
                resolve(await Utils.mapAsync(CurrModelVal.value, async item => {
                    if (item.title)
                        return { value: item, title: item.title }
                    else {
                        let t = await props.finderDataProvider!.getTitle(item.value);
                        return { value: item, title: t }
                    }
                }));
            });
        }
        else {
            //одиночный выбор
            if (CurrModelVal.value)
                if (CurrModelVal.value.title != null)
                    return CurrModelVal.value.title;
                else
                    return props.finderDataProvider?.getTitle(CurrModelVal.value.value)
        }
    }
    else
        return null;
});


const onReferEdit = async () => {
    if (!readonly.value) {
        let res = await props.finderDataProvider?.edit(CurrModelVal.value);
        if (res != null) {
            CurrModelVal.value = res;
            onValChanged(true);
        }
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

const focus = () => {
    if (refField.value.focus)
        refField.value.focus();
}


onMounted(() => {
});


onUnmounted(() => {
    //т.к. компонент уничтожается, сбрсываем ошибку компонента. 
    //Иначе может возникнуть ситуация невозможности сохранения формы из-за наличия ошибки, которую нельзя сбросить т.к. элемент уничтожен
    resetErr(false);
})


defineExpose({
    focus
})
</script>

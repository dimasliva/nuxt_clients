<template>
    <v-expansion-panels :model-value="opened ? '1' : null">
        <v-expansion-panel elevation="0" value="1">
            <v-expansion-panel-title class="text-subtitle-2">{{ docTitle }}</v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-row >
                    <v-col style="max-width:25%">
                        <InputField :type="EDataType.string" :state="state" label="Серия" :focused="focused"
                            :model-value="CurrModelVal!.getSerial()" ::maska="capLettersNumbersMask"
                            @update:model-value="async (val) => { CurrModelVal!.setSerial(val); onValChanged(); }"
                            :constraints="{ max: 16 }" />
                    </v-col>
                    <v-col style="max-width:35%">
                        <InputField :state="state" :type="EDataType.string" label="Номер" :maska="capLettersNumbersMask"
                            :constraints="{ max: 32 }" :model-value="CurrModelVal!.getNumber()"
                            @update:model-value="async (val) => { CurrModelVal!.setNumber(val); onValChanged(); }" />
                    </v-col>

                    <v-col style="max-width:35%">
                        <InputField :state="state" :type="EDataType.date" label="Дата выдачи" :maska="capLettersNumbersMask"
                            :model-value="CurrModelVal!.getWhen()" :constraints="{ min: '1900-01-01', max: new Date() }"
                            @update:model-value="async (val) => { CurrModelVal!.setWhen(val); onValChanged(); }" />
                    </v-col>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { EDataType } from "~/lib/globalTypes";
import { Dictionary } from "~/lib/Dicts/Dictionary";
import { setupBase } from "~/componentComposables/inputs/base"
import type PersonalDocumentEntity from "~/lib/MoApi/Records/DataEntities/PersonalDocumentEntity";
import * as persDocDictConst from "~/lib/Dicts/DictPersonalDocumentsConst";


const { t, locale } = useI18n();

defineOptions({
    inheritAttrs: true,
    customOptions: {}
})


interface IProps<T> {
    modelValue: T;
    required?: boolean;
    label?: string | null;
    tokens?: string[] | null,

    opened?: boolean | null,
    focused?: boolean | null,
    complex?: boolean | null,
    typeCode?: number | null;
    typeField?: boolean | null,
    serialField?: boolean | null,
    numberField?: boolean | null,
    whenField?: boolean | null,
    whoField?: boolean | null,
    whoCodeField?: boolean | null,
    regionField?: boolean | null,

    state?: {
        errCnt: number,
        changedCnt: number,
        readonly: boolean
    } | null
}
const props = defineProps<IProps<PersonalDocumentEntity>>();

const emit = defineEmits<{
    "update:modelValue": [value: PersonalDocumentEntity]
}>();

const { OldModelVal, CurrModelVal, onKeydown, onValChanged } = setupBase<PersonalDocumentEntity>(props, emit);

const availablePersDocTypes = ref();
const docTitle = ref("");

const capLettersNumbersMask = {
    mask: "a",
    tokens: { a: { pattern: /[A-z,А-я,0-9]/, multiple: true } }
}

//отслеживание изменений props.modelValue
watch(props, async (rval: any) => {
    if (!rval.modelValue.equal(OldModelVal.value)) {
        OldModelVal.value = rval.modelValue.clone();
        CurrModelVal.value = <PersonalDocumentEntity>props.modelValue!.clone();
        availablePersDocTypes.value = Dictionary.itemsToValueTitle((await CurrModelVal.value!.getAvailablePersonalDocumentTypes())!);
        docTitle.value = (CurrModelVal.value!.getTypeCode() == persDocDictConst.OTHER_PERS_DOC) ? "Персональный документ" :
            (await CurrModelVal.value.getTypeTitle())!;
    }
}, { immediate: true });



</script>

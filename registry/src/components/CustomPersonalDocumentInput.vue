<template>
    <v-expansion-panels :model-value="panelOpened ? '1' : null" >
        <v-expansion-panel elevation="0" value="1">
            <v-expansion-panel-title class="text-subtitle-2">{{ docTitle }}</v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-row class="pt-3">
                    <v-col style="max-width:25%">
                        <InputField :type="EDataType.string" :state="state" label="Серия" :ref="cRefs['selected']"
                            :model-value="CurrModelVal!.getSerial()" ::maska="capLettersNumbersMask"
                            @update:model-value="async (val) => { CurrModelVal!.setSerial(val); onValChanged(); }"
                            :constraints="{ max: 16 }"  @vue:mounted="(f)=>{ nextTick(()=>cRefs['selected'].value.focus()) }" />
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
                <v-row >
                    <v-col>
                        <InputField :state="state" :type="EDataType.text" label="Комментарий" 
                            :model-value="CurrModelVal!.getComment()" :constraints="{  max: 256 }"
                            @update:model-value="async (val) => { CurrModelVal!.setComment(val); onValChanged(); }" />
                    </v-col>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { EDataType } from "~/src/common/lib/globalTypes";
import { Dictionary } from "~/src/common/lib/Dicts/Dictionary";
import { setupBase } from "~components/~composables/InputBase"
import type PersonalDocumentEntity from "~/src/common/lib/MoApi/Records/DataEntities/PersonalDocumentEntity";
import * as persDocDictConst from "~/src/common/lib/Dicts/DictPersonalDocumentsConst";
import * as Helpers from '~/src/common/lib/Helpers';


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
let cRefs = {selected: ref()};
let panelOpened=ref(props.opened);


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




onMounted(()=>{
    nextTick(()=>{
     //   debugger;
   // cRefs.value.focus();
    })

});

</script>

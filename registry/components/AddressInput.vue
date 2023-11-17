<template>
    <v-container>

        <v-row class="d-flex  justify-center">
            <v-col sm="9">
                <InputField :type="EDataType.strictstring" :state="state" label="Страна"
                    :model-value="CurrModelVal!.getCountry()" :items="availableCountries"
                    @update:model-value="async (val) => { setCountry(val); }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" placeholder="Россия" />
            </v-col>
        </v-row>

        <v-row class="d-flex  justify-center">
            <v-col sm="9">
                <InputField
                    :type="(CurrModelVal!.getCountry() == dcCountries.RUSSIA) ? EDataType.strictstring : EDataType.string"
                    :state="state" label="Регион" :model-value="CurrModelVal!.getRegion()" :items="availableRegions"
                    :maska="capWordMask" @update:model-value="async (val) => { CurrModelVal!.setRegion(val) }"
                    :constraints="{ max: 256 }" @blur="(d) => onValChanged()" @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
        </v-row>

        <v-row class="d-flex  justify-center">
            <v-col sm="9">
                <InputField :type="EDataType.string" :state="state" label="Муниципальный Район, Округ"
                    :model-value="CurrModelVal!.getDistrict()" :maska="capWordMask" :constraints="{ max: 256 }"
                    @update:model-value="async (val) => { CurrModelVal!.setDistrict(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

        </v-row>

        <v-row class="d-flex  justify-center">
            <v-col sm="4" v-if="CurrModelVal!.getCountry() == dcCountries.RUSSIA">
                <InputField :type="EDataType.strictstring" label="Вид населенного пункта" :state="state"
                    :maska="capWordMask" :items="availableSettelmentsTypes" :model-value="CurrModelVal!.getSettlementType()"
                    @update:model-value="async (val) => { CurrModelVal!.setSettlementType(val) }"
                    @blur="(d) => onValChanged()" @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="5">
                <InputField :type="EDataType.string" :state="state" :model-value="CurrModelVal!.getSettlement()"
                    :constraints="{ max: 256 }" label="Название населенного пункта" :maska="capWordMask"
                    @update:model-value="async (val) => { CurrModelVal!.setSettlement(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="3">
                <InputField :type="EDataType.string" :state="state" label="Индекс" :model-value="CurrModelVal!.getZip()"
                    :maska="capLettersNumbersMask" :constraints="{ max: 16 }"
                    @update:model-value="async (val) => { CurrModelVal!.setZip(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
        </v-row>

        <v-row class="d-flex  justify-start">
            <v-col sm="5">
                <InputField :type="EDataType.string" :state="state" label="Улица, Проспект"
                    :model-value="CurrModelVal!.getStreet()" :maska="capWordMask" :constraints="{ max: 256 }"
                    @update:model-value="async (val) => { CurrModelVal!.setStreet(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
            <v-col sm="2">
                <InputField :type="EDataType.string" :state="state" label="Дом" :model-value="CurrModelVal!.getBuilding()"
                    :maska="capLettersNumbersMask" :constraints="{ max: 16 }"
                    @update:model-value="async (val) => { CurrModelVal!.setBuilding(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="2">
                <InputField :type="EDataType.string" :state="state" label="Корпус" :model-value="CurrModelVal!.getCorp()"
                    :maska="capLettersNumbersMask" :constraints="{ max: 8 }"
                    @update:model-value="async (val) => { CurrModelVal!.setCorp(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="2">
                <InputField :type="EDataType.string" :state="state" label="Квартира" :model-value="CurrModelVal!.getFlat()"
                    :maska="capLettersNumbersMask" :constraints="{ max: 8 }"
                    @update:model-value="async (val) => { CurrModelVal!.setFlat(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
        </v-row>


    </v-container>
</template>

    
<script setup lang="ts">
import { useI18n } from "vue-i18n"
import AddressEntity from '~/lib/MoApi/Records/DataEntities/AddressEntity';
import { EDataType } from "~/lib/globalTypes";
import { Dictionary } from "~/lib/Dicts/Dictionary";
import * as dcCountries from "~/lib/Dicts/DictCountriesConst";
import { setupBase } from "~/componentComposables/inputs/base"

const { t, locale } = useI18n();

defineOptions({
    inheritAttrs: false,
    customOptions: {}
})



interface IProps {
    modelValue: AddressEntity;
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

const emit = defineEmits<{
    "update:modelValue": [value: AddressEntity]
}>();

const { OldModelVal, CurrModelVal, onKeydown, onValChanged } = setupBase<AddressEntity>(props, emit);


const availableCountries = ref();
const availableRegions = ref();
const availableSettelmentsTypes = ref();


const capWordMask = {
    mask: "Aa",
    tokens: { A: { pattern: /[A-я,0-9]/, transform: (chr: string) => chr.toUpperCase() }, a: { pattern: /[a-я,0-9,\s]/, multiple: true } }
}

const capLettersNumbersMask = {
    mask: "a",
    tokens: { a: { pattern: /[A-z,А-я,0-9]/, multiple: true } }
}

//отслеживание изменений props.modelValue
watch(props, async (rval: any) => {
    //присваивние здесь значения CurrModelVal приводит к тому, что обязательные поля становятся в ошибочное состояние сразу, 
    //а не после того как было введено значение пользователем
    if (!rval.modelValue.equal(OldModelVal.value)) {
        let resetCountry = rval.modelValue.country != OldModelVal.value?.country;
        OldModelVal.value = rval.modelValue.clone();
        CurrModelVal.value = <AddressEntity>props.modelValue!.clone();

        availableCountries.value = Dictionary.itemsToValueTitle((await CurrModelVal.value!.getAvailableCountries())!);


        if (CurrModelVal.value.country == dcCountries.RUSSIA) {
            //для России используются словари
            availableRegions.value = Dictionary.itemsToValueTitle((await CurrModelVal.value!.getAvailableRegions())!);
            availableSettelmentsTypes.value = Dictionary.itemsToValueTitle((await CurrModelVal.value!.getAvailableSettlementTypes())!, 1);

        }
        else {
            //для остальных используются произвольные значения
            availableRegions.value = [];
        }
    }
}, { immediate: true });


const setCountry = (val) => {
    //сброс полей, если изменилась страна
    CurrModelVal.value!.reset();

    CurrModelVal.value!.setCountry(val);
}


</script>

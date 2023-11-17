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
                    @update:model-value="async (val) => { CurrModelVal!.setRegion(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
        </v-row>

        <v-row class="d-flex  justify-center">
            <v-col sm="9">
                <InputField :type="EDataType.string" :state="state" label="Муниципальный Район, Округ"
                    :model-value="CurrModelVal!.getDistrict()"
                    @update:model-value="async (val) => { CurrModelVal!.setDistrict(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
            
        </v-row>

        <v-row class="d-flex  justify-center">
            <v-col sm="4" v-if="CurrModelVal!.getCountry() == dcCountries.RUSSIA">
                <InputField :type="EDataType.strictstring" label="Вид населенного пункта" :state="state"
                    :items="availableSettelmentsTypes" :model-value="CurrModelVal!.getSettlementType()"
                    @update:model-value="async (val) => { CurrModelVal!.setSettlementType(val) }"
                    @blur="(d) => onValChanged()" @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="5">
                <InputField :type="EDataType.string" :state="state" :model-value="CurrModelVal!.getSettlement()"
                    label="Название населенного пункта"
                    @update:model-value="async (val) => { CurrModelVal!.setSettlement(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="3">
                <InputField :type="EDataType.string" :state="state" label="Индекс" :model-value="CurrModelVal!.getZip()"
                    @update:model-value="async (val) => { CurrModelVal!.setZip(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
        </v-row>

        <v-row class="d-flex  justify-start">
            <v-col sm="5">
                <InputField :type="EDataType.string" :state="state" label="Улица, Проспект"
                    :model-value="CurrModelVal!.getStreet()"
                    @update:model-value="async (val) => { CurrModelVal!.setStreet(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>
            <v-col sm="2">
                <InputField :type="EDataType.string" :state="state" label="Дом" :model-value="CurrModelVal!.getBuilding()"
                    @update:model-value="async (val) => { CurrModelVal!.setBuilding(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="2">
                <InputField :type="EDataType.string" :state="state" label="Корпус" :model-value="CurrModelVal!.getCorp()"
                    @update:model-value="async (val) => { CurrModelVal!.setCorp(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
            </v-col>

            <v-col sm="2">
                <InputField :type="EDataType.string" :state="state" label="Квартира" :model-value="CurrModelVal!.getFlat()"
                    @update:model-value="async (val) => { CurrModelVal!.setFlat(val) }" @blur="(d) => onValChanged()"
                    @keydown.stop="(k) => onKeydown(k)" />
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
import { Dictionary } from "~/lib/Dicts/Dictionary";
import * as dcCountries from "~/lib/Dicts/DictCountriesConst";

const { t, locale } = useI18n();

defineOptions({
    inheritAttrs: false,
    customOptions: {}
})


const emit = defineEmits(["update:modelValue", "changed"])

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

const visible = ref(props.tokens ? chkTrait(props.tokens, "r") : true);
const readonly = ref(!(props.tokens ? chkTrait(props.tokens, "u") || chkTrait(props.tokens, "c") : true) || !!props.state?.readonly);
const availableCountries = ref();
const availableRegions = ref();
const availableSettelmentsTypes = ref();



let OldModelVal = ref<AddressEntity>();
let CurrModelVal = ref<AddressEntity>();

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
            CurrModelVal.value = props.modelValue!;
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

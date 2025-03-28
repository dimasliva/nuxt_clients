<template>
    <FormsEditWindowDialog title="Профиль организации компании" :on-save="save" :on-close="close" :readonly="readonly">

        <template #default="{ fieldsOptions }">
            <v-card-text>
                <!-- Раздел для короткого названия организации -->
                <v-row>
                    <v-col cols="12">
                        <InputField :state="fieldsOptions" :type="EDataType.string" label="Короткое название"
                            v-model="rec!.MData.shortTitle" />
                    </v-col>
                </v-row>

                <!-- Раздел для полного названия организации -->
                <v-row>
                    <v-col cols="12">
                        <InputField :state="fieldsOptions" :type="EDataType.string" label="Полное название"
                            v-model="rec!.MData.fullTitle" />
                    </v-col>
                </v-row>

                <!-- Раздел для OID организации -->
                <v-row>
                    <v-col cols="12">
                        <InputField :state="fieldsOptions" :type="EDataType.string" label="OID"
                            v-model="rec!.MData.oid" />
                    </v-col>
                </v-row>
            </v-card-text>
        </template>
    </FormsEditWindowDialog>
</template>


<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ERecLockArg, RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { Container } from 'inversify';
import { CompanyOrganizationRecord, CompanyOrganizationRecordData } from '~/lib/MoApi/Records/CompanyOrganizationRecord';
import FormsEditWindowDialog from '~/components/forms/EditWindowDialog.vue';
import InputField from '~/components/InputField.vue';
import { EDataType } from '~/lib/globalTypes';
import { type IEditFormProps, useEditForm, useEditFormBegin } from '~/componentComposables/editForms/useEditForm';



const props = defineProps<IEditFormProps>();

const { eventsHandler, diC, recStore } = useEditFormBegin(props);

const recKey = ref<string | null>(null);
const rec = ref<CompanyOrganizationRecord>();

defineExpose({ eventsHandler });


const loadFunc = async () => {
    // Загрузка существующей записи или создание новой
    if (props.recKey) {
        rec.value = await recStore.fetch(CompanyOrganizationRecord, props.recKey, ERecLockArg.Try, true);
    }
    else {
        rec.value = await recStore.createNew(CompanyOrganizationRecord, (data) => { });
    }

    return rec;
}


const saveFunc = async () => {
    if (rec.value!.IsNew) {
        await rec.value!.save();
    }
    else {
        await rec.value!.save();
    }
}


const { readonly, close, save } = await useEditForm(loadFunc, saveFunc, false);



</script>

<style scoped>
.v-expansion-panels {
    z-index: auto;
}
</style>
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
import { useEditForm } from '~/componentComposables/editForms/useEditForm';


interface IProps {
    diC?: Container,
    recKey: string | null;
    readonly?: boolean;
}

const props = defineProps<IProps>();

const diC = props.diC || useSessionContainer();
const recStore = diC.get<RecordsStore>("RecordsStore");

const recKey = ref<string | null>(null);
const rec = ref<CompanyOrganizationRecord>();

const eventsHandler = (e: string, d: any) => {
    switch (e) {
        case "onKeydown": return true;
    }
};

defineExpose({ eventsHandler });



// Загрузка существующей записи или создание новой
if (props.recKey) {
    rec.value = await recStore.fetch(CompanyOrganizationRecord, props.recKey, ERecLockArg.Try, true);
}
else {
    rec.value = await recStore.createNew(CompanyOrganizationRecord, (data) => { });
}

const { readonly, close } = await useEditForm(rec, false);


const save = async () => {
    if (rec.value!.IsNew) {
        await rec.value!.save();
    }
    else {
        await rec.value!.save();
    }
}






</script>

<style scoped>
.v-expansion-panels {
    z-index: auto;
}
</style>
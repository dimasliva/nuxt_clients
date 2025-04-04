<template>
    <FormsEditWindowDialog title="Профиль Заказа" :on-save="save" :on-close="close" :readonly="readonly">
        <template #default="{ fieldsOptions }">
            <v-card-text>
                <!-- Основная информация о заказе -->
                <v-row>
                    <v-col cols="4">
                        <InputField :type="EDataType.string" :state="fieldsOptions" label="Организация"
                            v-model="rec!.MData.organization" />
                    </v-col>

                    <v-col cols="4">
                        <InputField :type="EDataType.string" :state="fieldsOptions" label="Договор"
                            v-model="rec!.MData.contract" />
                    </v-col>

                    <v-col cols="4">
                        <InputField :type="EDataType.datetime" :state="fieldsOptions" label="Дата и время создания"
                            v-model="rec!.MData.date" required />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <InputField :type="EDataType.float" :state="fieldsOptions" label="Полная стоимость"
                            :constraints="{ numAfterPoint: 2, fixed: true }" v-model="fullPrice" readonly />
                    </v-col>

                    <v-col cols="3">
                        <InputField :type="EDataType.float" :state="fieldsOptions" label="Оплата" numAfterPoint="2"
                            :constraints="{ numAfterPoint: 2, fixed: true }" v-model="payment" readonly />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="6">
                        <InputField :type="EDataType.text" :state="fieldsOptions" label="Комментарии"
                            :constraints="{ max: 2048 }" v-model="recSd!.MData.comments" />
                    </v-col>
                </v-row>

                <!-- Связанные клиенты -->
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-title>Связанные клиенты</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-list>
                                <v-list-item v-for="(client, index) in rec!.MData.clients" :key="index">
                                    {{ client }}
                                </v-list-item>
                            </v-list>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>

                <!-- Связанные сделки -->
                <v-expansion-panels class="mt-4">
                    <v-expansion-panel>
                        <v-expansion-panel-title>Связанные сделки</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-list>
                                <v-list-item v-for="(deal, index) in rec!.MData.deals" :key="index">
                                    {{ deal }}
                                </v-list-item>
                            </v-list>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>
        </template>
    </FormsEditWindowDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ERecLockArg, RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import { DealOrderRecord } from '~/src/common/lib/MoApi/Records/DealOrderRecord';
import { EDataType } from '~/src/common/lib/globalTypes';
import InputField from '~/src/widgets/Layers/InputField.vue';
import { useEditForm, useEditFormBegin } from '~forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';
import { DealOrderSdRecord } from '~/src/common/lib/MoApi/Records/DealOrderSdRecord';
import { useCurrency } from '~/src/common/composables/useCurrency';
import type { Container } from 'inversify';
import type { IProfileDialogProps } from './types';



const props = defineProps<IProfileDialogProps>();
const { eventsHandler, diC, recStore } = useEditFormBegin(props);

defineExpose({ eventsHandler });

const rec = ref<DealOrderRecord>();
const recSd = ref<DealOrderSdRecord>();
const { currencyM2V } = useCurrency();
const title = computed(() => props.recKey ? 'Редактирование заказа' : 'Новый заказ');
const fullPrice = computed(() => currencyM2V(rec.value!.MData.fullPrice || 0));
const payment = computed(() => currencyM2V(rec.value!.MData.payment || 0));


// Загрузка существующей записи или создание новой
const loadFunc = async () => {
    if (props.recKey) {
        rec.value = await recStore.fetch(DealOrderRecord, props.recKey, ERecLockArg.Try, true);
        let recs = await recStore.getRecordsM([
            { id: { key: props.recKey, type: DealOrderSdRecord }, optional: true }
        ]);

        recSd.value = recs[0] as DealOrderSdRecord;
    }
    else {
        rec.value = await recStore.createNew(DealOrderRecord, (data) => { });
        recSd.value = await recStore.createNew(DealOrderSdRecord, (data) => { });
    }
    return rec;
}


const saveFunc = async () => {
    if (rec.value!.IsNew) {
        await rec.value!.save();
        recSd.value!.Key = rec.value!.Key;
    }
    else {
        await rec.value!.save();
    }

    await recSd.value!.save();
}

const { readonly, close, save } = await useEditForm(loadFunc, saveFunc, props.readonly);

</script>

<style scoped>
.v-expansion-panels {
    background-color: transparent;
}
</style>
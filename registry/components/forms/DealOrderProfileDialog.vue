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
                        <InputField :type="EDataType.datetime" :state="fieldsOptions" label="Дата и время создания" v-model="rec!.MData.date"
                            required />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <InputField :type="EDataType.float" :state="fieldsOptions" label="Полная стоимость" :constraints="{ numAfterPoint: 2, fixed: true }"
                            v-model="fullPrice" readonly />
                    </v-col>

                    <v-col cols="3">
                        <InputField :type="EDataType.float" :state="fieldsOptions" label="Оплата" numAfterPoint="2" :constraints="{ numAfterPoint: 2, fixed: true }"
                        v-model="payment" readonly />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="6">
                        <InputField :type="EDataType.text" :state="fieldsOptions" label="Комментарии" :constraints="{ max: 2048}"
                            v-model="recSd!.MData.comments" />
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
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { DealOrderRecord } from '~/lib/MoApi/Records/DealOrderRecord';
import { EDataType } from '~/lib/globalTypes';
import InputField from '~/components/InputField.vue';
import { useEditForm } from '~/componentComposables/editForms/useEditForm';
import { DealOrderSdRecord } from '~/lib/MoApi/Records/DealOrderSdRecord';
import { useCurrency } from '~/componentComposables/useCurrency';

interface Props {
    recKey: string | null;
    readonly?: boolean;
}

const props = defineProps<Props>();

const diC = useContainer();
const recStore = diC.get(RecordsStore);
const rec = ref<DealOrderRecord>();
const recSd = ref<DealOrderSdRecord>();

const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};

defineExpose({ eventsHandler });

// Загрузка существующей записи или создание новой
if (props.recKey) {
    let recs = await recStore.getRecordsM([
        { id: { key: props.recKey, type: DealOrderRecord } },
        { id: { key: props.recKey, type: DealOrderSdRecord }, optional: true }
    ]);

    rec.value = recs[0] as DealOrderRecord;
    recSd.value = recs[1] as DealOrderSdRecord;
}
else {
    rec.value = await recStore.createNew(DealOrderRecord, (data) => { });
    recSd.value = await recStore.createNew(DealOrderSdRecord, (data) => { });
}


const { isRecLock, readonly, close } = await useEditForm(rec, props.readonly);
const { currencyM2V } = useCurrency();


const title = computed(() => props.recKey ? 'Редактирование заказа' : 'Новый заказ');
const fullPrice = computed(() => currencyM2V(rec.value!.MData.fullPrice ||0));
const payment = computed(() => currencyM2V(rec.value!.MData.payment ||0));

const save = async () => {
    if (rec.value!.IsNew) {
    await rec.value!.save();
    recSd.value!.Key = rec.value!.Key;
  }
  else {
    await rec.value!.save();
  }

  await recSd.value!.save();
}

</script>

<style scoped>
.v-expansion-panels {
    background-color: transparent;
}
</style>
<template>
  <FormsEditWindowDialog title="Профиль элемента расписания" :on-save="save" :on-close="close" :readonly="readonly">
    <template #default="{ fieldsOptions }">
      <v-card-text>
        <v-row class="mt-1">
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.string" v-model="rec!.MData.title"
            label="Название" />
        </v-row>

        <v-row>
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.string" v-model="rec!.MData.code"
            label="Код" />
        </v-row>

        <v-row>
          <InputField :state="fieldsOptions" class="pb-4" :type="EDataType.string" v-model="rec!.MData.description"
            label="Описание" />
        </v-row>

      </v-card-text>
    </template>
  </FormsEditWindowDialog>>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useI18n } from "vue-i18n";
import { Container } from 'inversify';
import { ERecLockArg, RecordsStore } from '~/src/common/lib/MoApi/Records/RecordsStore';
import { ScheduleItemGroupRecord } from '~/src/common/lib/MoApi/Records/ScheduleItemGroupRecord';
import { useEditForm } from '~forms/WindowDialogs/~sub/EditWindowDialogs/~composables/useEditForm';
import InputField from '~/src/widgets/Layers/InputField.vue';
import { EDataType } from '~/src/common/lib/globalTypes';

const { t, locale } = useI18n();


interface IProps {
  diC?: Container;
  recKey: string | null;
  rec?: ScheduleItemGroupRecord,
  readonly?: boolean
}

const props = defineProps<IProps>();

const diC = props.diC || useSessionContainer();
const recStore = diC.get<RecordsStore>("RecordsStore");

const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};

defineExpose({ eventsHandler });

let rec = ref<ScheduleItemGroupRecord>();

if (props.recKey) {
  rec.value = await recStore.fetch(ScheduleItemGroupRecord, props.recKey, ERecLockArg.Try, true);
} else {
  rec.value = await recStore.createNew(ScheduleItemGroupRecord, (data) => { });
}

const { readonly, close } = await useEditForm(rec, props.readonly);


const save = async () => {
  if (rec.value!.IsNew) {
    await rec.value!.save();
  } else {
    await rec.value!.save();
  }
}

const cancelModifingData = () => {
  rec.value!.cancelModifingData();
}
</script>

<style scoped>
.v-expansion-panels {
  z-index: auto;
}
</style>
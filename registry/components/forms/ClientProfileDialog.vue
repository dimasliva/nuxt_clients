<template>
  <v-card width="700" style="height: 80dvh;">
    <v-card-title class="mx-2">
      <v-row class="pa-4">
        <div class="text-h5 ma-2">Профиль клиента</div>
        <v-spacer></v-spacer>
        <img class="mr-4 mt-2 bg-secondary rounded-circle" height="50" width="50" src="doctor-test.jpg" />
        <v-icon @click="closeDialog(console.log())">mdi-close</v-icon>
      </v-row>
    </v-card-title>
    <v-card-text>
      <v-row class="pa-6">
        <v-col sm="4">
          <v-text-field label="Фамилия" v-model="rec.MData.surname" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иванов" density="compact" v-maska:[fioMaskOptions] />
        </v-col>

        <v-col sm="4">
          <v-text-field label="Имя" v-model="rec.MData.name" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иван" density="compact" :rules="[(v: string) => !!v || $t('required')]"
            v-maska:[fioMaskOptions] />
        </v-col>

        <v-col sm="4">
          <v-text-field label="Отчество" v-model="rec.MData.patronymic" clearable autofocus required maxlength="128"
            variant="underlined" placeholder="Иванович" density="compact" v-maska:[fioMaskOptions] />
        </v-col>

      </v-row>
    </v-card-text>
    <v-card-actions class="mr-4 mb-1">
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="text" @click="rec.cancelModifingData(); closeDialog(null)">
        {{ $t('close') }}
      </v-btn>
      <v-btn color="primary" variant="text" @click="onSaveBtnClick()">
        Сохранить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
 
<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { RecordsStore } from '~/lib/MoApi/Records/RecordsStore';
import { PageMap } from '~/lib/PageMap';
import { UserContext } from '~/lib/UserContext';
import { ClientRecord } from '~/lib/MoApi/Records/ClientRecord'


interface IProps {
  recKey: string | null;
}

const props = defineProps<IProps>();

const iocc = useContainer();
const userCtx = iocc.get<UserContext>('UserContext');
const pageMap = iocc.get<PageMap>("PageMap");
const recStore = iocc.get(RecordsStore);

const fioMaskOptions = {
  mask: "Aa",
  tokens: { A: { pattern: /[A-я]/, transform: (chr: string) => chr.toUpperCase() }, a: { pattern: /[a-я]/, multiple: true } }
}

const rec = ref(props.recKey ? await recStore.fetch(ClientRecord, props.recKey) : await recStore.createNew(ClientRecord, (data) => { }));


const onSaveBtnClick= async ()=>{
  await rec.value.save(); 
  closeDialog(rec.value.Key)
}

const eventsHandler = (e: string, d: any) => {
  switch (e) {
    case "onKeydown": return true;
  }
};


defineExpose({ eventsHandler });




</script>
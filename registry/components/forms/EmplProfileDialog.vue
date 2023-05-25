<template>
 <v-card width="700">
  <v-card-title>
    <v-row class="pa-4">
      <div class="text-h5 ma-2">Карточка сотрудника</div>
      <v-spacer></v-spacer>
      <img class="ma-2 bg-secondary rounded-circle" height="100" width="100" src="@/doctor-test.jpg"/>
    </v-row>
  </v-card-title>
  <v-card-text>
    <v-container>
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field label="Имя" clearable v-model="empName" variant="underlined" placeholder="Иван" density="compact" :rules="[(v: string) => !!v || $t('required')]">
            <template v-slot:append-inner>
              <input v-model="empName" v-maska data-maska="Aa" data-maska-tokens="A:[А-Я]|a:[а-я]:multiple" class="w-100"/>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Фамилия" clearable v-model="empSurname" variant="underlined" placeholder="Иванов" density="compact" :rules="[(v: string) => !!v || $t('required')]">
            <template v-slot:append-inner>
              <input v-model="empSurname" v-maska data-maska="Aa" data-maska-tokens="A:[А-Я]|a:[а-я]:multiple" class="w-100"/>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Отчество" clearable v-model="empPatronymic" variant="underlined" placeholder="Иванович" density="compact" :rules="[(v: string) => !!v || $t('required')]">
            <template v-slot:append-inner>
              <input v-model="empPatronymic" v-maska data-maska="Aa" data-maska-tokens="A:[А-Я]|a:[а-я]:multiple" class="w-100"/>
            </template>
          </v-text-field>
        </v-col>
        <!-- <v-col cols="12" sm="6">
          <v-text-field clearable v-model="empPhone" placeholder="+7(...) ...-..-.." label="Телефон" variant="underlined" density="compact" :rules="[(v: string) => !!v || $t('required')]">
            <template v-slot:append-inner>
              <input v-model="empPhone" v-maska data-maska="+7(###) ###-##-##" class="w-100"/>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field v-model="empEmail" label="Email" variant="underlined" density="compact" :rules="[(v: string) => !!v || $t('required'), (v: string) => (/.+@.+\..+/.test(v)) || $t('vemail')]"></v-text-field>
        </v-col> -->
        <v-col cols="12" sm="6">
          <v-text-field variant="underlined" :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'" density="compact"  @click:append-inner="show = !show" label="Пароль" :type="show ? 'text' : 'password'"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <VueDatePicker v-model="empBirthdate" :enable-time-picker="false" model-type="yyyy-MM-dd" locale="ru" auto-apply >
            <template #trigger>
              <v-text-field v-model="empBirthdate" type="date" variant="underlined" :rules="[(v: string) => !!v || $t('required')]" required clearable>
                <template v-slot:label>
                  <span>
                    {{ $t('emplBirthdate') }}
                  </span>
                </template>
              </v-text-field>
            </template>
          </VueDatePicker>
        </v-col>
        <v-col cols="12" sm="6">
          <v-select v-model="empGender" label="Пол" :items="['м','ж']" variant="underlined"></v-select>
        </v-col>
      </v-row>
    </v-container>
  </v-card-text>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn color="blue-darken-1" variant="text" @click="closeDialog(console.log('closed'))">
      {{ $t('close') }}
    </v-btn>
    <v-btn color="blue-darken-1" variant="text" @click="actionEmpl(empName, empSurname, empPatronymic, empGender)">
      {{ $t('ok') }}
    </v-btn>
  </v-card-actions>
</v-card>
</template>

<script setup lang="ts">
import { uid4 } from '~~/utils/uid';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

interface Employee {
  name: string;
  surname: string;
  patronymic: string;
  gender: string;
  birthdate: string;
  phone: string;
  email: string;
  id: number;
}

interface Props {
  dialog: boolean;
  empl: Employee;
  action: (name: string, surname: string, patronymic: string, gender: string) => void;
}
const props = defineProps<Props> ()

let show = ref(false)
let empName = ref(props.empl.name)
let empSurname = ref(props.empl.surname)
let empPatronymic = ref(props.empl.patronymic)
let empPhone = ref(props.empl.phone)
let empBirthdate = ref(props.empl.birthdate)
let empGender = ref(props.empl.gender)
let empEmail = ref(props.empl.email)
let empId = ref(props.empl.id)



const actionEmpl = ( name, surname, patronymic, gender) =>{
props.action(name, surname, patronymic, gender);
closeDialog(console.log('done'));
}

</script>
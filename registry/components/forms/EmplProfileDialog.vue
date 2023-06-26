<template>
  <v-card width="700">
   <v-card-title class="mx-2">
     <v-row class="pa-4">
       <div class="text-h5 ma-2">{{ props.header }}</div>
       <v-spacer></v-spacer>
       <img class="mr-4 mt-2 bg-secondary rounded-circle" height="50" width="50" src="@/doctor-test.jpg"/>
       <v-icon @click="closeDialog(console.log('closed'))">mdi-close</v-icon>
     </v-row>
    </v-card-title>
    <v-card-text>
     <v-form  v-model="form" @submit.prevent="actionEmpl">
      <v-container>
        <v-row class="pa-6">
          <v-col cols="12" sm="6">
            <v-text-field label="Имя" clearable v-model="empName" autofocus required maxlength="128" variant="underlined" placeholder="Иван" density="compact" :rules="[(v: string) => !!v || $t('required')]">
              <template v-slot:append-inner>
                <input v-model="empName" @input="empName = translit(empName).charAt(0).toUpperCase() + translit(empName).slice(1).toLowerCase()" v-maska data-maska="Aa" data-maska-tokens="A:[A-я;,.']|a:[a-я;.,']:multiple" class="w-100"/>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Фамилия" clearable v-model="empSurname" required maxlength="128" variant="underlined" placeholder="Иванов" density="compact" :rules="[(v: string) => !!v || $t('required')]">
              <template v-slot:append-inner>
                <input v-model="empSurname"  @input="empSurname = translit(empSurname).charAt(0).toUpperCase() + translit(empSurname).slice(1).toLowerCase()" v-maska data-maska="Aa" data-maska-tokens="A:[A-я;,.']|a:[a-я;,.']:multiple" class="w-100"/>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Отчество" clearable v-model="empPatronymic" maxlength="128" variant="underlined" placeholder="Иванович" density="compact">
              <template v-slot:append-inner>
                <input v-model="empPatronymic"  @input="empPatronymic = translit(empPatronymic).charAt(0).toUpperCase() + translit(empPatronymic).slice(1).toLowerCase()" v-maska data-maska="Aa" data-maska-tokens="A:[A-я;,.']|a:[a-я;,.']:multiple" class="w-100"/>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="empEmail" label="Email" placeholder="ivanov@mail.com" required maxlength="64" variant="underlined" density="compact" :rules="[(v: string) => !!v || $t('required'), (v: string) => (/.+@.+\..+/.test(v)) || $t('vemail')]"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field clearable v-model="empPhone" placeholder="+7(999) 999-99-99" required maxlength="24" label="Телефон" variant="underlined" density="compact" :rules="[(v: string) => !!v || $t('required')]">
              <template v-slot:append-inner>
                <input v-model="empPhone" v-maska data-maska="+7(###) ###-##-##" class="w-100"/>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Логин" :disabled="!addAccount" clearable v-model="empLogin" @click:control="empLogin = empEmail" :required="addAccount" maxlength="128" variant="underlined" placeholder="Ivan001" density="compact" :rules="addAccount?[(v: string) => !!v || $t('required')]: undefined">
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <VueDatePicker v-model="empBirthdate" :enable-time-picker="false"  model-type="yyyy-MM-dd" locale="ru" auto-apply teleport-center>
              <template #trigger>
                <v-text-field v-model="empBirthdate" density="compact" type="date" variant="underlined" :rules="[(v: string) => !!v || $t('required')]" required clearable>
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
            <v-select v-model="empGender" density="compact" label="Пол" :items="[m, f]" variant="underlined"></v-select>
          </v-col>
        </v-row>
        <v-checkbox class="ml-4" v-if="adding" label="создать аккаунт" v-model="addAccount" color="primary"></v-checkbox>
      </v-container>
    </v-form>
  </v-card-text>
   <v-card-actions class="mr-4 mb-1">
     <v-spacer></v-spacer>
     <v-btn color="primary" variant="text" @click="closeDialog(console.log('closed'))">
       {{ $t('close') }}
     </v-btn>
     <v-btn :disabled="!form" color="primary" @click="() => {console.log( empPhone.replace(/[+() --]/g, '').trim())}" variant="text" type="submit">
       {{ props.button }}
     </v-btn>
   </v-card-actions>
 </v-card>
 </template>
 
 <script setup lang="ts">
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
   action: (name: string, surname: string, patronymic: string, gender: string, phone: string, email: string) => void;
   header: string;
   button: string;
   adding: boolean;
 }
 const props = defineProps<Props> ()

let addAccount = ref(props.adding? false : true)
let form = ref(false)
let show = ref(false)
let empName = ref(props.empl.name)
let empSurname = ref(props.empl.surname)
let empPatronymic = ref(props.empl.patronymic)
let empPhone = ref(props.empl.phone)
let empBirthdate = ref(props.empl.birthdate)
let empGender = ref(props.empl.gender)
let empEmail = ref(props.empl.email)
let empId = ref(props.empl.id)
let empLogin = ref('')
let m = ref('м')
let f = ref('ж')

let translit = (word) => {
   const converter = {
     'a': 'ф', 'b': 'и', 'v': 'м', 'g': 'п', 'd': 'в',
     'e': 'у', 'z': 'я', 'i': 'ш', 'y': 'н', 'k': 'л',
     'l': 'д', 'm': 'ь', 'n': 'т', 'o': 'щ', 'p': 'з',
     'r': 'к', 's': 'ы', 't': 'е', 'u': 'г', 'f': 'а',
     'h': 'р', 'c': 'с', 'j': 'о', 'w': 'ц', ';': 'ж',
     "'": 'э', ',': 'б', "x": "ч", 'q': 'й', '.': 'ю'
   };
 
   for (const [key, value] of Object.entries(converter)) {
     word = word.replaceAll(key, value);
   }
 
   return word;
}
 
const actionEmpl = () =>{
props.action(empName.value, empSurname.value, empPatronymic.value, empGender.value, empPhone.value.replace(/[+() --]/g, '').trim(), empEmail.value);
closeDialog(console.log('done'));
}
 
 </script>
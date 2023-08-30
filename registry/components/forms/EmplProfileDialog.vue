<template>
  <v-card width="700">
   <v-card-title class="mx-2">
     <v-row class="pa-4">
       <div class="text-h5 ma-2">{{ props.header }}</div>
       <v-spacer></v-spacer>
       <img class="mr-4 mt-2 bg-secondary rounded-circle" height="50" width="50" src="/doctor-test.jpg"/>
       <v-icon @click="closeDialog(console.log())">mdi-close</v-icon>
     </v-row>
    </v-card-title>
    <v-card-text>
     <v-form  v-model="form" @submit.prevent="actionEmpl">
      <v-container>
        <v-row class="pa-6">
          <v-col cols="12" sm="6">
            <v-text-field label="Имя" clearable v-model="empName" v-maska:[fioOptions] :autofocus="updProf" :disabled="!updProf" required maxlength="128" variant="underlined" placeholder="Иван" density="compact" :rules="[(v: string) => !!v || $t('required')]" @input="empName = translit(empName).charAt(0).toUpperCase() + translit(empName).slice(1).toLowerCase()"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Фамилия" clearable v-model="empSurname" v-maska:[fioOptions] :disabled="!updProf" required maxlength="128" variant="underlined" placeholder="Иванов" density="compact" :rules="[(v: string) => !!v || $t('required')]" @input="empSurname = translit(empSurname).charAt(0).toUpperCase() + translit(empSurname).slice(1).toLowerCase()"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Отчество" clearable v-model="empPatronymic" v-maska:[fioOptions] :disabled="!updProf" maxlength="128" variant="underlined" placeholder="Иванович" density="compact" @input="empPatronymic = translit(empPatronymic).charAt(0).toUpperCase() + translit(empPatronymic).slice(1).toLowerCase()"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="empEmail" label="Email" :disabled="!updCont" placeholder="ivanov@mail.com" required maxlength="64" variant="underlined" density="compact" :rules="[(v: string) => !!v || $t('required'), (v: string) => (/.+@.+\..+/.test(v)) || $t('vemail')]"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field clearable v-model="empPhone" :disabled="!updCont" placeholder="+7(999) 999-99-99" v-maska:[phoneOptions] required maxlength="24" label="Телефон" variant="underlined" density="compact" :rules="[(v: string) => !!v || $t('required')]"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-if="crtEmpl&&adding">
            <v-text-field label="Логин" :disabled="!addAccount" clearable v-model="empLogin" @click:control="empLogin = empEmail" :required="addAccount" maxlength="128" variant="underlined" placeholder="Ivan001" density="compact" :rules="addAccount?[(v: string) => !!v || $t('required')]: undefined"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <VueDatePicker v-model="empBirthdate" :enable-time-picker="false"  model-type="yyyy-MM-dd" locale="ru" auto-apply teleport-center>
              <template #trigger>
                <v-text-field v-model="empBirthdate" density="compact" type="date" :disabled="!updProf" variant="underlined" :rules="[(v: string) => !!v || $t('required')]" required clearable>
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
            <v-select v-model="empGender" density="compact" label="Пол" :disabled="!updProf" :items="[{gender: 'м', val: 'm'}, {gender: 'ж', val: 'f'}]" item-title="gender" item-value="val" variant="underlined"></v-select>
          </v-col>
          <v-col v-if="specEmpl" cols="12" sm="6">
            <v-select v-model="empRole" density="compact" label="Роль" :disabled="!updProf" :items="roles" variant="underlined" multiple></v-select>
          </v-col>
        </v-row>
        <v-checkbox class="ml-4" v-if="adding" label="создать аккаунт" v-model="addAccount" color="primary"></v-checkbox>
      </v-container>
    </v-form>
  </v-card-text>
   <v-card-actions class="mr-4 mb-1">
     <v-spacer></v-spacer>
     <v-btn color="primary" variant="text" @click="closeDialog(console.log())">
       {{ $t('close') }}
     </v-btn>
     <v-btn :disabled="!form" v-if="updProf" color="primary" @click="() => {actionEmpl()}" variant="text" type="submit">
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
   mainPhone: string;
   mainEmail: string;
   id: string;
 }

 interface Rights {
  empProfRights : string;
  empContRights : string;
 }

 interface ExtraInfo {
   gender: string;
   birthdate: any;
   roles: string;
 }
 
 interface Props {
   rights: Rights;
   empl: Employee;
   extr: ExtraInfo;
   action: (name: string, surname: string, patronymic: string, gender: string, birthdate: string, roles: string, mainPhone: string, mainEmail: string, id: string, login?: string) => void;
   header: string;
   button: string;
   adding: boolean;
   compRoles: Array<string>
 }
 const props = defineProps<Props> ()

const phoneOptions = {
  mask: "+7(###) ###-##-##"
}

const fioOptions = {
  mask: "Aa",
  tokens: {
    A:{pattern: /[A-я;,.']/},
    a:{pattern: /[a-я;,.']/, multiple: true}
  }
}

let addAccount = ref(props.adding? false : true)
let form = ref(false)
let show = ref(false)
let empName = ref(props.empl.name)
let empSurname = ref(props.empl.surname)
let empPatronymic = ref(props.empl.patronymic)
let empPhone = ref(props.empl.mainPhone)
let empBirthdate = ref(props.extr.birthdate? props.extr.birthdate.slice(0, 10) : props.extr.birthdate)
let empEmail = ref(props.empl.mainEmail)
let empId = ref(props.empl.id)
let empLogin = ref<any>(props.adding?'':null)
let empGender = ref(props.extr.gender)
let empRole = ref<any>(typeof props.extr.roles == 'string'?props.extr.roles.split(','):props.extr.roles)
let updProf = ref(props.rights.empProfRights.includes('u'))
let updCont = ref(props.rights.empContRights.includes('u'))
let crtEmpl = ref(props.rights.empContRights.includes('c') && props.rights.empProfRights.includes('c'))
let specEmpl = ref(props.rights.empContRights.includes('s') && props.rights.empProfRights.includes('s'))

let roles = ref(props.compRoles)

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
props.action(empName.value, empSurname.value, empPatronymic.value, empGender.value, new Date(empBirthdate.value).toISOString(), empRole.value.toString(), empPhone.value.replace(/[+() --]/g, '').trim(), empEmail.value, empId.value, empLogin.value);
closeDialog(console.log(empRole.value));
}
 </script>
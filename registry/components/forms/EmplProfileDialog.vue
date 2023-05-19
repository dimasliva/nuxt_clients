<template>
 <v-card>
  <v-card-title>
    <span class="text-h5">Карточка сотрудника</span>
  </v-card-title>
  <v-card-text>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field label="ФИО" v-model="empName"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="empPhone" label="Телефон"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="empEmail" label="Email" :rules="[(v: string) => !!v || $t('required'), (v: string) => (/.+@.+\..+/.test(v)) || $t('vemail')]"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"  @click:append="show = !show" label="Пароль" :type="show ? 'text' : 'password'"></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-card-text>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn color="blue-darken-1" variant="text" @click="closeDialog(console.log('closed'))">
      {{ $t('close') }}
    </v-btn>
    <v-btn color="blue-darken-1" variant="text" @click="actionEmpl(empName, empPhone, empEmail, empId)">
      {{ $t('ok') }}
    </v-btn>
  </v-card-actions>
</v-card>
</template>

<script setup lang="ts">
interface Employee {
  name: string;
  phone: string;
  email: string;
  id: number;
}

interface Props {
  dialog: boolean;
  empl: Employee;
  action: (name: string, phone: string, email: string, id: number) => void;
}
const props = defineProps<Props> ()

let show = ref(false)
let empName = ref(props.empl.name)
let empPhone = ref(props.empl.phone)
let empEmail = ref(props.empl.email)
let empId = ref(props.empl.id)



const actionEmpl = (name, phone, email, id) =>{
props.action(name, phone, email, id);
closeDialog(console.log('done'));
}

</script>
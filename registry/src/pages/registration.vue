<template>
  <v-sheet class="d-flex align-center bg-background" height="100vh">
    <v-card class="mx-auto rounded-lg" elevation="10" width="600" border="md">
      <v-row class="bg-primary ma-0 pa-1" justify="center">
        <div class="text-h3">{{ $t('registry') }}</div>
      </v-row>
      <div class="d-flex flex-row-reverse ma-0 pa-0">
        <v-select v-model="$i18n.locale" :items="['ru', 'en']" style="max-width: 95px;" prepend-inner-icon="mdi-earth"
          density="compact" class="ma-4 " variant="solo">
        </v-select>
      </div>
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-row class="pa-6">
          <v-col v-for="items in fields" cols="12" sm="6">
            <v-text-field variant="underlined" v-model=items.field :readonly="loading" :rules=items.rules required
              clearable class="ma-1" v-on:keyup.enter="$event.target.blur()" @click="errR = false">
              <template v-slot:label>
                <span>
                  {{ $t(items.title) }} <span class="text-info">{{ items.star }}</span>
                </span>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <VueDatePicker v-model="date" :enable-time-picker="false" model-type="yyyy-MM-dd" locale="ru" auto-apply >
              <template #trigger>
                <v-text-field v-model="date" type="date" variant="underlined" :readonly="loading" :rules="rules" required clearable>
                  <template v-slot:label>
                    <span>
                      {{ $t('birthdate') }} <span class="text-info">*</span>
                    </span>
                  </template>
                </v-text-field>
              </template>
            </VueDatePicker>
          </v-col>
        </v-row>
        <p v-if="errR" class="text-red-darken-4 text-center">{{ errRegText }}</p>
        <v-row justify="end">
          <v-btn :disabled="!form" :loading="loading" inline color="primary" variant="elevated" class="ma-6" type="submit">
            {{ $t('signin') }}
          </v-btn>
        </v-row>
        <v-row justify="center">

          <v-dialog v-model="codeField" width="600px" persistent>
            <v-card>
              <v-card-text class="text-center">
                {{ $t('codeinfo') }}
                <v-row class="pa-2 ma-2">
                  <v-text-field variant="underlined" v-model="confCode" required :rules="codeRule" clearable
                    @click="errC = false">
                    <template v-slot:label>
                      <span>
                        {{ $t('codeinput') }}
                      </span>
                    </template>
                  </v-text-field>
                </v-row>
              </v-card-text>
              <p v-if="errC" class="text-red-darken-4 text-center ma-0 pa-0">{{ errConfText }}</p>
              <v-card-actions>
                <p class="ma-4 pa-1">
                  {{ seconds >= 60 ? Math.floor(seconds / 60) : 0 }}:{{ seconds < 10 ? "0" + seconds : (seconds % 60 < 10
                    ? "0" + seconds % 60 : seconds % 60) }} </p>
                    <v-spacer></v-spacer>
                    <v-btn class="ma-2" color="primary" variant="elevated" @click="codeField = false, loading = false, confCode =('') ">{{
                      $t('cancel')
                    }}</v-btn>
                    <v-btn class="ma-2" color="primary" variant="elevated" @click="confirm" :disabled="!confCode">{{
                      $t('ok') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="confField" width="600px" persistent>
            <v-card>
              <v-card-text class="text-center">
                Вы успешно зарегестрировали компанию!<br>Нажмите на кнопку для перехода на страницу авторизации.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="ma-2" color="primary" variant="elevated" @click="navigateTo('/signin')">{{
                  $t('ok') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';
import * as U from "~/src/common/lib/Utils";

const { t } = useI18n()
let form = ref(false)
let errR = ref(false)
let errC = ref(false)
let loading = ref(false)
let date = ref()
let codeField = ref(false)
let confField = ref(false)
let seconds = ref(0)
let confCode = ref("")
let errRegText = ref("")
let errConfText = ref("")

let login = ref('')
let password = ref('')
let companyTitle = ref('')
let companyFullTitle = ref('')
let emplName = ref('')
let emplSurname = ref('')
let emplPatronymic = ref('')
let email = ref('')

let fields = ref([
  { field: login, star: "*", title: "login", rules: [(v: string) => !!v || t('required'), (v: string) => v.length >= 4 || t('vlogin', [4])] },
  { field: password, star: "*", title: "password", rules: [(v: string) => !!v || t('required'), (v: string) => v.length >= 6 || t('vpass', [6])] },
  { field: companyTitle, star: "*", title: "companyTitle", rules: [(v: string) => !!v || t('required'),] },
  { field: companyFullTitle, star: "*", title: "companyFullTitle", rules: [(v: string) => !!v || t('required'),] },
  { field: emplName, star: "*", title: "emplName", rules: [(v: string) => !!v || t('required')] },
  { field: emplSurname, star: "*", title: "emplSurname", rules: [(v: string) => !!v || t('required')] },
  { field: emplPatronymic, title: "emplPatronymic" },
  { field: email, star: "*", title: "email", rules: [(v: string) => !!v || t('required'), (v: string) => (/.+@.+\..+/.test(v)) || t('vemail')] },
])

const timer =
  setInterval(() => {
    if (seconds.value > 0) {
      seconds.value--
    } else {
      codeField.value = false
      loading.value = false
    }
  }, 1000);

const iocc = useContainer();
const apiClient = iocc.get<MoApiClient>("MoApiClient");

const onSubmit = async () => {

  if (!form) return

  let regData = {
    "email": email.value,
    "login": login.value,
    "password": await U.getPasswordHash(password.value),
    "companyTitle": companyTitle.value,
    "companyFullTitle": companyFullTitle.value,
    "emplName": emplName.value,
    "emplSurname": emplSurname.value,
    "emplPatronymic": emplPatronymic.value,
    "emplBirthdate": (date.value)
  }
  try {
    let data = await apiClient.registerPending(regData)
    seconds.value = data.lifeTime
    codeField.value = true
  } catch (error: any) {
    console.log(error)
    errRegText.value = t(error.code)
    errR.value = true
  }

  codeField.value == true ? loading.value = true : errR.value = true

}

const confirm = async () => {

  let confData = {
    "login": login.value,
    "code": confCode.value
  }

  try {
    let data = await apiClient.registerConfirmation(confData)
    if (data) {
      codeField.value = false
      confField.value = true
    } else {
      errConfText.value = "Код введен неверно"
      errC.value = true
    }
  } catch (error: any) {
    errConfText.value = t(error.code)
    errC.value = true
  }

}

let codeRule = ref([
  (v: string) => !!v || t('required')
])

let rules = ref([
  (v: string) => !!v || t('required'),
  (v: string) => (/^(?:19|20)\d{2}-\d\d-\d\d$/.test(v)) || t('vbirthday')
])

definePageMeta({
  layout: false,
});

defineExpose({
  form,
  errR,
  loading,
  fields,
  date
})
</script>


<template>
        <v-form v-model="form" @submit.prevent="onSubmit" class="w-50">
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
                        {{ $t('emplBirthdate') }} <span class="text-info">*</span>
                      </span>
                    </template>
                  </v-text-field>
                </template>
              </VueDatePicker>
            </v-col>
          </v-row>
          <p v-if="errR" class="text-red-darken-4 text-center">{{ errRegText }}</p>
          <v-row justify="start">
            <v-btn :disabled="!form" :loading="loading" inline color="primary" variant="elevated" class="ma-6"
              type="submit">
              Создать
            </v-btn>
          </v-row>
        </v-form>
  </template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { MoApiClient } from '~/src/common/lib/MoApi/MoApiClient';

const { t } = useI18n()
let form = ref(false)
let errR = ref(false)
let loading = ref(false)
let date = ref()
let codeField = ref(false)
let seconds = ref(0)
let errRegText = ref("")

let login = ref('')
let password = ref('')
let companyTitle = ref('')
let companyFullTitle = ref('')
let emplName = ref('')
let emplSurname = ref('')
let emplPatronymic = ref('')
let email = ref('')

let fields = ref([
  { field: emplName, star: "*", title: "emplName", rules: [(v: string) => !!v || t('required')] },
  { field: emplSurname, star: "*", title: "emplSurname", rules: [(v: string) => !!v || t('required')] },
  { field: emplPatronymic, title: "emplPatronymic" },
  { field: email, star: "*", title: "email", rules: [(v: string) => !!v || t('required')] },
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
    "password": password.value,
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

let codeRule = ref([
  (v: string) => !!v || t('required')
])

let rules = ref([
  (v: string) => !!v || t('required'),
  (v: string) => (/^(?:19|20)\d{2}-\d\d-\d\d$/.test(v)) || t('vbirthday')
])

defineExpose({
  form,
  errR,
  loading,
  fields,
  date
})
</script>


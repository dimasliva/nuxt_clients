<template>
  <v-sheet class="d-flex align-center bg-background" height="100vh">
    <v-card class="mx-auto rounded-lg" elevation="10" width="600" border="md">
      <v-row class="bg-primary ma-0 pa-1" justify="center">
        <div class="text-h3">{{ $t('registry') }}</div>
      </v-row>
      <div class="d-flex flex-row-reverse ma-0 pa-0">
        <v-select v-model="$i18n.locale" :items="['ru']" style="max-width: 95px;" prepend-inner-icon="mdi-earth"
        density="compact" class="ma-4 " variant="solo">
      </v-select>
    </div>
      <v-form v-model="form" @submit.prevent="onSubmit">
        
        <v-row class="pa-6">
          
          <v-col
          v-for="items in fields"
          cols="12"
          sm="6"
          >
          <v-text-field
          variant="underlined" v-model=items.field :readonly="loading" :rules=items.rules required clearable class="ma-1"  v-on:keyup.enter="$event.target.blur()" @click="err = false" > 
          <template v-slot:label>
            <span>
              {{ $t(items.title) }} <span class="text-info">{{ items.star }}</span>
            </span>
          </template>
        </v-text-field>
      </v-col>
      <v-col
      cols="12"
      sm="6"
      >
      <VueDatePicker v-model="date" :enable-time-picker="false" model-type="dd.MM.yyyy" locale="ru" auto-apply>
        <template #trigger>
          <v-text-field v-model="date" variant="underlined" :readonly="loading" :rules="rules" required clearable>
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
        <p v-if="err" class="text-red-darken-4 text-center">{{ $t('regerr') }}</p>
        <v-row justify="end">
            <v-btn :disabled="!form" :loading="loading" inline color="primary" variant="elevated" class="ma-6" 
            type="submit" >
            {{ $t('signin') }}
          </v-btn>
        </v-row>
        <v-row justify="center">

          <v-dialog
            v-model="dialog"
            width="600px"
            persistent
          >
                <v-card>
                  <v-card-text class="text-center">
                    {{ $t('codeinfo') }}
                    <v-row class="pa-2 ma-2">
                      <v-text-field variant="underlined" required clearable>
                        <template v-slot:label>
                          <span>
                            {{ $t('codeinput') }}
                          </span>
                        </template>
                      </v-text-field>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <p class="ma-4 bg-primary pa-1 rounded">
                      {{ minutes }}:{{ seconds }}
                    </p>
                    <v-spacer></v-spacer>
                    <v-btn class="ma-2" color="primary" variant="elevated" @click="dialog = false">{{ $t('close') }}</v-btn>
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

const { t } = useI18n()

let form = ref(false)

let err = ref(false)

let loading = ref(false)

let date = ref()

let dialog = ref(false)

let minutes = ref(1)
let seconds = ref(60)



const onSubmit =async () => {
  
  if (!form) return
  
  dialog.value = true
  
  minutes.value = 1;
  seconds.value = 60;
  dialog.value == true? loading.value = true : err.value = true
  const timer = setInterval(() => {
    if (seconds.value > 0) {
          seconds.value--
        }
        if (seconds.value === 0) {
          if (minutes.value === 0) {
            dialog.value = false;
            clearInterval
          } else {
            minutes.value--;
            seconds.value = 59;
          }
        }
      }, 1000);

  setTimeout(() => (loading.value = false), 2000)

  console.log(fields.value)

}

let rules = ref([
  (v: string) => !!v || t('required'),
  (v:string) => (/^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*$/.test(v)) || t('vbirthday')
])

let fields = ref([
  { field: "", star: "*", title: "login", rules: [ (v: string) => !!v || t('required'), (v: string) => v.length >= 4 || t('vlogin', [4]) ] },
  { field: "", star: "*", title: "password", rules: [ (v: string) => !!v || t('required'), (v: string) => v.length >= 6 || t('vpass', [6]) ] },
  { field: "", star: "*", title: "companyTitle", rules: [ (v: string) => !!v || t('required'), ]  },
  { field: "", star: "*", title: "companyFullTitle", rules: [ (v: string) => !!v || t('required'), ]  },
  { field: "", star: "*", title: "emplName", rules: [ (v: string) => !!v || t('required')]  },
  { field: "", star: "*", title: "emplSurname", rules: [ (v: string) => !!v || t('required') ]  },
  { field: "", title: "emplPatronymic" },
  { field: "", star: "*", title: "email", rules: [ (v: string) => !!v || t('required') ]  },
])

defineExpose({
  form,
  err,
  loading,
  fields,
  date
})
</script>


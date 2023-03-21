<template>
  <v-sheet class="d-flex align-center bg-black" height="100vh">
    <v-card class="mx-auto " width="600" border="md">
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

          <v-col
          v-for="items in fields"
          cols="12"
          sm="6"
          >
          <v-text-field
            variant="underlined" v-model=items.field :counter= items.count :readonly="loading" required clearable class="ma-1" > 
            <template v-slot:label>
              <span>
                {{ $t(items.placeholder) }}
              </span>
            </template>
          </v-text-field>
          </v-col>
        </v-row>

        <v-row justify="end">
          <v-btn :disabled="!form" :loading="loading" inline color="primary" variant="elevated" class="ma-6"
            type="submit">
            {{ $t('signin') }}
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
    <v-snackbar
      v-model="snackbar"
      vertical
    >
      <div class="text-subtitle-1 pb-2 text-info">{{ $t('autherr') }}</div>

      <p>{{ $t('errtext') }}</p>

      <template v-slot:actions>
        <v-btn
          color="info"
          variant="text"
          @click="snackbar = false"
        >
          {{ $t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-sheet>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';


const { t } = useI18n()

let form = ref(false)

let snackbar = ref(false)

let loading = ref(false)

const onSubmit =async () => {
  if (!form) return

  loading.value = true
  snackbar.value = true

  setTimeout(() => (loading.value = false), 2000)

  console.log(fields.value)


}



let fields = ref([
  { count: 4 , field: "", placeholder: "login" },
  { count: 4 , field: "", placeholder: "password" },
  { count: 3 , field: "", placeholder: "companyTitle" },
  { count: 5 , field: "", placeholder: "companyFullTitle" },
  { count: 2 , field: "", placeholder: "emplName" },
  { count: 2 , field: "", placeholder: "emplSurname" },
  { count: 6 , field: "", placeholder: "emplBirthdate" },
  { count: 4 , field: "", placeholder: "email" },
])

defineExpose({
  form,
  snackbar,
  loading,
  fields
})
</script>

<style scoped>

</style>
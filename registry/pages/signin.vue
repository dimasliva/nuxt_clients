<template>
  <v-sheet class="d-flex bg-background align-center h-screen" min-width="1100px">
    <v-card class=" mx-auto rounded-lg" elevation="10" width="600" border="md">
      <v-row class="bg-primary ma-0 pa-1" justify="center">
        <div class="text-h3">{{ $t('signin') }}</div>
      </v-row>
      <div class="d-flex flex-row-reverse ma-0 pa-0">
        <v-select v-model="$i18n.locale" :items="['ru', 'en']" style="max-width: 95px;" prepend-inner-icon="mdi-earth"
          density="compact" class="ma-4 " variant="solo">
        </v-select>
      </div>
      <v-form v-model="form" @submit.prevent="onSubmit">

        <v-row class="pa-6">

          <v-col
          cols="12"
          sm="6"
          >
          <v-text-field
            variant="underlined" v-model= "login"  :readonly="loading" :rules="nameRules" required clearable class="ma-1" > 
            <template v-slot:label>
              <span>
                {{ $t('login') }}
              </span>
            </template>
          </v-text-field>
          </v-col>

          <v-col
          cols="12"
          sm="6"
          >
          <v-text-field
            variant="underlined" v-model="password" :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" :readonly="loading"  :rules="passRules" :type="show ? 'text' : 'password'" required class="ma-1" clearable  @click:append="show = !show" >
            <template v-slot:label>
              <span>
                {{ $t('password') }}
              </span>
            </template>
          </v-text-field>
          </v-col>
        </v-row>

        <v-dialog v-model="signerr" width="20%">
          <v-card>
            <v-card-text class="text-center">
              {{ $t('errtext') }}
            </v-card-text>
            <v-card-actions>
              <v-btn color="info" block @click="signerr = false">{{ $t('close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-row justify="end">
          <v-btn :disabled="!form" :loading="loading" inline color="primary" variant="elevated" class="ma-6"
            type="submit">
            {{ $t('signin') }}
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { UserContext } from "~~/lib/UserContext";

const { t } = useI18n()

let form = ref(false)

const login = ref("")

const password = ref("")

let loading = ref(false)  

let signerr = ref(false)

let show = ref(false)

let nameRules = ref([
  (v: string) => !!v || t('required')
])

let passRules = ref([
  (v: string) => !!v || t('required'),
])


const onSubmit = async () => {
  if (!form) return

  const iocc = useContainer();
  const userCtx = iocc.get<UserContext>("UserContext");


  if (await userCtx.tryAuthorize(login.value,password.value)) {
    navigateTo('/dashboard');
  } else {
    signerr.value = true
  }

  loading.value = false;
}

defineExpose({
  form,
  login,
  password,
  nameRules,
  passRules,
  loading
})

</script>

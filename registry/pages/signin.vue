<template>
  <v-sheet class="d-flex bg-background align-center h-screen" min-width="1100px">
    <v-card class=" mx-auto rounded-lg" elevation="10" width="600" border="md">
      <v-row class="bg-primary ma-0 pa-1" justify="center">
        <div class="text-h3">{{ $t('signin') }}</div>
      </v-row>
      <div class="d-flex flex-row-reverse ma-0 pa-0">
        <v-select v-model="$i18n.locale" :items="['ru']" style="max-width: 95px;" prepend-inner-icon="mdi-earth"
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
            variant="underlined" v-on:keyup.enter="$event.target.blur()" v-model= "login"  :readonly="loading" :rules="nameRules" required clearable class="ma-1" @click="err = false"  > 
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
            variant="underlined"  v-on:keyup.enter="$event.target.blur()" v-model="password" :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" :readonly="loading"  :rules="passRules" :type="show ? 'text' : 'password'" required class="ma-1" clearable  @click:append="show = !show" @click="err = false" >
            <template v-slot:label>
              <span>
                {{ $t('password') }}
              </span>
            </template>
          </v-text-field>
          </v-col>
        </v-row>

        <p v-if="err" class="text-red-darken-4 text-center">{{ $t('errtext') }}</p>

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

let show = ref(false)

let err = ref(false)

let nameRules = ref([
  (v: string) => !!v || t('required')
])

let passRules = ref([
  (v: string) => !!v || t('required')
])


const onSubmit = async () => {
  if (!form) return

  const iocc = useContainer();
  const userCtx = iocc.get<UserContext>("UserContext");


  if (await userCtx.tryAuthorize(login.value,password.value)) {
    navigateTo('/dashboard');
  } else {
    err.value = true;
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
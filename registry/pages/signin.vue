<template>
  <v-sheet class="d-flex  align-center h-screen" min-width="1100px">
    <v-card class=" mx-auto" width="600" max-height="400">
      <v-row class="bg-blue-darken-4 ma-0 pa-1" justify="center">
        <div class="text-h3">{{ $t('signin') }}</div>
      </v-row>
      <div class="d-flex flex-row-reverse ma-0 pa-0">
        <v-select v-model="$i18n.locale" :items="['ru', 'en']" style="max-width: 95px;" prepend-inner-icon="mdi-earth"
          density="compact" class="ma-4 " variant="solo">
        </v-select>
      </div>
      <v-form v-model="form" @submit.prevent="onSubmit">

        <v-row class="pa-6">

          <v-text-field variant="underlined" v-model="logIn" :counter="15" :readonly="loading" :rules="nameRules" required
            clearable class="ma-1">
            <template v-slot:label>
              <span>
                {{ $t('login') }}
              </span>
            </template>
          </v-text-field>

          <v-text-field variant="underlined" v-model="passWord" :readonly="loading" :counter="5" :rules="passRules"
            required class="ma-1" clearable>
            <template v-slot:label>
              <span>
                {{ $t('password') }}
              </span>
            </template>
          </v-text-field>
        </v-row>


        <v-row justify="end">
          <v-btn :disabled="!form" :loading="loading" inline color="blue-darken-4" variant="elevated" class="ma-6"
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
import type userCtx from "@/models/context"
import i18n from "~~/plugins/i18n";
import { MoApiClientSettings } from "~~/lib/MoApi/MoApiClientSettings";
import { IUserCredentials } from "~~/lib/Security";


const { t } = useI18n()

let form = ref(false)

const logIn = ref("")

const passWord = ref("")

let loading = ref(false)


const nameRules = ref([
  (v: string) => !!v || t('rlogin'),
  (v: string) => (v && v.length <= 15) || t('vlogin'),
])

const passRules = ref([
  (v: string) => !!v || t('rpass'),
  (v: string) => v.length >= 5 || t('vpass'),
])

const onSubmit = async () => {
  if (!form) return
  const iocc = useContainer();
  const userCtx = iocc.get<UserContext>("UserContext");
  const apiSettinngs = iocc.get<MoApiClientSettings>("MoApiClientSettings");

  apiSettinngs.Credentials = { login: logIn.value, password: passWord.value };
  loading.value = true;

  if (await userCtx.tryAuthorize()) {
    let credCookie = useCookie<IUserCredentials | null>("user_credentials");
    credCookie.value=apiSettinngs.Credentials;
    navigateTo('/dashboard');
  }

  loading.value = false;
  console.log(i18n)
}

defineExpose({
  form,
  logIn,
  passWord,
  nameRules,
  passRules,
  loading
})

</script>
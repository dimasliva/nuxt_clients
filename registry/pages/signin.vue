<template>
    <v-sheet class="d-flex  align-center h-screen bg-blue-lighten-1">
      <v-card class=" mx-auto" width="600" max-height="400">
          <v-row class="bg-blue-darken-4 ma-0 pa-1" justify="center">
            <div class="text-h3">{{ $t('signin') }}</div>
          </v-row>
          <div class="d-flex flex-row-reverse ma-0 pa-0">
            <v-select v-model="$i18n.locale" 
              :items="['ru', 'en']"
              style="max-width: 95px;"
              prepend-inner-icon="mdi-earth"
              density="compact"
              class="ma-4 "
              variant="solo"
            >
            </v-select>
          </div>
        <v-form
          v-model="form"
          @submit.prevent="onSubmit"
        >
            <v-row class="mt-8 pa-4 ">
              <v-col
              cols="12"
              md="6"
              >
                <v-text-field
                variant="underlined"
                  v-model="login"
                  :readonly="loading"
                  :counter="15"
                  :rules="nameRules"
                  required
                  clearable
                >
                  <template v-slot:label>
                    <span>
                      {{ $t('login') }}
                    </span>
                  </template>
              </v-text-field>
              </v-col>

              <v-col
              cols="12"
              md="6"
              >
              <v-text-field
              variant="underlined"
              v-model="password"
              :readonly="loading"
              :counter="5"
              :rules="passRules"
              required
              clearable
              >
              <template v-slot:label>
              <span>
                {{ $t('password') }}
              </span>
            </template>
            </v-text-field>
            </v-col>
          </v-row>
      
          <v-row justify="end">
            <v-btn
              :disabled="!form"
              :loading="loading"
              inline
              color="blue-darken-4"
              type="submit"
              variant="elevated"
              class="ma-6"
            >
            {{ $t('signin') }}
            </v-btn>
          </v-row>
        </v-form>
      </v-card>
    </v-sheet>
  </template>

<script lang="ts">
import userCtx from "~~/models/context"

  export default {
    data: () => ({
      form: false,
      login: null,
      password: null,
      loading: false,
      nameRules : [
   (v: string) => !!v || "Login is required",
   (v: string) => (v && v.length <= 15) || "Login must be less than 10 characters",
 ],
 passRules : [
   (v: string) => !!v || "Password is required",
   (v: string) => v.length >= 5 || "Password must be 5 characters or more",
 ]
    }),



    methods: {
      onSubmit () {
        if (!this.form) return

        this.loading = true

        setTimeout(() => (this.loading = false), 2000);

        if (this.login == "admin" && this.password == "12345") {
      userCtx.isAuth = true;
      navigateTo('/dashboard');
      }
  }
     
    },
  }
</script>
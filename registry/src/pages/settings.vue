<template>
  <div>
    <v-card elevation="4" class="ma-4" width="400">
      <template v-slot:title>
        Настройки
      </template>

      <v-card-text>
        Язык и внешний вид
      </v-card-text>
      <v-row class="ma-4 d-flex align-center">
        <p class="mx-2">Тема </p>

        <v-switch hide-details inset @click="toggleTheme"></v-switch>
      </v-row>
      <v-row class="ma-4">
        <p class="mx-2 d-flex align-center">Язык:</p>

        <v-select v-model="$i18n.locale" :items="['ru', 'en']" style="max-width: 50px;" variant="underlined" density="compact"></v-select>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify/lib/framework.mjs';
import { useCookie } from '#app';

const theme = useTheme();
const themeCookie = useCookie('theme');

// Загружаем тему из cookies при инициализации
if (themeCookie.value) {
  theme.global.name.value = themeCookie.value;
}

const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'lightTheme' : 'darkTheme';
  theme.global.name.value = newTheme;
  // Сохраняем тему в cookies
  themeCookie.value = newTheme;
};
</script>

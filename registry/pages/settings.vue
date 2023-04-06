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

        <v-switch hide-details inset  @click="toggleTheme">
        </v-switch>
    </v-row>
    <v-row class="ma-4">
       <p class=" mx-2 d-flex align-center">Язык:</p>
 
        <v-select v-model="$i18n.locale" :items="['ru', 'en']" style="max-width: 50px;" variant="underlined" density="compact">
           </v-select>
    </v-row>
    </v-card>
</div>
</template>
  
<script setup>
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify/lib/framework.mjs';

const theme = useTheme();

const toggleTheme = () => {
theme.global.name.value = theme.global.current.value.dark ? 'lightTheme' : 'darkTheme'
} 
</script>
  
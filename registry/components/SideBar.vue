<template>

    <v-app-bar color="primary" prominent >
      <v-app-bar-nav-icon
        variant="text"
        @click="rail = !rail"
      ></v-app-bar-nav-icon>
  
      <v-toolbar-title>Med Office</v-toolbar-title>
  
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" icon="mdi-account-circle"></v-btn>
        </template>
        <v-list>
          <v-list-item @click="toggleTheme">
            <v-list-item-title>Theme <v-icon end icon="mdi-theme-light-dark" size="x-small"></v-icon></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="bg-background">
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-magnify"
          value="search"
        >
        <v-text-field  v-model="input"></v-text-field>
      </v-list-item>
        <v-list-item v-for="item in filteredChapters()" prepend-icon="mdi-share-variant" :value="item" >
          {{ item }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script>
  export default {
    data: () => ({
      drawer: true,
      group: null,
      rail: true,
      dark: true
    })
  };
  </script>

<script setup>
import { useTheme } from 'vuetify/lib/framework.mjs';

let input = ref('')

const chapters = ['кластеры', 'пациенты', 'доктора', 'сервер']

let filteredChapters = () => {
  return chapters.filter((chapter) =>
    chapter.toLowerCase().includes(input.value.toLowerCase())
  );
}

const theme = useTheme();

const toggleTheme = () => {
theme.global.name.value = theme.global.current.value.dark ? 'lightTheme' : 'darkTheme'
}
</script>
  
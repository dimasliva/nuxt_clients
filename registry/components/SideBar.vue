<template>

    <v-app-bar color="primary" prominent >
      <v-app-bar-nav-icon
        variant="text"
        @click="rail = !rail"
      ></v-app-bar-nav-icon>
  
      <v-toolbar-title  @click="navigateTo('/dashboard')" style="cursor: pointer;">
        <v-img src="logo_9PqMg0J9.png" :height="50" :width="200"></v-img>
      </v-toolbar-title>
  
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
        <p>Максим</p>  <v-btn variant="text" v-bind="props" icon="mdi-account-circle"></v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>Сиамсов М.М.</v-list-item-title>
          </v-list-item>
          <v-list-item @click="navigateTo('/settings')">
            <v-list-item-title>Настройки<v-icon end icon="mdi-cog" size="x-small"/></v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="navigateTo('/signout')">
            <v-list-item-title>Выйти<v-icon end icon="mdi-close" size="x-small"/></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="bg-background">
      <v-list >
        <v-list-item prepend-icon="mdi-magnify" value="search" @click="rail = false, $refs.myinput.focus()">
        <v-text-field single-line hide-details ref="myinput" density="compact" v-model="input"></v-text-field>
      </v-list-item>
        <v-list-item v-for="item in filteredChapters()" :prepend-icon="item.icon" :title="item.title" :value="item.title" @click="navigateTo(item.nav)" >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>

<script setup>
let input = ref('')
let drawer = ref(true)
let group = ref(null)
let rail = ref(true)
let dark = ref(true)

const chapters = [
  {title:"Панель управления", nav: "/dashboard", icon:"mdi-view-dashboard"}, 
  {title:"Администрирование", nav: "/administration", icon:"mdi-account-tie"}, 
  {title:"ЖПЗ", nav: "/administration", icon:"mdi-account-heart"}, 
  {title:"База данных", nav: "/administration", icon:"mdi-server"}, 
]

let translit = (word) => {
  const converter = {
    'a': 'ф', 'b': 'и', 'v': 'м', 'g': 'п', 'd': 'в',
    'e': 'у', 'z': 'я', 'i': 'ш', 'y': 'н', 'k': 'л',
    'l': 'д', 'm': 'ь', 'n': 'т', 'o': 'щ', 'p': 'з',
    'r': 'к', 's': 'ы', 't': 'е', 'u': 'г', 'f': 'а',
    'h': 'р', 'c': 'с', 'j': 'о', 'w': 'ц' 
  };

  for (const [key, value] of Object.entries(converter)) {
    word = word.replaceAll(key, value);
  }

  return word;
}

let filteredChapters = () => {
  return chapters.filter(chapter =>
   chapter.title.toLowerCase().includes(translit(input.value.toLowerCase()))
  );
}

</script>
  
<template>
  <v-app-bar color="primary" prominent>
    <v-app-bar-nav-icon variant="text" @click="rail = !rail"></v-app-bar-nav-icon>

    <v-toolbar-title @click="navigateTo('/dashboard')" style="cursor: pointer;">
      <v-img src="logo_9PqMg0J9.png" :height="50" :width="200"></v-img>
    </v-toolbar-title>

    <v-spacer></v-spacer>
    <v-menu>
      <template v-slot:activator="{ props }">
        <p>Максим</p> <v-btn variant="text" v-bind="props" icon="mdi-account-circle"></v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>Сиамсов М.М.</v-list-item-title>
        </v-list-item>
        <v-list-item @click="navigateTo('/settings')">
          <v-list-item-title>Настройки<v-icon end icon="mdi-cog" size="x-small" /></v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="navigateTo('/signout')">
          <v-list-item-title>Выйти<v-icon end icon="mdi-close" size="x-small" /></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="bg-background" :width="350">
    <v-list :opened="opened" open-strategy="multiple">
      <v-list-item prepend-icon="mdi-magnify" value="search" @click="rail = false, pInput.focus()">
        <v-text-field single-line hide-details ref="pInput" density="compact" v-model="input"></v-text-field>
      </v-list-item>
      <template v-for="item in filteredChaptersGr()">
        <v-list-group v-if="item.childs?.length! > 0" @click="rail = false" :value="item.id">
          <template v-slot:activator="{ props, isOpen }">
            <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" :value="item.title"></v-list-item>
          </template>
          <template v-if="rail == false">
            <v-list-item v-for="el in item.childs" :prepend-icon="el.icon" :to="el.getPagePath()" :title="el.title" />
          </template>
        </v-list-group>
        <v-list-item v-else :prepend-icon="item.icon" :title="item.title" :value="item.title"
          :to="(item.getPagePath())"></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
  <NuxtPage />
</template>

<script setup lang="ts">
import { IModuleItemsMenu } from '~~/lib/ModuleManager';
import { ModuleManager } from '~~/lib/ModuleManager';
import { CloneData } from "@/lib/Helpers";
import { EnumArray } from "@/lib/EnumArray";

let pInput = ref();
let input = ref('')
let drawer = ref(true)
let rail = ref(true)
let expandGr = ref(true)
const iocc = useContainer();
let opened = ref();
const modManager = iocc.get<ModuleManager>("ModuleManager");


const chapters = modManager.getModuleItemsMenu();

let translit = (word) => {
  const converter = {
    'a': 'ф', 'b': 'и', 'v': 'м', 'g': 'п', 'd': 'в',
    'e': 'у', 'z': 'я', 'i': 'ш', 'y': 'н', 'k': 'л',
    'l': 'д', 'm': 'ь', 'n': 'т', 'o': 'щ', 'p': 'з',
    'r': 'к', 's': 'ы', 't': 'е', 'u': 'г', 'f': 'а',
    'h': 'р', 'c': 'с', 'j': 'о', 'w': 'ц', ';': 'ж',
    "'": 'э', ',': 'б', "x": "ч"
  };

  for (const [key, value] of Object.entries(converter)) {
    word = word.replaceAll(key, value);
  }

  return word;
}

// @click="navigateTo(item.getPagePath())"
let filteredChaptersGr = () => {

  const _filter = (_chapters: IModuleItemsMenu[]) => {
    let res = new EnumArray<IModuleItemsMenu>();
    _chapters.forEach(chapter => {

      let newChapter: IModuleItemsMenu = {
        id: chapter.id,
        title: chapter.title,
        icon: chapter.icon,
        getPagePath: chapter.getPagePath
      };

      let filtred = chapter.title.toLowerCase().includes(translit(input.value.toLowerCase()));
      if (chapter.childs?.length! >= 0) {
        if (filtred)
          newChapter.childs = chapter.childs;
        else
          newChapter.childs = _filter(chapter.childs!)
      }
      if (filtred || newChapter.childs?.length! > 0) res.push(newChapter);
    });

    return res;
  };

  let res = _filter(chapters)

  if (input.value) {
    let newopened: string[] = [];
    res.forEach((val) => { if (val.childs?.length! > 0) newopened.push(val.id) })
    opened.value = newopened;
  }
  else opened.value = null;

  return res;
}

</script>
  

<style>
.v-list-item__prepend>.v-icon {
  margin-inline-end: 12px;
}

.v-list-group--prepend {
  --parent-padding: calc(var(--indent-padding));
}

.v-list-group__items .v-list-item-title {
  font-size: 0.85rem;
}

.v-list-group__items .v-list-item__prepend>.v-icon {
  font-size: calc(var(--v-icon-size-multiplier) * 1.25em);
}
</style>

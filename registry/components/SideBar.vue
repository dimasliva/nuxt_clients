<template>
  <v-app-bar color="primary" prominent elevation="0">
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
            <v-list-item-title>Настройки<v-icon end icon="mdi-cog" size="x-small"/></v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="navigateTo('/signout')">
            <v-list-item-title>Выйти<v-icon end icon="mdi-close" size="x-small"/></v-list-item-title>
          </v-list-item>
        </v-list>
    </v-menu>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="bg-background" :width="350">
    <v-list class="main_menu" :opened="opened" open-strategy="multiple" :selected="selected" select-strategy="classic" @update:selected=debugger>
      <v-list-item prepend-icon="mdi-magnify" value="search" @click="rail = false, pInput.focus()" >
        <v-text-field single-line clearable hide-details ref="pInput" density="compact" v-model="input" @click:clear="input = ''"></v-text-field>
      </v-list-item>
      <template v-for="item in filteredChaptersGr()">
        <v-list-group v-if="item.childs?.length! > 0" @click="rail = false" :value="item.id" >
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" :value="item.title"></v-list-item>
          </template>
          <template v-if="rail == false">
            <v-list-item v-for="el in item.childs" @click="navigateTo(el.getPagePath())" style="padding-inline-start: 50px !important;">
              <v-icon :icon="el.icon" size="x-small" start >
              </v-icon>
              <v-list-item-title class="text-body-2 d-inline">
                {{ el.title }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-list-group>
        <v-list-item v-else :prepend-icon="item.icon" :title="item.title" :value="item.title"
        @click="navigateTo(item.getPagePath())"></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
    <v-row align="center" justify="start" class="ma-1" style="height: 40px !important;">
      <v-col v-for="(selection, i) in pages" :key="selection.title" cols="auto" class="py-1 pe-0">
        <v-chip closable elevation="2"  @click="navigateTo(selection.link)" @click:close="pages.splice(i, 1)">
          {{ selection.title }}
        </v-chip>
      </v-col>
    </v-row>
    <!-- <v-divider :thickness="2" class="mx-4" color="primary"></v-divider> -->
    <v-card class="mx-4 overflow-auto" elevation="2" height="85vh">
    <v-row class="ma-0 pa-4 bg-white" style="position: sticky !important; top:0" >
      <p  class="text-h6 font-weight-bold mx-2">{{ currPageTitle }}</p>
      <v-btn color="secondary" size="x-small" @click="onPinPageBtnClick" icon="mdi-pin"/>
        <v-spacer></v-spacer>
        <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" color="secondary" size="x-small" icon="mdi-dots-vertical"/>
      </template>
      <v-list>
          <v-list-item>
            <v-list-item-title>Content here<v-icon end icon="mdi-close" size="x-small"/></v-list-item-title>
          </v-list-item>
        </v-list>
    </v-menu>
    </v-row>
      <NuxtPage :keepalive="true" @vnode-updated="debugger" class="px-4"/>
    </v-card>
</template>

<script setup lang="ts">
import { IModuleItemsMenu } from '~~/lib/ModuleManager';
import { ModuleManager } from '~~/lib/ModuleManager';
import { CloneData } from "@/lib/Helpers";
import { EnumArray } from "@/lib/EnumArray";
import { PageMap } from '~~/lib/PageMap';


let pInput = ref();
let input = ref('')
let drawer = ref(true)
let rail = ref(true)
const iocc = useContainer();
let opened = ref();
let selected=ref();
let currPageTitle = ref('')


let pages = ref<any[]>([])

const modManager = iocc.get<ModuleManager>("ModuleManager");
const pageMap = iocc.get<PageMap>("PageMap");

const chapters = modManager.getModuleItemsMenu();


const route = useRoute()
watch(() => route.query, () => {
  const pageData = pageMap.getPageData(route.path)
  currPageTitle.value = pageData?.title||"";
})

const onPinPageBtnClick = (e) => {
  const pageData = pageMap.getPageData(route.path)
  if(!pageData) return;
  if(pages.value.find((v,i,o)=>v.link==route.path)) return;
  pages.value.push({icon: pageData.icon, title: pageData.title, link: route.path})
}

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
  